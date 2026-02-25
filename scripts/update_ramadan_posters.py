import json
import requests
import time
import os
import re

API_KEY = "882e741f7283dc9ba1654d4692ec30f6"
BASE_URL = "https://api.themoviedb.org/3"
JSON_PATH = "public/ramadan_2026_results.json"

def search_tmdb(query):
    if not query or len(query) < 2:
        return []
    try:
        url = f"{BASE_URL}/search/multi"
        params = {
            "api_key": API_KEY,
            "query": query,
            "language": "ar"
        }
        response = requests.get(url, params=params)
        data = response.json()
        results = data.get("results", [])
        if not results:
            # Try English
            params["language"] = "en"
            response = requests.get(url, params=params)
            data = response.json()
            results = data.get("results", [])
            
        return results
    except Exception as e:
        print(f"Error searching TMDB for '{query}': {e}")
        return []

def clean_search_query(title):
    # Remove common prefixes
    prefixes = ["مسلسل ", "برنامج ", "سلسلة ", "فيلم ", "حصريا ", "مشاهدة "]
    query = title
    for p in prefixes:
        if query.lower().startswith(p.lower()):
            query = query[len(p):]
    
    # Remove year 2026, 2025 etc.
    query = re.sub(r'202\d', '', query)
    
    # Remove anything in brackets
    query = re.sub(r'\(.*?\)', '', query)
    query = re.sub(r'\[.*?\]', '', query)
    
    return query.strip()

def update_posters():
    if not os.path.exists(JSON_PATH):
        print(f"File not found: {JSON_PATH}")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated_count = 0
    total = len(data)

    print(f"Processing {total} items with AGGRESSIVE search...")

    for i, item in enumerate(data):
        title = item.get("title", "")
        clean_title = item.get("clean_title", "") or title
        current_poster = item.get("poster", "")
        
        # We want to replace posters that are from problematic domains or missing
        # But for this manual run, let's try to update ANYTHING that isn't already a TMDB original URL if we find a match
        needs_update = True
        if "image.tmdb.org" in current_poster:
             # Already a TMDB poster, maybe skip unless we want to "refresh" it
             # Let's skip to save API calls
             needs_update = False
        
        if needs_update:
            # 1. Cleaned full title (without prefixes/years)
            cleaned = clean_search_query(title)
            # 2. First 2-3 words of cleaned title
            words = cleaned.split()
            short = " ".join(words[:3]) if len(words) > 3 else cleaned
            very_short = " ".join(words[:2]) if len(words) > 2 else cleaned
            
            queries = [cleaned, short, very_short, clean_title]
            # De-duplicate queries and filter out empty/short ones
            queries = list(dict.fromkeys([q for q in queries if q and len(q) >= 2]))
            
            found_poster = None
            found_backdrop = None
            
            print(f"[{i+1}/{total}] Searching for '{title}'... (Queries: {queries})")
            
            for q in queries:
                results = search_tmdb(q)
                if results:
                    for hit in results:
                        if hit.get("poster_path"):
                            found_poster = f"https://image.tmdb.org/t/p/w500{hit['poster_path']}"
                            # Also grab backdrop if possible for better carousel support
                            if hit.get("backdrop_path"):
                                found_backdrop = f"https://image.tmdb.org/t/p/original{hit['backdrop_path']}"
                            break
                if found_poster:
                    break
            
            if found_poster:
                item["poster"] = found_poster
                if found_backdrop:
                    item["backdrop"] = found_backdrop
                updated_count += 1
                print(f"    -> FOUND: {found_poster}")
            else:
                print(f"    -> NOT FOUND")
            
            time.sleep(0.05)
        else:
            # print(f"[{i+1}/{total}] Skipping '{title}' (Already has TMDB poster)")
            pass

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Finished. Updated {updated_count} posters.")

if __name__ == "__main__":
    update_posters()
