import glob
import re

# Fix UI components
for filepath in glob.glob('src/components/ui/*.tsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'([\"\'`])\s+const\s', r'\1;\nconst ', content)
    content = re.sub(r'([\"\'`])\s+function\s', r'\1;\nfunction ', content)
    content = re.sub(r'\)\s+function\s', r');\nfunction ', content)
    content = re.sub(r'\}\s+function\s', r'};\nfunction ', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix other broken components
fixes = {
    'src/components/dashboard/DataFusionCenter.tsx': [
        ('if possible, or just a smaller safe radius', ''),
    ],
    'src/components/monitor/LiveMonitorDashboard.tsx': [
        ('set the event for the next poll cycle to pick up', ''),
        ('fetch latest alerts', ''),
    ],
    'src/components/intelligence/ChatAssistant.tsx': [
        (r'/\*\*(.*?)\\*\g', r'/\*\*(.*?)\\\*\*/g'),
        (r'/\*(.*?)\\g', r'/\*(.*?)\\\*/g'),
    ],
    'src/components/nutrition/NutritionDashboard.tsx': [
        ("fetching compliance (we'll just post a mock compliance to get the average back)", ""),
        ("fetching /food/{id}/substitutions", ""),
    ],
    'src/components/cdss/DecisionDashboard.tsx': [
        ('Fetch patient data', ''),
        ('Fetch AI Recommendations from CDSS endpoint (triggers full AI analysis)', ''),
        ('Fetch treatment pathway for highest-risk condition', ''),
    ],
    'src/components/dashboard/XAIModule.tsx': [
        ('Fetch a prediction to explain (e.g., cardiovascular disease risk)', ''),
    ],
    'src/components/layout/DashboardLayout.tsx': [
        ('if (window.innerWidth >= 768) { setSidebarOpen(true); } }, []);', 'useEffect(() => { if (window.innerWidth >= 768) { setSidebarOpen(true); } }, []);'),
    ]
}

for filepath, replacements in fixes.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        # Also clean up any loose /* or */
        content = content.replace('/* ', '')
        content = content.replace(' */', '')
        
        # fix formatMessage in ChatAssistant
        if 'ChatAssistant' in filepath:
            content = content.replace(".replace(/\\*\\*(.*?)\\*\\g, '<strong>$1</strong>')", ".replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')")
            content = content.replace(".replace(/\\*(.*?)\\g, '<em>$1</em>')", ".replace(/\\*(.*?)\\*/g, '<em>$1</em>')")
            content = content.replace("return content .replace", "return content.replace")
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(e)
