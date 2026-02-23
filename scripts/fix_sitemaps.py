import os
import urllib.parse
import re

def fix_sitemap(file_path):
    print(f"Processing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Fix corrupted URLs like watchhttps://...
    # Pattern: watchhttps://tomito.xyz/ramadan-trailer/([^-]+)-ramadan/([^?]*)
    # Should probably be watch-ramadan/\2
    # Let's look at the specific corruption in line 304:
    # watchhttps://tomito.xyz/ramadan-trailer/%D8%B5%D8%AD%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A7%D8%B1%D8%B6-ramadan/%D8%A7%D9%84%D8%B3%D9%88%D9%82-%D8%A7%D9%84%D8%AD%D8%B1%D8%A9?episode=5
    
    # Simple fix for the specific corruption:
    def fix_loc(match):
        loc = match.group(1)
        
        # If corrupted
        if 'watchhttps://' in loc:
            # Extract the actual path after the last / or based on the episode part
            # It seems it should be watch-ramadan/[title]?episode=...
            title_match = re.search(r'ramadan/([^?]+)', loc)
            if title_match:
                title = title_match.group(1)
                episode_match = re.search(r'\?episode=\d+', loc)
                episode = episode_match.group(0) if episode_match else ""
                loc = f"https://tomito.xyz/watch-ramadan/{title}{episode}"
        
        # Decode Arabic characters
        loc = urllib.parse.unquote(loc)
        
        # Replace hyphens with spaces in the title part
        # We only want to target the part after /ramadan-trailer/ or /watch-ramadan/
        # but before the query string
        
        parts = loc.split('?')
        base = parts[0]
        query = "?" + parts[1] if len(parts) > 1 else ""
        
        if '/ramadan-trailer/' in base:
            prefix, title = base.split('/ramadan-trailer/', 1)
            title = title.replace(' ', '-')
            base = f"{prefix}/ramadan-trailer/{title}"
        elif '/watch-ramadan/' in base:
            prefix, title = base.split('/watch-ramadan/', 1)
            title = title.replace(' ', '-')
            base = f"{prefix}/watch-ramadan/{title}"
            
        return f"<loc>{base}{query}</loc>"

    fixed_content = re.sub(r'<loc>(.*?)</loc>', fix_loc, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print(f"Finished {file_path}")

files_to_fix = [
    '/home/tomito/Desktop/tomito/public/sitemap-ramadan.xml',
    '/home/tomito/Desktop/tomito/public/sitemap-ramadan-full.xml',
    '/home/tomito/Desktop/tomito/dist/sitemap-ramadan-full.xml'
]

for f in files_to_fix:
    if os.path.exists(f):
        fix_sitemap(f)
    else:
        print(f"File not found: {f}")
