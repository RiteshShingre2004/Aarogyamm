import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calculateTDEE } from '../../utils/fitness';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { FitnessLevel } from '../../types';
import {
    Sprout,
    Leaf,
    Heart,
    Check,
    Zap,
    Timer,
    Users,
    ArrowRight
} from 'lucide-react';

const LEVELS = [
    {
        id: 'beginner' as FitnessLevel,
        icon: Sprout, name: 'Beginner',
        desc: '"I rarely exercise or am just starting out"',
        detail: 'Mostly sedentary lifestyle, no regular workout routine',
        for: 'New moms, ladies returning after a break, complete beginners',
        intensity: 'Low–Medium', duration: '25 min/day',
        color: '#2ECC71',
    },
    {
        id: 'intermediate' as FitnessLevel,
        icon: Leaf, name: 'Intermediate',
        desc: '"I exercise 2–3 times a week or have some experience"',
        detail: 'Some fitness background, can handle moderate intensity',
        for: 'Ladies who walk regularly, do some yoga or home workouts',
        intensity: 'Medium–High', duration: '35 min/day',
        color: '#FF8C42',
    },
];

export default function Step3FitnessLevel() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { bmr = 1300, selectedGoal = 'fat-loss' } = location.state ?? {};
    const firstName = (user?.displayName ?? 'Goddess').split(' ')[0];

    const [selected, setSelected] = useState<FitnessLevel | null>(null);
    const [saving, setSaving] = useState(false);

    const handleContinue = async () => {
        if (!selected || !user) return;
        setSaving(true);

        const tdee = calculateTDEE(bmr, selected);

        await updateDoc(doc(db, 'users', user.uid), {
            'profile.fitnessLevel': selected,
            'metrics.tdee': tdee,
            'progress.planStartDate': new Date().toISOString(),
        });

        setSaving(false);
        navigate('/onboarding/step4', {
            state: { tdee, fitnessLevel: selected, selectedGoal, bmr },
        });
    };

    return (
        <div className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#FFF5F8' }}>
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2" style={{ color: '#8B7B8B' }}>
                    <span>Step 3 of 4</span><span>Fitness Level</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(212,65,142,0.15)' }}>
                    <div className="h-2 rounded-full w-3/4" style={{ background: 'linear-gradient(90deg, #D4418E, #FF8C42)' }} />
                </div>
                <div className="flex gap-2 mt-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-2 w-2 rounded-full"
                            style={{ background: i <= 2 ? '#D4418E' : 'rgba(212,65,142,0.3)' }} />
                    ))}
                </div>
            </div>

            <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#1A0A2E' }}>
                How active are you right now, {firstName}?
            </h1>
            <p className="mb-8 flex items-center gap-1.5" style={{ color: '#8B7B8B' }}>
                Be honest — there's no wrong answer! We'll start exactly where you are <Heart size={14} fill="rgba(212,65,142,0.3)" />
            </p>

            <div className="flex flex-col gap-4 mb-8">
                {LEVELS.map((level, i) => (
                    <motion.div key={level.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelected(level.id)}
                        whileHover={{ scale: 1.01 }}
                        className="rounded-2xl p-5 cursor-pointer transition-all"
                        style={{
                            border: selected === level.id ? `2px solid ${level.color}` : '1.5px solid rgba(212,65,142,0.15)',
                            background: selected === level.id ? `${level.color}12` : 'white',
                            boxShadow: selected === level.id ? `0 0 0 3px ${level.color}20` : 'none',
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <motion.div animate={selected === level.id ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.3 }} className="p-3 rounded-2xl bg-white/50" style={{ color: level.color }}>
                                <level.icon size={32} />
                            </motion.div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div>
                                        <span className="font-bold text-lg" style={{ color: '#1A0A2E' }}>{level.name}</span>
                                        
                                    </div>
                                    {selected === level.id && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                                            style={{ background: level.color }}><Check size={14} strokeWidth={4} />
                                        </motion.div>
                                    )}
                                </div>
                                <p className="text-sm italic mb-2" style={{ color: '#8B7B8B' }}>{level.desc}</p>
                                <p className="text-sm mb-3" style={{ color: '#1A0A2E' }}>{level.detail}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${level.color}20`, color: level.color }}>
                                        <Zap size={10} /> {level.intensity}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${level.color}20`, color: level.color }}>
                                        <Timer size={10} /> {level.duration}
                                    </span>
                                </div>
                                <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#8B7B8B' }}>
                                    <Users size={12} /> {level.for}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: selected ? 1.02 : 1 }}
                whileTap={{ scale: selected ? 0.98 : 1 }}
                onClick={handleContinue}
                disabled={!selected || saving}
                className="w-full py-4 rounded-2xl text-white font-semibold text-lg"
                style={{
                    background: selected ? 'linear-gradient(135deg, #D4418E, #7B2D8B)' : 'rgba(212,65,142,0.3)',
                    cursor: selected ? 'pointer' : 'not-allowed',
                }}
            >
                {saving ? 'Saving...' : selected ? <span className="flex items-center gap-2">Continue <ArrowRight size={20} /></span> : 'Select your level to continue'}
            </motion.button>
        </div>
    );
}
