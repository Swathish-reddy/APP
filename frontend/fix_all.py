import os
import re
import glob

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix imports merged together
    content = re.sub(r'("|' + r"')" + r'\s+import ', r'\1;\nimport ', content)
    content = re.sub(r'\}\s+import ', r'};\nimport ', content)
    content = re.sub(r'\]\s+import ', r'];\nimport ', content)
    content = re.sub(r'\)\s+import ', r');\nimport ', content)
    content = re.sub(r'("|' + r"')" + r'\s+export ', r'\1;\nexport ', content)
    content = re.sub(r'\}\s+export ', r'};\nexport ', content)

    # Fix "use client" missing semicolon
    content = content.replace('"use client" import', '"use client";\nimport')
    content = content.replace('"use client" function', '"use client";\nfunction')
    content = content.replace('"use client" const', '"use client";\nconst')

    # Remove // comments heuristically
    # A comment is // followed by a space, and ends when we see a common keyword
    # keywords: const, let, if, return, await, }, alert, <, fetch, try, set
    pattern = r'//\s(.*?)(?=\sconst\s|\slet\s|\sif\s|\sreturn\s|\sawait\s|\s\}\s|\salert|\s<|\sfetch|\stry\s|\sset|\s?})'
    
    # We can just replace it with empty string
    content = re.sub(pattern, '', content)

    # Also undo any /* */ that my previous script broke by accident
    # The previous script did: /* ... */
    # Wait, my previous script modified 4 files and ruined them by making the rest of the file a comment.
    # Let's restore the 4 files first by undoing the /* ... */ wrapping
    # We will just replace /* (.*?)(?= const | let | if | return | await | } | alert | < | fetch | try | set | ?})
    content = re.sub(r'/\*\s(.*?)(?=\sconst\s|\slet\s|\sif\s|\sreturn\s|\sawait\s|\s\}\s|\salert|\s<|\sfetch|\stry\s|\sset|\s?})', r'', content)
    
    # Just to be safe, let's remove any trailing */ that might have been left
    content = content.replace('*/', '')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filepath in glob.glob('src/**/*.tsx', recursive=True):
    fix_file(filepath)
