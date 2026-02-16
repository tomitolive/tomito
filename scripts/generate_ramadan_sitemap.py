import json
import os
import re
from datetime import datetime

# Configuration
BASE_URL = "https://tomito.xyz"
cwd = os.getcwd()
RAMADAN_DATA_PATH = os.path.join(cwd, "public/ramadan_series_2026.json")
SITEMAP_PATH = os.path.join(cwd, "public/sitemap-ramadan.xml")

def create_slug(text):
    if not text:
        return ""
    # Exact replication of frontend logic in src/lib/utils.ts
    text = text.lower().strip()
    # Keep alphanumeric and Arabic chars. Replace everything else with -
    text = re.sub(r'[^\w\u0621-\u064A-]+', '', text)
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'\--+', '-', text)
    text = text.strip('-')
    return text

def create_slug_with_id(id, title):
    return f"{id}-{create_slug(title)}"

def generate_ramadan_sitemap():
    if not os.path.exists(RAMADAN_DATA_PATH):
        print(f"Error: Ramadan data file not found at {RAMADAN_DATA_PATH}")
        return

    urls = []
    
    with open(RAMADAN_DATA_PATH, 'r', encoding='utf-8') as f:
        ramadan_series = json.load(f)
        for series in ramadan_series:
            series_id = series.get('id')
            title_en = series.get('title_en')
            title_ar = series.get('title_ar')
            
            if series_id:
                # English Slug URL
                if title_en:
                    slug_en = create_slug_with_id(series_id, title_en)
                    urls.append(f"{BASE_URL}/tv/{slug_en}")
                
                # Arabic Slug URL
                if title_ar:
                    slug_ar = create_slug_with_id(series_id, title_ar)
                    urls.append(f"{BASE_URL}/tv/{slug_ar}")

                # Watch page (ID based, only need one)
                urls.append(f"{BASE_URL}/tv/{series_id}/watch")

    # Generate XML
    now = datetime.now().strftime("%Y-%m-%d")
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for url in urls:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{url}</loc>')
        xml_content.append(f'    <lastmod>{now}</lastmod>')
        xml_content.append('    <changefreq>weekly</changefreq>')
        xml_content.append('    <priority>0.9</priority>') # Higher priority for new content
        xml_content.append('  </url>')
    
    xml_content.append('</urlset>')

    # Ensure output directory exists
    os.makedirs(os.path.dirname(SITEMAP_PATH), exist_ok=True)

    with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(xml_content))

    print(f"Ramadan sitemap generated successfully with {len(urls)} URLs at {SITEMAP_PATH}")

if __name__ == "__main__":
    generate_ramadan_sitemap()
