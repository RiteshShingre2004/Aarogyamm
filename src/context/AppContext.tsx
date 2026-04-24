import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import type { AppUser, UserProfile, UserMetrics, WorkoutDay, MealPlanDay } from '../types';
import { FALLBACK_WORKOUT_PLAN, FALLBACK_MEAL_PLAN } from '../utils/fallbackData';

interface AppState {
    userData: AppUser | null;
    workoutPlan: WorkoutDay[];
    mealPlan: MealPlanDay[];
    isDataLoading: boolean;
    language: 'en' | 'hi';
}

type AppAction =
    | { type: 'SET_USER_DATA'; payload: AppUser }
    | { type: 'SET_WORKOUT_PLAN'; payload: WorkoutDay[] }
    | { type: 'SET_MEAL_PLAN'; payload: MealPlanDay[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_LANGUAGE'; payload: 'en' | 'hi' }
    | { type: 'COMPLETE_WORKOUT'; payload: { day: number; calories: number } }
    | { type: 'LOG_WEIGHT'; payload: { date: string; weightKg: number } }
    | { type: 'LOG_MOOD'; payload: { date: string; mood: number; energy: number } };

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_USER_DATA':
            return { ...state, userData: action.payload };
        case 'SET_WORKOUT_PLAN':
            return { ...state, workoutPlan: action.payload };
        case 'SET_MEAL_PLAN':
            return { ...state, mealPlan: action.payload };
        case 'SET_LOADING':
            return { ...state, isDataLoading: action.payload };
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload };
        case 'COMPLETE_WORKOUT': {
            if (!state.userData) return state;
            const newCompletedDays = [...state.userData.progress.completedDays, action.payload.day];
            const newProgress = {
                ...state.userData.progress,
                completedDays: newCompletedDays,
                workoutsCompleted: state.userData.progress.workoutsCompleted + 1,
                totalCaloriesBurned: state.userData.progress.totalCaloriesBurned + action.payload.calories,
                currentDay: Math.min(action.payload.day + 1, 30),
                lastWorkoutDate: new Date().toISOString(),
                points: state.userData.progress.points + 50,
            };
            return { ...state, userData: { ...state.userData, progress: newProgress } };
        }
        case 'LOG_WEIGHT': {
            if (!state.userData) return state;
            const newLog = [...state.userData.weightLog, action.payload];
            return { ...state, userData: { ...state.userData, weightLog: newLog } };
        }
        case 'LOG_MOOD': {
            if (!state.userData) return state;
            const newMoodLog = [...state.userData.moodLog, action.payload];
            return { ...state, userData: { ...state.userData, moodLog: newMoodLog } };
        }
        default:
            return state;
    }
}

const initialState: AppState = {
    userData: null,
    workoutPlan: FALLBACK_WORKOUT_PLAN,
    mealPlan: FALLBACK_MEAL_PLAN,
    isDataLoading: true,
    language: 'en',
};

interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    saveProfile: (profile: Partial<UserProfile>, metrics: Partial<UserMetrics>) => Promise<void>;
    completeWorkout: (day: number, calories: number) => Promise<void>;
    logWeight: (weightKg: number) => Promise<void>;
    logMood: (mood: number, energy: number) => Promise<void>;
    saveWorkoutPlan: (plan: WorkoutDay[]) => Promise<void>;
    saveMealPlan: (plan: MealPlanDay[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Load user data from Firestore when auth user changes
    useEffect(() => {
        if (!user) {
            dispatch({ type: 'SET_USER_DATA', payload: null as any }); // Clear data on logout
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });

        // Subscribe to user document
        const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (userSnap) => {
            if (userSnap.exists()) {
                dispatch({ type: 'SET_USER_DATA', payload: userSnap.data() as AppUser });
            }
            dispatch({ type: 'SET_LOADING', payload: false });
        }, (error) => {
            console.error('Error listening to user data:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
        });

        // Load workout plan (non-reactive for now, usually generated once)
        const loadPlans = async () => {
            try {
                const planSnap = await getDoc(doc(db, 'users', user.uid, 'plans', 'workout'));
                if (planSnap.exists() && planSnap.data()?.days) {
                    dispatch({ type: 'SET_WORKOUT_PLAN', payload: planSnap.data()!.days });
                }
                const mealSnap = await getDoc(doc(db, 'users', user.uid, 'plans', 'meal'));
                if (mealSnap.exists() && mealSnap.data()?.days) {
                    dispatch({ type: 'SET_MEAL_PLAN', payload: mealSnap.data()!.days });
                }
            } catch (err) {
                console.error('Error loading plans:', err);
            }
        };

        loadPlans();

        return () => {
            unsubscribeUser();
        };
    }, [user]);

    const saveProfile = async (profile: Partial<UserProfile>, metrics: Partial<UserMetrics>) => {
        if (!user) return;
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, { profile, metrics });
    };

    const completeWorkout = async (day: number, calories: number) => {
        if (!user) return;
        dispatch({ type: 'COMPLETE_WORKOUT', payload: { day, calories } });
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, {
            'progress.completedDays': arrayUnion(day),
            'progress.workoutsCompleted': (state.userData?.progress.workoutsCompleted ?? 0) + 1,
            'progress.totalCaloriesBurned': (state.userData?.progress.totalCaloriesBurned ?? 0) + calories,
            'progress.currentDay': Math.min(day + 1, 30),
            'progress.lastWorkoutDate': new Date().toISOString(),
            'progress.points': (state.userData?.progress.points ?? 0) + 50,
        });
    };

    const logWeight = async (weightKg: number) => {
        if (!user) return;
        const entry = { date: new Date().toISOString(), weightKg };
        dispatch({ type: 'LOG_WEIGHT', payload: entry });
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, { weightLog: arrayUnion(entry) });
    };

    const logMood = async (mood: number, energy: number) => {
        if (!user) return;
        const entry = { date: new Date().toISOString(), mood, energy };
        dispatch({ type: 'LOG_MOOD', payload: entry });
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, { moodLog: arrayUnion(entry) });
    };

    const saveWorkoutPlan = async (plan: WorkoutDay[]) => {
        if (!user) return;
        dispatch({ type: 'SET_WORKOUT_PLAN', payload: plan });
        await setDoc(doc(db, 'users', user.uid, 'plans', 'workout'), { days: plan, savedAt: new Date().toISOString() });
    };

    const saveMealPlan = async (plan: MealPlanDay[]) => {
        if (!user) return;
        dispatch({ type: 'SET_MEAL_PLAN', payload: plan });
        await setDoc(doc(db, 'users', user.uid, 'plans', 'meal'), { days: plan, savedAt: new Date().toISOString() });
    };

    return (
        <AppContext.Provider value={{ state, dispatch, saveProfile, completeWorkout, logWeight, logMood, saveWorkoutPlan, saveMealPlan }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
