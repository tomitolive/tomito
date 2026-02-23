import json
import os

cwd = os.getcwd()
MAIN_JSON = os.path.join(cwd, "public/ramadan_2026_results.json")
BATCH_JSON = os.path.join(cwd, "dist/ramadan_2026_results_batch2.json")

def merge_batch():
    if not os.path.exists(MAIN_JSON) or not os.path.exists(BATCH_JSON):
        print("Required files not found.")
        return

    with open(MAIN_JSON, 'r', encoding='utf-8') as f:
        main_data = json.load(f)
    
    with open(BATCH_JSON, 'r', encoding='utf-8') as f:
        batch_data = json.load(f)

    # Index main data by ID for fast lookup
    main_index = {item['id']: item for item in main_data if item['type'] == 'series'}

    new_series_count = 0
    new_episodes_count = 0

    for item in batch_data:
        if item['type'] == 'series':
            if item['id'] not in main_index:
                # Add new series
                item['episodes'] = []
                main_data.append(item)
                main_index[item['id']] = item
                new_series_count += 1
        elif item['type'] == 'episode':
            parent_id = item.get('parent_id')
            if parent_id and parent_id in main_index:
                parent_series = main_index[parent_id]
                # Check if episode already exists
                existing_ep_nums = [ep.get('episode_number') for ep in parent_series.get('episodes', [])]
                
                # Extract episode number from title if not present
                ep_num = item.get('episode_number')
                if not ep_num:
                    import re
                    match = re.search(r'الحلقة\s+(\d+)', item['title'])
                    if match:
                        ep_num = int(match.group(1))
                        item['episode_number'] = ep_num
                
                if ep_num and ep_num not in existing_ep_nums:
                    parent_series['episodes'].append(item)
                    new_episodes_count += 1

    with open(MAIN_JSON, 'w', encoding='utf-8') as f:
        json.dump(main_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully merged: {new_series_count} new series, {new_episodes_count} new episodes.")

if __name__ == "__main__":
    merge_batch()
