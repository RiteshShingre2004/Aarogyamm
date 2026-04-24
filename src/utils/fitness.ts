// Fitness calculation utilities for AAROGYAM

export function calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 23) return 'Healthy Weight';
    if (bmi < 27.5) return 'Overweight';
    return 'Obese';
}

export function getBMIColor(bmi: number): string {
    if (bmi < 18.5) return '#FF8C42'; // orange
    if (bmi < 23) return '#2ECC71'; // green
    if (bmi < 27.5) return '#F4C430'; // yellow
    return '#D4418E'; // rose
}

// Mifflin-St Jeor Equation (for women)
export function calculateBMR(weightKg: number, heightCm: number, age: number): number {
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
}

export function calculateTDEE(bmr: number, fitnessLevel: string): number {
    const multipliers: Record<string, number> = {
        beginner: 1.2,
        intermediate: 1.375,
    };
    const multiplier = multipliers[fitnessLevel] ?? 1.2;
    return Math.round(bmr * multiplier);
}

export function getTargetCalories(tdee: number, goal: string): number {
    switch (goal) {
        case 'fat-loss': return Math.round(tdee - 400);
        case 'muscle-gain': return Math.round(tdee + 250);
        case 'strength': return Math.round(tdee + 100);
        case 'yoga-flexibility': return tdee;
        default: return tdee;
    }
}

export function getRecommendedGoal(bmi: number): { goal: string; reason: string } {
    if (bmi < 18.5) return {
        goal: 'Gain Muscle & Strength',
        reason: 'Your body needs nourishment and lean muscle building',
    };
    if (bmi < 23) return {
        goal: 'Tone & Maintain',
        reason: "You're at a healthy weight — let's sculpt and maintain it!",
    };
    if (bmi < 27.5) return {
        goal: 'Fat Loss & Fitness',
        reason: 'A balanced fat-loss plan will bring you to your ideal range',
    };
    return {
        goal: 'Fat Loss Focus',
        reason: 'Let\'s begin with a sustainable fat loss journey built just for you',
    };
}

export function getWorkoutDuration(fitnessLevel: string): number {
    const durations: Record<string, number> = {
        beginner: 25,
        intermediate: 35,
    };
    return durations[fitnessLevel] ?? 30;
}

export function isRestDay(dayNumber: number): boolean {
    return dayNumber % 6 === 0;
}

export function getStreakCount(completedDays: number[]): number {
    if (!completedDays.length) return 0;
    const sorted = [...completedDays].sort((a, b) => b - a);
    let streak = 0;
    let expected = sorted[0];
    for (const day of sorted) {
        if (day === expected) {
            streak++;
            expected--;
        } else {
            break;
        }
    }
    return streak;
}

export function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export const MOTIVATIONAL_QUOTES = [
    'Every rep brings you closer to your dream.',
    'A fit mother is a happy household.',
    'Your body is not a burden. It\'s a blessing. Train it with love.',
    'Strength doesn\'t come from what you can do. It comes from overcoming what you thought you couldn\'t.',
    'Your strength, your identity.',
    'Small steps every day lead to big transformations.',
    'You are not behind. You are exactly where you need to be.',
    'Rest is not weakness — it\'s wisdom.',
    'You showed up. That\'s already a win.',
    'Your journey, your pace, your victory.',
];

export interface LevelInfo {
    level: number;
    title: string;
    icon: string;
    minPoints: number;
    maxPoints: number;
}

/** Returns the current plan day (1–30) based on IST midnight rollovers. */
export function getCurrentPlanDay(planStartDate: string | null | undefined): number {
    if (!planStartDate) return 1;
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30
    const startDay = Math.floor((new Date(planStartDate).getTime() + IST_OFFSET_MS) / 86400000);
    const nowDay = Math.floor((Date.now() + IST_OFFSET_MS) / 86400000);
    return Math.min(Math.max(1, nowDay - startDay + 1), 30);
}

export function getLevel(points: number): LevelInfo {
    const LEVELS: LevelInfo[] = [
        { level: 1, title: 'Seedling', icon: '🌱', minPoints: 0, maxPoints: 99 },
        { level: 2, title: 'Blossom', icon: '🌸', minPoints: 100, maxPoints: 299 },
        { level: 3, title: 'Rising', icon: '🌿', minPoints: 300, maxPoints: 599 },
        { level: 4, title: 'Warrior', icon: '⚔️', minPoints: 600, maxPoints: 999 },
        { level: 5, title: 'Champion', icon: '🏆', minPoints: 1000, maxPoints: 1499 },
        { level: 6, title: 'Goddess', icon: '✨', minPoints: 1500, maxPoints: Infinity },
    ];
    return LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) ?? LEVELS[0];
}
