import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to find className="... bg-slate-900 ... " and add 'dark'
    # But a safer approach is: for every className string, if it has bg-slate-900 or bg-slate-800, add dark.
    # regex for className string: className="([^"]*)"
    # or className={`([^`]+)`}
    
    modified = False
    
    def replacer(match):
        nonlocal modified
        full_match = match.group(0)
        attr = match.group(1)
        classes = match.group(2)
        
        # Check if it contains bg-slate-900 or bg-slate-800 as standalone classes
        if re.search(r'(?<!:)\bbg-slate-(800|900)\b', classes):
            if not re.search(r'\bdark\b', classes):
                new_classes = 'dark ' + classes
                modified = True
                return f'{attr}"{new_classes}"'
        return full_match

    # Match className="..."
    new_content = re.sub(r'(className=)"([^"]+)"', replacer, content)
    
    def replacer_template(match):
        nonlocal modified
        full_match = match.group(0)
        attr = match.group(1)
        classes = match.group(2)
        
        if re.search(r'(?<!:)\bbg-slate-(800|900)\b', classes):
            if not re.search(r'\bdark\b', classes):
                new_classes = 'dark ' + classes
                modified = True
                return f'{attr}`{new_classes}`'
        return full_match

    # Match className={`...`}
    new_content = re.sub(r'(className=)`([^`]+)`', replacer_template, new_content)

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

def main():
    src_dir = r"c:\APP\frontend\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
