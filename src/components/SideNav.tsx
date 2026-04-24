import { memo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
    Home,
    Dumbbell,
    Utensils,
    TrendingUp,
    User,
    Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/meal', icon: Utensils, label: 'Meals' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/profile', icon: User, label: 'Profile' },
];

function SideNav() {
    const { user } = useAuth();
    const firstName = (user?.displayName ?? 'You').split(' ')[0];

    return (
        <aside
            style={{
                width: 220,
                minWidth: 220,
                height: '100vh',
                position: 'sticky',
                top: 0,
                background: 'rgba(255,245,248,0.97)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(212,65,142,0.12)',
                boxShadow: '4px 0 24px rgba(212,65,142,0.06)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                gap: 0,
                overflowY: 'auto',
                zIndex: 40,
            }}
        >
            {/* Logo */}
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, paddingLeft: 8, textDecoration: 'none', cursor: 'pointer' }}>
                <img src="/logoo.png" alt="Aarogyam" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: '50%' }} />
                <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: '#D4418E',
                    letterSpacing: '0.02em',
                }}>AAROGYAM</span>
            </Link>

            {/* Nav Links */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '11px 16px',
                            borderRadius: 14,
                            textDecoration: 'none',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: 14,
                            color: isActive ? '#D4418E' : '#8B7B8B',
                            background: isActive ? 'rgba(212,65,142,0.1)' : 'transparent',
                            transition: 'all 0.18s ease',
                            border: isActive ? '1px solid rgba(212,65,142,0.18)' : '1px solid transparent',
                        })}
                        onMouseEnter={e => {
                            const el = e.currentTarget;
                            if (!el.style.background.includes('0.1')) {
                                el.style.background = 'rgba(212,65,142,0.05)';
                                el.style.color = '#D4418E';
                            }
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget;
                            if (!el.style.background.includes('0.1')) {
                                el.style.background = 'transparent';
                                el.style.color = '#8B7B8B';
                            }
                        }}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User avatar at bottom */}
            <Link to="/profile" style={{
                marginTop: 24,
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(212,65,142,0.06)',
                border: '1px solid rgba(212,65,142,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(212,65,142,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(212,65,142,0.2)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(212,65,142,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(212,65,142,0.12)';
                }}>
                <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #D4418E',
                    flexShrink: 0,
                }}>
                    {user?.photoURL
                        ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{
                            width: '100%', height: '100%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(212,65,142,0.1)', color: '#D4418E'
                        }}><User size={20} /></div>
                    }
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {firstName}
                    </div>
                    <div style={{ fontSize: 11, color: '#8B7B8B', display: 'flex', alignItems: 'center', gap: 4 }}>
                        My Journey <Sparkles size={10} className="text-secondary" />
                    </div>
                </div>
            </Link>
        </aside>
    );
}

export default memo(SideNav);
