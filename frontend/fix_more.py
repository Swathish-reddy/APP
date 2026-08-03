import os

fixes = {
    'src/app/(dashboard)/patients/[id]/documents/page.tsx': [
        ('if processing', ''),
    ],
    'src/app/(dashboard)/patients/[id]/page.tsx': [
        ('const id = resolvedParams?.id ||"";', ''),
    ],
    'src/app/(dashboard)/patients/page.tsx': [
        ('fetch from API }`)  setPatients(data))', ''),
        ('fetch from API }`)', ''),
    ],
    'src/app/(dashboard)/settings/page.tsx': [
        ('settings state', ''),
    ],
    'src/components/monitor/LiveMonitorDashboard.tsx': [
        ('set the event for the next poll cycle to pick up', ''),
        ('fetch latest alerts', ''),
    ],
    'src/components/monitor/MonitorTopSection.tsx': [
        ("if there's an active emergency alert in the last 5 alerts", ""),
    ],
    'src/components/monitor/VitalStreamsPanel.tsx': [
        ("isAnimationActive={false}  </LineChart>", "isAnimationActive={false} /> </LineChart>"),
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
