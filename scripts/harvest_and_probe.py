import requests
import json
import os
import time
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("API_BASE_URL", os.getenv("VITE_API_BASE_URL", "https://solve.ivy.homes"))
API_KEY = os.getenv("API_KEY", os.getenv("VITE_API_KEY", ""))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "src", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Login
login_r = requests.post(f"{BASE_URL}/auth/login", headers={"X-API-Key": API_KEY}, json={
    "email": "demo1@ivy.homes",
    "password": "d5ea62d081"
})
login_data = login_r.json()
access_token = login_data.get("access_token")
refresh_token = login_data.get("refresh_token")

HEADERS = {
    "X-API-Key": API_KEY,
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

def fetch_all(endpoint, name):
    print(f"\n==========================================")
    print(f"Fetching {endpoint}...")
    limit = 50
    offset = 0
    results = []
    
    # First request
    r = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, params={"offset": offset, "limit": limit})
    if r.status_code != 200:
        print(f"Failed to fetch {endpoint}: {r.status_code} {r.text}")
        return []
        
    data = r.json()
    total = data.get("total", 0)
    meta = {k: v for k, v in data.items() if k != "results"}
    print(f"Server reported total: {total}")
    
    items = data.get("results", [])
    results.extend(items)
    offset += len(items)
    print(f"Initial batch: {len(items)} items. Total so far: {len(results)}/{total}")
    
    has_more = data.get("has_more", True)
    
    while has_more and len(items) > 0:
        r = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, params={"offset": offset, "limit": limit})
        if r.status_code != 200:
            print(f"Error at offset {offset}: {r.status_code} {r.text}")
            break
        data = r.json()
        items = data.get("results", [])
        has_more = data.get("has_more", False)
        if not items:
            break
        results.extend(items)
        offset += len(items)
        if len(results) % 500 == 0 or not has_more or len(results) >= total:
            print(f"Offset {offset}: accumulated {len(results)} / {total} (has_more: {has_more})")
            
    # Check if there is anything beyond
    extra_r = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, params={"offset": offset, "limit": limit})
    if extra_r.status_code == 200:
        extra_items = extra_r.json().get("results", [])
        if extra_items:
            print(f"NOTICE: Found {len(extra_items)} extra items beyond offset {offset}!")
            results.extend(extra_items)
            
    filepath = os.path.join(OUTPUT_DIR, f"{name}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "total_records": len(results), "records": results}, f, indent=2)
    print(f"FINISHED {endpoint}: {len(results)} records saved to {filepath}")
    
    # Verify uniqueness of IDs
    if name == "listings":
        ids = [x.get("listing_id") for x in results]
        print(f"Total listing_id count: {len(ids)}, Unique: {len(set(ids))}")
    elif name == "rentals":
        ids = [x.get("listing_id") for x in results]
        print(f"Total rental listing_id count: {len(ids)}, Unique: {len(set(ids))}")
    elif name == "projects":
        ids = [x.get("project_id") for x in results]
        print(f"Total project_id count: {len(ids)}, Unique: {len(set(ids))}")
        
    return results

if __name__ == "__main__":
    fetch_all("/v1/listings", "listings")
    fetch_all("/v1/rentals", "rentals")
    fetch_all("/v1/projects", "projects")
