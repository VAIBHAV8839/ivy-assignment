import json
import os
from collections import Counter, defaultdict
from datetime import datetime

SCRATCH_DIR = r"C:\Users\saura\.gemini\antigravity\brain\fdcfe58d-1a28-4492-81f9-efca80e55d18\scratch"

with open(os.path.join(SCRATCH_DIR, "listings.json"), "r", encoding="utf-8") as f:
    listings_data = json.load(f)
    listings = listings_data["records"]

with open(os.path.join(SCRATCH_DIR, "rentals.json"), "r", encoding="utf-8") as f:
    rentals_data = json.load(f)
    rentals = rentals_data["records"]

with open(os.path.join(SCRATCH_DIR, "projects.json"), "r", encoding="utf-8") as f:
    projects_data = json.load(f)
    projects = projects_data["records"]

print(f"Loaded {len(listings)} listings, {len(rentals)} rentals, {len(projects)} projects.")

# ----------------- Q1: total_listing_records -----------------
print("\n=== Q1: Total Listing Records ===")
print("Total listing records:", len(listings))

# ----------------- Q3: active_listings -----------------
print("\n=== Q3: Active Listings ===")
is_live_counts = Counter(l.get("is_live") for l in listings)
print("is_live counts:", is_live_counts)
active_count = sum(1 for l in listings if l.get("is_live") is True)
print(f"active_listings (is_live == True): {active_count}")

# ----------------- Inspect Fields & Types in listings -----------------
print("\nSample listing keys:", list(listings[0].keys()))

# ----------------- Q4: Corrupt Listing Records -----------------
print("\n=== Investigating Potential Corrupt Listings (Q4) ===")
corrupt_candidates = []

for l in listings:
    lid = l["listing_id"]
    reasons = []
    
    # 1. Floor vs Total Floors
    floor = l.get("floor")
    total_floors = l.get("total_floors")
    if floor is not None and total_floors is not None:
        if floor > total_floors:
            reasons.append(f"floor ({floor}) > total_floors ({total_floors})")
        if total_floors < 0:
            reasons.append(f"total_floors < 0 ({total_floors})")
        if floor < 0: # unless basement?
            reasons.append(f"floor < 0 ({floor})")
            
    # 2. Area checks
    carpet = l.get("carpet_area")
    super_built = l.get("super_built_up_area")
    if carpet is not None:
        if carpet <= 0:
            reasons.append(f"carpet_area <= 0 ({carpet})")
        if super_built is not None and super_built > 0:
            if carpet > super_built:
                reasons.append(f"carpet ({carpet}) > super_built ({super_built})")
                
    # 3. Price checks
    price = l.get("price")
    if price is not None and price <= 0:
        reasons.append(f"price <= 0 ({price})")
        
    # 4. Bedroom / Bathroom
    bedroom = l.get("bedroom")
    bathroom = l.get("bathroom")
    if bedroom is not None and bedroom <= 0:
        reasons.append(f"bedroom <= 0 ({bedroom})")
    if bathroom is not None and bathroom <= 0:
        reasons.append(f"bathroom <= 0 ({bathroom})")
        
    # 5. Coordinates (Chennai is ~12.8 - 13.3 N, ~80.0 - 80.4 E)
    lat = l.get("latitude")
    lon = l.get("longitude")
    if lat is not None and lon is not None:
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            reasons.append(f"invalid lat/lon ({lat}, {lon})")
        elif not (12.0 <= lat <= 14.0 and 79.0 <= lon <= 81.5):
            reasons.append(f"lat/lon far outside Chennai ({lat}, {lon})")
            
    # 6. Balcony
    balcony = l.get("balcony")
    if balcony is not None and balcony < 0:
        reasons.append(f"balcony < 0 ({balcony})")

    if reasons:
        corrupt_candidates.append((lid, reasons, l))

print(f"Found {len(corrupt_candidates)} corrupt candidates:")
for lid, reasons, l in corrupt_candidates:
    print(f"  {lid}: {', '.join(reasons)}")

# ----------------- Q5: Rentals in assigned locality -----------------
print("\n=== Q5: Rentals in Thoraipakkam ===")
localities_in_rentals = Counter(r.get("locality", "").lower() for r in rentals)
print("Top 10 rental localities:", localities_in_rentals.most_common(10))
thoraipakkam_rentals = [r for r in rentals if r.get("locality", "").lower() == "thoraipakkam"]
print(f"Total rentals in thoraipakkam: {len(thoraipakkam_rentals)}")

prices = [r.get("price", 0) for r in thoraipakkam_rentals]
print(f"Sample prices in thoraipakkam: {prices[:10]}")
total_rent = sum(prices)
print(f"total_monthly_rent: {total_rent}")

# Check for rental unit anomalies or strange fields in rentals
print("Rental price range:", min(prices) if prices else 0, "to", max(prices) if prices else 0)

# ----------------- Q7: Costliest Project -----------------
print("\n=== Q7: Costliest Project ===")
max_proj = None
max_price = -1
for p in projects:
    p_max = p.get("price_max")
    # check if there's any other price field or if price_max is in INR
    if p_max is not None and p_max > max_price:
        max_price = p_max
        max_proj = p

print(f"Costliest project by price_max: project_id={max_proj.get('project_id')}, price_max={max_price}, name={max_proj.get('apartment_name')}")

# Check all price fields in projects to see if any project has strange units or price_max_inr vs price_max
proj_prices = sorted([(p.get("project_id"), p.get("price_max"), p.get("price_min"), p.get("apartment_name")) for p in projects], key=lambda x: x[1] if x[1] else 0, reverse=True)
print("Top 5 costliest projects:")
for x in proj_prices[:5]:
    print(" ", x)

# ----------------- Q8: Listings last 7 days -----------------
print("\n=== Q8: Listings posted in [REFERENCE - 7 days, REFERENCE) ===")
# REFERENCE = 2026-09-10T00:00:00+05:30
# 7 days before = 2026-09-03T00:00:00+05:30
# Check date format in posted_at
posted_dates = [l.get("posted_at") for l in listings if l.get("posted_at")]
print("Sample posted_at values:", posted_dates[:5])

count_last_7 = 0
for l in listings:
    p = l.get("posted_at")
    if not p:
        continue
    # Let's inspect format: e.g. "2026-01-19T12:56:00" or with Z or +05:30
    # Python 3.11+ fromisoformat handles many formats
    try:
        if p.endswith("Z"):
            dt = datetime.fromisoformat(p.replace("Z", "+00:00"))
        else:
            # check if offset is present
            dt = datetime.fromisoformat(p)
            if dt.tzinfo is None:
                # If no timezone specified, is it IST?
                # The prompt says: "in [REFERENCE - 7 days, REFERENCE), in IST?"
                pass
    except Exception as e:
        print(f"Error parsing date {p}: {e}")

# We will write precise datetime comparison logic
