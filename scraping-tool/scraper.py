import requests
import json
import time
import os

# --- CONFIGURATION ---
API_KEY = "882e741f7283dc9ba1654d4692ec30f6" 
OUTPUT_FILE = "../public/movies_data.json"

# Beddel hadu ila bghiti kter (Kol page fiha 20)
# Maslan 100 page ghadi t-3tik 2000 Movie + 2000 TV = 4000 items.
PAGES_TO_SCRAPE = 1000 

def get_big_data():
    all_data = []
    media_types = ['movie', 'tv']

    print(f"🚀 Bdina l-khidma dyal Big Data...")
    
    for m_type in media_types:
        print(f"🎬 Khddamin 3la l-{m_type}s (Target: {PAGES_TO_SCRAPE * 20} items)")
        
        for page in range(1, PAGES_TO_SCRAPE + 1):
            params_en = {'api_key': API_KEY, 'language': 'en-US', 'page': page}
            params_ar = {'api_key': API_KEY, 'language': 'ar-SA', 'page': page}
            
            try:
                # English fetch
                res_en = requests.get(f"https://api.themoviedb.org/3/{m_type}/popular", params=params_en)
                if res_en.status_code != 200:
                    print(f"🛑 Hbsna f page {page} hitach: {res_en.status_code}")
                    break # Ila tqada l-7ed d l-pages
                
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
                        "title_en": name_en,
                        "title_ar": name_ar,
                        "overview_en": item_en.get('overview', ''),
                        "overview_ar": item_ar.get('overview', '') if item_ar and item_ar.get('overview') else item_en.get('overview', ''),
                        "poster": f"https://image.tmdb.org/t/p/w500{item_en.get('poster_path')}",
                        "rating": item_en.get('vote_average'),
                        "date": item_en.get('release_date') or item_en.get('first_air_date'),
                        "popularity": item_en.get('popularity')
                    }
                    all_data.append(entry)
                
                if page % 10 == 0:
                    print(f"💠 Safi jm3na {len(all_data)} items tal db...")
                
                # Bach TMDB API mat-banich 3lina (Rate limiting)
                time.sleep(0.1) 

            except Exception as e:
                print(f"⚠️ Error: {str(e)}")
                continue

    # Create folder ila makanch
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    # Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n✨ T-salat l-mouhimma!")
    print(f"📂 L-file fih {len(all_data)} items.")

if __name__ == "__main__":
    get_big_data()