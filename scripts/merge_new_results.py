import json
import os
import re

def merge_list_by_key(old_list, new_list, key='url'):
    if not old_list: old_list = []
    if not new_list: return old_list
    indexed = {item[key]: item for item in old_list if isinstance(item, dict) and key in item}
    for item in new_list:
        if isinstance(item, dict) and key in item:
            if item[key] not in indexed:
                old_list.append(item)
                indexed[item[key]] = item
    return old_list

def merge_results():
    cwd = os.getcwd()
    # Paths for public/
    PUBLIC_MAIN = os.path.join(cwd, "public/ramadan_2026_results.json")
    PUBLIC_LIGHT = os.path.join(cwd, "public/ramadan_2026_results_light.json")
    # Paths for dist/
    DIST_MAIN = os.path.join(cwd, "dist/ramadan_2026_results.json")
    DIST_LIGHT = os.path.join(cwd, "dist/ramadan_2026_results_light.json")
    
    # Input batch files
    BATCH_1 = os.path.join(cwd, "dist/ramadan_2026_results_1.json")
    BATCH_2 = os.path.join(cwd, "dist/ramadan_2026_results_2.json")

    required_files = [PUBLIC_MAIN, BATCH_1, BATCH_2]
    for f in required_files:
        if not os.path.exists(f):
            print(f"Error: {f} not found.")
            return

    print("Loading data...")
    with open(PUBLIC_MAIN, 'r', encoding='utf-8') as f:
        main_data = json.load(f)

    batch_files = [BATCH_1, BATCH_2]
    
    series_index = {s['id']: s for s in main_data if s.get('type') == 'series'}

    new_series_count = 0
    new_episodes_count = 0
    merged_episodes_count = 0

    for batch_path in batch_files:
        print(f"Processing {os.path.basename(batch_path)}...")
        with open(batch_path, 'r', encoding='utf-8') as f:
            batch_data = json.load(f)

        # First pass: add all series and index them
        for item in batch_data:
            if item.get('type') == 'series':
                item_id = item['id']
                if item_id not in series_index:
                    if 'episodes' not in item:
                        item['episodes'] = []
                    main_data.append(item)
                    series_index[item_id] = item
                    new_series_count += 1
                else:
                    existing_series = series_index[item_id]
                    # Update metadata
                    for key, value in item.items():
                        if key not in existing_series or not existing_series[key]:
                            existing_series[key] = value

        # Second pass: add/merge episodes
        for item in batch_data:
            if item.get('type') == 'episode':
                parent_id = item.get('parent_id')
                if not parent_id and item.get('id'):
                     # Some files might use 'id' as 'parent_id' for episodes or vice versa
                     parent_id = item['id']

                if parent_id in series_index:
                    parent_series = series_index[parent_id]
                    if 'episodes' not in parent_series:
                        parent_series['episodes'] = []
                    
                    # Extract episode number if missing
                    if 'episode_number' not in item:
                        match = re.search(r'الحلقة\s+(\d+)', item['title'])
                        if match:
                            item['episode_number'] = int(match.group(1))

                    ep_num = item.get('episode_number')
                    ep_url = item.get('url')
                    
                    # Find existing episode
                    existing_ep = None
                    for ep in parent_series['episodes']:
                        if ep_url and ep.get('url') == ep_url:
                            existing_ep = ep
                            break
                        if ep_num and ep.get('episode_number') == ep_num:
                            existing_ep = ep
                            break
                    
                    if existing_ep:
                        # Merge watch_servers and download_links
                        existing_ep['watch_servers'] = merge_list_by_key(
                            existing_ep.get('watch_servers', []), 
                            item.get('watch_servers', [])
                        )
                        existing_ep['download_links'] = merge_list_by_key(
                            existing_ep.get('download_links', []), 
                            item.get('download_links', [])
                        )
                        merged_episodes_count += 1
                    else:
                        parent_series['episodes'].append(item)
                        new_episodes_count += 1

    # Update counts, sort, and light data
    print("Updating metadata and sorting...")
    light_data = []
    for s in main_data:
        if s.get('type') == 'series':
            if 'episodes' in s:
                # Sort by episode number
                s['episodes'].sort(key=lambda x: x.get('episode_number', 0))
                s['episode_count'] = len(s['episodes'])
            
            light_item = {
                "id": s['id'],
                "title": s['title'],
                "clean_title": s.get('clean_title', s['title'].replace("مسلسل ", "").split(" 202")[0]),
                "poster": s.get('poster'),
                "backdrop": s.get('backdrop'),
                "year": s.get('year', "2026"),
                "isSupreme": s.get('isSupreme', False),
                "episode_count": s.get('episode_count', 0)
            }
            light_data.append(light_item)

    print("Saving files...")
    for path in [PUBLIC_MAIN, DIST_MAIN]:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(main_data, f, ensure_ascii=False, indent=2)

    for path in [PUBLIC_LIGHT, DIST_LIGHT]:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(light_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully processed:")
    print(f"- {new_series_count} new series added.")
    print(f"- {new_episodes_count} new episodes added.")
    print(f"- {merged_episodes_count} existing episodes updated with new links.")

if __name__ == "__main__":
    merge_results()
