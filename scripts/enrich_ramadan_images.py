import json
import requests
import time
import os

TMDB_API_KEY = "882e741f7283dc9ba1654d4692ec30f6"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500"
INPUT_FILE = "public/ramadan_2026_results.json"
OUTPUT_FILE = "public/ramadan_2026_results.json"

def search_tv(query):
    try:
        url = f"{TMDB_BASE_URL}/search/tv"
        params = {"api_key": TMDB_API_KEY, "query": query, "language": "ar"}
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            results = response.json().get("results", [])
            return results[0] if results else None
    except Exception as e:
        print(f"Error searching TMDB for {query}: {e}")
    return None

def fetch_season_details(tv_id, season_number=1):
    try:
        url = f"{TMDB_BASE_URL}/tv/{tv_id}/season/{season_number}"
        params = {"api_key": TMDB_API_KEY, "language": "ar"}
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching season details for {tv_id}: {e}")
    return None

def enrich_data():
    if not os.path.exists(INPUT_FILE):
        print(f"Input file {INPUT_FILE} not found.")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Enriching {len(data)} series...")
    for i, series in enumerate(data):
        title = series.get("clean_title") or series.get("title")
        print(f"[{i+1}/{len(data)}] Processing: {title}")
        
        hit = search_tv(title)
        if hit:
            series["poster"] = f"{TMDB_IMG_URL}{hit.get('poster_path')}" if hit.get('poster_path') else series.get("poster")
            series["backdrop"] = f"{TMDB_IMG_URL}{hit.get('backdrop_path')}" if hit.get('backdrop_path') else None
            
            # Fetch Season 1 for episode stills
            season = fetch_season_details(hit["id"], 1)
            if season and "episodes" in season:
                tmdb_episodes = season["episodes"]
                for ep in series.get("episodes", []):
                    # Match by episode number
                    ep_num = ep.get("episode_number")
                    tmdb_ep = next((te for te in tmdb_episodes if te.get("episode_number") == ep_num), None)
                    if tmdb_ep and tmdb_ep.get("still_path"):
                        ep["poster"] = f"{TMDB_IMG_URL}{tmdb_ep['still_path']}"
                        print(f"  - Found still for EP {ep_num}")
            
            # Be nice to API
            time.sleep(0.1)
        else:
            print(f"  - No TMDB match found.")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Enrichment complete!")

if __name__ == "__main__":
    enrich_data()
