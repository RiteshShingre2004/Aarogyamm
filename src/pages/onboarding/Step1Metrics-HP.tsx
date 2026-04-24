import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { calculateBMI, calculateBMR, calculateTDEE, getBMICategory, getBMIColor } from '../../utils/fitness';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

type SubStep = 'age' | 'weight' | 'height' | 'results';

function ProgressBar({ current, total }: { current: number; total: number }) {
    return (
        <div className="mb-8">
            <div className="flex justify-between text-sm mb-2" style={{ color: '#8B7B8B' }}>
                <span>Step 1 of 4</span>
                <span>Body Metrics</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(212,65,142,0.15)' }}>
                <motion.div
                    className="h-2 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #D4418E, #FF8C42)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(current / total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <div className="flex gap-2 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-2 w-2 rounded-full transition-all ${i === 0 ? 'scale-125' : ''}`}
                        style={{ background: i === 0 ? '#D4418E' : 'rgba(212,65,142,0.3)' }} />
                ))}
            </div>
        </div>
    );
}

function ProgressRing({ bmi, category, color }: { bmi: number; category: string; color: string }) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const normalizedBmi = Math.min(Math.max(bmi, 10), 45);
    const progress = (normalizedBmi - 10) / 35;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="flex flex-col items-center">
            <svg width="180" height="180" className="progress-ring">
                <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(212,65,142,0.15)" strokeWidth="12" />
                <motion.circle
                    cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth="12"
                    strokeLinecap="round" strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    transform="rotate(-90 90 90)"
                />
                <text x="90" y="85" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold" fontFamily="Playfair Display">{bmi}</text>
                <text x="90" y="108" textAnchor="middle" fill="#8B7B8B" fontSize="12" fontFamily="DM Sans">BMI Score</text>
            </svg>
            <span className="font-semibold text-lg mt-2" style={{ color }}>{category}</span>
        </div>
    );
}

export default function Step1Metrics() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { state } = useAppContext();
    const firstName = (user?.displayName ?? 'Beautiful').split(' ')[0];

    const [subStep, setSubStep] = useState<SubStep>('age');
    const [age, setAge] = useState(28);
    const [weight, setWeight] = useState(60);
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [height, setHeight] = useState(160);
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [feet, setFeet] = useState(5);
    const [inches, setInches] = useState(3);
    const [bmi, setBmi] = useState(0);
    const [bmiCategory, setBmiCategory] = useState('');
    const [bmr, setBmr] = useState(0);
    const [tdee, setTdee] = useState(0);
    const [saving, setSaving] = useState(false);

    const weightKg = weightUnit === 'kg' ? weight : weight * 0.453592;
    const heightCm = heightUnit === 'cm' ? height : feet * 30.48 + inches * 2.54;

    const calculateAndShow = () => {
        const calcBmi = calculateBMI(weightKg, heightCm);
        const calcBmr = calculateBMR(weightKg, heightCm, age);
        const calcTdee = calculateTDEE(calcBmr, state.userData?.profile?.fitnessLevel ?? 'beginner');
        setBmi(calcBmi);
        setBmiCategory(getBMICategory(calcBmi));
        setBmr(calcBmr);
        setTdee(calcTdee);
        setSubStep('results');
    };

    const handleContinue = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                'profile.age': age,
                'profile.weightKg': weightKg,
                'profile.heightCm': heightCm,
                'metrics.bmi': bmi,
                'metrics.bmiCategory': bmiCategory,
                'metrics.bmr': bmr,
                'metrics.tdee': tdee,
                'metrics.targetCalories': tdee,
            });
        } catch (e) { console.error(e); }
        setSaving(false);
        navigate('/onboarding/step2', { state: { bmi, bmiCategory, bmr, tdee } });
    };

    const slideIn = {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
        transition: { duration: 0.4 },
    };

    return (
        <div className="min-h-screen px-5 py-8 max-w-lg mx-auto" style={{ background: '#FFF5F8' }}>
            <ProgressBar current={1} total={4} />
            <p className="font-accent text-2xl mb-8" style={{ color: '#D4418E' }}>
                Let's get to know you, {firstName}! 🌸
            </p>

            <AnimatePresence mode="wait">
                {subStep === 'age' && (
                    <motion.div key="age" {...slideIn}>
                        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: '#1A0A2E' }}>
                            How old are you, beautiful?
                        </h2>
                        <p className="mb-8" style={{ color: '#8B7B8B' }}>Your age helps us personalise the workout intensity</p>
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-44 h-44 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, rgba(212,65,142,0.1), rgba(255,140,66,0.1))', border: '2px solid rgba(212,65,142,0.2)' }}>
                                <span className="font-display text-6xl font-bold" style={{ color: '#D4418E' }}>{age}</span>
                            </div>
                            <input type="range" min="18" max="70" value={age} onChange={e => setAge(+e.target.value)}
                                className="w-full" style={{ accentColor: '#D4418E' }} />
                            <div className="flex justify-between w-full text-sm" style={{ color: '#8B7B8B' }}>
                                <span>18</span><span>70</span>
                            </div>
                            <p className="font-accent text-lg text-center" style={{ color: '#7B2D8B' }}>
                                {age >= 18 && age <= 25 ? `Amazing! ${age} is the perfect age to start! 💪` :
                                    age <= 35 ? `Perfect! ${age} is a great age to commit! 🌸` :
                                        age <= 50 ? `Wonderful! It's never too late to feel amazing! ✨` :
                                            `Inspiring! Strength has no age limit! 🔥`}
                            </p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setSubStep('weight')}
                                className="w-full py-4 rounded-2xl text-white font-semibold text-lg"
                                style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)' }}>
                                Next →
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {subStep === 'weight' && (
                    <motion.div key="weight" {...slideIn}>
                        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: '#1A0A2E' }}>
                            What's your current weight?
                        </h2>
                        <p className="mb-6" style={{ color: '#8B7B8B' }}>There's no right or wrong number. This helps us personalise your plan 🤍</p>
                        <div className="flex gap-2 mb-6">
                            {(['kg', 'lbs'] as const).map(u => (
                                <button key={u} onClick={() => setWeightUnit(u)}
                                    className={`flex-1 py-2 rounded-xl font-medium transition-all ${weightUnit === u ? 'text-white' : ''}`}
                                    style={{ background: weightUnit === u ? '#D4418E' : 'rgba(212,65,142,0.1)', color: weightUnit === u ? 'white' : '#D4418E' }}>
                                    {u.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-center gap-6 mb-8">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeight(w => Math.max(30, w - 1))}
                                className="w-14 h-14 rounded-full text-2xl font-bold text-white"
                                style={{ background: '#D4418E' }}>−
                            </motion.button>
                            <div className="text-center">
                                <span className="font-display text-6xl font-bold" style={{ color: '#D4418E' }}>{weight}</span>
                                <span className="text-xl ml-2" style={{ color: '#8B7B8B' }}>{weightUnit}</span>
                            </div>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeight(w => Math.min(200, w + 1))}
                                className="w-14 h-14 rounded-full text-2xl font-bold text-white"
                                style={{ background: '#D4418E' }}>+
                            </motion.button>
                        </div>
                        <input type="range" min="30" max="200" value={weight} onChange={e => setWeight(+e.target.value)}
                            className="w-full mb-8" style={{ accentColor: '#D4418E' }} />
                        <div className="flex gap-3">
                            <button onClick={() => setSubStep('age')} className="flex-1 py-3 rounded-2xl border font-medium"
                                style={{ borderColor: 'rgba(212,65,142,0.3)', color: '#D4418E' }}>← Back</button>
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setSubStep('height')}
                                className="flex-2 py-3 px-8 rounded-2xl text-white font-semibold"
                                style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)', flex: 2 }}>
                                Next →
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {subStep === 'height' && (
                    <motion.div key="height" {...slideIn}>
                        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: '#1A0A2E' }}>
                            How tall are you?
                        </h2>
                        <div className="flex gap-2 mb-6">
                            {(['cm', 'ft'] as const).map(u => (
                                <button key={u} onClick={() => setHeightUnit(u)}
                                    className="flex-1 py-2 rounded-xl font-medium transition-all"
                                    style={{ background: heightUnit === u ? '#D4418E' : 'rgba(212,65,142,0.1)', color: heightUnit === u ? 'white' : '#D4418E' }}>
                                    {u === 'cm' ? 'CM' : 'FT / IN'}
                                </button>
                            ))}
                        </div>
                        {heightUnit === 'cm' ? (
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className="text-center">
                                    <span className="font-display text-6xl font-bold" style={{ color: '#D4418E' }}>{height}</span>
                                    <span className="text-xl ml-2" style={{ color: '#8B7B8B' }}>cm</span>
                                </div>
                                <input type="range" min="130" max="210" value={height} onChange={e => setHeight(+e.target.value)}
                                    className="w-full" style={{ accentColor: '#D4418E' }} />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 mb-8">
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: '#8B7B8B' }}>Feet</label>
                                    <input type="range" min="4" max="7" value={feet} onChange={e => setFeet(+e.target.value)}
                                        className="w-full" style={{ accentColor: '#D4418E' }} />
                                    <div className="text-center font-display text-4xl font-bold mt-2" style={{ color: '#D4418E' }}>{feet} ft</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block" style={{ color: '#8B7B8B' }}>Inches</label>
                                    <input type="range" min="0" max="11" value={inches} onChange={e => setInches(+e.target.value)}
                                        className="w-full" style={{ accentColor: '#D4418E' }} />
                                    <div className="text-center font-display text-4xl font-bold mt-2" style={{ color: '#D4418E' }}>{inches} in</div>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setSubStep('weight')} className="flex-1 py-3 rounded-2xl border font-medium"
                                style={{ borderColor: 'rgba(212,65,142,0.3)', color: '#D4418E' }}>← Back</button>
                            <motion.button whileHover={{ scale: 1.02 }} onClick={calculateAndShow}
                                className="flex-2 py-3 px-8 rounded-2xl text-white font-semibold"
                                style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)', flex: 2 }}>
                                Calculate My BMI 🎯
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {subStep === 'results' && (
                    <motion.div key="results" {...slideIn}>
                        <h2 className="font-display text-3xl font-bold mb-2 text-center" style={{ color: '#1A0A2E' }}>
                            Your Results 🌟
                        </h2>
                        <p className="text-center mb-8" style={{ color: '#8B7B8B' }}>Based on your metrics, here's your personalised baseline</p>
                        <div className="flex justify-center mb-8">
                            <ProgressRing bmi={bmi} category={bmiCategory} color={getBMIColor(bmi)} />
                        </div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl p-6 mb-6"
                            style={{ background: 'rgba(212,65,142,0.06)', border: '1px solid rgba(212,65,142,0.15)' }}>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Daily Calories (TDEE)', value: `${tdee} kcal`, icon: '🔥' },
                                    { label: 'Basal Metabolic Rate', value: `${bmr} kcal`, icon: '💓' },
                                    { label: 'Weight', value: `${weightKg.toFixed(1)} kg`, icon: '⚖️' },
                                    { label: 'Height', value: `${heightCm.toFixed(0)} cm`, icon: '📏' },
                                ].map((stat, i) => (
                                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="text-center p-3 rounded-2xl bg-white">
                                        <div className="text-2xl mb-1">{stat.icon}</div>
                                        <div className="font-bold" style={{ color: '#1A0A2E' }}>{stat.value}</div>
                                        <div className="text-xs" style={{ color: '#8B7B8B' }}>{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleContinue}
                            disabled={saving}
                            className="w-full py-4 rounded-2xl text-white font-semibold text-lg"
                            style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)' }}>
                            {saving ? 'Saving...' : 'See Your Workout Suggestions →'}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
