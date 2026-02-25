import json
import os
import re
import requests
import time

# Dictionary to map Arabic number words to digits
ARABIC_NUMBERS = {
    'الاولى': 1, 'الاول': 1, 'الأولى': 1, 'الأول': 1,
    'الثانية': 2, 'الثاني': 2, 'الثانيه': 2,
    'الثالثة': 3, 'الثالث': 3, 'الثالثه': 3,
    'الرابعة': 4, 'الرابع': 4, 'الرابعه': 4,
    'الخامسة': 5, 'الخامس': 5, 'الخامسه': 5,
    'السادسة': 6, 'السادس': 6, 'السادسه': 6,
    'السابعة': 7, 'السابع': 7, 'السابعه': 7,
    'الثامنة': 8, 'الثامن': 8, 'الثامنه': 8,
    'التاسعة': 9, 'التاسع': 9, 'التاسعه': 9,
    'العاشرة': 10, 'العاشر': 10, 'العاشره': 10,
    'الاخيرة': 30, 'الأخيرة': 30
}

# Configuration
TMDB_API_KEY = "882e741f7283dc9ba1654d4692ec30f6"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500"

def fetch_tmdb_poster(query):
    if not query:
        return None
    try:
        url = f"{TMDB_BASE_URL}/search/multi"
        params = {
            "api_key": TMDB_API_KEY,
            "query": query,
            "language": "ar"
        }
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("results"):
                # Try to find a TV or Movie match
                for res in data["results"]:
                    if res.get("media_type") in ["tv", "movie"] and res.get("poster_path"):
                        return f"{TMDB_IMG_URL}{res['poster_path']}"
        return None
    except Exception as e:
        print(f"Error fetching TMDB poster for {query}: {e}")
        return None

def clean_title(title):
    if not title: return ""
    title = re.sub(r'^(مسلسل|برنامج)\s+', '', title)
    title = re.sub(r'\s+الحلقة\s+.*$', '', title)
    title = re.sub(r'\s+الحلقه\s+.*$', '', title)
    title = re.sub(r'\s+-\s+.*$', '', title)
    title = re.sub(r'كامل|بجودة|عالية|مترجم|مدبلج', '', title)
    return title.strip()

def extract_episode_number(title):
    if not title: return None
    match = re.search(r'(?:الحلقة|الحلقه)\s+(\d+)', title)
    if match: return int(match.group(1))
    for word, num in ARABIC_NUMBERS.items():
        if re.search(rf'(?:الحلقة|الحلقه)\s+{word}', title):
            return num
    match = re.search(r'(\d+)\s*$', title)
    if match: return int(match.group(1))
    return None

def transform_data(input_paths, output_path):
    series_map = {}

    for input_path in input_paths:
        if not os.path.exists(input_path):
            print(f"Warning: {input_path} not found. Skipping.")
            continue

        print(f"Processing source: {input_path}")
        with open(input_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        # Normalize data: Flatten if nested, then process
        normalized_entries = []
        for item in raw_data:
            if item.get('type') == 'series' and 'episodes' in item:
                episodes = item.pop('episodes', [])
                normalized_entries.append(item)
                for ep in episodes:
                    ep['type'] = 'episode'
                    ep['parent_id'] = item['id']
                    normalized_entries.append(ep)
            else:
                normalized_entries.append(item)

        # 1. First pass: Collect/Merge Series attributes
        for entry in [item for item in normalized_entries if item.get('type') == 'series']:
            s_id = entry.get('id')
            if s_id not in series_map:
                series_map[s_id] = {
                    "id": s_id,
                    "title": entry.get('title'),
                    "clean_title": entry.get('clean_title') or clean_title(entry.get('title')),
                    "poster": entry.get('poster'),
                    "description": entry.get('description'),
                    "year": entry.get('year', '2026'),
                    "type": "series",
                    "episodes_map": {}
                }
            else:
                # Update series if new info is available (prefer non-empty)
                for key in ["title", "clean_title", "poster", "description"]:
                    if entry.get(key) and not series_map[s_id].get(key):
                        series_map[s_id][key] = entry.get(key)

        # 2. Second pass: Collect/Merge Episodes
        for ep in [item for item in normalized_entries if item.get('type') == 'episode']:
            parent_id = ep.get('parent_id')
            if not parent_id: continue
            
            if parent_id not in series_map:
                s_title = clean_title(ep.get('title'))
                series_map[parent_id] = {
                    "id": parent_id, "title": s_title, "clean_title": s_title,
                    "poster": ep.get('poster'), "description": ep.get('description'),
                    "year": ep.get('year', '2026'), "type": "series", "episodes_map": {}
                }
            
            ep_num = ep.get('episode_number') or extract_episode_number(ep.get('title'))
            if ep_num is None: ep_num = 0

            existing_ep = series_map[parent_id]["episodes_map"].get(ep_num)
            
            new_ep_data = {
                "id": ep.get('id'),
                "title": ep.get('title'),
                "episode_number": ep_num,
                "poster": ep.get('poster'),
                "description": ep.get('description'),
                "watch_servers": ep.get('watch_servers', []),
                "download_links": ep.get('download_links', [])
            }

            # Merge episode data. We now merge servers and download links from all sources.
            if not existing_ep:
                series_map[parent_id]["episodes_map"][ep_num] = new_ep_data
            else:
                # Merge watch_servers
                existing_servers = existing_ep.get('watch_servers', [])
                existing_urls = {s['url'] for s in existing_servers}
                for s in new_ep_data['watch_servers']:
                    if s['url'] not in existing_urls:
                        existing_servers.append(s)
                        existing_urls.add(s['url'])
                existing_ep['watch_servers'] = existing_servers
                
                # Merge download_links
                existing_dls = existing_ep.get('download_links', [])
                existing_dl_urls = {s['url'] for s in existing_dls}
                for s in new_ep_data['download_links']:
                    if s['url'] not in existing_dl_urls:
                        existing_dls.append(s)
                        existing_dl_urls.add(s['url'])
                existing_ep['download_links'] = existing_dls
                
                # Update other fields if empty
                for key in ["id", "title", "poster", "description"]:
                    if not existing_ep.get(key) and new_ep_data.get(key):
                        existing_ep[key] = new_ep_data[key]

    # Final cleanup and nesting
    final_data = []
    # Sort series map by title to keep a stable order
    sorted_ids = sorted(series_map.keys(), key=lambda x: series_map[x].get('title', ''))
    
    final_data = []
    print(f"Enriching {len(sorted_ids)} series with TMDB posters...")
    
    for s_id in sorted_ids:
        s = series_map[s_id]
        
        # TMDB Enrichment: Try clean_title first, then title
        tmdb_poster = fetch_tmdb_poster(s.get("clean_title"))
        if not tmdb_poster:
            tmdb_poster = fetch_tmdb_poster(s.get("title"))
            
        if tmdb_poster:
            s["poster"] = tmdb_poster
            print(f"Found TMDB poster for: {s.get('title')}")
            # Optional: Sleep slightly to be nice to API
            time.sleep(0.1)
        else:
            print(f"No TMDB poster found for: {s.get('title')}")

        sorted_nums = sorted(s["episodes_map"].keys())
        eps = []
        for num in sorted_nums:
            ep = s["episodes_map"][num]
            # INCLUSIVE: Keep even without watch_servers
            eps.append(ep)
        
        # INCLUSIVE: Keep series even if eps is empty
        s["episodes"] = eps
        if "episodes_map" in s:
            del s["episodes_map"]
        final_data.append(s)

    # Final count check
    print(f"Total series in memory: {len(final_data)}")
    total_eps = sum(len(s.get('episodes', [])) for s in final_data)
    print(f"Total episodes in memory: {total_eps}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully cleaned, merged, and re-transformed {len(final_data)} series.")
    print(f"Total nested episodes: {total_eps}")
    print(f"Output: {output_path}")

if __name__ == "__main__":
    sources = [
        '/home/tomito/Desktop/tomito/public/ramadan_2026_results.json',
        '/home/tomito/Desktop/tomito/dist/ramadan_2026_results.json'
    ]
    output_path = '/home/tomito/Desktop/tomito/public/ramadan_2026_results.json'
    transform_data(sources, output_path)
    
    # Also copy to dist to keep them in sync
    import shutil
    shutil.copy2(output_path, '/home/tomito/Desktop/tomito/dist/ramadan_2026_results.json')
    print(f"Synced to dist/ramadan_2026_results.json")

