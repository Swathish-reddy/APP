import os

fixes = {
    'src/app/(dashboard)/patients/[id]/page.tsx': [
        ('useEffect(() => {   setPatientId(id);', 'useEffect(() => { const id = params?.id || ""; setPatientId(id);'),
    ],
    'src/components/monitor/LiveMonitorDashboard.tsx': [
        ('useState<string | null>(null);  const fetchStatic', 'useState<string | null>(null);\n  useEffect(() => {\n    const fetchStatic'),
    ]
}

for filepath, replacements in fixes.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(e)
