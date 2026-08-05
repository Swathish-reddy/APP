import os, glob

base = glob.escape('c:/APP/frontend/src/app/(dashboard)/patients/[id]')
clients = glob.glob(base + '/**/client.tsx', recursive=True)
clients.append('c:/APP/frontend/src/app/(dashboard)/patients/[id]/client.tsx')

for p in set(clients):
    if not os.path.exists(p): continue
    with open(p, 'r') as f:
        content = f.read()
    
    if '"use client"' not in content and "'use client'" not in content:
        with open(p, 'w') as f:
            f.write('"use client";\n' + content)
