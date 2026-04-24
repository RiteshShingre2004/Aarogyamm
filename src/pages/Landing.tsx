import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

// Logo Icon using PNG image
const LotusIcon = () => (
    <img src="/logoo.png" alt="Aarogyam Logo" className="w-50 h-50 object-contain drop-shadow-lg" />
);

// Woman warrior yoga silhouette SVG
const WomanSilhouette = () => (
    <svg viewBox="0 0 200 400" className="w-48 h-96 md:w-64 md:h-[480px]" fill="none">
        <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4418E" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FF8C42" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#7B2D8B" stopOpacity="0.5" />
            </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="100" cy="40" rx="22" ry="25" fill="url(#sg)" />
        {/* Hair flowing */}
        <path d="M 78 30 Q 60 10 65 50 Q 70 70 80 55" fill="url(#sg)" opacity="0.8" />
        {/* Torso */}
        <path d="M 75 65 Q 65 90 68 130 Q 70 150 100 155 Q 130 150 132 130 Q 135 90 125 65 Z" fill="url(#sg)" />
        {/* Warrior II pose - arms outstretched */}
        <path d="M 68 90 Q 20 80 5 85" stroke="url(#sg)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 132 90 Q 180 80 195 85" stroke="url(#sg)" strokeWidth="14" strokeLinecap="round" />
        {/* Front leg bent */}
        <path d="M 85 155 Q 70 190 55 230 Q 45 260 50 290" stroke="url(#sg)" strokeWidth="20" strokeLinecap="round" />
        {/* Back leg straight */}
        <path d="M 115 155 Q 130 190 145 240 Q 155 270 150 295" stroke="url(#sg)" strokeWidth="20" strokeLinecap="round" />
        {/* Front foot */}
        <ellipse cx="50" cy="295" rx="18" ry="8" fill="url(#sg)" />
        {/* Back foot */}
        <ellipse cx="150" cy="295" rx="18" ry="8" fill="url(#sg)" />
    </svg>
);

// Floating petal component
function Petal({ delay, x, size }: { delay: number; x: number; size: number }) {
    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{ left: `${x}%`, bottom: '-20px' }}
            initial={{ y: 0, opacity: 0, rotate: 0 }}
            animate={{ y: '-110vh', opacity: [0, 0.7, 0.7, 0], rotate: 720 }}
            transition={{ duration: 6 + Math.random() * 4, delay, repeat: Infinity, ease: 'linear' }}
        >
            <svg width={size} height={size} viewBox="0 0 20 20">
                <ellipse cx="10" cy="10" rx="6" ry="10" fill="#D4418E" opacity="0.6" transform="rotate(45 10 10)" />
            </svg>
        </motion.div>
    );
}

export default function Landing() {
    const navigate = useNavigate();
    const petals = useRef(
        Array.from({ length: 12 }, (_, i) => ({
            id: i,
            delay: i * 0.8,
            x: Math.random() * 100,
            size: 10 + Math.random() * 12,
        }))
    );

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, #1A0A2E 0%, #D4418E 35%, #FF8C42 65%, #7B2D8B 100%)',
                backgroundSize: '300% 300%',
                animation: 'meshGradient 10s ease infinite',
            }}
        >
            {/* Petal particles */}
            {petals.current.map(p => <Petal key={p.id} delay={p.delay} x={p.x} size={p.size} />)}

            {/* Mandala background decoration */}
            <motion.div
                className="absolute opacity-20 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                style={{ width: '600px', height: '600px' }}
            >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <ellipse key={i} cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#D4418E" strokeWidth="0.8"
                            transform={`rotate(${i * 30} 100 100)`} opacity="0.5" />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ellipse key={i} cx="100" cy="100" rx="50" ry="20" fill="none" stroke="#FF8C42" strokeWidth="0.8"
                            transform={`rotate(${i * 45} 100 100)`} opacity="0.5" />
                    ))}
                </svg>
            </motion.div>

            {/* Woman silhouette — right side */}
            <div className="absolute right-0 bottom-0 opacity-30 md:opacity-50 pointer-events-none">
                <WomanSilhouette />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 3.5, y: '25vh', opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{
                        duration: 2.5,
                        delay: 0.5,
                        ease: [0.34, 1.56, 0.64, 1] // Custom "back out" ease for premium feel
                    }}
                    className="mb-1"
                >
                    <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 3.5 }}
                    >
                        <LotusIcon />
                    </motion.div>
                </motion.div>

                {/* App name */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8, duration: 1.2 }}
                    className="font-display text-5xl md:text-7xl font-bold text-white mb-3 tracking-wide"
                    style={{ textShadow: '0 2px 20px rgba(212,65,142,0.5)' }}
                >
                    AAROGYAM
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.4, duration: 1.2 }}
                    className="font-accent text-xl md:text-2xl text-white/90 mb-2"
                >
                    Strong Roots. Stronger You.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.8, duration: 1.2 }}
                    className="text-white/70 text-sm mb-10"
                >
                    Your fitness companion — built for Indian women
                </motion.p>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 4.2, duration: 0.8 }}
                    onClick={() => navigate('/login')}
                    className="shimmer-btn text-white font-semibold text-lg px-10 py-4 rounded-full shadow-2xl cursor-pointer border-0 flex items-center gap-2 group"
                >
                    <Sparkles size={20} className="text-white/80 group-hover:scale-125 transition-transform" />
                    Start Your Journey
                    <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.2 }}
                    className="mt-4 text-white/60 text-sm"
                >
                    Exclusively designed for Indian women
                </motion.p>
            </div>
        </div>
    );
}
