import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { getLevel } from '../utils/fitness';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { auth } from '../firebase';
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from 'firebase/auth';
import { toast } from '../components/Toast';
import {
    User,
    LogOut,
    Dumbbell,
    Flame,
    Calendar,
    BarChart2,
    Scale,
    TrendingUp,
    Trophy,
    Sprout,
    Zap,
    Target,
    ShieldCheck
} from 'lucide-react';

function StatBadge({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="rounded-2xl p-4 text-center flex flex-col items-center gap-1"
            style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
            <Icon size={20} className="text-[#D4418E] mb-1" />
            <div className="font-bold text-lg" style={{ color: '#D4418E' }}>{value}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#8B7B8B' }}>{label}</div>
        </div>
    );
}

const BADGE_LIST = [
    { id: 'first-workout', icon: Sprout, name: 'First Step', desc: 'Completed first workout', threshold: 1 },
    { id: 'week1', icon: Dumbbell, name: 'Week Warrior', desc: '7 workouts done', threshold: 7 },
    { id: 'fortnight', icon: Target, name: 'Fortnight Fighter', desc: '14 workouts done', threshold: 14 },
    { id: 'month', icon: Trophy, name: 'Monthly Maven', desc: 'Completed 30-day plan', threshold: 30 },
    { id: 'streak7', icon: Flame, name: 'Fire Seven', desc: '7-day streak', threshold: 7 },
    { id: 'calorie1k', icon: Zap, name: 'Energy Queen', desc: 'Burned 1000+ kcal', threshold: 1000 },
];

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { state, logWeight } = useAppContext();
    const { userData } = state;
    const [weightInput, setWeightInput] = useState('');
    const [showWeightInput, setShowWeightInput] = useState(false);

    // MFA Enrollment State
    const [enrollPhone, setEnrollPhone] = useState('');
    const [enrollCode, setEnrollCode] = useState('');
    const [enrollVerificationId, setEnrollVerificationId] = useState('');
    const [enrollLoading, setEnrollLoading] = useState(false);

    const progress = userData?.progress;
    const profile = userData?.profile;
    const metrics = userData?.metrics;
    const points = progress?.points ?? 0;
    const workoutsDone = progress?.workoutsCompleted ?? 0;
    const levelInfo = getLevel(points);

    const handleLogWeight = async () => {
        if (!weightInput) return;
        await logWeight(parseFloat(weightInput));
        setWeightInput('');
        setShowWeightInput(false);
    };

    const weightChartData = (userData?.weightLog ?? []).slice(-10).map(w => ({
        date: new Date(w.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        weight: w.weightKg,
    }));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleEnrollSms = async () => {
        if (!user || !enrollPhone) return;
        setEnrollLoading(true);
        try {
            const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-profile', { size: 'invisible' });
            const session = await multiFactor(user).getSession();
            const phoneInfoOptions = {
                phoneNumber: enrollPhone,
                session
            };
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
            setEnrollVerificationId(verificationId);
            toast('SMS sent! Please check your phone.', 'success');
        } catch (err: any) {
            console.error('MFA enroll send error', err);
            toast('Failed to send SMS code.', 'error');
        } finally {
            setEnrollLoading(false);
        }
    };

    const verifyEnrollCode = async () => {
        if (!user || !enrollCode || !enrollVerificationId) return;
        setEnrollLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(enrollVerificationId, enrollCode);
            const assertion = PhoneMultiFactorGenerator.assertion(credential);
            await multiFactor(user).enroll(assertion, 'Personal Phone');
            toast('Successfully enrolled in Two-Factor Authentication!', 'success');
            setEnrollVerificationId('');
            setEnrollCode('');
            setEnrollPhone('');
        } catch (err: any) {
            console.error('MFA enroll verify error', err);
            toast('Failed to verify SMS code.', 'error');
        } finally {
            setEnrollLoading(false);
        }
    };
    
    // Safety check with optional chaining since multiFactor might not be fully populated on initial load sometimes
    const isEnrolled = (user as any)?.multiFactor?.enrolledFactors?.length > 0;

    return (
        <div className="min-h-screen" style={{ background: '#FFF5F8' }}>
            {/* Header */}
            <div className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
                style={{ background: 'rgba(255,245,248,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,65,142,0.1)' }}>
                <h1 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                    <User size={24} className="text-[#D4418E]" /> My Profile
                </h1>
                <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    style={{ background: 'rgba(212,65,142,0.1)', color: '#D4418E' }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <div className="px-8 pt-6">
                {/* Profile Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-6 mb-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #D4418E, #7B2D8B)', boxShadow: '0 8px 32px rgba(212,65,142,0.3)' }}>
                    <div className="absolute inset-0 opacity-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                width: 40, height: 40, borderRadius: '50%', border: '1px solid white',
                                animation: 'pulseRing 3s ease-in-out infinite', animationDelay: `${i * 0.4}s`,
                            }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden">
                            {user?.photoURL
                                ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center bg-white/20">
                                    <User size={40} className="text-white" />
                                </div>
                            }
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-white font-bold">{user?.displayName}</h2>
                            <p className="text-white/70 text-sm">{user?.email}</p>
                            {/* Level Badge */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xl">{levelInfo.icon}</span>
                                <div>
                                    <p className="text-white text-sm font-semibold">{levelInfo.title}</p>
                                    <p className="text-white/70 text-xs">{points} pts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <StatBadge icon={Dumbbell} label="Workouts" value={`${workoutsDone}`} />
                    <StatBadge icon={Flame} label="Total kcal" value={`${progress?.totalCaloriesBurned ?? 0}`} />
                    <StatBadge icon={Calendar} label="Streak" value={`${progress?.streakDays ?? 0} days`} />
                </div>

                {/* Health Metrics */}
                <div className="rounded-3xl p-5 mb-6"
                    style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                        <BarChart2 size={18} className="text-[#D4418E]" /> Health Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Height', value: profile?.heightCm ? `${profile.heightCm} cm` : '-- cm' },
                            { label: 'Weight', value: profile?.weightKg ? `${profile.weightKg.toFixed(1)} kg` : '-- kg' },
                            { label: 'BMI', value: metrics?.bmi ? `${metrics.bmi} (${metrics.bmiCategory})` : '--' },
                            { label: 'Daily Calories', value: `${metrics?.targetCalories ?? metrics?.tdee ?? '--'} kcal` },
                            { label: 'Fitness Level', value: profile?.fitnessLevel ?? '--' },
                            { label: 'Goal', value: profile?.selectedGoal?.replace('-', ' ') ?? '--' },
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(212,65,142,0.05)' }}>
                                <p className="text-xs" style={{ color: '#8B7B8B' }}>{item.label}</p>
                                <p className="font-semibold capitalize" style={{ color: '#1A0A2E' }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weight Log */}
                <div className="rounded-3xl p-5 mb-6"
                    style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                            <Scale size={18} className="text-[#D4418E]" /> Weight Log
                        </h3>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowWeightInput(s => !s)}
                            className="text-sm px-3 py-1 rounded-xl text-white"
                            style={{ background: '#D4418E' }}>+ Log Today</motion.button>
                    </div>
                    {showWeightInput && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex gap-2 mb-4">
                            <input type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)}
                                placeholder="e.g. 58.5" className="flex-1 px-3 py-2 rounded-xl text-sm"
                                style={{ border: '1.5px solid rgba(212,65,142,0.3)', outline: 'none' }} />
                            <span className="flex items-center text-sm" style={{ color: '#8B7B8B' }}>kg</span>
                            <button onClick={handleLogWeight}
                                className="px-4 py-2 rounded-xl text-white text-sm font-medium"
                                style={{ background: '#D4418E' }}>Save</button>
                        </motion.div>
                    )}
                    {weightChartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={140}>
                            <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="profileWeightGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4418E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4418E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B7B8B', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.5)',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                    }}
                                    formatter={(v) => [`${v} kg`, 'Weight']}
                                />
                                <Area type="monotone" dataKey="weight" stroke="#D4418E" strokeWidth={3} fillOpacity={1} fill="url(#profileWeightGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-sm py-4 flex flex-col items-center gap-2" style={{ color: '#8B7B8B' }}>
                            <TrendingUp size={24} className="opacity-20" />
                            Log at least 2 entries to see your weight trend
                        </p>
                    )}
                </div>

                {/* Achievement Badges */}
                <div className="rounded-3xl p-5 mb-6"
                    style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                        <Trophy size={18} className="text-[#D4418E]" /> Achievements
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {BADGE_LIST.map(badge => {
                            const earned = (() => {
                                if (badge.id === 'first-workout') return workoutsDone >= 1;
                                if (badge.id === 'week1') return workoutsDone >= 7;
                                if (badge.id === 'fortnight') return workoutsDone >= 14;
                                if (badge.id === 'month') return workoutsDone >= 30;
                                if (badge.id === 'streak7') return (progress?.streakDays ?? 0) >= 7;
                                if (badge.id === 'calorie1k') return (progress?.totalCaloriesBurned ?? 0) >= 1000;
                                return false;
                            })();
                            return (
                                <motion.div key={badge.id} whileHover={{ scale: 1.05 }}
                                    className="flex flex-col items-center text-center p-3 rounded-2xl"
                                    style={{ background: earned ? 'rgba(212,65,142,0.08)' : 'rgba(0,0,0,0.03)', opacity: earned ? 1 : 0.4 }}>
                                    <badge.icon size={32} className={earned ? "text-[#D4418E]" : "text-[#8B7B8B]"} />
                                    <p className="text-xs font-semibold mt-1" style={{ color: '#1A0A2E' }}>{badge.name}</p>
                                    <p className="text-xs mt-0.5" style={{ color: '#8B7B8B' }}>{badge.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Multi-Factor Authentication */}
                <div className="rounded-3xl p-5 mb-12"
                    style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                        <ShieldCheck size={18} className="text-[#D4418E]" /> Security Center
                    </h3>
                    <div id="recaptcha-profile"></div>

                    {isEnrolled ? (
                        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(52, 168, 83, 0.1)' }}>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-green-800 text-sm">Two-Factor Authentication is Active</p>
                                <p className="text-xs text-green-700">Your account is secured with SMS verification.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl p-5" style={{ background: 'rgba(212,65,142,0.04)' }}>
                            <p className="text-sm font-semibold mb-2" style={{ color: '#1A0A2E' }}>Enable Two-Factor Auth</p>
                            <p className="text-xs mb-4" style={{ color: '#8B7B8B' }}>Add an extra layer of security to your account. You'll receive a code via SMS whenever you sign in.</p>
                            
                            {!enrollVerificationId ? (
                                <div className="flex flex-col gap-3">
                                    <input 
                                        type="tel" 
                                        placeholder="Phone number (e.g. +91 9876543210)" 
                                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-pink-400"
                                        value={enrollPhone}
                                        onChange={e => setEnrollPhone(e.target.value)}
                                        style={{ borderColor: 'rgba(212,65,142,0.2)' }}
                                    />
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleEnrollSms}
                                        disabled={enrollLoading || !enrollPhone}
                                        className="w-full py-3 rounded-xl text-white font-medium text-sm flex justify-center items-center disabled:opacity-70"
                                        style={{ background: '#D4418E' }}
                                    >
                                        {enrollLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Enrollment Code'}
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="6-digit code" 
                                        className="flex-1 px-4 py-3 rounded-xl border text-sm text-center tracking-widest outline-none focus:border-pink-400"
                                        value={enrollCode}
                                        onChange={e => setEnrollCode(e.target.value)}
                                        maxLength={6}
                                        style={{ borderColor: 'rgba(212,65,142,0.2)' }}
                                    />
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={verifyEnrollCode}
                                        disabled={enrollLoading || enrollCode.length !== 6}
                                        className="px-6 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-70"
                                        style={{ background: '#D4418E' }}
                                    >
                                        {enrollLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify'}
                                    </motion.button>
                                    <button 
                                        onClick={() => setEnrollVerificationId('')}
                                        className="text-xs px-2"
                                        style={{ color: '#8B7B8B' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
