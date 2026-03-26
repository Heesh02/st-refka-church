import React from 'react';
import { motion } from 'framer-motion';

interface PasswordFeedbackProps {
  password?: string;
  confirmPassword?: string;
  t: any;
  showMatch?: boolean;
}

export const PasswordFeedback: React.FC<PasswordFeedbackProps> = ({ password = '', confirmPassword, t, showMatch = true }) => {
  const isLengthValid = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  let strength = 0;
  if (password.length > 0) strength += 1;
  if (isLengthValid) strength += 1;
  if (hasLetter && hasNumber) strength += 1;
  if (password.length >= 10 && /[A-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength += 1;

  const getStrengthColor = () => {
    switch (strength) {
      case 0: return 'bg-zinc-800';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-indigo-500';
      default: return 'bg-zinc-800';
    }
  };

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showMatchStatus = showMatch && confirmPassword !== undefined && confirmPassword.length > 0;

  if (password.length === 0 && (!confirmPassword || confirmPassword.length === 0)) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 space-y-3"
    >
      <div className="flex gap-1 h-1 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div key={level} className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? getStrengthColor() : 'bg-zinc-800'}`} />
        ))}
      </div>
      <div className="text-[11px] text-zinc-500 space-y-1.5 px-1 pb-2">
        <p className={`flex items-center gap-2 transition-colors ${isLengthValid ? 'text-emerald-400' : ''}`}>
           <span className={`w-1 h-1 rounded-full ${isLengthValid ? 'bg-emerald-400' : 'bg-zinc-600'}`} /> {t.min8Chars}
        </p>
        <p className={`flex items-center gap-2 transition-colors ${(hasLetter && hasNumber) ? 'text-emerald-400' : ''}`}>
           <span className={`w-1 h-1 rounded-full ${(hasLetter && hasNumber) ? 'bg-emerald-400' : 'bg-zinc-600'}`} /> {t.letterAndNumber}
        </p>
        {showMatchStatus && (
          <p className={`flex items-center gap-2 transition-colors ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
             <span className={`w-1 h-1 rounded-full ${passwordsMatch ? 'bg-emerald-400' : 'bg-red-400'}`} /> 
             {passwordsMatch ? t.passwordsMatch : t.passwordsDoNotMatch}
          </p>
        )}
      </div>
    </motion.div>
  );
};
