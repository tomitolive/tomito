import json
import os
import re

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

            # Merge episode data. If already exists, we might want to prioritize specific sources
            # For simplicity, if it exists and has servers, we keep it, otherwise update.
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

            if not existing_ep or len(new_ep_data["watch_servers"]) >= len(existing_ep.get("watch_servers", [])):
                series_map[parent_id]["episodes_map"][ep_num] = new_ep_data

    # Final cleanup and nesting
    final_data = []
    for s_id, s in series_map.items():
        sorted_nums = sorted(s["episodes_map"].keys())
        eps = []
        for num in sorted_nums:
            ep = s["episodes_map"][num]
            if ep["watch_servers"]:
                # SPECIAL CLEANUP FOR AL-MADDAH
                if 'المداح' in s.get('title', ''):
                    ep['watch_servers'] = ep['watch_servers'][-4:]
                eps.append(ep)
        
        if eps:
            s["episodes"] = eps
            del s["episodes_map"]
            final_data.append(s)

    # Sort final series by title or popularity? Let's keep existing order mostly
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully cleaned, merged, and re-transformed {len(final_data)} series.")
    print(f"Output: {output_path}")

if __name__ == "__main__":
    sources = [
        '/home/tomito/Desktop/tomito/public/ramadan_2026_results.json', # Current public (nested/flattened)
        '/home/tomito/Desktop/tomito/dist/ramadan_2026_results.json',   # Latest dist bits
        '/home/tomito/Desktop/tomito/dist/ramadan_2026_results_batch2.json' # New batch
    ]
    transform_data(sources, '/home/tomito/Desktop/tomito/public/ramadan_2026_results.json')

