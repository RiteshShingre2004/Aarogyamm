import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import type { Meal } from '../types';
import { getCurrentPlanDay } from '../utils/fitness';
import {
    Sunrise,
    Apple,
    Utensils,
    Coffee,
    Moon,
    ShoppingBasket,
    ChefHat,
    Lightbulb,
    Timer,
    Leaf,
    Star,
    Check,
    Lock,
    Droplets
} from 'lucide-react';


function MealCard({ meal, type }: { meal: Meal; type: string }) {
    const [expanded, setExpanded] = useState(false);
    const mealIcons: Record<string, any> = {
        breakfast: Sunrise, midMorningSnack: Apple, lunch: Utensils, eveningSnack: Coffee, dinner: Moon,
    };
    const mealLabels: Record<string, string> = {
        breakfast: 'Breakfast', midMorningSnack: 'Snack', lunch: 'Lunch',
        eveningSnack: 'Snack', dinner: 'Dinner',
    };
    const Icon = mealIcons[type];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl mb-4 overflow-hidden"
            style={{ border: '1.5px solid rgba(212,65,142,0.12)', background: 'white' }}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-pink-50 text-[#D4418E]">
                            <Icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D4418E' }}>
                                {mealLabels[type]} • {meal.time}
                            </p>
                            <p className="font-semibold" style={{ color: '#1A0A2E' }}>{meal.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold" style={{ color: '#FF8C42' }}>{meal.calories}</p>
                        <p className="text-xs" style={{ color: '#8B7B8B' }}>kcal</p>
                    </div>
                </div>
                {/* Macros Bar */}
                <div className="flex gap-3 mt-3">
                    {[
                        { label: 'Protein', val: meal.protein, color: '#D4418E' },
                        { label: 'Carbs', val: meal.carbs, color: '#FF8C42' },
                        { label: 'Fat', val: meal.fat, color: '#7B2D8B' },
                    ].map(m => (
                        <div key={m.label} className="flex-1">
                            <div className="text-xs font-bold" style={{ color: m.color }}>{m.val}g</div>
                            <div className="text-xs" style={{ color: '#8B7B8B' }}>{m.label}</div>
                            <div className="h-1 rounded-full mt-1" style={{ background: 'rgba(212,65,142,0.1)' }}>
                                <div className="h-1 rounded-full" style={{ background: m.color, width: `${Math.min(100, m.val * 3)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4">
                    <hr className="mb-4" style={{ borderColor: 'rgba(212,65,142,0.1)' }} />
                    <div className="mb-3">
                        <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: '#D4418E' }}>
                            <ShoppingBasket size={14} /> Ingredients
                        </p>
                        <ul className="space-y-1">
                            {meal.ingredients.map((ing, i) => (
                                <li key={i} className="text-sm" style={{ color: '#1A0A2E' }}>• {ing}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(212,65,142,0.06)' }}>
                        <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: '#D4418E' }}>
                            <ChefHat size={14} /> How to Make
                        </p>
                        <p className="text-sm" style={{ color: '#1A0A2E' }}>{meal.instructions}</p>
                    </div>
                    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,140,66,0.08)' }}>
                        <p className="text-sm flex items-start gap-2" style={{ color: '#FF8C42' }}>
                            <Lightbulb size={16} className="shrink-0 mt-0.5" /> {meal.tip}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                            {meal.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-white"
                                    style={{ background: tag.includes('PCOS') ? '#7B2D8B' : tag.includes('High') ? '#D4418E' : '#2ECC71' }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <span className="text-xs flex items-center gap-1" style={{ color: '#8B7B8B' }}>
                            <Timer size={12} /> {meal.prepTime}
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function MealPlan() {
    const { state } = useAppContext();
    const { mealPlan, userData } = state;
    const [waterGlasses, setWaterGlasses] = useState(0);

    // IST-aware plan day (1-30)
    const planDay = getCurrentPlanDay(userData?.profile?.planGeneratedAt);
    const isMealUnlocked = (day: number) => day <= planDay; // days 1..planDay are unlocked

    // selectedDay is 1-indexed (matches plan day numbers)
    const [selectedDay, setSelectedDay] = useState(planDay);

    // Sync to today when plan day changes (e.g. midnight)
    useEffect(() => { setSelectedDay(planDay); }, [planDay]);

    // Use modulo so old 7-day saved plans still work (wraps around), and new 30-day plans work directly
    const dayPlan = mealPlan.length > 0 ? mealPlan[(selectedDay - 1) % mealPlan.length] : undefined;
    const tdee = userData?.metrics?.tdee ?? 1800;
    const targetCal = userData?.metrics?.targetCalories ?? tdee;

    // IST date label for today
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(Date.now() + IST_OFFSET);
    const dateLabel = todayIST.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

    if (!dayPlan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Leaf size={48} className="text-[#D4418E] animate-bounce" />
                <p className="font-accent text-xl" style={{ color: '#D4418E' }}>Loading your meal plan...</p>
            </div>
        );
    }

    // Explicit chronological order: morning → night
    const MEAL_ORDER = ['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'] as const;
    const meals = MEAL_ORDER.map(key => [key, dayPlan.meals[key]] as const);
    const totalCal = meals.reduce((sum, [, m]) => sum + m.calories, 0);

    return (
        <div className="min-h-screen" style={{ background: '#FFF5F8' }}>
            {/* Header */}
            <div className="sticky top-0 z-20 px-8 py-4"
                style={{ background: 'rgba(255,245,248,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,65,142,0.1)' }}>
                <h1 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                    <Utensils size={24} className="text-[#D4418E]" /> My Meal Plan
                </h1>
                <p className="text-sm" style={{ color: '#8B7B8B' }}>
                    {dateLabel} &nbsp;•&nbsp; Day {planDay} of 30 &nbsp;•&nbsp; Target: {targetCal} kcal
                </p>
            </div>

            <div className="px-8 pt-6">
                {/* Day Selector — 30 days, unlocked up to today */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 snap-x">
                    {Array.from({ length: 30 }, (_, i) => {
                        const day = i + 1;
                        const unlocked = isMealUnlocked(day);
                        const isToday = day === planDay;
                        const isPast = day < planDay;
                        return (
                            <motion.button key={day}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDay(day)}
                                className="min-w-[54px] py-2 px-2 rounded-2xl text-center flex-shrink-0 snap-start"
                                style={{
                                    background: selectedDay === day ? '#D4418E' : unlocked ? 'white' : 'rgba(0,0,0,0.04)',
                                    color: selectedDay === day ? 'white' : unlocked ? '#1A0A2E' : '#C4B5C4',
                                    border: isToday && selectedDay !== day ? '2px solid #D4418E' : '1px solid rgba(212,65,142,0.15)',
                                    cursor: 'pointer',
                                }}>
                                <div className="text-xs font-bold flex justify-center mb-0.5">
                                    {isToday ? <Star size={10} fill="currentColor" /> : isPast ? <Check size={10} strokeWidth={3} /> : !unlocked ? <Lock size={10} /> : <div className="h-[10px]" />}
                                </div>
                                <div className="text-xs font-bold" style={{ color: selectedDay === day ? 'white' : '#8B7B8B' }}>
                                    D{day}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Preview banner for locked days */}
                {!isMealUnlocked(selectedDay) && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-4 mb-5 flex items-center gap-3"
                        style={{ background: 'rgba(212,65,142,0.06)', border: '1.5px dashed rgba(212,65,142,0.3)' }}>
                        <Lock size={24} className="text-[#D4418E]" />
                        <div>
                            <p className="font-semibold text-sm" style={{ color: '#D4418E' }}>Preview Mode — Day {selectedDay}</p>
                            <p className="text-xs" style={{ color: '#8B7B8B' }}>This meal plan unlocks on Day {selectedDay} of your journey. Come back then to track your meals!</p>
                        </div>
                    </motion.div>
                )}

                {/* Calorie overview */}
                <div className="rounded-2xl p-4 mb-6 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, rgba(212,65,142,0.08), rgba(255,140,66,0.08))', border: '1px solid rgba(212,65,142,0.15)' }}>
                    <div>
                        <p className="text-sm" style={{ color: '#8B7B8B' }}>Today's Calories</p>
                        <p className="font-display text-3xl font-bold" style={{ color: '#D4418E' }}>{totalCal}</p>
                        <p className="text-xs" style={{ color: '#8B7B8B' }}>of {targetCal} kcal target</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-block rounded-full px-3 py-1 text-sm font-bold text-white"
                            style={{ background: totalCal <= targetCal ? '#2ECC71' : '#D4418E' }}>
                            {totalCal <= targetCal ? <><Check size={14} strokeWidth={3} /> On Track</> : `+${totalCal - targetCal}`}
                        </div>
                    </div>
                </div>

                {/* Meal cards */}
                {meals.map(([type, meal]) => (
                    <MealCard key={type} meal={meal} type={type} />
                ))}

                {/* Water tracker */}
                <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                                <Droplets size={18} className="text-blue-500" /> Water Tracker
                            </h3>
                            <p className="text-xs" style={{ color: '#8B7B8B' }}>Goal: 8 glasses / day</p>
                        </div>
                        <span className="font-bold text-2xl" style={{ color: '#D4418E' }}>{waterGlasses}/8</span>
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <motion.button key={i} whileTap={{ scale: 0.9 }}
                                onClick={() => setWaterGlasses(Math.min(8, i + 1))}
                                className="text-xl"
                                style={{ opacity: i < waterGlasses ? 1 : 0.3 }}>
                                <Droplets
                                    size={24}
                                    className={i < waterGlasses ? "text-blue-500 fill-blue-500" : "text-gray-300"}
                                />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Grocery tip */}
                <div className="rounded-2xl p-4" style={{ background: 'rgba(123,45,139,0.08)' }}>
                    <p className="font-semibold mb-1 flex items-center gap-2" style={{ color: '#7B2D8B' }}>
                        <ShoppingBasket size={18} /> Shopping Tip
                    </p>
                    <p className="text-sm" style={{ color: '#1A0A2E' }}>
                        All ingredients in this plan are available at your local kirana store. Stock up on dal, paneer, seasonal vegetables, and whole grains weekly.
                    </p>
                </div>
            </div>
        </div>
    );
}
