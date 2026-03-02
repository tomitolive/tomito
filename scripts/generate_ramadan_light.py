import json
import os

MAIN_JSON_PATH = "public/ramadan_2026_results.json"
LIGHT_JSON_PATH = "public/ramadan_2026_results_light.json"

def generate_light_json():
    if not os.path.exists(MAIN_JSON_PATH):
        print(f"Main JSON not found: {MAIN_JSON_PATH}")
        return

    print(f"Reading main JSON: {MAIN_JSON_PATH}")
    with open(MAIN_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    light_data = []
    print(f"Processing {len(data)} items...")

    for item in data:
        # Extract only essential fields for the grid/list view
        light_item = {
            "id": item.get("id"),
            "title": item.get("title"),
            "clean_title": item.get("clean_title"),
            "poster": item.get("poster"),
            "backdrop": item.get("backdrop"),
            "year": item.get("year"),
            "isSupreme": item.get("isSupreme", False),
            "episode_count": len(item.get("episodes", []))
        }
        light_data.append(light_item)

    print(f"Saving lightweight JSON to {LIGHT_JSON_PATH}")
    with open(LIGHT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(light_data, f, ensure_ascii=False, indent=2)

    original_size = os.path.getsize(MAIN_JSON_PATH) / (1024 * 1024)
    light_size = os.path.getsize(LIGHT_JSON_PATH) / (1024 * 1024)
    
    print(f"Optimization complete!")
    print(f"Original size: {original_size:.2f} MB")
    print(f"Lightweight size: {light_size:.2f} MB")
    print(f"Reduction: {(1 - light_size/original_size)*100:.1f}%")

if __name__ == "__main__":
    generate_light_json()
