import requests
from typing import List, Dict

def query_nvd(product: str, version: str, api_key: str = None) -> List[Dict]:
    """Query NVD API for vulnerabilities for a given product and version."""
    # NVD requires CPE format; this is a simplified search fallback
    url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    params = {
        "keywordSearch": f"{product} {version}",
        "resultsPerPage": 10
    }
    headers = {}
    if api_key:
        headers["apiKey"] = api_key
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            vulns = data.get("vulnerabilities", [])
            # Flatten for consistency
            return [v.get("cve", {}) for v in vulns]
        else:
            return []
    except Exception:
        return []
