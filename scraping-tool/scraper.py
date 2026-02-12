import requests
import json
import time
import os

# --- CONFIGURATION ---
API_KEY = "882e741f7283dc9ba1654d4692ec30f6" 
# Use absolute paths relative to the script's directory for reliability
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../public/data")

MOVIES_FILE = os.path.join(DATA_DIR, "movies.json")
TV_SHOWS_FILE = os.path.join(DATA_DIR, "tv-shows.json")

# Number of pages to scrape (20 items per page)
PAGES_TO_SCRAPE = 100 

def get_big_data():
    all_movies = []
    all_tv = []
    media_types = ['movie', 'tv']

    print(f"🚀 Starting Scraper...")
    
    for m_type in media_types:
        print(f"🎬 Processing {m_type}s (Target: {PAGES_TO_SCRAPE * 20} items)")
        
        for page in range(1, PAGES_TO_SCRAPE + 1):
            params_en = {'api_key': API_KEY, 'language': 'en-US', 'page': page}
            params_ar = {'api_key': API_KEY, 'language': 'ar-SA', 'page': page}
            
            try:
                # English fetch
                res_en = requests.get(f"https://api.themoviedb.org/3/{m_type}/popular", params=params_en)
                if res_en.status_code != 200:
                    print(f"🛑 Stopped at page {page} due to: {res_en.status_code}")
                    break
                
                data_en = res_en.json().get('results', [])
                
                # Arabic fetch
                res_ar = requests.get(f"https://api.themoviedb.org/3/{m_type}/popular", params=params_ar)
                data_ar = res_ar.json().get('results', []) if res_ar.status_code == 200 else []

                for item_en in data_en:
                    # Match Arabic version
                    item_ar = next((m for m in data_ar if m['id'] == item_en['id']), None)
                    
                    name_en = item_en.get('title') or item_en.get('name')
                    name_ar = (item_ar.get('title') or item_ar.get('name')) if item_ar else name_en

                    entry = {
                        "id": item_en['id'],
                        "type": m_type,
                        "title": name_en, # Simplified key names to match generator
                        "title_ar": name_ar,
                        "overview": item_en.get('overview', ''),
                        "overview_ar": item_ar.get('overview', '') if item_ar and item_ar.get('overview') else item_en.get('overview', ''),
                        "poster_path": item_en.get('poster_path'),
                        "vote_average": item_en.get('vote_average'),
                        "release_date": item_en.get('release_date') or item_en.get('first_air_date'),
                        "popularity": item_en.get('popularity')
                    }
                    if m_type == 'movie':
                        all_movies.append(entry)
                    else:
                        all_tv.append(entry)
                
                if page % 10 == 0:
                    print(f"💠 Scraped {page} pages so far...")
                
                time.sleep(0.1) 

            except Exception as e:
                print(f"⚠️ Error: {str(e)}")
                continue

    # Create folder if it doesn't exist
    os.makedirs(DATA_DIR, exist_ok=True)

    # Save Movies
    with open(MOVIES_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_movies, f, ensure_ascii=False, indent=4)
    
    # Save TV Shows
    with open(TV_SHOWS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_tv, f, ensure_ascii=False, indent=4)
    
    print(f"\n✨ Mission Completed!")
    print(f"📂 Movies: {len(all_movies)} items.")
    print(f"📂 TV Shows: {len(all_tv)} items.")

if __name__ == "__main__":
    get_big_data()