import os

# fix page.tsx
with open('src/app/(dashboard)/patients/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    
# .finally(() => setLoading(false)); }); }, [params]);
content = content.replace('}); }, [params]);', '}, [params]);')

with open('src/app/(dashboard)/patients/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# fix LiveMonitorDashboard.tsx
with open('src/components/monitor/LiveMonitorDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const [simulationEvent, setSimulationEvent] = useState<string | null>(null);\n  useEffect(() => {\n    const fetchStatic',
    'const [simulationEvent, setSimulationEvent] = useState<string | null>(null);\n  useEffect(() => {\n    const fetchStatic'
)
# wait, what's wrong with LiveMonitorDashboard?
#  const [simulationEvent, setSimulationEvent] = useState<string | null>(null);  useEffect(() => {    const fetchStatic = async () => { try { const devRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/devices`); setDevices(await devRes.json()); } catch(e) { console.error(e); } }; fetchStatic(); }, [patientId]);
# Ah! It's `useEffect(() => { ... fetchStatic(); }, [patientId]);`
# Wait, let's see the error:
# src/components/monitor/LiveMonitorDashboard.tsx: SyntaxError: ',' expected. (22:1138)
# `... const alertRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/alerts`); setAlerts(await alertRes.json()); setLoading(false); } } catch (err) { console.error("Stream error", err); } };  const interval = setInterval(pollStream, 1000); return () => { isSubscribed = false; clearInterval(interval); }; }, [patientId, simulationEvent]); const triggerEmergency = async (eventType: string) => {   setSimulationEvent(eventType);  setTimeout(() => setSimulationEvent(null), 5000); };`

# I see `let isSubscribed = true; const pollStream = async () => { ... } ... }, [patientId, simulationEvent]);`
# Wait! Where is the `useEffect` for `pollStream`? It says `}, [patientId, simulationEvent]);` but it's missing the `useEffect(() => {` before `let isSubscribed = true;` !!!
# So `let isSubscribed = true;` should be `useEffect(() => { let isSubscribed = true;`

content = content.replace('let isSubscribed = true;', 'useEffect(() => { let isSubscribed = true;')

with open('src/components/monitor/LiveMonitorDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

