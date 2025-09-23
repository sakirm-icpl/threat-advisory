import requests
from typing import List, Dict, Optional

def query_osv(product: str, version: str) -> List[Dict]:
    """Query OSV API for vulnerabilities for a given product and version."""
    url = "https://api.osv.dev/v1/query"
    payload = {
        "query": {
            "package": {"name": product},
            "version": version
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            vulns = data.get("vulns", [])
            return vulns
        else:
            return []
    except Exception:
        return []
