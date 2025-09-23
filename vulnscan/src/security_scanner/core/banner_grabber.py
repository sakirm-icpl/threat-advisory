import socket
from typing import Optional

def grab_banner(host: str, port: int, timeout: float = 3.0) -> Optional[str]:
    """Attempt to grab a banner from a TCP service."""
    try:
        with socket.create_connection((host, port), timeout=timeout) as sock:
            sock.settimeout(timeout)
            try:
                banner = sock.recv(1024)
                return banner.decode(errors="replace").strip()
            except Exception:
                return None
    except Exception:
        return None