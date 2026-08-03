import glob

for file in ['src/app/page.tsx', 'src/components/layout/DashboardLayout.tsx']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace React.useEffect with just useEffect and make sure the import is perfect
    content = content.replace('import React, { useState, useEffect } from "react";', 'import React, { useState, useEffect, Suspense } from "react";')
    content = content.replace('React.useEffect', 'useEffect')
    content = content.replace('React.useState', 'useState')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
