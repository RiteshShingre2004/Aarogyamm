import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerToast } from './Toast';

export default function ToastProvider() {
    const [messages, setMessages] = useState<{ id: number; text: string; type: string }[]>([]);

    useEffect(() => {
        let counter = 0;
        registerToast((msg, type = 'info') => {
            const id = ++counter;
            setMessages(prev => [...prev, { id, text: msg, type }]);
            setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 3500);
        });
    }, []);

    const colors: Record<string, string> = {
        success: '#2ECC71',
        error: '#D4418E',
        info: '#7B2D8B',
    };

    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {messages.map(m => (
                    <motion.div key={m.id}
                        initial={{ opacity: 0, x: 80, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.9 }}
                        className="px-4 py-3 rounded-2xl text-white text-sm font-medium shadow-lg max-w-xs"
                        style={{ background: colors[m.type] ?? colors.info, pointerEvents: 'auto' }}>
                        {m.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
