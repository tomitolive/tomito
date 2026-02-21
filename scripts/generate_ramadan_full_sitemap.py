import json
import os
import re
from datetime import datetime
from urllib.parse import quote

# Configuration
BASE_URL = "https://tomito.xyz"
cwd = os.getcwd()
# Path to the real data file used by the app
RAMADAN_DATA_PATH = os.path.join(cwd, "public/ramadan_2026_results.json")
SITEMAP_PATH = os.path.join(cwd, "public/sitemap-ramadan-full.xml")

def generate_ramadan_full_sitemap():
    if not os.path.exists(RAMADAN_DATA_PATH):
        print(f"Error: Ramadan data file not found at {RAMADAN_DATA_PATH}")
        return

    urls = []
    
    # 1. Static Ramadan main page
    urls.append(f"{BASE_URL}/ramadan")
    
    with open(RAMADAN_DATA_PATH, 'r', encoding='utf-8') as f:
        ramadan_data = json.load(f)
        
        for entry in ramadan_data:
            full_title = entry.get('title')
            if full_title:
                # Encoded URL for the series
                safe_name = quote(full_title)
                
                # 1. Main series trailer/info page
                urls.append(f"{BASE_URL}/ramadan-trailer/{safe_name}")
                
                # 2. Episode specific links
                episodes = entry.get('episodes', [])
                for ep in episodes:
                    ep_num = ep.get('episode_number')
                    if ep_num:
                        # Episode trailer/info link
                        urls.append(f"{BASE_URL}/ramadan-trailer/{safe_name}?episode={ep_num}")
                        
                        # Episode download link
                        urls.append(f"{BASE_URL}/ramadan-download/{safe_name}?episode={ep_num}")

    # Generate XML
    now = datetime.now().strftime("%Y-%m-%d")
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for url in urls:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{url}</loc>')
        xml_content.append(f'    <lastmod>{now}</lastmod>')
        xml_content.append('    <changefreq>daily</changefreq>')
        xml_content.append('    <priority>1.0</priority>')
        xml_content.append('  </url>')
    
    xml_content.append('</urlset>')

    # Ensure output directory exists
    os.makedirs(os.path.dirname(SITEMAP_PATH), exist_ok=True)

    with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(xml_content))

    print(f"Full Ramadan sitemap generated successfully with {len(urls)} URLs at {SITEMAP_PATH}")

if __name__ == "__main__":
    generate_ramadan_full_sitemap()
