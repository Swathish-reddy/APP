import glob
import re

for filepath in glob.glob('src/app/(dashboard)/patients/**/page.tsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace `export default function Page(props: any) { return <ClientComponent {...props} />; }`
    # Or variations
    content = re.sub(r'export default function Page\(props:\s*any\)\s*\{\s*return <ClientComponent \{\.\.\.props\} />;?\s*\}', 
                     r'export default function Page() {\n  return <ClientComponent />;\n}', 
                     content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
