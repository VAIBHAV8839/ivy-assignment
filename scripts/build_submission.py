import json
import os
from collections import defaultdict, Counter

SCRATCH_DIR = r"C:\Users\saura\.gemini\antigravity\brain\fdcfe58d-1a28-4492-81f9-efca80e55d18\scratch"
ROOT_DIR = r"c:\Users\saura\Desktop\Online_Judge_project"

with open(os.path.join(SCRATCH_DIR, "listings.json"), "r", encoding="utf-8") as f:
    listings = json.load(f)["records"]

with open(os.path.join(SCRATCH_DIR, "rentals.json"), "r", encoding="utf-8") as f:
    rentals = json.load(f)["records"]

with open(os.path.join(SCRATCH_DIR, "projects.json"), "r", encoding="utf-8") as f:
    projects = json.load(f)["records"]

# ----------------- Q1: total_listing_records -----------------
q1_total = len(listings) # 4100

# ----------------- Q4: corrupt_listing_ids -----------------
corrupt_reasons = {}
for l in listings:
    lid = l["listing_id"]
    reasons = []
    if l.get("price", 0) <= 0:
        reasons.append("negative price")
    if l.get("total_floors") is not None and l.get("floor", 0) > l.get("total_floors", 0):
        reasons.append("floor > total_floors")
    if l.get("super_built_up_area", 0) > 0 and l.get("carpet_area", 0) > l.get("super_built_up_area", 0):
        reasons.append("carpet > super_built")
    if l.get("latitude", 0) > 80:
        reasons.append("swapped lat/lon")
    if reasons:
        corrupt_reasons[lid] = reasons

q4_corrupt = sorted(list(corrupt_reasons.keys()))

# ----------------- Q9: fake_listing_ids -----------------
agency_contacts = {
    '+912000054434', '+912000159466', '+912003940107', '+912005820728',
    '+912005640249', '+912006984574', '+912000545441'
}
fake_listings = [l for l in listings if l.get("posted_by_contact") in agency_contacts]
q9_fake = sorted(list(set(l["listing_id"] for l in fake_listings)))

# ----------------- Q2: unique_properties -----------------
def norm_str(s):
    return ' '.join((s or '').lower().strip().replace('-', ' ').split())

by_exact_flat = defaultdict(list)
for l in listings:
    apt = norm_str(l.get('apartment_name'))
    loc = norm_str(l.get('locality'))
    floor = l.get('floor')
    total_floors = l.get('total_floors')
    bhk = l.get('bedroom')
    facing = norm_str(l.get('facing_direction'))
    c = l.get('carpet_area', 0)
    if c < 200:
        c_sqft = round(c * 10.7639)
    else:
        c_sqft = c
    key = (apt, loc, floor, total_floors, bhk, facing, c_sqft)
    by_exact_flat[key].append(l)

total_extra_records = sum(len(v) - 1 for v in by_exact_flat.values())
q2_unique = len(listings) - total_extra_records # 4058

# ----------------- Q3: active_listings -----------------
q3_active = sum(1 for l in listings if l.get("is_live") is True) # 3233

# ----------------- Q5: total_monthly_rent -----------------
thoraipakkam_rentals = [r for r in rentals if r.get("locality", "").lower() == "thoraipakkam"]
q5_rent = sum(r.get("price", 0) for r in thoraipakkam_rentals) # 5853000

# ----------------- Q6: avg_price_per_sqft_2bhk -----------------
corrupt_set = set(q4_corrupt)
fake_set = set(q9_fake)
valid_2bhk = [l for l in listings if l.get("is_live") is True and l.get("bedroom") == 2 and l["listing_id"] not in corrupt_set and l["listing_id"] not in fake_set]

conv_rates = []
for l in valid_2bhk:
    p = l['price']
    c = l['carpet_area']
    if p < 100000:
        p *= 1000
    if c < 200:
        c *= 10.7639
    conv_rates.append(p / c)

q6_avg_price = round(sum(conv_rates) / len(conv_rates), 2) # 10004.37

# ----------------- Q7: costliest_project -----------------
# Projects with price_max: if < 10, Crores (* 10^7), else Lakhs (* 10^5)
best_proj = None
best_price_inr = -1
for p in projects:
    p_max = p.get("price_max", 0)
    if p_max < 10:
        inr = int(round(p_max * 10_000_000))
    else:
        inr = int(round(p_max * 100_000))
    if inr > best_price_inr:
        best_price_inr = inr
        best_proj = p["project_id"]

q7_costliest = {
    "project_id": best_proj, # P40224
    "price_max_inr": best_price_inr # 37800000
}

# ----------------- Q8: listings_last_7_days -----------------
from datetime import datetime, timezone, timedelta
ist = timezone(timedelta(hours=5, minutes=30))
ref = datetime(2026, 9, 10, 0, 0, 0, tzinfo=ist)
ref_minus_7 = ref - timedelta(days=7)

q8_last_7 = 0
for l in listings:
    p = l.get("posted_at")
    if not p:
        continue
    # Naive timestamp is in IST
    dt = datetime.fromisoformat(p).replace(tzinfo=ist)
    if ref_minus_7 <= dt < ref:
        q8_last_7 += 1 # 122

# ----------------- Q10: projects_with_wrong_listing_count -----------------
live_counts = Counter(l.get('project_id') for l in listings if l.get('project_id') and l.get('is_live') is True)
q10_wrong_projects = sum(1 for p in projects if p.get('total_listings', 0) != live_counts.get(p['project_id'], 0)) # 119

# ----------------- Part 3: Findings -----------------
findings = [
    {
        "endpoint": "*",
        "category": "auth",
        "documented": "Every request must carry the API key appended as a query parameter (?api_key=IVY26-...)",
        "actual": "Query parameter api_key is rejected with 401; key must be supplied via the X-API-Key HTTP header.",
        "how_found": "Observed 401 error response stating 'send your key in the X-API-Key request header, not as a query parameter'",
        "impact": "All API requests fail with 401 if following the documentation.",
        "evidence": []
    },
    {
        "endpoint": "/auth/login",
        "category": "auth",
        "documented": "Returns token with expires_in 86400 (24 hours) and states there is no refresh flow.",
        "actual": "Returns access_token with expires_in 900 (15 minutes), refresh_token, and refresh_url /auth/refresh.",
        "how_found": "Inspected JSON payload returned by POST /auth/login.",
        "impact": "Client applications expire after 15 minutes unless implementing the refresh token flow.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listing/{id}",
        "category": "missing_endpoint",
        "documented": "GET /v1/listing/{listing_id} returns a single listing object.",
        "actual": "Returns 404 Not Found. The endpoint is plural: GET /v1/listings/{id}.",
        "how_found": "Probed singular and plural paths; singular 404s while plural resolves.",
        "impact": "Detail pages fail to load if using the singular path.",
        "evidence": ["MAG-4001518", "100-4000035"]
    },
    {
        "endpoint": "/v1/listings/{id}/similar",
        "category": "missing_endpoint",
        "documented": "GET /v1/listings/{listing_id}/similar returns up to ten comparable listings.",
        "actual": "Returns 404 Not Found. The endpoint does not exist on the server.",
        "how_found": "Requested the similar endpoint with known valid listing IDs.",
        "impact": "Similar listing strip fails if relying on backend endpoint.",
        "evidence": ["MAG-4001518", "100-4000035"]
    },
    {
        "endpoint": "/v1/favourites",
        "category": "missing_endpoint",
        "documented": "User saved listings are managed via GET, POST, DELETE /v1/favourites with body {'id': '...'}.",
        "actual": "/v1/favourites returns 404 Not Found. Running endpoint is /v1/saved, POST expects {'listing_id': '...'} and returns 201 Created.",
        "how_found": "Probed candidate paths; /v1/saved resolved and returned 422 until listing_id payload was passed.",
        "impact": "Favourites operations fail completely when using documented URL and payload format.",
        "evidence": ["MAG-4001518"]
    },
    {
        "endpoint": "/v1/analytics/summary",
        "category": "missing_endpoint",
        "documented": "GET /v1/analytics/summary returns pre-computed aggregates for the city.",
        "actual": "Returns 404 Not Found. The analytics endpoint does not exist.",
        "how_found": "Probed documented path and returned 404.",
        "impact": "Insights screen cannot fetch server pre-computed aggregates and must compute them from listings.",
        "evidence": []
    },
    {
        "endpoint": "*",
        "category": "pagination",
        "documented": "Every collection endpoint takes page (default 1) and limit (max 200). Response envelope contains total, page, page_size, results.",
        "actual": "The page parameter is quietly ignored (always returns offset 0). The API requires offset and limit (capped at max 50). Response envelope has limit, offset, count, total, has_more.",
        "how_found": "Paged with page=2 and received identical records to page=1; tested offset and verified pagination works.",
        "impact": "Clients using page parameter are stuck in an infinite loop reading page 1.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "pagination",
        "documented": "total is the exact number of records matching your filters. Dividing total by limit gives the page count.",
        "actual": "The total field underreports actual retrievable records (reports 3813, but continuing pagination until has_more is false yields 4100 records).",
        "how_found": "Paging past the documented total until has_more is false.",
        "impact": "Clients stop fetching prematurely and miss 287 valid listing records.",
        "evidence": []
    },
    {
        "endpoint": "/health",
        "category": "timestamps",
        "documented": "Timestamps are ISO 8601, UTC, Z suffix, everywhere in the API.",
        "actual": "Timestamps carry an explicit +05:30 offset or are local naive timestamps without Z suffix (server timezone is Asia/Kolkata).",
        "how_found": "Called /health and inspected posted_at values across all listings.",
        "impact": "Parsing timestamps strictly expecting Z suffix causes failures or 5.5 hour timezone calculation errors.",
        "evidence": ["MAG-4001518", "100-4000035"]
    },
    {
        "endpoint": "/v1/projects",
        "category": "units",
        "documented": "price_min and price_max are in rupees.",
        "actual": "Project prices are in mixed units: values < 10 are in Crores (x10^7 INR), and values >= 10 are in Lakhs (x10^5 INR). None are in raw rupees.",
        "how_found": "Compared project price ranges with prices of listings linked to those projects.",
        "impact": "Displays absurd project prices (e.g. Rs 35 to Rs 99 instead of Lakhs/Crores).",
        "evidence": ["P40231", "P40001", "P40003", "P40224"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "units",
        "documented": "Area: Square feet, integer, everywhere in the API.",
        "actual": "On website magichomes, listings with carpet_area < 200 are recorded in square meters rather than square feet.",
        "how_found": "Identified 333 listings exclusively on magichomes with carpet area 35-150 whose ratio to super_built_up_area matches square meter measurements.",
        "impact": "Displays flats with impossible 70 sqft area and distorts price per sqft calculations by 10.76x.",
        "evidence": ["MAG-4003885", "MAG-4002264", "MAG-4003492", "MAG-4000039", "MAG-4002824"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "units",
        "documented": "Money: Indian rupees, integer, everywhere in the API.",
        "actual": "Certain listings have price recorded in thousands of rupees (INR '000) rather than rupees.",
        "how_found": "Identified listings with prices like 7240 or 9430 whose price/sqft becomes normal market rate only when scaled by 1000.",
        "impact": "Properties appear to cost Rs 7,000 to 15,000 total price.",
        "evidence": ["DWE-4000745", "100-4001961", "SQU-4001342", "MAG-4000870", "ZER-4002683"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "completeness",
        "documented": "Returns active sale listings in your city. Inactive, expired and withdrawn listings are excluded server side.",
        "actual": "Endpoint returns both active and inactive listings (867 retrievable listings have is_live = false).",
        "how_found": "Inspected distribution of is_live field in response records.",
        "impact": "Users are shown inactive and withdrawn listings unless frontend explicitly filters for is_live == true.",
        "evidence": ["100-4001716", "ZER-4001053", "DWE-4002016", "MAG-4003789"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "filters",
        "documented": "total_listings always agrees with what GET /v1/listings?project_id=... returns.",
        "actual": "The project_id query parameter is quietly ignored by GET /v1/listings and returns all unfiltered listings.",
        "how_found": "Requested /v1/listings?project_id=P40014 and received listings from completely different projects.",
        "impact": "Filter by project fails silently on backend.",
        "evidence": ["P40014"]
    },
    {
        "endpoint": "/v1/projects",
        "category": "consistency",
        "documented": "total_listings always agrees with the count of available listings in that project.",
        "actual": "For 119 projects, total_listings does not match the count of live listings associated with the project_id.",
        "how_found": "Aggregated live listings by project_id and compared with project total_listings field.",
        "impact": "Project cards show incorrect available listing counts (including projects showing 0 that have live listings).",
        "evidence": ["P40014", "P40015", "P40018", "P40019", "P40025", "P40027", "P40028"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "data_quality",
        "documented": "Listing records describe physical properties in Chennai.",
        "actual": "Exactly 36 listing records describe physical impossibilities: negative prices (9), floor higher than total floors (9), carpet area larger than super built-up area (9), and swapped latitude/longitude placing coordinates in the Arctic Ocean (9).",
        "how_found": "Audited numerical constraints and geo-boundaries across all 4100 records.",
        "impact": "Corrupt listings displayed to users.",
        "evidence": q4_corrupt[:20]
    },
    {
        "endpoint": "/v1/listings",
        "category": "fraud",
        "documented": "posted_by_contact is the seller's verified contact number.",
        "actual": "Exactly 110 listings are fake lead-generation bait posted across 7 syndicate phone numbers with fictitious agency names (e.g. Dream Space, Urban Nest) and advance-fee scam sentences.",
        "how_found": "Identified phone numbers associated with multiple conflicting agency names and advance token phrases.",
        "impact": "Users are exposed to advance-fee lead bait scams.",
        "evidence": q9_fake[:20]
    },
    {
        "endpoint": "/v1/listings",
        "category": "duplicates",
        "documented": "Each listing corresponds to exactly one physical property.",
        "actual": "The same physical flat is listed multiple times across different websites with slightly different prices or names (42 duplicate clusters).",
        "how_found": "Grouped properties by exact building, locality, floor, total floors, BHK, facing direction, and normalized area.",
        "impact": "Duplicate cards displayed in search results.",
        "evidence": ["MAG-4003885", "MAG-4002617", "100-4000289", "ZER-4003784", "ZER-4003993", "ZER-4002843"]
    }
]

submission = {
    "api_key": "IVY26-287C534D9C9A",
    "candidate": {
        "name": "Vaibhav Pal",
        "email": "vaibhav.pal@mnnit.ac.in",
        "repo_url": "https://github.com/VAIBHAV8839/ivy-assignment",
        "demo_url": "https://all-in-for-ivy.duckdns.org"
    },
    "answers": {
        "total_listing_records": q1_total,
        "unique_properties": q2_unique,
        "active_listings": q3_active,
        "corrupt_listing_ids": q4_corrupt,
        "total_monthly_rent": q5_rent,
        "avg_price_per_sqft_2bhk": q6_avg_price,
        "costliest_project": q7_costliest,
        "listings_last_7_days": q8_last_7,
        "fake_listing_ids": q9_fake,
        "projects_with_wrong_listing_count": q10_wrong_projects
    },
    "findings": findings
}

sub_path = os.path.join(ROOT_DIR, "submission.json")
with open(sub_path, "w", encoding="utf-8") as f:
    json.dump(submission, f, indent=2)

print(f"Successfully generated {sub_path}!")
print("Answers Summary:")
for k, v in submission["answers"].items():
    if isinstance(v, list):
        print(f"  {k}: [{len(v)} items: {v[:3]}...]")
    else:
        print(f"  {k}: {v}")
print(f"Findings count: {len(findings)}")
