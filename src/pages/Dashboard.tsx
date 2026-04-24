import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { getTimeGreeting, MOTIVATIONAL_QUOTES, isRestDay, getCurrentPlanDay } from '../utils/fitness';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
    Flame,
    Calendar,
    Scale,
    Star,
    TrendingUp,
    Clock,
    Target,
    Utensils,
    User as LucideUser,
    Dumbbell,
    Sparkles,
    X,
    ChevronRight,
    Info,
    CheckCircle2
} from 'lucide-react';

function SessionPreviewModal({ isOpen, onClose, day, workout }: { isOpen: boolean; onClose: () => void; day: number; workout: any }) {
    if (!isOpen || !workout) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/80 backdrop-blur-xl rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-white/40"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-pink-100/50 flex items-center justify-between bg-white/40">
                    <div>
                        <div className="text-[10px] font-bold text-[#D4418E] uppercase tracking-widest mb-1">Session Preview • Day {day}</div>
                        <h3 className="text-2xl font-display font-bold text-[#1A0A2E]">{workout.theme}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-50 transition-colors">
                        <X size={20} className="text-[#8B7B8B]" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {workout.exercises.map((ex: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white/60">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-[#D4418E] font-bold">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#1A0A2E] text-sm">{ex.name}</h4>
                                    <div className="text-[10px] text-[#8B7B8B] flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {ex.durationSeconds ? `${ex.durationSeconds}s` : ex.reps}</span>
                                        {ex.sets && <span className="flex items-center gap-1"><Info size={10} /> {ex.sets} sets</span>}
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-[#D4418E] uppercase">{ex.type}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-pink-50/30 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#8B7B8B]">
                        <Info size={14} className="text-[#D4418E]" />
                        Upcoming workouts are locked until you reach them.
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
    return (
        <motion.div whileHover={{ scale: 1.05, translateY: -5 }}
            className="rounded-3xl p-5 transition-all duration-300"
            style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 10px 25px rgba(212,65,142,0.06)'
            }}>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-pink-50 text-[#D4418E]">
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#8B7B8B' }}>{label}</span>
            </div>
            <div className="font-display font-bold text-3xl" style={{ color: '#1A0A2E' }}>{value}</div>
            {sub && <div className="text-[10px] mt-1 font-semibold" style={{ color: '#D4418E' }}>{sub.toUpperCase()}</div>}
        </motion.div>
    );
}

function ProgressRing({ percent, label, size = 100 }: { percent: number; label: string; size?: number }) {
    const r = size / 2 - 8;
    const circ = 2 * Math.PI * r;
    return (
        <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm rounded-3xl p-4 border border-white/50 shadow-sm transition-transform hover:scale-105">
            <svg width={size} height={size} className="progress-ring">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,65,142,0.08)" strokeWidth="8" />
                <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#pinkGradient)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - percent / 100) }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} />
                <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#D4418E" />
                        <stop offset="100%" stopColor="#FF8C42" />
                    </linearGradient>
                </defs>
                <text x={size / 2} y={size / 2 + 8} textAnchor="middle" fill="#1A0A2E" fontSize="20" fontWeight="bold" className="font-display">
                    {Math.round(percent)}%
                </text>
            </svg>
            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest" style={{ color: '#8B7B8B' }}>{label}</span>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { state } = useAppContext();
    const { userData, workoutPlan, isDataLoading } = state;

    const location = useLocation();
    const firstName = (user?.displayName ?? 'Goddess').split(' ')[0];
    const greeting = getTimeGreeting();
    const [selectedDay, setSelectedDay] = useState<number>(userData?.progress?.currentDay ?? 1);
    const [showWelcome, setShowWelcome] = useState(location.state?.firstTime === true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

    // Sync selectedDay with currentDay on mount once userData is available
    const currentDay = getCurrentPlanDay(userData?.progress?.planStartDate);
    const [isFirstSync, setIsFirstSync] = useState(true);

    useEffect(() => {
        if (userData && isFirstSync) {
            setSelectedDay(currentDay);
            setIsFirstSync(false);
        }
    }, [userData, currentDay, isFirstSync]);

    useEffect(() => {
        if (showWelcome) {
            const t = setTimeout(() => setShowWelcome(false), 4000);
            return () => clearTimeout(t);
        }
    }, [showWelcome]);

    // Auto-refresh at midnight IST
    useEffect(() => {
        const checkMidnight = () => {
            const now = new Date();
            const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
            if (istTime.getHours() === 0 && istTime.getMinutes() === 0 && istTime.getSeconds() < 10) {
                // It's midnight IST, refresh currentDay
                window.location.reload();
            }
        };
        const interval = setInterval(checkMidnight, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    if (isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF5F8]">
                <div className="text-center">
                    <div className="text-4xl animate-bounce mb-4">🌸</div>
                    <p className="text-[#D4418E] font-bold tracking-widest text-xs">LOADING YOUR JOURNEY...</p>
                </div>
            </div>
        );
    }

    const progress = userData?.progress;
    const metrics = userData?.metrics;
    const workoutsCompleted = progress?.workoutsCompleted ?? 0;
    const completedDays = progress?.completedDays ?? [];

    const todayWorkout = workoutPlan.find(d => d.day === selectedDay);
    const isRest = todayWorkout?.isRestDay ?? isRestDay(selectedDay);
    const isCompleted = completedDays.includes(selectedDay);
    const isFuture = selectedDay > currentDay;
    const isToday = selectedDay === currentDay;

    const { completeWorkout } = useAppContext();

    const handleMarkRestDone = async () => {
        await completeWorkout(selectedDay, 0);
    };

    // Weekly chart data — always show 7 distinct days ending at currentDay (min day 7 to avoid clamp duplicates)
    const chartEndDay = Math.max(currentDay, 7);
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const day = chartEndDay - 6 + i;
        const wd = workoutPlan.find(w => w.day === day);
        return {
            name: `D${day}`,
            calories: completedDays.includes(day) ? (wd?.caloriesBurned ?? 0) : 0,
        };
    });


    const navigateToWorkout = useCallback(() => {
        navigate('/workout', { state: { day: selectedDay } });
    }, [navigate, selectedDay]);

    return (
        <div className="min-h-screen" style={{ background: '#FFF5F8' }}>

            {/* First-time Welcome Overlay */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center"
                        style={{ background: 'rgba(255,245,248,0.96)', backdropFilter: 'blur(12px)' }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-2xl border border-pink-100 max-w-sm">
                            <div className="text-6xl mb-4">🌸</div>
                            <h1 className="text-3xl font-bold mb-2" style={{ color: '#D4418E' }}>
                                Jai Ho, {firstName}!
                            </h1>
                            <p className="text-lg mb-6" style={{ color: '#8B7B8B' }}>
                                Your 30-day transformation plan is ready. Let's make today count!
                            </p>
                            <button onClick={() => setShowWelcome(false)}
                                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-transform active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)' }}>
                                Let's Start! 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header Section */}
            <div className="px-8 pt-8 pb-4">
                <header className="relative">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-xl font-bold uppercase tracking-[0.1em] mb-3 flex items-center gap-2" style={{ color: '#D4418E' }}>
                            <Sparkles size={20} />
                            {greeting}, {firstName}!
                        </h1>
                    </motion.div>
                </header>
            </div>

            <div className="px-8 pt-2">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Calendar} label="Day" value={`${currentDay}/30`} sub="current phase" />
                    <StatCard icon={Flame} label="Calories" value={`${metrics?.targetCalories ?? metrics?.tdee ?? 1800}`} sub="daily target" />
                    <StatCard icon={Scale} label="BMI" value={`${metrics?.bmi ?? '--'}`} sub={metrics?.bmiCategory ?? ''} />
                    <StatCard icon={Star} label="Workouts" value={`${workoutsCompleted}/30`} sub="streak: 0" />
                </div>

                {/* Today's Workout Hero Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-[0_20px_50px_rgba(212,65,142,0.15)] group"
                    style={{
                        background: isRest
                            ? 'linear-gradient(135deg, #1A0A2E 0%, #2D1B4E 100%)'
                            : 'linear-gradient(135deg, #D4418E 0%, #FF8C42 100%)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full -ml-24 -mb-24 blur-[60px]"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                                    {selectedDay === currentDay ? "TODAY'S PLAN" : `SESSION PREVIEW`}
                                </span>
                                {selectedDay !== currentDay && (
                                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                                        DAY {selectedDay}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-4xl font-display font-bold text-white mb-2 leading-tight">
                                {isRest ? 'Rest & Recover' : todayWorkout?.theme ?? 'Today\'s Workout'}
                                <span className="ml-3 inline-block animate-bounce-slow">
                                    {isRest ? <Sparkles size={32} className="text-white/40" /> : <Flame size={32} className="text-white/40 fill-white/10" />}
                                </span>
                            </h2>
                            {!isRest && (
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {[
                                        { label: 'Time', text: `${todayWorkout?.duration ?? 30}m`, icon: Clock },
                                        { label: 'Intensity', text: 'Moderate', icon: TrendingUp },
                                        { label: 'Focus', text: todayWorkout?.theme?.split(' ')[0] ?? 'Full Body', icon: Target },
                                    ].map((b, i) => (
                                        <div key={i} className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                            <b.icon size={14} className="text-white/80" />
                                            <span className="text-white font-medium text-sm">{b.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isRest
                                ? <p className="text-white/80 italic mb-6">Rest is essential for your transformation. Focus on stretching and hydration today!</p>
                                : <p className="text-white/80 italic mb-6">"{todayWorkout?.motivationalNote}"</p>
                            }
                        </div>

                        <div className="relative z-10">
                            {isRest ? (
                                isToday ? (
                                    isCompleted ? (
                                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
                                            Completed <CheckCircle2 size={20} className="text-green-400" />
                                        </div>
                                    ) : (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={handleMarkRestDone}
                                            className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-2 hover:bg-white/30 transition-all">
                                            Mark as Done <CheckCircle2 size={20} />
                                        </motion.button>
                                    )
                                ) : (
                                    <div className="text-white/40 font-bold uppercase tracking-widest text-xs">
                                        Rest Day {isCompleted && "✓"}
                                    </div>
                                )
                            ) : (
                                isFuture ? (
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsPreviewOpen(true)}
                                        className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-2 hover:bg-white/30 transition-all">
                                        Preview Session <ChevronRight size={20} />
                                    </motion.button>
                                ) : (
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={navigateToWorkout}
                                        className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-2 group/btn hover:bg-white/30 transition-all">
                                        {isCompleted ? (
                                            <>Review Plan <Clock size={20} className="group-hover/btn:rotate-12 transition-transform" /></>
                                        ) : (
                                            <>Start Workout <Star size={20} className="group-hover/btn:scale-125 transition-transform" /></>
                                        )}
                                    </motion.button>
                                )
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 30-Day Calendar */}
                <div className="mb-8">
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                        <Calendar size={18} className="text-[#D4418E]" /> 30-Day Schedule
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                            const isCompleted = completedDays.includes(day);
                            const isToday = day === currentDay;
                            const isRestD = workoutPlan.find(w => w.day === day)?.isRestDay ?? isRestDay(day);
                            const isSelected = day === selectedDay;
                            const isFuture = day > currentDay;
                            return (
                                <button key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-9 h-9 rounded-full transition-all flex items-center justify-center font-bold text-sm shadow-sm
                                        ${isSelected ? 'scale-110 ring-2 ring-offset-2' : ''}`}
                                    style={{
                                        background: isToday ? 'linear-gradient(135deg, #D4418E, #FF8C42)' : isCompleted ? 'rgba(212,65,142,0.1)' : 'white',
                                        border: isSelected ? '2px solid #D4418E' : '1px solid rgba(212,65,142,0.08)',
                                        color: isToday ? 'white' : isFuture ? '#8B7B8B' : '#1A0A2E',
                                        opacity: isFuture ? 0.5 : 1,
                                    }}>
                                    {isRestD && !isToday ? <Sparkles size={14} /> : day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Progress Rings */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <ProgressRing percent={(workoutsCompleted / 25) * 100} label="Journey" />
                    <ProgressRing percent={progress?.streakDays ? Math.min(100, (progress.streakDays / 7) * 100) : 0} label="Weekly" />
                    <ProgressRing percent={Math.min(100, ((progress?.totalCaloriesBurned ?? 0) / 5000) * 100)} label="Calories" />
                </div>

                {/* Weekly chart */}
                <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 mb-8 shadow-[0_10px_30px_rgba(212,65,142,0.08)] border border-white/60">
                    <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                        <TrendingUp size={20} className="text-[#D4418E]" /> Weekly Calories Burned
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#D4418E" />
                                    <stop offset="100%" stopColor="#FF8C42" />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#8B7B8B', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(212,65,142,0.04)', radius: 12 }}
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255, 255, 255, 0.5)',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#D4418E', fontWeight: 'bold' }}
                                labelStyle={{ color: '#1A0A2E', marginBottom: '4px', fontWeight: 'bold' }}
                            />
                            <Bar
                                dataKey="calories"
                                fill="url(#barGradient)"
                                radius={[10, 10, 10, 10]}
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                        { icon: Utensils, label: 'Meal Plan', path: '/meal' },
                        { icon: TrendingUp, label: 'Progress', path: '/progress' },
                        { icon: LucideUser, label: 'Profile', path: '/profile' },
                        { icon: Dumbbell, label: 'Workout', path: '/workout' },
                    ].map((a, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(a.path)}
                            className="flex flex-col items-center gap-2 py-4 rounded-2xl card-hover"
                            style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                            <div className="p-2 rounded-xl bg-pink-50 text-[#D4418E]">
                                <a.icon size={22} strokeWidth={2} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: '#8B7B8B' }}>{a.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Quote banner */}
                <div className="py-12 px-6 rounded-3xl text-center mb-12"
                    style={{ background: 'linear-gradient(135deg, rgba(212,65,142,0.08), rgba(255,140,66,0.08))' }}>
                    <p className="font-accent text-2xl italic mb-3" style={{ color: '#1A0A2E' }}>
                        "{quote}"
                    </p>
                    <p className="text-sm font-medium flex items-center justify-center gap-2" style={{ color: '#D4418E' }}>
                        DAILY INSPIRATION <Sparkles size={14} />
                    </p>
                </div>
            </div>

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:hidden" />

            <AnimatePresence>
                {isPreviewOpen && (
                    <SessionPreviewModal
                        isOpen={isPreviewOpen}
                        onClose={() => setIsPreviewOpen(false)}
                        day={selectedDay}
                        workout={todayWorkout}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
