import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle password reset token from URL
  useEffect(() => {
    const handlePasswordResetToken = async () => {
      try {
        // Extract token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        // Also check URL hash (for PKCE flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashToken = hashParams.get('access_token');
        const hashType = hashParams.get('type');

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            setIsInitializing(false);
            // Clean up URL
            window.history.replaceState({}, document.title, '/reset-password');
          }
        });

        // Handle token from query parameters
        if (token && type === 'recovery') {
          try {
            // Try to verify the token using verifyOtp
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'recovery',
            });

            if (error) {
              // If verifyOtp fails, redirect to Supabase's verify endpoint
              window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(token)}&type=recovery&redirect_to=${encodeURIComponent(window.location.href)}`;
              return;
            }

            if (data.session) {
              // Session established, user can now reset password
              setIsInitializing(false);
              // Clean up URL
              window.history.replaceState({}, document.title, '/reset-password');
              subscription.unsubscribe();
              return;
            }
          } catch (verifyError: any) {
            // If all else fails, redirect to Supabase's verify endpoint
            window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(token)}&type=recovery&redirect_to=${encodeURIComponent(window.location.href)}`;
            return;
          }
        }

        // Handle token from hash (PKCE flow) - Supabase processes these automatically
        if (hashToken && hashType === 'recovery') {
          // Wait a moment for Supabase to process the hash token
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            setIsError(true);
            setMessage(error.message || 'Invalid or expired reset link. Please request a new one.');
            setIsInitializing(false);
            subscription.unsubscribe();
            return;
          }

          if (data.session) {
            setIsInitializing(false);
            // Clean up URL
            window.history.replaceState({}, document.title, '/reset-password');
            subscription.unsubscribe();
            return;
          }
        }

        // Check if session already exists
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          if (!token && !hashToken) {
            setIsError(true);
            setMessage('Invalid or expired reset link. Please request a new password reset.');
          }
        } else {
          // Session exists, user can reset password
          setIsInitializing(false);
        }

        // Cleanup subscription after 10 seconds
        setTimeout(() => {
          subscription.unsubscribe();
        }, 10000);
      } catch (err: any) {
        setIsError(true);
        setMessage(err?.message || 'An error occurred while processing the reset link.');
        setIsInitializing(false);
      }
    };

    void handlePasswordResetToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setIsError(true);
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setIsError(true);
        setMessage(error.message);
        return;
      }

      setIsError(false);
      setMessage('Password updated successfully. You can now sign in with your new password.');
    } catch {
      setIsError(true);
      setMessage('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 relative z-10">
          <div className="text-center">
            <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={40} />
            <p className="text-zinc-400 text-sm">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

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
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-900/10 blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Enter your new password below to finish resetting your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-xs text-center border ${
                isError
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              {message}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Update Password
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-xs text-zinc-400 hover:text-indigo-300 transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
};


