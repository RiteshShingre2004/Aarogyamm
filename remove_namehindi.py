import re
import os

files_to_process = [
    r"c:\Users\hplap\OneDrive\Documents\A\src\utils\fallbackData.ts",
    r"c:\Users\hplap\OneDrive\Documents\A\src\utils\planGenerator.ts"
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # In fallbackData.ts: `nameHindi: '...', `
    content = re.sub(r"nameHindi:\s*'[^']*',\s*", "", content)
    
    # In planGenerator.ts: `ex('id', 'name', 'hindi', ` -> `ex('id', 'name', `
    # Using a negative lookahead to avoid eating up the rest of the file
    content = re.sub(r"(ex\s*\([^,]+,\s*'[^']+',\s*)'[^']+',\s*", r"\1", content)
    
    # In planGenerator.ts declaration: `const ex = (id: string, name: string, nameHindi: string, type:` -> `const ex = (id: string, name: string, type:`
    content = re.sub(r"nameHindi:\s*string,\s*", "", content)
    
    # In planGenerator.ts return: `({ id, name, nameHindi, type, sets,` -> `({ id, name, type, sets,`
    content = re.sub(r"nameHindi,\s*", "", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

for f in files_to_process:
    process_file(f)
