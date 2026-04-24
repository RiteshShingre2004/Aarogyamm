import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from 'firebase/auth';
import { toast } from '../components/Toast';
// Mandala SVG for decorative panel
const MandalaSVG = () => (
    <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full opacity-10">
        {Array.from({ length: 16 }).map((_, i) => (
            <ellipse key={i} cx="150" cy="150" rx="120" ry="40" fill="none" stroke="white" strokeWidth="0.8"
                transform={`rotate(${i * 22.5} 150 150)`} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx="150" cy="150" rx="80" ry="25" fill="none" stroke="white" strokeWidth="0.6"
                transform={`rotate(${i * 30} 150 150)`} />
        ))}
    </svg>
);

// Google icon SVG
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, resolveMfaSignIn, loading } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // MFA State
    const [mfaResolver, setMfaResolver] = useState<any>(null);
    const [mfaVerificationId, setMfaVerificationId] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let result;
            if (isSignUp) {
                result = await signUpWithEmail(email, password, name);
            } else {
                result = await signInWithEmail(email, password);
            }
            if (result.isNewUser) {
                navigate('/onboarding/step1');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Email Auth error:', err);
            const code = err?.code ?? '';
            if (code === 'auth/multi-factor-auth-required') {
                const resolver = getMultiFactorResolver(auth, err);
                setMfaResolver(resolver);
                return;
            } else if (code === 'auth/email-already-in-use') {
                toast('This email is already registered. Please sign in.', 'error');
            } else if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
                toast('Invalid email or password.', 'error');
            } else if (code === 'auth/weak-password') {
                toast('Password should be at least 6 characters.', 'error');
            } else {
                toast(`Auth failed: ${code || 'unknown error'}`, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { isNewUser } = await signInWithGoogle();
            if (isNewUser) {
                navigate('/onboarding/step1');
            } else {
                navigate('/dashboard');
            }
        } catch (err: unknown) {
            console.error('Auth error:', err);
            const code = (err as { code?: string })?.code ?? '';
            if (code === 'auth/popup-blocked') {
                toast('Popup blocked! Please allow popups for this site in your browser.', 'error');
            } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
                toast('Sign-in cancelled. Try again!', 'info');
            } else if (code === 'auth/unauthorized-domain') {
                toast('Domain not authorized. Add localhost to Firebase Auth settings.', 'error');
            } else if (code === 'auth/invalid-api-key') {
                toast('Invalid Firebase API key. Check your .env file.', 'error');
            } else {
                toast(`Sign-in failed: ${code || 'unknown error'}`, 'error');
            }
        }
    };

    const sendMfaSms = async () => {
        if (!mfaResolver) return;
        setMfaLoading(true);
        try {
            const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
            const phoneInfoOptions = {
                multiFactorHint: mfaResolver.hints[0],
                session: mfaResolver.session
            };
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
            setMfaVerificationId(verificationId);
            toast('SMS sent! Please check your phone.', 'success');
        } catch (err: any) {
            console.error('SMS send error', err);
            toast('Failed to send SMS code.', 'error');
        } finally {
            setMfaLoading(false);
        }
    };

    const verifyMfaCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setMfaLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(mfaVerificationId, mfaCode);
            const assertion = PhoneMultiFactorGenerator.assertion(credential);
            const result = await resolveMfaSignIn(mfaResolver, assertion);
            if (result.isNewUser) {
                navigate('/onboarding/step1');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('MFA verify error', err);
            toast('Invalid SMS verification code.', 'error');
        } finally {
            setMfaLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden md:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1A0A2E, #D4418E, #FF8C42)' }}
            >
                <MandalaSVG />
                <div className="relative z-10 text-center px-8">
                    <div className="text-7xl mb-6">🧘‍♀️</div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="font-display text-3xl text-white font-bold mb-3"
                    >
                        आपकी शक्ति,
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="font-display text-3xl text-white font-bold mb-6"
                    >
                        आपकी पहचान
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="text-white/70 text-sm italic"
                    >
                        "Your strength, your identity"
                    </motion.p>
                    <div className="mt-8 flex gap-3 justify-center">
                        {['🌸', '💪', '🌿', '✨'].map((e, i) => (
                            <motion.span key={i} animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                className="text-2xl">{e}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-10 right-10 w-40 h-40 rounded-full border border-white/20" />
                <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full border border-white/15" />
            </motion.div>

            {/* Right login panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12"
                style={{ background: '#FFF5F8' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <img src="/logoo.png" alt="Aarogyam" className="w-10 h-10 object-contain rounded-full" />
                        <span className="font-display text-2xl font-bold" style={{ color: '#D4418E' }}>AAROGYAM</span>
                    </div>

                    {/* Glass card */}
                    <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'white', border: '1px solid rgba(212,65,142,0.15)' }}>
                        <div id="recaptcha-container"></div>
                        
                        {mfaResolver ? (
                            <>
                                <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#1A0A2E' }}>
                                    Two-Factor Auth 🔒
                                </h1>
                                <p className="mb-6" style={{ color: '#8B7B8B' }}>
                                    A code will be sent to your phone ending in {mfaResolver.hints[0]?.phoneNumber?.slice(-4) || '****'}
                                </p>
                                
                                {!mfaVerificationId ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={sendMfaSms}
                                        disabled={mfaLoading}
                                        className="w-full py-3.5 px-6 rounded-2xl font-bold cursor-pointer text-white disabled:opacity-70 transition-all flex justify-center items-center mb-6"
                                        style={{
                                            background: 'linear-gradient(135deg, #FF8C42, #D4418E)',
                                            boxShadow: '0 4px 15px rgba(212,65,142,0.3)',
                                        }}
                                    >
                                        {mfaLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Verification Code'}
                                    </motion.button>
                                ) : (
                                    <form onSubmit={verifyMfaCode} className="flex flex-col gap-4 mb-6">
                                        <input 
                                            type="text" 
                                            placeholder="6-digit code" 
                                            className="w-full px-4 py-3 rounded-xl border outline-none focus:border-pink-400 text-center text-xl tracking-widest"
                                            value={mfaCode}
                                            onChange={e => setMfaCode(e.target.value)}
                                            required
                                            maxLength={6}
                                            style={{ borderColor: 'rgba(212,65,142,0.2)' }}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={mfaLoading || mfaCode.length !== 6}
                                            className="w-full mt-2 py-3.5 px-6 rounded-2xl font-bold cursor-pointer text-white disabled:opacity-70 transition-all flex justify-center items-center"
                                            style={{
                                                background: 'linear-gradient(135deg, #FF8C42, #D4418E)',
                                                boxShadow: '0 4px 15px rgba(212,65,142,0.3)',
                                            }}
                                        >
                                            {mfaLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify & Sign In'}
                                        </motion.button>
                                    </form>
                                )}
                                
                                <div className="text-center mb-2">
                                    <button
                                        type="button"
                                        onClick={() => { setMfaResolver(null); setMfaVerificationId(''); setMfaCode(''); }}
                                        className="text-sm font-semibold hover:underline cursor-pointer"
                                        style={{ color: '#8B7B8B' }}
                                    >
                                        Cancel & Go Back
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#1A0A2E' }}>
                                    {isSignUp ? 'Join Aarogyam 🌸' : 'Welcome, Goddess 🌸'}
                                </h1>
                                <p className="mb-6" style={{ color: '#8B7B8B' }}>
                                    {isSignUp ? 'Create an account to begin your journey' : 'Sign in to continue your transformation'}
                                </p>

                                {/* Email/Password Form */}
                                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
                                    {isSignUp && (
                                        <input 
                                            type="text" 
                                            placeholder="Your Name" 
                                            className="w-full px-4 py-3 rounded-xl border outline-none focus:border-pink-400"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required={isSignUp}
                                            style={{ borderColor: 'rgba(212,65,142,0.2)' }}
                                        />
                                    )}
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        className="w-full px-4 py-3 rounded-xl border outline-none focus:border-pink-400"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        style={{ borderColor: 'rgba(212,65,142,0.2)' }}
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Password" 
                                        className="w-full px-4 py-3 rounded-xl border outline-none focus:border-pink-400"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{ borderColor: 'rgba(212,65,142,0.2)' }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-2 py-3.5 px-6 rounded-2xl font-bold cursor-pointer text-white disabled:opacity-70 transition-all flex justify-center items-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #FF8C42, #D4418E)',
                                            boxShadow: '0 4px 15px rgba(212,65,142,0.3)',
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            isSignUp ? 'Create Account' : 'Sign In'
                                        )}
                                    </motion.button>
                                </form>
                                
                                <div className="text-center mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-sm font-semibold hover:underline cursor-pointer"
                                        style={{ color: '#D4418E' }}
                                    >
                                        {isSignUp ? 'Already have an account? Sign In' : 'New here? Create an Account'}
                                    </button>
                                </div>
                            </>
                        )}


                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px" style={{ background: 'rgba(212,65,142,0.15)' }} />
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8B7B8B' }}>Or continue with</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(212,65,142,0.15)' }} />
                        </div>

                        {/* Google Sign-In */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl font-medium cursor-pointer transition-all mb-4"
                            style={{
                                background: 'white',
                                border: '1.5px solid rgba(212,65,142,0.3)',
                                boxShadow: '0 4px 20px rgba(212,65,142,0.1)',
                                color: '#1A0A2E',
                            }}
                        >
                            <GoogleIcon />
                            Google
                        </motion.button>

                        {/* Privacy assurance */}
                        <p className="text-center text-xs" style={{ color: '#8B7B8B' }}>
                            🔒 We never share your data. Your journey is private.
                        </p>
                    </div>

                    {/* Features preview */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {[
                            { icon: '💪', text: 'Workouts' },
                            { icon: '🥗', text: 'Indian Meals' },
                            { icon: '📊', text: 'Track Progress' },
                        ].map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="text-center p-3 rounded-2xl"
                                style={{ background: 'rgba(212,65,142,0.06)' }}
                            >
                                <div className="text-2xl">{f.icon}</div>
                                <div className="text-xs font-medium mt-1" style={{ color: '#8B7B8B' }}>{f.text}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
