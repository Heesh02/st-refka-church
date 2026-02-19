import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthScreenProps {
  onLogin: (identifier: string, pass: string, method: 'email' | 'phone') => Promise<string | null>;
  onRegister: (email: string, pass: string, name: string, phone: string) => Promise<string | null>;
  onForgotPassword: (email: string) => Promise<string | null>;
  translations: {
    loginWithEmail: string;
    loginWithPhone: string;
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
    phonePlaceholder: string;
    password: string;
    signIn: string;
    createAccount: string;
    forgotPassword: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    signUp: string;
    signInLink: string;
    enterEmail: string;
    enterPhone: string;
  };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, onForgotPassword, translations: t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      let resultError: string | null = null;
      if (isLogin) {
        const identifier = loginMethod === 'email' ? email : phone;
        resultError = await onLogin(identifier, password, loginMethod);
      } else {
        resultError = await onRegister(email, password, name, phone);
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

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setLoginMethod('email');
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

        {/* Login Method Toggle — only for login mode */}
        {isLogin && (
          <div className="flex bg-zinc-950/50 border border-zinc-800 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-300'
                }`}
            >
              <Mail size={16} />
              {t.loginWithEmail}
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-300'
                }`}
            >
              <Phone size={16} />
              {t.loginWithPhone}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name — registration only */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <label className="text-xs font-medium text-zinc-400 ml-1">{t.fullName}</label>
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

          {/* Email — always shown in registration, shown in login when method is email */}
          {(!isLogin || loginMethod === 'email') && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">{t.emailAddress}</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!isLogin || loginMethod === 'email'}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          )}

          {/* Phone — always shown in registration (required), shown in login when method is phone */}
          {(!isLogin || loginMethod === 'phone') && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">{t.phoneNumber}</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={!isLogin || loginMethod === 'phone'}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder={t.phonePlaceholder}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">{t.password}</label>
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
            {isLogin && loginMethod === 'email' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-[11px] text-zinc-400 hover:text-indigo-300 transition-colors"
                  disabled={isLoading}
                >
                  {t.forgotPassword}
                </button>
              </div>
            )}
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-xs text-center border ${isError
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
                {isLogin ? t.signIn : t.createAccount}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-sm">
            {isLogin ? t.dontHaveAccount + ' ' : t.alreadyHaveAccount + ' '}
            <button
              onClick={switchMode}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isLogin ? t.signUp : t.signInLink}
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