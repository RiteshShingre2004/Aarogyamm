import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, '../public/indian_women_meals_600_cleaned.csv');
const outPath = path.resolve(__dirname, '../src/utils/mealsData.ts');

const text = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
    const lines = [];
    let currentLine = [];
    let currentCell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && text[i + 1] === '"' && inQuotes) {
            currentCell += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            currentLine.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && text[i + 1] === '\n') {
                i++;
            }
            currentLine.push(currentCell.trim());
            if (currentLine.join('').trim() !== '') {
                lines.push(currentLine);
            }
            currentLine = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell.trim() !== '' || currentLine.length > 0) {
        currentLine.push(currentCell.trim());
        lines.push(currentLine);
    }
    return lines;
}

const lines = parseCSV(text);
const headers = lines[0];
const dataLines = lines.slice(1);

const parsedMeals = dataLines.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
        obj[header] = row[index];
    });
    return obj;
});

// Map to our Meal format
// Original struct:
// meal_id,meal_name,meal_time,diet_type,meal_type,suitable_for,calories,protein,carbs,fats,fiber_g,glycemic_index,prep_time_min,is_gluten_free,is_diabetic_friendly,portion,scalable

const generatedData = parsedMeals.map(row => {
    const cleanNum = (str) => parseFloat(String(str).replace(/[^\d.]/g, '')) || 0;

    const tags = [];
    if (row.suitable_for) {
        tags.push(...row.suitable_for.split(',').map(s => s.trim()).filter(Boolean));
    }
    if (row.is_gluten_free === 'Yes') tags.push('Gluten Free');
    if (row.is_diabetic_friendly === 'Yes') tags.push('Diabetic Friendly');

    return {
        id: row.meal_id,
        name: row.meal_name,
        time: row.meal_time || 'Dinner',       // e.g. Breakfast, Lunch, Dinner, Snack
        dietType: row.diet_type || 'Veg',      // Veg, Non-Veg
        mealType: row.meal_type || 'Balanced', // Deficit, Balanced, Surplus
        calories: cleanNum(row.calories),
        protein: cleanNum(row.protein),
        carbs: cleanNum(row.carbs),
        fat: cleanNum(row.fats),
        prepTime: (row.prep_time_min || '15') + ' min',
        ingredients: [row.portion || ''],
        instructions: row.portion || '',
        tip: '',
        tags: Array.from(new Set(tags))
    };
});

const tsContent = `// Auto-generated from indian_women_meals_600_cleaned.csv

export interface CSVMeal {
    id: string;
    name: string;
    time: string;
    dietType: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    prepTime: string;
    ingredients: string[];
    instructions: string;
    tip: string;
    tags: string[];
}

export const CSV_MEALS: CSVMeal[] = ${JSON.stringify(generatedData, null, 4)};
`;

fs.writeFileSync(outPath, tsContent, 'utf8');
console.log('Successfully wrote', generatedData.length, 'meals to', outPath);
