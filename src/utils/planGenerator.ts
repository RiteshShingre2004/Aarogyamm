import type { WorkoutDay, MealPlanDay } from '../types';
import { CSV_MEALS } from './mealsData';

export interface UserParams {
    goal: string;
    fitnessLevel: string;
    equipment: string[];
    healthConditions: string[];
    tdee: number;
    dietaryPreference: string;
    age: number;
    bmi: number;
}

// ─── Exercise pools ────────────────────────────────────────────────────────────

const ex = (id: string, name: string, type: WorkoutDay['exercises'][0]['type'],
    sets: number, reps: string, dur: number, muscles: string[],
    instructions: string[], mistakes: string[], beginner: string, advanced: string, gif: string) =>
    ({ id, name, type, sets, reps, durationSeconds: dur, targetMuscles: muscles, instructions, commonMistakes: mistakes, beginnerModification: beginner, advancedVariation: advanced, gifKeyword: gif });

const WARMUPS = [
    ex('wu1', 'Suryanamaskar', 'warm-up', 1, '5 rounds', 300, ['Full Body'],
        ['Stand tall, palms together.', 'Inhale and raise arms overhead.', 'Fold forward, step back to plank.', 'Flow through cobra then downward dog.', 'Step forward and rise. Repeat.'],
        ['Holding breath', 'Sagging hips'], 'Do 3 rounds slowly.', 'Increase to 10 rounds.', 'suryanamaskar yoga'),
    ex('wu2', 'Neck & Shoulder Rolls', 'warm-up', 1, '60 sec', 60, ['Neck', 'Shoulders'],
        ['Slowly roll neck in circles.', 'Roll shoulders forward then backward.', 'Shake out arms.'],
        ['Forcing range'], 'Keep movements tiny.', 'Add chest openers.', 'neck rolls warm up'),
    ex('wu3', 'March in Place', 'warm-up', 1, '2 min', 120, ['Legs', 'Cardio'],
        ['March on the spot lifting knees high.', 'Swing arms naturally.', 'Breathe steadily.'],
        ['Looking down'], 'Small steps are fine.', 'Add high knees.', 'march in place warm up'),
];

const BODYWEIGHT = [
    ex('bw1', 'Bodyweight Squats', 'strength', 3, '15', 180, ['Quads', 'Glutes'],
        ['Feet shoulder width.', 'Push hips back and lower.', 'Thighs parallel to floor.', 'Press through heels.'],
        ['Knees caving in'], 'Squat to a chair.', 'Add jump at top.', 'bodyweight squat'),
    ex('bw2', 'Knee Push-Ups', 'strength', 3, '10', 150, ['Chest', 'Triceps'],
        ['Hands shoulder width on knees.', 'Lower chest to floor.', 'Press back up.'],
        ['Flaring elbows wide'], 'Wall push-ups.', 'Full push-ups.', 'knee push up'),
    ex('bw3', 'Glute Bridges', 'strength', 3, '20', 180, ['Glutes', 'Hamstrings'],
        ['Lie on back, knees bent.', 'Press heels to lift hips.', 'Squeeze glutes at top.', 'Lower slowly.'],
        ['Pushing through toes'], 'Smaller range.', 'Single-leg bridge.', 'glute bridge'),
    ex('bw4', 'Plank Hold', 'strength', 3, '30 sec', 180, ['Core', 'Shoulders'],
        ['High plank, body straight.', 'Brace core hard.', 'Hold steady.'],
        ['Sagging hips'], 'Forearm plank.', 'Shoulder taps.', 'plank hold'),
    ex('bw5', 'Reverse Lunges', 'strength', 3, '12 each leg', 180, ['Glutes', 'Quads'],
        ['Step back with right foot.', 'Lower knee toward floor.', 'Press through front heel.'],
        ['Front knee caving'], 'Hold wall for balance.', 'Add knee drive.', 'reverse lunge'),
    ex('bw6', 'Bicycle Crunches', 'strength', 3, '20', 150, ['Obliques', 'Core'],
        ['Lie on back.', 'Bring knee to opposite elbow.', 'Alternate sides smoothly.'],
        ['Pulling neck'], 'Feet on floor.', 'Slow 2 sec each side.', 'bicycle crunch'),
    ex('bw7', 'Donkey Kicks', 'strength', 3, '15 each side', 180, ['Glutes', 'Core'],
        ['On all fours.', 'Kick one leg back and up.', 'Squeeze glute at top.'],
        ['Rotating hips'], 'Small range.', 'Add ankle weight.', 'donkey kicks exercise'),
    ex('bw8', 'Wall Sit', 'strength', 3, '30 sec', 150, ['Quads', 'Glutes'],
        ['Back flat against wall.', 'Slide down to 90°.', 'Hold position.'],
        ['Knee past toes'], 'Slide down partially.', 'Extend hold to 60 sec.', 'wall sit exercise'),
];

const DUMBBELL = [
    ex('db1', 'Dumbbell Squats', 'strength', 3, '12', 180, ['Quads', 'Glutes'],
        ['Hold dumbbells at sides.', 'Squat with chest tall.', 'Press through heels.'],
        ['Heels lifting'], 'Lighter weight.', 'Goblet squat holding one dumbbell.', 'dumbbell squat'),
    ex('db2', 'Dumbbell Rows', 'strength', 3, '12 each arm', 180, ['Back', 'Biceps'],
        ['Hinge forward 45°.', 'Pull dumbbell to hip.', 'Squeeze back at top.'],
        ['Rotating torso'], 'Very light weight.', 'Single-arm row.', 'dumbbell row'),
    ex('db3', 'Bicep Curls', 'strength', 3, '12', 150, ['Biceps'],
        ['Stand with dumbbells.', 'Curl up slowly.', 'Lower with control.'],
        ['Swinging elbows'], 'Hammer curls.', 'Slow eccentric 3 sec.', 'bicep curl dumbbell'),
    ex('db4', 'Overhead Press', 'strength', 3, '10', 150, ['Shoulders', 'Triceps'],
        ['Start at shoulders.', 'Press straight up.', 'Lower with control.'],
        ['Arching lower back'], 'Seated version.', 'Arnold press.', 'dumbbell overhead press'),
    ex('db5', 'Romanian Deadlift', 'strength', 3, '12', 180, ['Hamstrings', 'Glutes'],
        ['Stand with dumbbells.', 'Hinge at hips, lower weights.', 'Drive hips forward.'],
        ['Rounding back'], 'Keep tiny bend in knees.', 'Slow 4-count descent.', 'romanian deadlift dumbbell'),
];

const BANDS = [
    ex('rb1', 'Band Squats', 'strength', 3, '15', 180, ['Quads', 'Glutes'],
        ['Band above knees.', 'Push knees out against band.', 'Squat down.'],
        ['Knees caving'], 'Lighter band.', 'Add a pause at bottom.', 'resistance band squat'),
    ex('rb2', 'Band Lateral Walks', 'strength', 3, '20 steps each', 180, ['Glutes', 'Hip Abductors'],
        ['Band at ankles.', 'Slight squat position.', 'Step sideways 20 steps each direction.'],
        ['Standing too tall'], 'Band at knees.', 'Add squat between steps.', 'band lateral walk'),
    ex('rb3', 'Band Glute Kickbacks', 'strength', 3, '15 each', 150, ['Glutes'],
        ['Band at ankles.', 'Kick one leg straight back.', 'Squeeze glute.'],
        ['Rotating hip'], 'Smaller range.', 'Add pause at top.', 'resistance band kickback'),
    ex('rb4', 'Band Bicep Curls', 'strength', 3, '15', 120, ['Biceps'],
        ['Stand on band.', 'Curl up with control.', 'Lower slowly.'],
        ['Swinging elbows'], 'Lighter band.', 'Single arm.', 'resistance band bicep curl'),
];

const YOGA = [
    ex('y1', 'Warrior I', 'yoga', 1, '45 sec each side', 120, ['Legs', 'Core', 'Shoulders'],
        ['Step right foot forward.', 'Bend front knee to 90°.', 'Raise arms overhead.', 'Gaze forward.'],
        ['Front knee past toes'], 'Smaller step.', 'Add a backbend.', 'warrior 1 yoga pose'),
    ex('y2', 'Warrior II', 'yoga', 1, '45 sec each side', 120, ['Legs', 'Core'],
        ['Wide stance.', 'Front knee bent.', 'Arms out to sides like a T.', 'Gaze over front hand.'],
        ['Shoulders tensing'], 'Shorter stance.', 'Add reverse warrior.', 'warrior 2 yoga pose'),
    ex('y3', 'Tree Pose', 'yoga', 1, '30 sec each side', 90, ['Balance', 'Core', 'Legs'],
        ['Stand on one leg.', 'Place foot on inner thigh.', 'Hands at heart.'],
        ['Placing foot on knee'], 'Hand on wall.', 'Arms overhead.', 'tree pose yoga'),
    ex('y4', 'Cat-Cow Stretch', 'yoga', 1, '10 rounds', 120, ['Spine', 'Core'],
        ['On all fours.', 'Inhale — arch back (cow).', 'Exhale — round back (cat).', 'Flow gently.'],
        ['Moving fast'], 'Tiny range.', 'Add neck circles.', 'cat cow stretch yoga'),
    ex('y5', 'Butterfly Pose', 'yoga', 1, '90 sec', 90, ['Hips', 'Inner Thighs'],
        ['Sit with soles of feet together.', 'Hold feet and flutter knees.', 'Fold forward gently.'],
        ['Forcing knees down'], 'Sit on folded blanket.', 'Walk feet further away.', 'butterfly pose yoga'),
    ex('y6', 'Seated Twist', 'yoga', 1, '45 sec each side', 90, ['Spine', 'Obliques'],
        ['Sit tall.', 'Twist to the right.', 'Left hand on right knee.', 'Hold and breathe.'],
        ['Collapsing spine'], 'Stay upright.', 'Deeper bind.', 'seated spinal twist yoga'),
    ex('y7', 'Bridge Pose', 'yoga', 1, '3 × 30 sec', 120, ['Glutes', 'Spine'],
        ['On back, knees bent.', 'Press hips up.', 'Interlace hands under back.'],
        ['Chin to chest'], 'Smaller lift.', 'One-leg bridge.', 'bridge pose yoga'),
];

const CARDIO = [
    ex('ca1', 'Bhangra Steps', 'cardio', 3, '2 min', 360, ['Full Body', 'Cardio'],
        ['Step side to side.', 'Big arm movements.', 'Add shoulder shimmy.', 'Keep energy high!'],
        ['Moving too small'], 'Gentle steps.', 'Add jumps.', 'bhangra dance cardio'),
    ex('ca2', 'Mountain Climbers', 'cardio', 3, '30 sec', 150, ['Core', 'Cardio'],
        ['High plank.', 'Drive knees to chest alternately.', 'Hips level.'],
        ['Bouncing hips'], 'Step instead of run.', 'Cross-body mountain climbers.', 'mountain climbers exercise'),
    ex('ca3', 'Jumping Jacks', 'cardio', 3, '40', 120, ['Full Body', 'Cardio'],
        ['Jump feet wide and arms up.', 'Jump back together.', 'Steady rhythm.'],
        ['Locked knees on landing'], 'Step jacks — no jump.', 'Faster pace.', 'jumping jacks cardio'),
    ex('ca4', 'High Knees', 'cardio', 3, '30 sec', 120, ['Core', 'Legs', 'Cardio'],
        ['Run in place.', 'Drive knees to waist height.', 'Pump arms.'],
        ['Looking down'], 'March instead.', 'Sprint speed.', 'high knees exercise'),
    ex('ca5', 'Skipping (Imaginary Rope)', 'cardio', 3, '2 min', 360, ['Calves', 'Cardio'],
        ['Jump lightly on balls of feet.', 'Rotate wrists as if holding rope.', 'Stay light.'],
        ['Jumping too high'], 'Single bounces.', 'Double unders.', 'jump rope exercise'),
];

const COOLDOWNS = [
    ex('cd1', "Child's Pose", 'cool-down', 1, '90 sec', 90, ['Back', 'Hips'],
        ['Kneel and sit back on heels.', 'Extend arms forward.', 'Rest forehead on mat.', 'Breathe deeply.'],
        ['Holding tension'], 'Pillow under forehead.', 'Walk hands further.', "child's pose yoga"),
    ex('cd2', 'Standing Forward Fold', 'cool-down', 1, '60 sec', 60, ['Hamstrings', 'Back'],
        ['Fold from hips.', 'Knees soft.', 'Let head hang.'],
        ['Rounding from waist'], 'Grab elbows.', 'Grab ankles.', 'standing forward fold yoga'),
    ex('cd3', 'Supine Twist', 'cool-down', 1, '60 sec each side', 120, ['Spine', 'Hips'],
        ['Lie on back.', 'Knee to opposite side.', 'Head turns opposite.', 'Breathe.'],
        ['Lifting shoulder'], 'Both knees together.', 'Extend top leg.', 'supine spinal twist yoga'),
    ex('cd4', 'Seated Forward Fold', 'cool-down', 1, '90 sec', 90, ['Hamstrings', 'Back'],
        ['Legs extended.', 'Hinge from hips.', 'Reach for feet.'],
        ['Rounding back'], 'Use towel around feet.', 'Reach past feet.', 'seated forward fold yoga'),
    ex('cd5', 'Legs Up the Wall', 'cool-down', 1, '3 min', 180, ['Legs', 'Recovery'],
        ['Lie near wall.', 'Swing legs up.', 'Arms out, close eyes.', 'Breathe deeply.'],
        ['Tight hamstrings pulling hips'], 'Slight bend in knees.', 'Add hip circles.', 'legs up wall pose'),
];

// ─── Helper ────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], n: number, offset = 0): T[] {
    const result: T[] = [];
    for (let i = 0; i < n; i++) result.push(arr[(i + offset) % arr.length]);
    return result;
}

function adjustSets(exercise: ReturnType<typeof ex>, level: string) {
    const e = { ...exercise };
    if (level === 'beginner') { e.sets = Math.max(1, e.sets - 1); }

    return e;
}

function getAvailableStrength(equipment: string[]) {
    let pool = [...BODYWEIGHT];
    if (equipment.includes('Dumbbells')) pool = [...pool, ...DUMBBELL];
    if (equipment.includes('Resistance Bands')) pool = [...pool, ...BANDS];
    return pool;
}

// ─── Workout Plan ──────────────────────────────────────────────────────────────

const GOAL_CONFIGS: Record<string, { days: Array<{ focus: string; theme: string; emoji: string }> }> = {
    'fat-loss': {
        days: [
            { focus: 'cardio', theme: 'Cardio Blast', emoji: '🔥' },
            { focus: 'strength', theme: 'Full Body Strength', emoji: '💪' },
            { focus: 'hiit', theme: 'HIIT Circuit', emoji: '⚡' },
            { focus: 'strength', theme: 'Lower Body Burn', emoji: '🍑' },
            { focus: 'cardio', theme: 'Dance Cardio', emoji: '💃' },
            { focus: 'rest', theme: 'Rest & Recover', emoji: '🌙' },
            { focus: 'yoga', theme: 'Active Recovery Yoga', emoji: '🧘' },
        ],
    },
    'strength': {
        days: [
            { focus: 'strength', theme: 'Upper Body Push', emoji: '💪' },
            { focus: 'strength', theme: 'Lower Body Power', emoji: '🦵' },
            { focus: 'strength', theme: 'Upper Body Pull', emoji: '🏋️' },
            { focus: 'rest', theme: 'Rest & Recover', emoji: '🌙' },
            { focus: 'strength', theme: 'Full Body Strength', emoji: '🔥' },
            { focus: 'cardio', theme: 'Cardio + Core', emoji: '⚡' },
            { focus: 'yoga', theme: 'Mobility & Stretch', emoji: '🧘' },
        ],
    },
    'muscle-gain': {
        days: [
            { focus: 'strength', theme: 'Upper Body Volume', emoji: '💪' },
            { focus: 'strength', theme: 'Lower Body Volume', emoji: '🦵' },
            { focus: 'rest', theme: 'Rest & Recover', emoji: '🌙' },
            { focus: 'strength', theme: 'Full Body Compound', emoji: '🏋️' },
            { focus: 'strength', theme: 'Core & Core Power', emoji: '🔥' },
            { focus: 'cardio', theme: 'Light Cardio', emoji: '🚶' },
            { focus: 'yoga', theme: 'Recovery Yoga', emoji: '🧘' },
        ],
    },
    'yoga-flexibility': {
        days: [
            { focus: 'yoga', theme: 'Morning Flow', emoji: '🌅' },
            { focus: 'yoga', theme: 'Strength Yoga', emoji: '💪' },
            { focus: 'yoga', theme: 'Hip Opening', emoji: '🧘' },
            { focus: 'rest', theme: 'Rest & Recover', emoji: '🌙' },
            { focus: 'yoga', theme: 'Power Yoga', emoji: '🔥' },
            { focus: 'strength', theme: 'Mindful Strength', emoji: '🌿' },
            { focus: 'yoga', theme: 'Restorative Yoga', emoji: '✨' },
        ],
    },
};

const NOTES: Record<string, string[]> = {
    'fat-loss': [
        'Every calorie burned is a step closer to your goal! 🔥',
        'Consistency beats perfection every time! 💪',
        'Your body is a temple — treat it with love! 🌸',
        'Sweat is just fat crying! Keep going! 💦',
        'You are stronger than yesterday! ✨',
    ],
    'strength': [
        'Strength is built rep by rep. You\'ve got this! 💪',
        'Every workout makes you harder to break! 🏋️',
        'Progress, not perfection! 🌟',
        'Strong women lift each other up! 💖',
        'Your muscles are growing stronger today! 🌱',
    ],
    'muscle-gain': [
        'Muscles are built in the gym, revealed in the kitchen! 🌿',
        'Every rep builds the body you deserve! 💪',
        'Volume today = definition tomorrow! 🔥',
        'Fuel your gains with belief! ✨',
        'Your body is constantly adapting and growing! 🌸',
    ],
    'yoga-flexibility': [
        'Flexibility is freedom. Breathe into it! 🧘',
        'Your body opens a little more each practice! 🌸',
        'Stillness is its own kind of strength! ✨',
        'Flow with grace, move with intention! 🌿',
        'Every inhale brings energy, every exhale releases tension! 💓',
    ],
};

export function generateWorkoutPlan(params: UserParams): WorkoutDay[] {
    const { goal, fitnessLevel, equipment, healthConditions } = params;
    const config = GOAL_CONFIGS[goal] ?? GOAL_CONFIGS['fat-loss'];
    const strPool = getAvailableStrength(equipment);
    const notes = NOTES[goal] ?? NOTES['fat-loss'];
    const days: WorkoutDay[] = [];

    // High-impact restriction for PCOS + overweight
    const limitHighImpact = healthConditions.includes('PCOS') && params.bmi > 27;

    for (let d = 1; d <= 30; d++) {
        const dayConfig = config.days[(d - 1) % 7];
        const weekMult = Math.floor((d - 1) / 7);
        const isRest = dayConfig.focus === 'rest';
        const dur = isRest ? 0 : (fitnessLevel === 'beginner' ? 25 : 35);
        const cal = isRest ? 0 : (150 + weekMult * 15 + (fitnessLevel === 'intermediate' ? 25 : 0));

        if (isRest) {
            days.push({ day: d, isRestDay: true, theme: `Day ${d} - Rest & Recover`, duration: 0, caloriesBurned: 0, motivationalNote: 'Rest is not laziness — your muscles rebuild today! 💖', exercises: [] });
            continue;
        }

        const offset = d * 3;
        let exercises: Array<ReturnType<typeof ex>> = [];
        const warmup = adjustSets(WARMUPS[d % WARMUPS.length], fitnessLevel);

        if (dayConfig.focus === 'strength') {
            exercises = [warmup, ...pick(strPool, 3, offset), adjustSets(COOLDOWNS[d % COOLDOWNS.length], fitnessLevel)];
        } else if (dayConfig.focus === 'cardio') {
            const cardioEx = limitHighImpact ? CARDIO.filter(c => !['ca3', 'ca5'].includes(c.id)) : CARDIO;
            exercises = [warmup, ...pick(cardioEx, 2, offset), ...pick(BODYWEIGHT, 1, offset), adjustSets(COOLDOWNS[(d + 1) % COOLDOWNS.length], fitnessLevel)];
        } else if (dayConfig.focus === 'hiit') {
            const hiitEx = limitHighImpact ? [...CARDIO.slice(0, 2), ...BODYWEIGHT.slice(0, 2)] : [...CARDIO, ...BODYWEIGHT];
            exercises = [warmup, ...pick(hiitEx, 3, offset), adjustSets(COOLDOWNS[d % COOLDOWNS.length], fitnessLevel)];
        } else if (dayConfig.focus === 'yoga') {
            exercises = [warmup, ...pick(YOGA, 3, offset), adjustSets(COOLDOWNS[(d + 2) % COOLDOWNS.length], fitnessLevel)];
        }

        // Adjust sets for fitness level
        exercises = exercises.map(e => adjustSets(e, fitnessLevel));

        days.push({
            day: d,
            isRestDay: false,
            theme: `Day ${d}`,
            duration: dur,
            caloriesBurned: cal,
            motivationalNote: notes[(d - 1) % notes.length],
            exercises,
        });
    }
    return days;
}

// ─── Meal Plan ─────────────────────────────────────────────────────────────────

function getMealPool(dietaryPreference: string) {
    const isVegetarian = dietaryPreference.toLowerCase().includes('veg') && !dietaryPreference.toLowerCase().includes('non');
    
    // Filter by dietary preference
    const allMeals = CSV_MEALS.filter(m => {
        if (isVegetarian && m.dietType.toLowerCase() === 'non-veg') return false;
        return true;
    });

    const breakfasts = allMeals.filter(m => m.time === 'Breakfast');
    const lunches = allMeals.filter(m => m.time === 'Lunch');
    const dinners = allMeals.filter(m => m.time === 'Dinner');
    const snacks = allMeals.filter(m => m.time.includes('Snack'));

    return {
        breakfasts: breakfasts.length > 0 ? breakfasts : [CSV_MEALS[0]],
        lunches: lunches.length > 0 ? lunches : [CSV_MEALS[0]],
        dinners: dinners.length > 0 ? dinners : [CSV_MEALS[0]],
        snacks: snacks.length > 0 ? snacks : [CSV_MEALS[0]]
    };
}

export function generateMealPlan(params: UserParams): MealPlanDay[] {
    const { dietaryPreference, tdee, goal, healthConditions } = params;
    const pool = getMealPool(dietaryPreference);
    
    // Split snacks roughly in half for morning/evening variety
    const halfSnack = Math.ceil(pool.snacks.length / 2);
    const morningSnacks = pool.snacks.slice(0, halfSnack);
    const eveningSnacks = pool.snacks.slice(halfSnack);

    const snacks = morningSnacks.length > 0 ? morningSnacks : pool.snacks;
    const eSnacks = eveningSnacks.length > 0 ? eveningSnacks : pool.snacks;

    // Calorie target based on goal
    const calTarget = goal === 'fat-loss' ? tdee - 300 : goal === 'muscle-gain' ? tdee + 200 : tdee;

    const pcosNote = healthConditions.includes('PCOS') ? ' • Low-GI foods prioritised for PCOS.' : '';
    const diabNote = healthConditions.includes('Diabetes') ? ' • Monitor portion sizes for blood sugar.' : '';

    const days: MealPlanDay[] = [];
    for (let d = 1; d <= 30; d++) {
        const breakfast = pool.breakfasts[(d - 1) % pool.breakfasts.length];
        const snk = snacks[(d - 1) % snacks.length];
        const esnk = eSnacks[(d - 1) % eSnacks.length];

        const fixedCal = breakfast.calories + snk.calories + esnk.calories;
        const remaining = calTarget - fixedCal;

        let bestLunch = pool.lunches[0];
        let bestDinner = pool.dinners[0];
        let bestDiff = Infinity;
        let bestVarietyScore = Infinity;

        for (let li = 0; li < pool.lunches.length; li++) {
             for (let di = 0; di < pool.dinners.length; di++) {
                 const combo = pool.lunches[li].calories + pool.dinners[di].calories;
                 const diff = Math.abs(combo - remaining);
                 const varietyScore = Math.abs(li + di - ((d - 1) % (pool.lunches.length + pool.dinners.length)));
                 
                 if (diff < bestDiff || (diff === bestDiff && varietyScore < bestVarietyScore)) {
                     bestDiff = diff;
                     bestVarietyScore = varietyScore;
                     bestLunch = pool.lunches[li];
                     bestDinner = pool.dinners[di];
                 }
             }
        }

        days.push({
             day: d,
             meals: {
                 breakfast: { ...breakfast, tip: (breakfast.tip || '') + pcosNote + diabNote },
                 midMorningSnack: snk,
                 lunch: bestLunch,
                 eveningSnack: esnk,
                 dinner: bestDinner,
             },
             targetCalories: calTarget,
        });
    }
    return days;
}
