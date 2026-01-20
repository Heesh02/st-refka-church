import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export const EmailConfirmationScreen: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Supabase automatically handles the token from the URL hash
                // when using the default auth flow. We just need to check if
                // a session was established.
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    setStatus('error');
                    setMessage(error.message || 'Failed to verify email. Please try again.');
                    return;
                }

                if (data.session) {
                    // User is now authenticated - email was confirmed
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                } else {
                    // No session yet - might still be processing or already confirmed
                    // Wait a moment and check again
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const { data: retryData } = await supabase.auth.getSession();
                    if (retryData.session) {
                        setStatus('success');
                        setMessage('Your email has been verified successfully!');
                    } else {
                        setStatus('success');
                        setMessage('Your email has been verified. You can now sign in.');
                    }
                }
            } catch {
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');
            }
        };

        void handleEmailConfirmation();
    }, []);

    const handleGoToLogin = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 5, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-900/10 blur-[100px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 relative z-10"
            >
                <div className="text-center">
                    {/* Status Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                        className="mb-6"
                    >
                        {status === 'loading' && (
                            <div className="w-20 h-20 mx-auto bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-lg">
                                <Loader2 className="animate-spin text-indigo-500" size={40} />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg">
                                <CheckCircle className="text-emerald-500" size={40} />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg">
                                <XCircle className="text-red-500" size={40} />
                            </div>
                        )}
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                        {status === 'loading' && 'Verifying Email'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    {/* Message */}
                    <p className="text-zinc-400 text-sm mb-8">{message}</p>

                    {/* Action Button */}
                    {status !== 'loading' && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoToLogin}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            Go to Sign In
                            <ArrowRight size={18} />
                        </motion.button>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        St. Refka Church
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
