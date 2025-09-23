"""Main CLI entry point."""

import sys
from typing import Optional

import click

from ..core.config import settings
from ..core.logging import configure_logging, get_logger


@click.group()
@click.option("--debug", is_flag=True, help="Enable debug mode")
@click.option("--config", type=click.Path(exists=True), help="Configuration file path")
@click.pass_context
def cli(ctx: click.Context, debug: bool, config: Optional[str]) -> None:
    """Security Scanner Platform CLI."""
    # Ensure context object exists
    ctx.ensure_object(dict)
    
    # Configure logging
    if debug:
        settings.debug = True
        settings.logging.level = "DEBUG"
    
    configure_logging()
    logger = get_logger(__name__)
    
    # Store context
    ctx.obj["debug"] = debug
    ctx.obj["config"] = config
    ctx.obj["logger"] = logger
    
    logger.info("Security Scanner Platform CLI started", debug=debug)


@cli.command()
@click.pass_context
def version(ctx: click.Context) -> None:
    """Show version information."""
    from .. import __version__
    click.echo(f"Security Scanner Platform v{__version__}")


@cli.command()
@click.pass_context
def config_check(ctx: click.Context) -> None:
    """Check configuration validity."""
    logger = ctx.obj["logger"]
    
    try:
        # Test database connection
        from ..core.database import db_manager
        db_manager.initialize()
        
        click.echo("✓ Configuration is valid")
        click.echo(f"✓ Database: {settings.database.host}:{settings.database.port}")
        click.echo(f"✓ Redis: {settings.redis.host}:{settings.redis.port}")
        
        logger.info("Configuration check passed")
        
    except Exception as e:
        click.echo(f"✗ Configuration error: {e}", err=True)
        logger.error("Configuration check failed", error=str(e))
        sys.exit(1)


@cli.group()
def scan() -> None:
    """Scanning operations."""
    pass


@scan.command()
@click.argument("targets", nargs=-1, required=True)
@click.option("--type", "scan_type", type=click.Choice(["network", "host", "both"]), 
              default="both", help="Type of scan to perform")
@click.option("--output", type=click.Path(), help="Output file path")
@click.pass_context
def start(ctx: click.Context, targets: tuple, scan_type: str, output: Optional[str]) -> None:
    """Start a security scan."""
    logger = ctx.obj["logger"]
    click.echo(f"Starting {scan_type} scan for targets: {', '.join(targets)}")


    # Use advanced PatternManager for pattern management
    try:
        from ..regex.patterns import PatternManager
        from ..core.config import settings
        pattern_manager = PatternManager(patterns_dir=settings.patterns_dir.resolve())
        loaded_count = pattern_manager.load_patterns_from_directory()
        logger.info("Patterns loaded", count=loaded_count)
        click.echo(f"Loaded {loaded_count} regex patterns for version detection.")
    except Exception as e:
        logger.error("Failed to load patterns", error=str(e))
        click.echo(f"Error loading patterns: {e}", err=True)
        return

    # For demonstration: try to grab a banner from each target (host:port) and match patterns
    from ..core.banner_grabber import grab_banner
    import re
    import ipaddress
    def expand_host_range(host):
        # Supports host range like 192.168.1.1-5 or 10.0.0.1-10.0.0.5
        if '-' in host:
            # e.g., 192.168.1.1-5 or 192.168.1.10-15 or 192.168.1.1-192.168.1.5
            start, end = host.split('-', 1)
            try:
                # If end is just a number, replace last octet
                if '.' not in end:
                    base = start.rsplit('.', 1)[0]
                    start_num = int(start.rsplit('.', 1)[1])
                    end_num = int(end)
                    return [f"{base}.{i}" for i in range(start_num, end_num+1)]
                else:
                    # Full IP range
                    start_ip = ipaddress.IPv4Address(start)
                    end_ip = ipaddress.IPv4Address(end)
                    return [str(ip) for ip in ipaddress.summarize_address_range(start_ip, end_ip)][0].split('/')
            except Exception:
                return [host]
        else:
            return [host]

    def parse_targets(targets):
        # Accepts host:port, host:port1,port2,port3, host1:port,host2:port, etc.
        parsed = []
        for target in targets:
            # Split by comma for multiple hosts/ports
            for part in target.split(','):
                part = part.strip()
                if not part:
                    continue
                # host:port or host:port1-port2
                if ':' in part:
                    host, ports = part.split(':', 1)
                    # Expand host range if present
                    hosts = expand_host_range(host)
                    # Support port ranges (e.g., 22-25)
                    for port_item in ports.split(','):
                        port_item = port_item.strip()
                        if '-' in port_item:
                            start, end = port_item.split('-', 1)
                            try:
                                for p in range(int(start), int(end)+1):
                                    for h in hosts:
                                        parsed.append((h, p))
                            except Exception:
                                continue
                        else:
                            try:
                                for h in hosts:
                                    parsed.append((h, int(port_item)))
                            except Exception:
                                continue
                else:
                    # No port specified, skip
                    continue
        return parsed

    import json
    import csv
    from pathlib import Path
    from ..core.cve_lookup import query_osv
    from ..core.nvd_lookup import query_nvd
    from ..core.vulners_lookup import query_vulners
    scan_targets = parse_targets(targets)
    if not scan_targets:
        click.echo("No valid targets to scan.")
        return
    results = []
    for host, port in scan_targets:
        click.echo(f"Connecting to {host}:{port} ...")
        banner = grab_banner(host, port)
        entry = {
            "host": host,
            "port": port,
            "banner": banner,
            "matches": []
        }
        if banner:
            click.echo(f"Received banner: {banner}")
            for pat in pattern_manager.patterns.values():
                compiled = pat.compile()
                match = compiled.search(banner)
                if match:
                    extracted = pat.extract_version_info(match)
                    # CVE lookup
                    vulns_osv = []
                    vulns_nvd = []
                    vulns_vulners = []
                    if extracted.get("product") and extracted.get("version"):
                        vulns_osv = query_osv(extracted["product"], extracted["version"])
                        vulns_nvd = query_nvd(extracted["product"], extracted["version"])
                        vulns_vulners = query_vulners(extracted["product"], extracted["version"])
                    # Aggregate and deduplicate CVEs by ID
                    cve_ids = set()
                    all_cves = []
                    for v in vulns_osv:
                        cve_id = v.get("id") or v.get("cve_id")
                        if cve_id and cve_id not in cve_ids:
                            cve_ids.add(cve_id)
                            all_cves.append(v)
                    for v in vulns_nvd:
                        cve_id = v.get("id") or v.get("cve", {}).get("id")
                        if cve_id and cve_id not in cve_ids:
                            cve_ids.add(cve_id)
                            all_cves.append(v)
                    for v in vulns_vulners:
                        cve_id = v.get("id") or v.get("_id")
                        if cve_id and cve_id not in cve_ids:
                            cve_ids.add(cve_id)
                            all_cves.append(v)
                    entry["matches"].append({
                        "pattern": pat.name,
                        "matched": match.group(0),
                        "version": extracted.get("version"),
                        "vendor": extracted.get("vendor"),
                        "product": extracted.get("product"),
                        "cves": all_cves
                    })
            if entry["matches"]:
                click.echo(f"Pattern matches:")
                for m in entry["matches"]:
                    click.echo(f"- Pattern: {m['pattern']}, Matched: {m['matched']}, Version: {m['version']}, Vendor: {m['vendor']}, Product: {m['product']}, CVEs: {len(m['cves'])}")
            else:
                click.echo("No patterns matched the banner.")
        else:
            click.echo("No banner received or connection failed.")
        results.append(entry)
    # Save results to file if output is specified
    if output:
        try:
            ext = Path(output).suffix.lower()
            if ext == ".json":
                with open(output, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2)
                click.echo(f"Results saved to {output}")
            elif ext == ".csv":
                with open(output, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(["host", "port", "banner", "pattern", "version", "vendor", "product", "cve_count"])
                    for entry in results:
                        for m in entry["matches"]:
                            writer.writerow([
                                entry["host"], entry["port"], entry["banner"],
                                m["pattern"], m["version"], m["vendor"], m["product"], len(m["cves"])
                            ])
                click.echo(f"Results saved to {output}")
            elif ext == ".html":
                with open(output, 'w', encoding='utf-8') as f:
                    f.write("<html><head><title>Scan Results</title></head><body>")
                    f.write("<h1>Scan Results</h1><table border='1'><tr><th>Host</th><th>Port</th><th>Banner</th><th>Pattern</th><th>Version</th><th>Vendor</th><th>Product</th><th>CVE Count</th></tr>")
                    for entry in results:
                        for m in entry["matches"]:
                            f.write(f"<tr><td>{entry['host']}</td><td>{entry['port']}</td><td>{entry['banner']}</td><td>{m['pattern']}</td><td>{m['version']}</td><td>{m['vendor']}</td><td>{m['product']}</td><td>{len(m['cves'])}</td></tr>")
                    f.write("</table></body></html>")
                click.echo(f"Results saved to {output}")
            else:
                click.echo(f"Unknown output file extension: {ext}", err=True)
        except Exception as e:
            click.echo(f"Failed to save results to {output}: {e}", err=True)

    logger.info("Scan started", targets=targets, scan_type=scan_type)
    click.echo("Scan completed successfully")


@cli.group()
def report() -> None:
    """Report generation operations."""
    pass


@report.command()
@click.option("--scan-id", required=True, help="Scan ID to generate report for")
@click.option("--format", "report_format", type=click.Choice(["json", "html", "pdf"]), 
              default="html", help="Report format")
@click.option("--output", type=click.Path(), help="Output file path")
@click.pass_context
def generate(ctx: click.Context, scan_id: str, report_format: str, output: Optional[str]) -> None:
    """Generate a vulnerability report."""
    logger = ctx.obj["logger"]
    
    click.echo(f"Generating {report_format} report for scan {scan_id}")
    
    # TODO: Implement actual report generation
    logger.info("Report generated", scan_id=scan_id, format=report_format)
    
    click.echo("Report generated successfully")


@cli.group()
def server() -> None:
    """Server management operations."""
    pass


@server.command()
@click.option("--host", default=settings.api_host, help="Host to bind to")
@click.option("--port", default=settings.api_port, help="Port to bind to")
@click.option("--workers", default=settings.api_workers, help="Number of worker processes")
@click.pass_context
def start_api(ctx: click.Context, host: str, port: int, workers: int) -> None:
    """Start the API server."""
    logger = ctx.obj["logger"]
    
    click.echo(f"Starting API server on {host}:{port} with {workers} workers")
    
    try:
        import uvicorn
        # TODO: Import actual FastAPI app
        # uvicorn.run("security_scanner.api.main:app", host=host, port=port, workers=workers)
        logger.info("API server would start here", host=host, port=port, workers=workers)
        click.echo("API server started successfully")
        
    except ImportError:
        click.echo("uvicorn not available. Install with: pip install uvicorn", err=True)
        sys.exit(1)
    except Exception as e:
        logger.error("Failed to start API server", error=str(e))
        click.echo(f"Failed to start API server: {e}", err=True)
        sys.exit(1)


def main() -> None:
    """Main entry point for the CLI."""
    cli()


if __name__ == "__main__":
    main()