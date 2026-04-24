import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Repeat,
    Target,
    ClipboardList,
    AlertTriangle,
    RefreshCw,
    Play,
    Check,
    Frown,
    PartyPopper,
    Timer,
    Dumbbell,
    Flame,
    Utensils,
    ArrowLeft,
    Lock,
    ChevronUp,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Exercise } from '../types';
import confetti from 'canvas-confetti';
import { getCurrentPlanDay } from '../utils/fitness';

function CircularTimer({ totalSeconds, onComplete }: { totalSeconds: number; onComplete: () => void }) {
    const [remaining, setRemaining] = useState(totalSeconds);
    const intervalRef = useRef<number | null>(null);
    const radius = 80;
    const circ = 2 * Math.PI * radius;

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            setRemaining(r => {
                if (r <= 1) {
                    clearInterval(intervalRef.current!);
                    onComplete();
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current!);
    }, [onComplete]);

    const progress = remaining / totalSeconds;
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = (remaining % 60).toString().padStart(2, '0');

    return (
        <svg width="200" height="200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(212,65,142,0.15)" strokeWidth="12" />
            <motion.circle cx="100" cy="100" r={radius} fill="none" stroke="#D4418E" strokeWidth="12"
                strokeLinecap="round" strokeDasharray={circ}
                animate={{ strokeDashoffset: circ * (1 - progress) }}
                transition={{ duration: 0.5 }}
                transform="rotate(-90 100 100)" />
            <text x="100" y="95" textAnchor="middle" fill="#1A0A2E" fontSize="32" fontWeight="700" fontFamily="Playfair Display">
                {mins}:{secs}
            </text>
            <text x="100" y="120" textAnchor="middle" fill="#8B7B8B" fontSize="12" fontFamily="DM Sans">seconds left</text>
        </svg>
    );
}

function ExerciseCard({
    exercise, index, total, onMarkDone, isDone, isPreview,
}: {
    exercise: Exercise; index: number; total: number; onMarkDone: () => void; isDone: boolean; isPreview?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [timerActive, setTimerActive] = useState(false);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-3xl p-5 mb-4"
            style={{
                background: isDone ? 'rgba(46,204,113,0.06)' : 'white',
                border: isDone ? '1.5px solid rgba(46,204,113,0.3)' : '1.5px solid rgba(212,65,142,0.12)',
            }}>
            <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(e => !e)}>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: exercise.type === 'warm-up' ? '#FF8C42' : exercise.type === 'cool-down' ? '#2ECC71' : exercise.type === 'cardio' ? '#7B2D8B' : '#D4418E' }}>
                            {exercise.type.toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: '#8B7B8B' }}>{index + 1} of {total}</span>
                        {isDone && <span className="text-xs text-green-500 font-bold">✓ Done</span>}
                        {isPreview && <span className="text-xs font-bold" style={{ color: '#8B7B8B' }}>🔒 Preview</span>}
                    </div>
                    <h3 className="font-display font-bold text-lg" style={{ color: '#1A0A2E' }}>{exercise.name}</h3>
                    
                    <div className="flex gap-4 mt-2 flex-wrap">
                        <span className="text-xs flex items-center gap-1" style={{ color: '#D4418E' }}>
                            <Repeat size={12} /> {exercise.sets} sets × {exercise.reps}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: '#8B7B8B' }}>
                            <Target size={12} /> {exercise.targetMuscles.join(', ')}
                        </span>
                    </div>
                </div>
                {expanded ? <ChevronUp size={20} style={{ color: '#8B7B8B' }} /> : <ChevronDown size={20} style={{ color: '#8B7B8B' }} />}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <hr className="my-4" style={{ borderColor: 'rgba(212,65,142,0.1)' }} />

                        {timerActive ? (
                            <div className="flex flex-col items-center py-4">
                                <CircularTimer
                                    totalSeconds={exercise.durationSeconds || 60}
                                    onComplete={() => {
                                        setTimerActive(false);
                                        speak(`Great job! Take a 30 second rest.`);
                                        onMarkDone();
                                    }}
                                />
                                <p className="font-accent text-lg mt-4" style={{ color: '#D4418E' }}>{exercise.name}</p>
                                <button onClick={() => setTimerActive(false)}
                                    className="mt-4 text-sm underline" style={{ color: '#8B7B8B' }}>Stop Timer</button>
                            </div>
                        ) : (
                            <>
                                {/* Instructions */}
                                <div className="mb-4">
                                    <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: '#D4418E' }}>
                                        <ClipboardList size={14} /> How to Perform
                                    </p>
                                    <ol className="space-y-2">
                                        {exercise.instructions.map((step, i) => (
                                            <li key={i} className="text-sm flex gap-2" style={{ color: '#1A0A2E' }}>
                                                <span className="font-bold min-w-[20px]" style={{ color: '#D4418E' }}>{i + 1}.</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {exercise.commonMistakes[0] && (
                                    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,140,66,0.08)' }}>
                                        <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: '#FF8C42' }}>
                                            <AlertTriangle size={14} /> Common Mistakes
                                        </p>
                                        {exercise.commonMistakes.map((m, i) => (
                                            <p key={i} className="text-xs" style={{ color: '#1A0A2E' }}>• {m}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(46,204,113,0.08)' }}>
                                    <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: '#2ECC71' }}>
                                        <RefreshCw size={14} /> Beginner Modification
                                    </p>
                                    <p className="text-xs" style={{ color: '#1A0A2E' }}>{exercise.beginnerModification}</p>
                                </div>

                                {/* Hide action buttons in preview mode */}
                                {!isPreview && (
                                    <div className="flex gap-3 mt-2">
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => { setTimerActive(true); speak(`Starting ${exercise.name}. ${exercise.instructions[0]}`); }}
                                            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)' }}>
                                            <Play size={16} fill="white" /> Start Timer
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={onMarkDone}
                                            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                                            style={{
                                                background: isDone ? 'rgba(46,204,113,0.1)' : 'rgba(212,65,142,0.08)',
                                                color: isDone ? '#2ECC71' : '#D4418E',
                                                border: `1px solid ${isDone ? '#2ECC71' : 'rgba(212,65,142,0.2)'}`,
                                            }}>
                                            {isDone ? <><Check size={16} /> Marked Done</> : <><Check size={16} /> Mark Done</>}
                                        </motion.button>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function WorkoutPlayer() {
    const navigate = useNavigate();
    const location = useLocation();
    const { state, completeWorkout } = useAppContext();
    const { userData, workoutPlan, isDataLoading } = state;

    const timeDay = getCurrentPlanDay(userData?.progress?.planStartDate);
    const dayNumber = location.state?.day ?? timeDay;
    const isPreview = dayNumber > timeDay;
    const workout = workoutPlan.find(w => w.day === dayNumber);
    const exercises = workout?.exercises ?? [];

    if (isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF5F8]">
                <div className="text-center">
                    <div className="text-4xl animate-bounce mb-4">🌸</div>
                    <p className="text-[#D4418E] font-bold tracking-widest text-xs">PREPARING SESSION...</p>
                </div>
            </div>
        );
    }

    const progressKey = 'fitmonk_workout_progress';
    const [doneSet, setDoneSet] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(progressKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.day === dayNumber) {
                    return new Set<string>(parsed.doneIds);
                }
            }
        } catch (e) {
            console.error('Failed to parse saved progress', e);
        }
        return new Set<string>();
    });
    const [showCompletion, setShowCompletion] = useState(false);
    const startTime = useRef(Date.now());

    const markDone = useCallback((id: string) => {
        setDoneSet(prev => {
            const newSet = new Set([...prev, id]);
            try {
                localStorage.setItem(progressKey, JSON.stringify({
                    day: dayNumber,
                    doneIds: Array.from(newSet)
                }));
            } catch (e) {
                console.error('Failed to save progress', e);
            }
            return newSet;
        });
    }, [dayNumber]);

    const handleCompleteWorkout = useCallback(async () => {
        await completeWorkout(dayNumber, workout?.caloriesBurned ?? 200);
        localStorage.removeItem(progressKey);
        setShowCompletion(true);
        confetti({
            particleCount: 150,
            spread: 80,
            colors: ['#D4418E', '#FF8C42', '#7B2D8B', '#F4C430', 'white'],
        });
    }, [dayNumber, workout, completeWorkout]);

    const allDone = exercises.length > 0 && exercises.every(e => doneSet.has(e.id));

    if (!workout) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Frown size={64} style={{ color: '#8B7B8B' }} />
                    </div>
                    <p className="font-display text-2xl font-bold mb-2" style={{ color: '#1A0A2E' }}>No workout found</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-3 rounded-2xl text-white"
                        style={{ background: '#D4418E' }}>← Back to Dashboard</button>
                </div>
            </div>
        );
    }

    if (showCompletion) {
        const elapsed = Math.round((Date.now() - startTime.current) / 60000);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
                style={{ background: 'linear-gradient(135deg, #1A0A2E, #D4418E)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                    className="mb-6">
                    <PartyPopper size={64} className="text-white" />
                </motion.div>
                <h1 className="font-display text-4xl text-white font-bold mb-2">Workout Complete!</h1>
                <p className="font-accent text-xl text-white/80 mb-8">{workout.motivationalNote}</p>
                <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
                    {[
                        { icon: Timer, val: `${Math.max(1, elapsed)} min`, label: 'Duration' },
                        { icon: Dumbbell, val: `${exercises.length}`, label: 'Exercises' },
                        { icon: Flame, val: `~${workout.caloriesBurned} kcal`, label: 'Burned' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-2xl p-3 text-center flex flex-col items-center gap-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <s.icon size={20} className="text-white/80" />
                            <div className="text-white font-bold">{s.val}</div>
                            <div className="text-white/60 text-[10px] uppercase font-bold tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/meal')}
                    className="w-full max-w-xs py-4 rounded-2xl font-bold text-xl text-white mb-4 flex items-center justify-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <Utensils size={24} /> Go to Meal Plan
                </motion.button>
                <button onClick={() => navigate('/dashboard')} className="text-white/60 text-sm underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: '#FFF5F8' }}>
            {/* Header */}
            <div className="sticky top-0 z-20 px-5 py-4 flex items-center gap-3"
                style={{ background: 'rgba(255,245,248,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,65,142,0.1)' }}>
                <button onClick={() => navigate('/dashboard')} className="p-2" style={{ color: '#D4418E' }}>
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <p className="text-xs" style={{ color: '#8B7B8B' }}>{workout?.theme}</p>
                    <p className="font-semibold text-sm" style={{ color: '#1A0A2E' }}>{exercises.length} exercises • {workout.duration} min</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full text-white font-medium"
                    style={{ background: '#D4418E' }}>{doneSet.size}/{exercises.length}</span>
            </div>

            <div className="px-5 pt-4">
                {/* Preview mode banner */}
                {isPreview && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-4 mb-5 flex items-center gap-3"
                        style={{ background: 'rgba(212,65,142,0.06)', border: '1.5px dashed rgba(212,65,142,0.3)' }}>
                        <Lock size={24} className="text-[#D4418E]" />
                        <div>
                            <p className="font-semibold text-sm" style={{ color: '#D4418E' }}>Preview Mode</p>
                            <p className="text-xs" style={{ color: '#8B7B8B' }}>Day {dayNumber} unlocks on its scheduled date. You can browse the exercises but cannot start yet.</p>
                        </div>
                    </motion.div>
                )}

                <p className="font-accent text-lg mb-5" style={{ color: '#7B2D8B' }}>{workout.motivationalNote}</p>

                {exercises.map((ex, i) => (
                    <ExerciseCard key={ex.id} exercise={ex} index={i} total={exercises.length}
                        onMarkDone={() => markDone(ex.id)} isDone={doneSet.has(ex.id)} isPreview={isPreview} />
                ))}

                {allDone && !isPreview && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={handleCompleteWorkout}
                            className="w-full py-4 rounded-2xl text-white font-bold text-xl mt-2 shimmer-btn flex items-center justify-center gap-3">
                            <Sparkles size={24} /> Complete Workout!
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
