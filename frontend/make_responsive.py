import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Colors & Theme
    # Remove pure dark mode overrides that force black
    content = content.replace("bg-slate-950", "bg-background")
    content = content.replace("bg-slate-900", "bg-card")
    content = content.replace("bg-slate-800", "bg-muted")
    content = content.replace("border-slate-800", "border-border")
    content = content.replace("border-slate-700", "border-border")
    
    # Replace white text with foreground to adapt to light/dark
    # Carefully replace text-white only in class names
    content = re.sub(r'\btext-white\b', 'text-foreground', content)
    content = re.sub(r'\btext-slate-200\b', 'text-foreground', content)
    content = re.sub(r'\btext-slate-300\b', 'text-foreground', content)
    content = re.sub(r'\btext-slate-400\b', 'text-muted-foreground', content)
    content = re.sub(r'\btext-slate-500\b', 'text-muted-foreground', content)
    
    content = re.sub(r'\bbg-white\b', 'bg-card', content)
    content = re.sub(r'\bbg-black\b', 'bg-background', content)

    # 2. Responsive Grids
    # Change fixed grid columns to responsive
    content = re.sub(r'\bgrid-cols-2\b', 'grid-cols-1 md:grid-cols-2', content)
    content = re.sub(r'\bgrid-cols-3\b', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', content)
    content = re.sub(r'\bgrid-cols-4\b', 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4', content)
    content = re.sub(r'\bgrid-cols-5\b', 'grid-cols-1 md:grid-cols-3 xl:grid-cols-5', content)
    
    # 3. Responsive Widths & Overflows
    # Prevent width overflow on standard widths
    content = re.sub(r'\bw-96\b', 'w-full md:w-96', content)
    content = re.sub(r'\bw-80\b', 'w-full md:w-80', content)
    content = re.sub(r'\bw-64\b', 'w-full md:w-64', content)
    content = re.sub(r'\bw-1/2\b', 'w-full md:w-1/2', content)
    content = re.sub(r'\bw-1/3\b', 'w-full md:w-full lg:w-1/3', content)
    content = re.sub(r'\bw-\[500px\]\b', 'w-full md:w-[500px]', content)
    content = re.sub(r'\bw-\[600px\]\b', 'w-full md:w-[600px]', content)

    # 4. Spacing and Padding
    # Make large paddings responsive
    content = re.sub(r'\bp-6\b', 'p-4 md:p-6', content)
    content = re.sub(r'\bp-8\b', 'p-4 md:p-8', content)
    content = re.sub(r'\bpx-6\b', 'px-4 md:px-6', content)
    content = re.sub(r'\bpx-8\b', 'px-4 md:px-8', content)
    content = re.sub(r'\bpy-6\b', 'py-4 md:py-6', content)
    
    # 5. Fix text sizing
    content = re.sub(r'\btext-4xl\b', 'text-3xl md:text-4xl', content)
    content = re.sub(r'\btext-5xl\b', 'text-4xl md:text-5xl', content)
    content = re.sub(r'\btext-3xl\b', 'text-2xl md:text-3xl', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    for filepath in glob.glob('src/**/*.tsx', recursive=True):
        try:
            process_file(filepath)
            print(f"Processed: {filepath}")
        except Exception as e:
            print(f"Failed {filepath}: {e}")
