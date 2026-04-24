// TypeScript types/interfaces for AAROGYAM

export interface Exercise {
    id: string;
    name: string;
    type: 'warm-up' | 'strength' | 'cardio' | 'cool-down' | 'yoga' | 'hiit';
    sets: number;
    reps: string;
    durationSeconds: number;
    targetMuscles: string[];
    instructions: string[];
    commonMistakes: string[];
    beginnerModification: string;
    advancedVariation: string;
    gifKeyword: string;
}

export interface WorkoutDay {
    day: number;
    isRestDay: boolean;
    theme: string;
    duration: number;
    exercises: Exercise[];
    caloriesBurned: number;
    motivationalNote: string;
    completedAt?: string | null;
}

export interface Meal {
    name: string;
    time: string;
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

export interface DailyMeals {
    breakfast: Meal;
    midMorningSnack: Meal;
    lunch: Meal;
    eveningSnack: Meal;
    dinner: Meal;
}

export interface MealPlanDay {
    day: number;
    meals: DailyMeals;
    targetCalories?: number;
}

export interface UserMetrics {
    bmi: number;
    bmiCategory: string;
    bmr: number;
    tdee: number;
    targetCalories: number;
    lastUpdated?: string;
}

export interface UserProgress {
    planStartDate?: string;
    currentDay: number;
    completedDays: number[];
    workoutsCompleted: number;
    totalCaloriesBurned: number;
    streakDays: number;
    lastWorkoutDate?: string;
    points: number;
}

export interface WeightEntry {
    date: string;
    weightKg: number;
}

export interface MoodEntry {
    date: string;
    mood: number; // 1-5
    energy: number; // 1-5
}

export type FitnessLevel = 'beginner' | 'intermediate';
export type WorkoutGoal = 'fat-loss' | 'strength' | 'muscle-gain' | 'yoga-flexibility';
export type DietaryPreference = 'vegetarian' | 'non-vegetarian';

export interface UserProfile {
    age: number;
    weightKg: number;
    heightCm: number;
    dietaryPreference: DietaryPreference;
    healthConditions: string[];
    equipmentAvailable?: string[];
    preferredWorkoutTime?: 'morning' | 'evening' | 'flexible';
    fitnessLevel: FitnessLevel;
    selectedGoal: WorkoutGoal;
    onboardingComplete: boolean;
    planGeneratedAt?: string;   // ISO timestamp written by PlanGenerating.tsx
}

export interface AppUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    createdAt: string;
    profile: UserProfile;
    metrics: UserMetrics;
    progress: UserProgress;
    weightLog: WeightEntry[];
    moodLog: MoodEntry[];
}

export const BADGE_DEFINITIONS = [
    { id: 'first-workout', icon: '✅', name: 'First Step!', description: 'Completed your first workout', condition: (p: UserProgress) => p.workoutsCompleted >= 1 },
    { id: 'streak-3', icon: '🔥', name: '3-Day Streak', description: 'Worked out 3 days in a row', condition: (p: UserProgress) => p.streakDays >= 3 },
    { id: 'streak-7', icon: '🌟', name: 'Week Warrior', description: '7-day workout streak', condition: (p: UserProgress) => p.streakDays >= 7 },
    { id: 'workouts-10', icon: '💪', name: '10 Workouts Done', description: 'Completed 10 workouts', condition: (p: UserProgress) => p.workoutsCompleted >= 10 },
    { id: 'workouts-20', icon: '🏆', name: 'Halfway Shakti', description: '20 workouts completed', condition: (p: UserProgress) => p.workoutsCompleted >= 20 },
    { id: 'plan-complete', icon: '🎊', name: '30-Day Goddess', description: 'Completed the full 30-day plan', condition: (p: UserProgress) => p.workoutsCompleted >= 25 },
    { id: 'goal-setter', icon: '🎯', name: 'Goal Setter', description: 'Set your fitness goal', condition: (_p: UserProgress) => true },
    { id: 'meal-explorer', icon: '🥗', name: 'Meal Explorer', description: 'Explored the meal plan', condition: (_p: UserProgress) => true },
];

export function getUserLevel(points: number): { name: string; emoji: string; next: number } {
    if (points >= 5000) return { name: 'Goddess', emoji: '🔥', next: Infinity };
    if (points >= 3000) return { name: 'Shakti', emoji: '🌳', next: 5000 };
    if (points >= 1500) return { name: 'Blossom', emoji: '🌸', next: 3000 };
    if (points >= 500) return { name: 'Sprout', emoji: '🌿', next: 1500 };
    return { name: 'Seedling', emoji: '🌱', next: 500 };
}
