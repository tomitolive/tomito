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

def get_slug(title, clean_title_attr=None):
    if clean_title_attr:
        base = clean_title_attr
    else:
        # Normalize/clean title like the frontend does
        base = re.sub(r'^(مسلسل|برنامج)\s+', '', title)
        base = re.sub(r'\s+الحلقة\s+\d+.*$', '', base)
        base = re.sub(r'\s+الحلقه\s+\d+.*$', '', base)
        base = re.sub(r'\s+-\s+.*$', '', base)
        base = re.sub(r'كامل|بجودة|عالية|مترجم|مدبلج', '', base)
        base = base.strip()
    
    # Replace spaces with hyphens and ensure it's URL-safe-ish
    slug = base.replace(' ', '-')
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    return slug

def merge_results():
    cwd = os.getcwd()
    
    # ── Input Files ──
    BATCHES = [
        os.path.join(cwd, "dist/ramadan_2026_results_1.json"),
        os.path.join(cwd, "dist/ramadan_2026_results_2.json"),
        os.path.join(cwd, "dist/ramadan_2026_results_3.json")
    ]
    
    # ── Output Directories ──
    DATA_DIRS = [
        os.path.join(cwd, "public/ramadan-data"), # Legacy/Development
        os.path.join(cwd, "public/data/ramadan"), # New Structure (Public)
        os.path.join(cwd, "dist/data/ramadan")    # Production Structure
    ]
    for d in DATA_DIRS:
        os.makedirs(d, exist_ok=True)

    # ── Load Existing Data ──
    # Default to public file as source of truth for existing data
    source_path = os.path.join(cwd, "public/ramadan_2026_results.json")
    main_data = []
    if os.path.exists(source_path):
        print(f"Loading existing data from {source_path}...")
        with open(source_path, 'r', encoding='utf-8') as f:
            main_data = json.load(f)

    series_index = {str(s['id']): s for s in main_data if s.get('type') == 'series'}

    new_series_count = 0
    new_episodes_count = 0
    merged_episodes_count = 0

    # ── Merge Batches ──
    for batch_path in BATCHES:
        if not os.path.exists(batch_path):
            continue
            
        print(f"Processing {os.path.basename(batch_path)}...")
        with open(batch_path, 'r', encoding='utf-8') as f:
            batch_data = json.load(f)

        # Pass 1: Series Metadata
        for item in batch_data:
            if item.get('type') == 'series':
                item_id = str(item['id'])
                if item_id not in series_index:
                    if 'episodes' not in item:
                        item['episodes'] = []
                    main_data.append(item)
                    series_index[item_id] = item
                    new_series_count += 1
                else:
                    existing_series = series_index[item_id]
                    # Update fields if empty or missing
                    for key, value in item.items():
                        if key not in existing_series or not existing_series[key]:
                            existing_series[key] = value

        # Pass 2: Episodes
        for item in batch_data:
            if item.get('type') == 'episode':
                parent_id = str(item.get('parent_id') or item.get('id', ''))
                if parent_id in series_index:
                    parent_series = series_index[parent_id]
                    if 'episodes' not in parent_series:
                        parent_series['episodes'] = []
                    
                    if 'episode_number' not in item:
                        match = re.search(r'الحلقة\s+(\d+)', item['title'])
                        if match:
                            item['episode_number'] = int(match.group(1))

                    ep_num = item.get('episode_number')
                    ep_url = item.get('url')
                    
                    existing_ep = None
                    for ep in parent_series['episodes']:
                        if ep_url and ep.get('url') == ep_url:
                            existing_ep = ep
                            break
                        if ep_num and ep.get('episode_number') == ep_num:
                            existing_ep = ep
                            break
                    
                    if existing_ep:
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

    # ── Finalize and Save ──
    print("Finalizing data structure and saving chunks...")
    light_data = []
    
    for s in main_data:
        if s.get('type') == 'series':
            # Sort episodes
            if 'episodes' in s:
                s['episodes'].sort(key=lambda x: x.get('episode_number', 0))
                s['episode_count'] = len(s['episodes'])
            
            # Generate Slug
            slug = get_slug(s['title'], s.get('clean_title'))
            s['slug'] = slug

            # Create Light Record
            light_item = {
                "id": s['id'],
                "title": s['title'],
                "clean_title": s.get('clean_title', s['title'].replace("مسلسل ", "").split(" 202")[0]),
                "poster": s.get('poster'),
                "backdrop": s.get('backdrop'),
                "year": s.get('year', "2026"),
                "isSupreme": s.get('isSupreme', False),
                "episode_count": s.get('episode_count', 0),
                "slug": slug
            }
            light_data.append(light_item)
            
            # Save Detail Chunk
            for target_dir in DATA_DIRS:
                chunk_path = os.path.join(target_dir, f"{slug}.json")
                with open(chunk_path, 'w', encoding='utf-8') as f:
                    json.dump(s, f, ensure_ascii=False, indent=2)

    # ── Save Indices ──
    print("Saving index files...")
    
    # Full indices
    FULL_INDEX_PATHS = [
        os.path.join(cwd, "public/ramadan_2026_results.json"),
        os.path.join(cwd, "dist/ramadan_2026_results.json")
    ]
    for path in FULL_INDEX_PATHS:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(main_data, f, ensure_ascii=False, indent=2)

    # Light indices (Mainly used by the frontend browsing)
    LIGHT_INDEX_PATHS = [
        os.path.join(cwd, "public/ramadan_2026_results_light.json"),
        os.path.join(cwd, "dist/ramadan_2026_results_light.json"),
        os.path.join(cwd, "public/data/ramadan.json"),
        os.path.join(cwd, "dist/data/ramadan.json")
    ]
    for path in LIGHT_INDEX_PATHS:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(light_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Successfully processed {new_series_count} new series and {new_episodes_count} new episodes.")
    print(f"✅ Data chunks and indices generated in multiple locations for compatibility.")

if __name__ == "__main__":
    merge_results()
