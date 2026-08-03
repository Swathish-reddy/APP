import os
import re

def fix_headings(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".jsx"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                def replacer(match):
                    tag_content = match.group(0)
                    if 'text-white' in tag_content:
                        return tag_content.replace('text-white', 'text-foreground')
                    return tag_content

                new_content = re.sub(r'<h[1-6][^>]*className="[^"]*text-white[^"]*"[^>]*>', replacer, content)
                
                # Also fix <p> tags with text-white if they look like important subheadings/stats
                def replacer_p(match):
                    tag_content = match.group(0)
                    if 'text-white' in tag_content:
                        return tag_content.replace('text-white', 'text-foreground')
                    return tag_content
                    
                new_content = re.sub(r'<p[^>]*className="[^"]*text-white[^"]*"[^>]*>', replacer_p, new_content)
                new_content = re.sub(r'<span[^>]*className="[^"]*text-white[^"]*"[^>]*>', replacer_p, new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
                    print(f"Fixed text in {filepath}")
                    
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    fix_headings("src/app")
