import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Dumbbell,
    Utensils,
    TrendingUp,
    User
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/meal', icon: Utensils, label: 'Meals' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/profile', icon: User, label: 'Profile' },
];

function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 py-2"
            style={{
                background: 'rgba(255,245,248,0.92)',
                backdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(212,65,142,0.12)',
                boxShadow: '0 -8px 24px rgba(212,65,142,0.08)',
            }}>
            <div className="flex justify-around max-w-lg mx-auto">
                {NAV_ITEMS.map(item => (
                    <NavLink key={item.path} to={item.path}
                        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all"
                        style={({ isActive }) => ({
                            background: isActive ? 'rgba(212,65,142,0.12)' : 'transparent',
                        })}>
                        <item.icon size={22} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

export default memo(BottomNav);
