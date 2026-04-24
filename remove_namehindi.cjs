const fs = require('fs');

const filesToProcess = [
    'c:\\Users\\hplap\\OneDrive\\Documents\\A\\src\\utils\\fallbackData.ts',
    'c:\\Users\\hplap\\OneDrive\\Documents\\A\\src\\utils\\planGenerator.ts'
];

filesToProcess.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // In fallbackData.ts: `nameHindi: '...', `
    content = content.replace(/nameHindi:\s*'[^']*',\s*/g, "");
    
    // In planGenerator.ts: `ex('id', 'name', 'hindi', ` -> `ex('id', 'name', `
    content = content.replace(/(ex\s*\([^,]+,\s*'[^']+',\s*)'[^']+',\s*/g, "$1");
    
    // In planGenerator.ts declaration: `const ex = (id: string, name: string, nameHindi: string, type:` -> `const ex = (id: string, name: string, type:`
    content = content.replace(/nameHindi:\s*string,\s*/g, "");
    
    // In planGenerator.ts return: `({ id, name, nameHindi, type, sets,` -> `({ id, name, type, sets,`
    content = content.replace(/nameHindi,\s*/g, "");

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`Processed ${filepath}`);
});
