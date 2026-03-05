import json
import os
import re
import shutil

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

def extract_episode_number(title):
    if not title: return None
    # 1. Look for explicit digits
    match = re.search(r'(?:الحلقة|الحلقه)\s+(\d+)', title)
    if match: return int(match.group(1))
    # 2. Look for Arabic number words
    for word, num in ARABIC_NUMBERS.items():
        if re.search(rf'(?:الحلقة|الحلقه)\s+{word}', title):
            return num
    # 3. Fallback: Last number in title
    match = re.search(r'(\d+)\s*$', title)
    if match: return int(match.group(1))
    return None

def clean_title(title):
    if not title: return ""
    return title.replace("مسلسل ", "").replace("برنامج ", "").split(" الحلقة")[0].strip()

def robust_merge(sources, output_path):
    series_map = {} # id -> series data
    # episodes_map: id -> ep_num -> episode data
    
    print(f"Reading {len(sources)} sources...")
    
    for path in sources:
        if not os.path.exists(path):
            print(f"Warning: Source not found: {path}")
            continue
        
        print(f"Processing {path}...")
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for item in data:
            if item.get('type') == 'series' or 'episodes' in item:
                s_id = item.get('id')
                if not s_id: continue
                
                if s_id not in series_map:
                    series_map[s_id] = {
                        "id": s_id,
                        "title": item.get('title', ''),
                        "clean_title": item.get('clean_title', clean_title(item.get('title'))),
                        "poster": item.get('poster'),
                        "description": item.get('description'),
                        "year": item.get('year', '2026'),
                        "type": item.get('type', 'series'),
                        "isSupreme": item.get('isSupreme', False),
                        "episodes_internal": {}
                    }
                else:
                    # Update metadata if missing
                    for key in ["poster", "description", "clean_title", "title", "isSupreme"]:
                        if not series_map[s_id].get(key) and item.get(key):
                            series_map[s_id][key] = item[key]
                
                # If it already has episodes (nested format)
                if 'episodes' in item:
                    for ep in item['episodes']:
                        ep_num = ep.get('episode_number') or extract_episode_number(ep.get('title'))
                        if ep_num is None: ep_num = 0
                        
                        eps = series_map[s_id]["episodes_internal"]
                        if ep_num not in eps:
                            eps[ep_num] = ep
                        else:
                            # Merge servers
                            seen_urls = {s['url'] for s in eps[ep_num].get('watch_servers', [])}
                            for s in ep.get('watch_servers', []):
                                if s['url'] not in seen_urls:
                                    eps[ep_num].setdefault('watch_servers', []).append(s)
                            
                            seen_dw_urls = {s['url'] for s in eps[ep_num].get('download_links', [])}
                            for s in ep.get('download_links', []):
                                if s['url'] not in seen_dw_urls:
                                    eps[ep_num].setdefault('download_links', []).append(s)
            
            elif item.get('type') == 'episode' or item.get('parent_id'):
                p_id = item.get('parent_id') or item.get('id') # Fallback to id if it's a flat episode but parent_id missing
                if not p_id: continue
                
                if p_id not in series_map:
                    # Create placeholder series
                    s_title = clean_title(item.get('title'))
                    series_map[p_id] = {
                        "id": p_id,
                        "title": s_title,
                        "clean_title": s_title,
                        "poster": item.get('poster'),
                        "description": item.get('description'),
                        "year": "2026",
                        "type": "series",
                        "isSupreme": False,
                        "episodes_internal": {}
                    }
                
                ep_num = item.get('episode_number') or extract_episode_number(item.get('title'))
                if ep_num is None: ep_num = 0
                
                eps = series_map[p_id]["episodes_internal"]
                if ep_num not in eps:
                    # Convert to nested format
                    eps[ep_num] = {
                        "id": item.get('id'),
                        "title": item.get('title'),
                        "episode_number": ep_num,
                        "poster": item.get('poster'),
                        "description": item.get('description'),
                        "watch_servers": item.get('watch_servers', []),
                        "download_links": item.get('download_links', [])
                    }
                else:
                    # Merge servers
                    seen_urls = {s['url'] for s in eps[ep_num].get('watch_servers', [])}
                    for s in item.get('watch_servers', []):
                        if s['url'] not in seen_urls:
                            eps[ep_num].setdefault('watch_servers', []).append(s)
                            
                    seen_dw_urls = {s['url'] for s in eps[ep_num].get('download_links', [])}
                    for s in item.get('download_links', []):
                        if s['url'] not in seen_dw_urls:
                            eps[ep_num].setdefault('download_links', []).append(s)

    # Convert back to list and final nesting
    final_list = []
    print(f"Final conversion of {len(series_map)} series...")
    
    for s_id, s in series_map.items():
        # Sort episodes by number
        sorted_eps = []
        for num in sorted(s["episodes_internal"].keys()):
            sorted_eps.append(s["episodes_internal"][num])
        
        s["episodes"] = sorted_eps
        del s["episodes_internal"]
        final_list.append(s)

    # Sort final list by title
    final_list.sort(key=lambda x: x.get('title', ''))

    print(f"Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
    
    # --- Split into individual files for Watch Page Performance ---
    data_dir = "public/ramadan-data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created directory: {data_dir}")
    
    print(f"Splitting into individual files in {data_dir}...")
    for s in final_list:
        slug_title = s.get('clean_title') or clean_title(s.get('title'))
        # Generate slug consistent with frontend
        slug = slug_title.replace(" ", "-")
        # Handle characters that might be problematic in filenames but allow Arabic
        # We just need it to match the JS encodeURIComponent / decodeURIComponent logic
        # Actually, for filenames, simple dash replace is usually enough if we are careful
        
        file_path = os.path.join(data_dir, f"{slug}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(s, f, ensure_ascii=False, indent=2)
            
    print(f"Final stats: {len(final_list)} series, {sum(len(s['episodes']) for s in final_list)} episodes.")

    # --- Generate Lightweight JSON for Main Grid ---
    light_list = []
    for s in final_list:
        light_list.append({
            "id": s.get("id"),
            "title": s.get("title"),
            "clean_title": s.get("clean_title"),
            "poster": s.get("poster"),
            "backdrop": s.get("backdrop"),
            "description": s.get("description"),
            "year": s.get("year", "2026"),
            "isSupreme": s.get("isSupreme", False),
            "episode_count": len(s.get("episodes", []))
        })
    
    light_path = "public/ramadan_2026_results_light.json"
    print(f"Writing lightweight JSON to {light_path}...")
    with open(light_path, 'w', encoding='utf-8') as f:
        json.dump(light_list, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    sources = [
        "dist/ramadan_2026_results.json",
        "dist/ramadan_2026_results_1.json",
        "dist/ramadan_2026_results_2.json"
    ]
    robust_merge(sources, "public/ramadan_2026_results.json")
    shutil.copy2("public/ramadan_2026_results.json", "dist/ramadan_2026_results.json")
