import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OtpVerify() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [verifying, setVerifying] = useState(false);
    const [sending, setSending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [shake, setShake] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const functions = getFunctions();
    const sendOtpFn = httpsCallable<{ email: string }, { maskedEmail: string }>(functions, 'sendOtp');
    const verifyOtpFn = httpsCallable<{ otp: string }, { success: boolean }>(functions, 'verifyOtp');

    // Auto-send OTP on mount
    useEffect(() => {
        if (user?.email) {
            handleSendOtp(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleSendOtp = async (initial = false) => {
        if (!user?.email) return;
        setSending(true);
        try {
            const result = await sendOtpFn({ email: user.email });
            setMaskedEmail(result.data.maskedEmail);
            setCountdown(RESEND_COOLDOWN);
            if (!initial) toast('New OTP sent to your email 📧', 'success');
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? 'Failed to send OTP';
            toast(msg, 'error');
        } finally {
            setSending(false);
        }
    };

    const focusNext = (index: number) => {
        if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    const focusPrev = (index: number) => {
        if (index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit) focusNext(index);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index]) focusPrev(index);
        if (e.key === 'ArrowLeft') focusPrev(index);
        if (e.key === 'ArrowRight') focusNext(index);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
        const next = [...otp];
        digits.forEach((d, i) => { next[i] = d; });
        setOtp(next);
        inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) {
            toast('Please enter all 6 digits', 'error');
            return;
        }
        setVerifying(true);
        try {
            await verifyOtpFn({ otp: code });
            toast('Email verified! Welcome to Aarogyam 🌸', 'success');
            navigate('/onboarding/step1');
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? 'Invalid OTP';
            toast(msg, 'error');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setVerifying(false);
        }
    };

    const isFilled = otp.every(d => d !== '');

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #D4418E 50%, #FF8C42 100%)' }}
        >
            {/* Background mandala */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            >
                <svg viewBox="0 0 400 400" style={{ width: 600, height: 600 }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                        <ellipse key={i} cx="200" cy="200" rx="160" ry="50" fill="none" stroke="white" strokeWidth="0.8"
                            transform={`rotate(${i * 22.5} 200 200)`} />
                    ))}
                </svg>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="rounded-3xl p-8 shadow-2xl backdrop-blur-md"
                    style={{ background: 'rgba(255,245,248,0.97)', border: '1px solid rgba(212,65,142,0.2)' }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-6">
                        <img src="/logoo.png" alt="Aarogyam" className="w-10 h-10 object-contain" />
                        <span className="font-bold text-xl" style={{ color: '#D4418E' }}>AAROGYAM</span>
                    </div>

                    {/* Shield icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: 'linear-gradient(135deg, #D4418E, #FF8C42)' }}
                    >
                        <span className="text-3xl">🔐</span>
                    </motion.div>

                    <h1 className="font-bold text-2xl mb-1" style={{ color: '#1A0A2E' }}>
                        Verify Your Email
                    </h1>
                    <p className="text-sm mb-1" style={{ color: '#8B7B8B' }}>
                        We sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-sm mb-6" style={{ color: '#D4418E' }}>
                        {maskedEmail || (user?.email ?? 'your email')}
                    </p>

                    {/* OTP Inputs */}
                    <AnimatePresence>
                        <motion.div
                            className="flex gap-3 justify-center mb-6"
                            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    className="w-11 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                                    style={{
                                        border: digit
                                            ? '2px solid #D4418E'
                                            : '2px solid rgba(212,65,142,0.25)',
                                        background: digit ? 'rgba(212,65,142,0.06)' : 'white',
                                        color: '#1A0A2E',
                                        boxShadow: digit ? '0 0 0 3px rgba(212,65,142,0.12)' : 'none',
                                    }}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Verify Button */}
                    <motion.button
                        whileHover={{ scale: isFilled && !verifying ? 1.02 : 1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerify}
                        disabled={!isFilled || verifying}
                        className="w-full py-3.5 rounded-2xl font-semibold text-white text-base transition-all cursor-pointer border-0"
                        style={{
                            background: isFilled && !verifying
                                ? 'linear-gradient(135deg, #D4418E, #FF8C42)'
                                : 'rgba(212,65,142,0.35)',
                            boxShadow: isFilled ? '0 8px 24px rgba(212,65,142,0.35)' : 'none',
                        }}
                    >
                        {verifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Verifying...
                            </span>
                        ) : '✨ Verify & Continue'}
                    </motion.button>

                    {/* Resend */}
                    <div className="mt-4 text-center">
                        {countdown > 0 ? (
                            <p className="text-sm" style={{ color: '#8B7B8B' }}>
                                Resend code in <span style={{ color: '#D4418E', fontWeight: 600 }}>{countdown}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={() => handleSendOtp(false)}
                                disabled={sending}
                                className="text-sm font-semibold cursor-pointer border-0 bg-transparent"
                                style={{ color: '#D4418E' }}
                            >
                                {sending ? 'Sending...' : "Didn't receive it? Resend OTP"}
                            </button>
                        )}
                    </div>

                    <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid rgba(212,65,142,0.12)' }}>
                        <p className="text-xs" style={{ color: '#c0b0b0' }}>
                            🔒 This keeps your account secure. Code expires in 5 minutes.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
