import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import {
    XAxis, YAxis, ResponsiveContainer, Tooltip,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    BarChart2,
    Flame,
    Calendar,
    Star,
    ClipboardList,
    Scale,
    TrendingUp,
    Smile,
    Dumbbell
} from 'lucide-react';

function SectionCard({ title, children }: { title: string; children: React.ReactNode; }) {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 mb-6 shadow-[0_10px_30px_rgba(212,65,142,0.06)] border border-white/60">
            <h3 className="font-bold mb-6 text-[#1A0A2E]">{title}</h3>
            {children}
        </div>
    );
}

const WORKOUT_COLORS = ['#D4418E', '#FF8C42', '#7B2D8B', '#2ECC71'];

export default function Progress() {
    const { state } = useAppContext();
    const { userData, workoutPlan } = state;
    const progress = userData?.progress;
    const completedDays = progress?.completedDays ?? [];
    const workoutsCompleted = progress?.workoutsCompleted ?? 0;

    // Weight trend
    const weightData = (userData?.weightLog ?? []).slice(-8).map(w => ({
        date: new Date(w.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        kg: w.weightKg,
    }));

    // Calorie burn by week
    const weeklyCalories = Array.from({ length: 4 }, (_, week) => {
        const startDay = week * 7 + 1;
        const endDay = startDay + 6;
        const cal = workoutPlan
            .filter(w => w.day >= startDay && w.day <= endDay && completedDays.includes(w.day))
            .reduce((sum, w) => sum + (w.caloriesBurned ?? 0), 0);
        return { week: `Week ${week + 1}`, calories: cal };
    });

    // Workout type distribution (derived from exercises since WorkoutDay has no type field)
    const typeCount: Record<string, number> = { Strength: 0, Cardio: 0, Yoga: 0, HIIT: 0 };
    workoutPlan.filter(w => completedDays.includes(w.day)).forEach(w => {
        const types = w.exercises.map(e => e.type);
        if (types.includes('yoga')) typeCount['Yoga']++;
        else if (types.includes('cardio')) typeCount['Cardio']++;
        else if (types.includes('strength')) typeCount['Strength']++;
        else typeCount['HIIT']++;
    });
    const pieData = Object.entries(typeCount).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v }));

    // Mood trend
    const moodData = (userData?.moodLog ?? []).slice(-7).map(m => ({
        date: new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit' }),
        mood: m.mood,
        energy: m.energy,
    }));

    const completionPct = Math.round((workoutsCompleted / 25) * 100);

    return (
        <div className="min-h-screen" style={{ background: '#FFF5F8' }}>
            <div className="sticky top-0 z-20 px-8 py-4"
                style={{ background: 'rgba(255,245,248,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,65,142,0.1)' }}>
                <h1 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                    <BarChart2 size={24} className="text-[#D4418E]" /> My Progress
                </h1>
                <p className="text-sm" style={{ color: '#8B7B8B' }}>Your 30-day transformation journey</p>
            </div>

            <div className="px-8 pt-6">
                {/* Big Win Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-6 mb-6 text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)' }}>
                    <div className="absolute inset-0 opacity-10">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="absolute rounded-full border border-white"
                                style={{ width: 80 + i * 40, height: 80 + i * 40, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                        ))}
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/80 text-sm mb-1">Overall Progress</p>
                        <p className="font-display text-5xl font-bold text-white mb-1">{completionPct}%</p>
                        <p className="text-white/80 text-sm">{workoutsCompleted} workouts complete</p>
                    </div>
                </motion.div>

                {/* Summary tiles */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                        { icon: Flame, label: 'Total Calories', value: `${progress?.totalCaloriesBurned ?? 0} kcal` },
                        { icon: Calendar, label: 'Current Streak', value: `${progress?.streakDays ?? 0} days` },
                        { icon: Star, label: 'Points Earned', value: `${progress?.points ?? 0} pts` },
                        { icon: ClipboardList, label: 'Days Remaining', value: `${30 - workoutsCompleted} days` },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl p-4 flex flex-col items-center text-center gap-1" style={{ background: 'white', border: '1px solid rgba(212,65,142,0.12)' }}>
                            <s.icon size={20} className="text-[#D4418E] mb-1" />
                            <div className="font-bold text-sm" style={{ color: '#D4418E' }}>{s.value}</div>
                            <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#8B7B8B' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Weight chart */}
                <SectionCard title="Weight Trend (kg)">
                    <div className="flex items-center gap-2 mb-4">
                        <Scale size={18} className="text-[#D4418E]" />
                        <span className="text-sm font-semibold" style={{ color: '#1A0A2E' }}>Body Weight Track</span>
                    </div>
                    {weightData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="kg" stroke="#D4418E" strokeWidth={3} fillOpacity={1} fill="url(#weightGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center py-8 text-sm flex flex-col items-center gap-2" style={{ color: '#8B7B8B' }}>
                            <TrendingUp size={24} className="opacity-20" />
                            Log your weight from the Profile page to track your trend
                        </p>
                    )}
                </SectionCard>

                {/* Side-by-side pie charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Weekly calorie pie chart */}
                    <div className="mb-0">
                        <SectionCard title="Weekly Calories Burned">
                            <div className="flex items-center gap-2 mb-4">
                                <Flame size={18} className="text-[#D4418E]" />
                                <span className="text-sm font-semibold" style={{ color: '#1A0A2E' }}>Energy Expenditure</span>
                            </div>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={weeklyCalories}
                                            dataKey="calories"
                                            nameKey="week"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                        >
                                            {weeklyCalories.map((_, i) => <Cell key={i} fill={WORKOUT_COLORS[i % 4]} stroke="none" />)}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(12px)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                            }}
                                            formatter={(v) => [`${v} kcal`, '']}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Workout type pie */}
                    {pieData.length > 0 && (
                        <div className="mb-0">
                            <SectionCard title="Workout Types">
                                <div className="flex items-center gap-2 mb-4">
                                    <Dumbbell size={18} className="text-[#D4418E]" />
                                    <span className="text-sm font-semibold" style={{ color: '#1A0A2E' }}>Routine Distribution</span>
                                </div>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={8}
                                            >
                                                {pieData.map((_, i) => <Cell key={i} fill={WORKOUT_COLORS[i % 4]} stroke="none" />)}
                                            </Pie>
                                            <Legend verticalAlign="bottom" height={36} />
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'rgba(255, 255, 255, 0.8)',
                                                    backdropFilter: 'blur(12px)',
                                                    borderRadius: '20px',
                                                    border: '1px solid rgba(255, 255, 255, 0.5)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </div>

                {/* Mood chart */}
                {moodData.length > 1 && (
                    <SectionCard title="Mood & Energy Trend">
                        <div className="flex items-center gap-2 mb-4">
                            <Smile size={18} className="text-[#D4418E]" />
                            <span className="text-sm font-semibold" style={{ color: '#1A0A2E' }}>Well-being Tracker</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4418E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#D4418E" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#FF8C42" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B7B8B', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis domain={[1, 5]} hide />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.5)'
                                    }}
                                />
                                <Area type="monotone" dataKey="mood" stroke="#D4418E" strokeWidth={3} fillOpacity={1} fill="url(#moodGrad)" name="Mood" />
                                <Area type="monotone" dataKey="energy" stroke="#FF8C42" strokeWidth={3} fillOpacity={1} fill="url(#energyGrad)" name="Energy" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </SectionCard>
                )}

                {/* Heatmap calendar */}
                <SectionCard title="Completion Heatmap">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-[#D4418E]" />
                        <span className="text-sm font-semibold" style={{ color: '#1A0A2E' }}>30-Day Activity</span>
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {Array.from({ length: 30 }, (_, i) => {
                            const day = i + 1;
                            const done = completedDays.includes(day);
                            return (
                                <motion.div key={i} whileHover={{ scale: 1.05 }}
                                    title={`Day ${day}${done ? ' ✓' : ''}`}
                                    className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border shadow-sm transition-all"
                                    style={{
                                        background: done ? 'linear-gradient(135deg, #D4418E, #FF8C42)' : 'rgba(255,255,255,0.6)',
                                        borderColor: done ? 'transparent' : 'rgba(212,65,142,0.1)',
                                        color: done ? 'white' : '#8B7B8B',
                                        backdropFilter: done ? 'none' : 'blur(4px)'
                                    }}>
                                    <span className="text-[12px] md:text-[10px] font-black tracking-tight leading-none">D{day}</span>
                                    <span className="text-[7px] md:text-[6px] font-black uppercase tracking-tight mt-1 opacity-90 leading-none text-center">
                                        {done ? 'DONE' : 'NOT COMPLETE'}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="flex gap-3 mt-3 items-center justify-end">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ background: '#D4418E' }} />
                            <span className="text-xs" style={{ color: '#8B7B8B' }}>Done</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ background: 'rgba(212,65,142,0.1)' }} />
                            <span className="text-xs" style={{ color: '#8B7B8B' }}>Pending</span>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
