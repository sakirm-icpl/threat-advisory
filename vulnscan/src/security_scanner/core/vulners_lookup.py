import requests
from typing import List, Dict

def query_vulners(product: str, version: str, api_key: str = None) -> List[Dict]:
    """Query Vulners API for vulnerabilities for a given product and version."""
    url = "https://vulners.com/api/v3/search/lucene/"
    query = f"software:{product} version:{version}"
    params = {"query": query, "size": 10}
    if api_key:
        params["apiKey"] = api_key
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            vulns = data.get("data", {}).get("search", [])
            return vulns
        else:
            return []
    except Exception:
        return []
