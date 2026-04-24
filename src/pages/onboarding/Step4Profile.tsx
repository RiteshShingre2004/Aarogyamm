import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    User,
    Sparkles,
    Rocket
} from 'lucide-react';

export default function Step4Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { fitnessLevel = 'beginner', selectedGoal = 'fat-loss', tdee = 1800 } = location.state ?? {};

    const [saving, setSaving] = useState(false);

    const handleFinish = async () => {
        if (!user) return;
        setSaving(true);
        await updateDoc(doc(db, 'users', user.uid), {
            'profile.dietaryPreference': 'vegetarian',
            'profile.healthConditions': ['None'],
        });
        setSaving(false);
        navigate('/onboarding/generating', {
            state: { fitnessLevel, selectedGoal, tdee },
        });
    };

    const firstName = (user?.displayName ?? 'Goddess').split(' ')[0];

    return (
        <div className="min-h-screen px-5 py-8 max-w-lg mx-auto pb-24" style={{ background: '#FFF5F8' }}>
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2" style={{ color: '#8B7B8B' }}>
                    <span>Step 4 of 4</span><span>Your Profile</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(212,65,142,0.15)' }}>
                    <div className="h-2 rounded-full w-full" style={{ background: 'linear-gradient(90deg, #D4418E, #FF8C42)' }} />
                </div>
                <div className="flex gap-2 mt-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-2 w-2 rounded-full" style={{ background: '#D4418E' }} />
                    ))}
                </div>
            </div>

            <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-2" style={{ color: '#1A0A2E' }}>
                Almost there, {firstName}! <Sparkles size={28} className="text-[#D4418E]" />
            </h1>
            <p className="mb-8" style={{ color: '#8B7B8B' }}>We are ready to build your custom transformation plan.</p>

            {/* Profile photo */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full border-4 overflow-hidden mb-3"
                    style={{ borderColor: '#D4418E', background: 'rgba(212,65,142,0.1)' }}>
                    {user?.photoURL
                        ? <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center bg-white/20 text-[#D4418E]">
                            <User size={40} />
                        </div>
                    }
                </div>
                <span className="font-semibold text-lg" style={{ color: '#1A0A2E' }}>{user?.displayName}</span>
                <span className="text-sm" style={{ color: '#8B7B8B' }}>{user?.email}</span>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-4 rounded-2xl text-white font-semibold text-xl mt-6"
                style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42, #7B2D8B)' }}
            >
                {saving ? 'Setting up your journey...' : <span className="flex items-center justify-center gap-2">Let's Go! <Rocket size={24} /> <Sparkles size={24} /></span>}
            </motion.button>
        </div>
    );
}
