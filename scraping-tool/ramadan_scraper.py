import requests
import json
import os
import time

# --- CONFIGURATION ---
API_KEY = "882e741f7283dc9ba1654d4692ec30f6"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Target file for 2026 series
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../public/ramadan_series_2026.json")

def search_ramadan_series(year):
    print(f"🔍 Searching for Ramadan series in {year}...")
    url = "https://api.themoviedb.org/3/discover/tv"
    # Using Arabic language, filtering by year and specific region (Arab world)
    params = {
        'api_key': API_KEY,
        'language': 'ar-SA',
        'first_air_date_year': year,
        'with_original_language': 'ar',
        'sort_by': 'popularity.desc'
    }
    
    res = requests.get(url, params=params)
    if res.status_code == 200:
        return res.json().get('results', [])
    return []

def fetch_full_details(tv_id):
    url = f"https://api.themoviedb.org/3/tv/{tv_id}"
    
    # Fetch Arabic
    res_ar = requests.get(url, params={'api_key': API_KEY, 'language': 'ar-SA'})
    # Fetch English
    res_en = requests.get(url, params={'api_key': API_KEY, 'language': 'en-US'})
    
    if res_ar.status_code == 200 and res_en.status_code == 200:
        d_ar = res_ar.json()
        d_en = res_en.json()
        
        return {
            "id": tv_id,
            "type": "tv",
            "title_en": d_en.get('name'),
            "title_ar": d_ar.get('name'),
            "overview_en": d_en.get('overview', ''),
            "overview_ar": d_ar.get('overview', ''),
            "poster": f"https://image.tmdb.org/t/p/w500{d_en.get('poster_path')}" if d_en.get('poster_path') else "",
            "rating": d_en.get('vote_average', 0),
            "date": d_en.get('first_air_date', ''),
            "popularity": d_en.get('popularity', 0)
        }
    return None

def main():
    years = [2026] # Only look for 2026
    all_series = []
    seen_ids = set()

    for year in years:
        results = search_ramadan_series(year)
        print(f"✅ Found {len(results)} potential series for {year}.")
        
        for item in results:
            tv_id = item['id']
            if tv_id not in seen_ids:
                print(f"✨ Fetching details for: {item.get('name')} (ID: {tv_id})")
                details = fetch_full_details(tv_id)
                if details:
                    all_series.append(details)
                    seen_ids.add(tv_id)
                time.sleep(0.1)

    if all_series:
        with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(all_series, f, ensure_ascii=False, indent=4)
        print(f"\n🚀 Mission Completed! Saved {len(all_series)} Ramadan series to {OUTPUT_PATH}")
    else:
        print("\n⚠️ No series found for 2026 yet.")

if __name__ == "__main__":
    main()
