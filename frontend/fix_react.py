import re

for filepath in ['src/app/page.tsx', 'src/components/layout/DashboardLayout.tsx']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the named import with namespace import
    content = re.sub(r'import React, \{.*?\} from [\'\"]react[\'\"];', 'import * as React from "react";', content)
    
    # Replace usages
    content = re.sub(r'\buseEffect\(', 'React.useEffect(', content)
    content = re.sub(r'\buseState\(', 'React.useState(', content)
    content = re.sub(r'\bSuspense\b', 'React.Suspense', content)
    
    # Fix accidental double React.React.
    content = content.replace('React.React.', 'React.')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
