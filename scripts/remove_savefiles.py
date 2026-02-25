import json
import os

def remove_savefiles_links():
    public_path = "/home/tomito/Desktop/tomito/public/ramadan_2026_results.json"
    dist_path = "/home/tomito/Desktop/tomito/dist/ramadan_2026_results.json"
    
    if not os.path.exists(public_path):
        print(f"Error: {public_path} not found")
        return

    with open(public_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for series in data:
        if 'episodes' in series:
            for episode in series['episodes']:
                # Filter watch_servers
                if 'watch_servers' in episode:
                    episode['watch_servers'] = [
                        srv for srv in episode['watch_servers'] 
                        if "savefiles" not in (srv.get('name', '').lower()) 
                        and "savefiles" not in (srv.get('url', '').lower())
                    ]
                
                # Filter download_links
                if 'download_links' in episode:
                    episode['download_links'] = [
                        link for link in episode['download_links'] 
                        if "savefiles" not in (link.get('name', '').lower()) 
                        and "savefiles" not in (link.get('url', '').lower())
                    ]

    # Save to public
    with open(public_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Successfully cleaned {public_path}")

    # Sync to dist if it exists
    if os.path.exists(dist_path):
        with open(dist_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully cleaned and synced {dist_path}")

if __name__ == "__main__":
    remove_savefiles_links()
