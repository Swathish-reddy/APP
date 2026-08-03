import re
import os

files = [
    'src/components/ui/scroll-area.tsx',
    'src/components/nutrition/NutritionDashboard.tsx',
    'src/components/cdss/DecisionDashboard.tsx',
    'src/components/dashboard/XAIModule.tsx'
]

for file_path in files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix use client
    content = content.replace('"use client" import', '"use client";\nimport')
    content = content.replace('"use client"; import', '"use client";\nimport')
    
    # In scroll-area, fix the other imports
    content = content.replace('} from"@base-ui/react/scroll-area" import', '} from "@base-ui/react/scroll-area";\nimport')
    content = content.replace('} from"@/lib/utils" function', '} from "@/lib/utils";\nfunction')

    # Fix // comments followed by space
    # It replaces // comment with /* comment */ and adds a newline
    content = re.sub(r'// (.*?)(\n|$)', r'/* \1 */\n', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
