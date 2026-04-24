import { useEffect, useState } from 'react';
import {
    Sparkles,
    Dumbbell,
    Activity,
    Search,
    BarChart2,
    Utensils,
    Check,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateWorkoutPlan, generateMealPlan, type UserParams } from '../../utils/planGenerator';

const MESSAGES = [
    { text: 'Analysing your body metrics...', icon: Search },
    { text: 'Calculating personalised calorie targets...', icon: BarChart2 },
    { text: 'Building your 30-day workout calendar...', icon: Dumbbell },
    { text: 'Curating Indian meals just for you...', icon: Utensils },
    { text: 'Adding the personalised touch...', icon: Sparkles },
    { text: 'Almost ready! Your transformation starts now!', icon: Activity },
];

export default function PlanGenerating() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { saveWorkoutPlan, saveMealPlan } = useAppContext();
    const [msgIndex, setMsgIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const firstName = (user?.displayName ?? 'Goddess').split(' ')[0];

    // Read from location.state passed from Step4Profile
    const { fitnessLevel = 'beginner', selectedGoal = 'fat-loss', tdee = 1800 } = location.state ?? {};

    useEffect(() => {
        if (!user) return;

        // Cycle messages every 1.1 sec
        let msg = 0;
        const interval = setInterval(() => {
            msg = Math.min(msg + 1, MESSAGES.length - 1);
            setMsgIndex(msg);
        }, 1100);

        const run = async () => {
            try {
                // 1. Read user profile from Firestore
                const snap = await getDoc(doc(db, 'users', user.uid));
                const data = snap.data() ?? {};
                const profile = data.profile ?? {};
                const metrics = data.metrics ?? {};

                const params: UserParams = {
                    goal: selectedGoal,
                    fitnessLevel: fitnessLevel,
                    equipment: ['No Equipment'],
                    healthConditions: profile.healthConditions ?? [],
                    tdee: tdee,
                    dietaryPreference: profile.dietaryPreference ?? 'vegetarian',
                    age: metrics.age ?? profile.age ?? 25,
                    bmi: metrics.bmi ?? 22,
                };

                // 2. Generate personalised plans
                const workoutPlan = generateWorkoutPlan(params);
                const mealPlan = generateMealPlan(params);

                // 3. Save to Firestore via AppContext
                await saveWorkoutPlan(workoutPlan);
                await saveMealPlan(mealPlan);

                // 4. Mark onboarding complete and save goal/level
                await updateDoc(doc(db, 'users', user.uid), {
                    'profile.onboardingComplete': true,
                    'profile.planGeneratedAt': new Date().toISOString(),
                    'profile.selectedGoal': selectedGoal,
                    'profile.fitnessLevel': fitnessLevel,
                    'metrics.tdee': tdee,
                    'metrics.targetCalories': selectedGoal === 'fat-loss'
                        ? tdee - 300
                        : selectedGoal === 'muscle-gain'
                            ? tdee + 200
                            : tdee,
                });

                // Navigate after messages finish
                setTimeout(() => {
                    clearInterval(interval);
                    navigate('/dashboard', { state: { firstTime: true } });
                }, MESSAGES.length * 1100 + 400);

            } catch (e: any) {
                console.error('Plan generation error:', e);
                clearInterval(interval);
                setError(e.message || 'An error occurred during plan generation.');
            }
        };

        run();
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, location.state]);

    const progress = Math.round(((msgIndex + 1) / MESSAGES.length) * 100);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #4a1060 50%, #D4418E 100%)' }}
        >
            {/* Background particles */}
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{ width: 4 + (i % 4) * 3, height: 4 + (i % 4) * 3, background: `rgba(255,255,255,${0.05 + (i % 3) * 0.05})`, left: `${(i * 8.3) % 100}%`, top: `${(i * 13.7) % 100}%` }}
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.3 }}
                />
            ))}

            {/* Spinning mandala */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="mb-10 relative">
                <svg viewBox="0 0 120 120" className="w-40 h-40">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <ellipse key={i} cx="60" cy="60" rx="50" ry="18"
                            fill="none" stroke="white" strokeWidth="0.7"
                            opacity={0.2 + (i % 4) * 0.1}
                            transform={`rotate(${i * 22.5} 60 60)`} />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ellipse key={i + 16} cx="60" cy="60" rx="30" ry="10"
                            fill="none" stroke="#F4C430" strokeWidth="0.9"
                            opacity={0.6}
                            transform={`rotate(${i * 45} 60 60)`} />
                    ))}
                    <circle cx="60" cy="60" r="10" fill="#F4C430" opacity={0.9} />
                    <circle cx="60" cy="60" r="5" fill="white" />
                </svg>
                {/* Pulsing ring */}
                <motion.div className="absolute inset-0 rounded-full border-2 border-white/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ margin: '-20px' }}
                />
            </motion.div>

            <h2 className="font-display text-3xl text-white font-bold text-center mb-2 flex items-center justify-center gap-2">
                Building Your Plan, {firstName}! <Sparkles className="text-[#F4C430]" size={28} />
            </h2>
            <p className="text-white/60 text-center mb-8 text-sm">Your personalised 30-day transformation journey</p>

            {/* Animated message */}
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.p
                        key="error"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-accent text-xl text-red-400 text-center mb-6 flex items-center justify-center gap-3 bg-red-900/40 p-4 rounded-xl shadow-lg border border-red-500/50"
                    >
                        {error}
                    </motion.p>
                ) : (
                    <motion.p
                        key={msgIndex}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4 }}
                        className="font-accent text-xl text-white text-center mb-6 flex items-center justify-center gap-3"
                    >
                        {(() => {
                            const Icon = MESSAGES[msgIndex].icon;
                            return <><Icon size={24} /> {MESSAGES[msgIndex].text}</>;
                        })()}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-72 h-2.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <motion.div
                    className="h-2.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #F4C430, #FF8C42, #D4418E)' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6 }}
                />
            </div>
            <p className="text-white/40 text-xs mb-10">{progress}% complete</p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {['30-Day Workout Plan', 'Personalised Meals', 'BMI Tracking', 'Progress Analytics'].map((f, i) => (
                    <motion.span key={f}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/80 flex items-center gap-1.5"
                        animate={{ opacity: msgIndex >= i + 1 ? 1 : 0.3 }}
                    >
                        {msgIndex >= i + 1 ? <Check size={12} className="text-green-400" /> : <Loader2 size={12} className="animate-spin" />} {f}
                    </motion.span>
                ))}
            </div>
        </div>
    );
}
