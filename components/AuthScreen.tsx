import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => Promise<string | null>;
  onRegister: (email: string, pass: string, name: string) => Promise<string | null>;
  onForgotPassword: (email: string) => Promise<string | null>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, onForgotPassword }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      let resultError: string | null = null;
      if (isLogin) {
        resultError = await onLogin(email, password);
      } else {
        resultError = await onRegister(email, password, name);
      }

      if (resultError) {
        setIsError(true);
        setMessage(resultError);
      }
    } catch (err) {
      setIsError(true);
      setMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      setIsError(true);
      setMessage('Please enter your email first.');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await onForgotPassword(email);
      if (result) {
        setIsError(true);
        setMessage(result);
      } else {
        setIsError(false);
        setMessage('If an account exists for this email, a reset link has been sent.');
      }
    } catch {
      setIsError(true);
      setMessage('Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
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
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-900/10 blur-[100px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-lg mb-4 overflow-hidden p-2"
          >
            <img src="/st-refka.png" alt="St. Refka Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            St. Refka Media Center
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {isLogin ? 'Sign in to access the church library' : 'Create an account to join the community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
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
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-[11px] text-zinc-400 hover:text-indigo-300 transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            )}
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
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
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