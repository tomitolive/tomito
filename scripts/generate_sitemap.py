import json
import os
import re
from datetime import datetime

# Configuration
BASE_URL = "https://tomito.xyz"
# Use paths relative to the project root
# We'll also print these for debugging in GitHub Actions
cwd = os.getcwd()
print(f"Current working directory: {cwd}")

DATA_DIR = os.path.join(cwd, "public/data")
SITEMAP_PATH = os.path.join(cwd, "public/sitemap.xml")

print(f"Using DATA_DIR: {DATA_DIR}")
print(f"Using SITEMAP_PATH: {SITEMAP_PATH}")

def create_slug(text):
    if not text:
        return ""
    # Exact replication of frontend logic in src/lib/utils.ts
    text = text.lower().strip()
    # Replace spaces with dashes first
    text = re.sub(r'\s+', '-', text)
    # Keep alphanumeric and Arabic chars. Replace everything else with nothing
    text = re.sub(r'[^\w\u0621-\u064A-]+', '', text)
    # Double - to single -
    text = re.sub(r'--+', '-', text)
    text = text.strip('-')
    return text

def create_slug_with_id(id, title):
    return f"{id}-{create_slug(title)}"

def generate_sitemap():
    urls = []

    # 1. Add static pages
    static_pages = [
        "",
        "/about",
        "/contact",
        "/privacy",
        "/ramadan",
        "/category/movie/all",
        "/category/tv/all"
    ]
    
    for page in static_pages:
        if page == "":
             urls.append(f"{BASE_URL}")
        else:
             urls.append(f"{BASE_URL}{page}")

    # 2. Add Movies
    movies_file = os.path.join(DATA_DIR, "movies.json")
    if os.path.exists(movies_file):
        with open(movies_file, 'r', encoding='utf-8') as f:
            movies = json.load(f)
            for movie in movies:
                movie_id = movie.get('id')
                title = movie.get('title') or movie.get('original_title')
                if movie_id and title:
                    slug = create_slug_with_id(movie_id, title)
                    # Trailer page
                    urls.append(f"{BASE_URL}/movie/{slug}")
                    # Watch page
                    urls.append(f"{BASE_URL}/movie/{movie_id}/watch")

    # 3. Add TV Shows
    tv_shows_file = os.path.join(DATA_DIR, "tv-shows.json")
    if os.path.exists(tv_shows_file):
        with open(tv_shows_file, 'r', encoding='utf-8') as f:
            tv_shows = json.load(f)
            for show in tv_shows:
                show_id = show.get('id')
                name = show.get('name') or show.get('original_name')
                if show_id and name:
                    slug = create_slug_with_id(show_id, name)
                    # Trailer page
                    urls.append(f"{BASE_URL}/tv/{slug}")
                    # Watch page
                    urls.append(f"{BASE_URL}/tv/{show_id}/watch")

    # Generate XML
    now = datetime.now().strftime("%Y-%m-%d")
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for url in urls:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{url}</loc>')
        xml_content.append(f'    <lastmod>{now}</lastmod>')
        xml_content.append('    <changefreq>weekly</changefreq>')
        xml_content.append('    <priority>0.8</priority>')
        xml_content.append('  </url>')
    
    xml_content.append('</urlset>')

    # Ensure output directory exists
    os.makedirs(os.path.dirname(SITEMAP_PATH), exist_ok=True)

    with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(xml_content))

    print(f"Sitemap generated successfully with {len(urls)} URLs at {SITEMAP_PATH}")

if __name__ == "__main__":
    generate_sitemap()
