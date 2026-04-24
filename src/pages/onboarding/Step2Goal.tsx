import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRecommendedGoal } from '../../utils/fitness';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { WorkoutGoal } from '../../types';
import {
    Flame,
    Dumbbell,
    Leaf,
    Sparkles,
    ArrowRight,
    Check,
    Star,
    Heart
} from 'lucide-react';

const GOALS = [
    {
        id: 'fat-loss' as WorkoutGoal,
        icon: Flame, name: 'Fat Loss', nameShort: 'FAT LOSS',
        desc: 'Burn stubborn fat with smart cardio and strength combos',
        outcome: 'Lose 3–5 kg in 30 days',
        gradient: 'linear-gradient(135deg, #FF8C42, #D4418E)',
    },
    {
        id: 'strength' as WorkoutGoal,
        icon: Dumbbell, name: 'Strength Training', nameShort: 'STRENGTH',
        desc: 'Build real functional strength for daily life tasks',
        outcome: 'Feel 2× stronger in 30 days',
        gradient: 'linear-gradient(135deg, #7B2D8B, #3a1a6e)',
    },
    {
        id: 'muscle-gain' as WorkoutGoal,
        icon: Leaf, name: 'Gain Muscle & Tone', nameShort: 'TONE & GAIN',
        desc: 'Grow lean muscle for a sculpted, defined body',
        outcome: 'Visible muscle definition in 30 days',
        gradient: 'linear-gradient(135deg, #2ECC71, #27ae60)',
    },
    {
        id: 'yoga-flexibility' as WorkoutGoal,
        icon: Sparkles, name: 'Yoga & Flexibility', nameShort: 'YOGA & FLEX',
        desc: 'Improve flexibility, posture, stress relief and inner balance',
        outcome: 'Better posture & calm mind in 30 days',
        gradient: 'linear-gradient(135deg, #D4418E, #7B2D8B)',
    },
];

export default function Step2Goal() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { bmi = 22, bmiCategory = 'Healthy Weight', tdee = 1800 } = location.state ?? {};

    const recommendation = getRecommendedGoal(bmi);
    const [selected, setSelected] = useState<WorkoutGoal | null>(null);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSelect = (goal: typeof GOALS[0]) => {
        setSelected(goal.id);
        if (goal.name === recommendation.goal || goal.id === 'fat-loss' && recommendation.goal.includes('Fat')) {
            setFeedback(`Great choice! That's exactly what we'd recommend!`);
        } else {
            setFeedback(`Love that! We'll build your plan around ${goal.name}`);
        }
    };

    const handleContinue = async () => {
        if (!selected || !user) return;
        setSaving(true);
        await updateDoc(doc(db, 'users', user.uid), { 'profile.selectedGoal': selected });
        setSaving(false);
        navigate('/onboarding/step3', { state: { bmi, bmiCategory, tdee, selectedGoal: selected } });
    };

    return (
        <div className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#FFF5F8' }}>
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2" style={{ color: '#8B7B8B' }}>
                    <span>Step 2 of 4</span><span>Fitness Goal</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(212,65,142,0.15)' }}>
                    <div className="h-2 rounded-full w-2/4" style={{ background: 'linear-gradient(90deg, #D4418E, #FF8C42)' }} />
                </div>
                <div className="flex gap-2 mt-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-2 w-2 rounded-full"
                            style={{ background: i <= 1 ? '#D4418E' : 'rgba(212,65,142,0.3)' }} />
                    ))}
                </div>
            </div>

            <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                What's your fitness dream? <Sparkles size={28} className="text-[#D4418E]" />
            </h1>
            <p className="mb-6" style={{ color: '#8B7B8B' }}>Based on your BMI of {bmi}, we have a special suggestion for you!</p>

            {/* AI Recommendation Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 mb-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(212,65,142,0.1), rgba(244,196,48,0.1))', border: '1.5px solid rgba(212,65,142,0.3)' }}
            >
                <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex items-center gap-1"
                    style={{ background: '#D4418E' }}><Sparkles size={10} /> Recommended</div>
                <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-xl bg-white/20">
                        <Star size={24} className="text-[#D4418E] fill-[#D4418E]" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4418E' }}>AAROGYAM RECOMMENDS</p>
                        <p className="font-semibold" style={{ color: '#1A0A2E' }}>{recommendation.goal}</p>
                        <p className="text-sm mt-1" style={{ color: '#8B7B8B' }}>{recommendation.reason}</p>
                        <p className="text-xs mt-1" style={{ color: '#8B7B8B' }}>Daily calorie target: <strong>{tdee} kcal</strong></p>
                    </div>
                </div>
            </motion.div>

            {/* Goal Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {GOALS.map((goal, i) => (
                    <motion.div key={goal.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(goal)}
                        className="rounded-2xl p-4 cursor-pointer relative overflow-hidden transition-all"
                        style={{
                            border: selected === goal.id ? '2px solid #D4418E' : '1.5px solid rgba(212,65,142,0.15)',
                            background: selected === goal.id ? 'rgba(212,65,142,0.08)' : 'white',
                            boxShadow: selected === goal.id ? '0 0 0 4px rgba(212,65,142,0.1)' : 'none',
                        }}
                    >
                        {selected === goal.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                                style={{ background: '#D4418E' }}><Check size={12} strokeWidth={4} /></div>
                        )}
                        <div className="p-2 rounded-xl bg-pink-50 text-[#D4418E] w-fit mb-3">
                            <goal.icon size={24} />
                        </div>
                        <div className="font-bold text-sm mb-1" style={{ color: '#1A0A2E' }}>{goal.nameShort}</div>
                        <div className="text-xs mb-2" style={{ color: '#8B7B8B', lineHeight: 1.4 }}>{goal.desc}</div>
                        <div className="text-xs font-medium px-2 py-0.5 rounded-full text-white inline-block"
                            style={{ background: goal.gradient }}>
                            {goal.outcome}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Feedback */}
            <AnimateFeedback text={feedback} />

            <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                disabled={!selected || saving}
                className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
                style={{
                    background: selected ? 'linear-gradient(135deg, #D4418E, #FF8C42)' : 'rgba(212,65,142,0.3)',
                    cursor: selected ? 'pointer' : 'not-allowed',
                }}
            >
                {saving ? 'Saving...' : <>Continue <ArrowRight size={20} /></>}
            </motion.button>
        </div>
    );
}

function AnimateFeedback({ text }: { text: string }) {
    if (!text) return null;
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3 px-4 rounded-2xl mb-4 font-accent text-lg flex items-center justify-center gap-2"
            style={{ background: 'rgba(212,65,142,0.08)', color: '#D4418E' }}>
            <Heart size={18} fill="#D4418E" /> {text}
        </motion.div>
    );
}
