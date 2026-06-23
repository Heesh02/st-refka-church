import React, { useEffect, useRef, useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export const AuthCallbackScreen: React.FC = () => {
  const [message, setMessage] = useState('Completing sign in...');
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) return;
    hasHandledCallback.current = true;

    const completeOAuthSignIn = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        const oauthError =
          queryParams.get('error_description') ||
          queryParams.get('error') ||
          hashParams.get('error_description') ||
          hashParams.get('error');

        if (oauthError) {
          setMessage(decodeURIComponent(oauthError));
          return;
        }

        const code = queryParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMessage(error.message);
            return;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setMessage(sessionError.message);
          return;
        }

        if (!data.session) {
          setMessage('Could not complete sign in. Please try again.');
          return;
        }

        window.location.replace('/');
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    };

    void completeOAuthSignIn();
  }, []);

  const isError = message !== 'Completing sign in...';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8 text-center"
      >
        {isError ? (
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <XCircle className="text-red-500" size={32} />
          </div>
        ) : (
          <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={32} />
        )}

        <h1 className="text-xl font-semibold text-white mb-2">
          {isError ? 'Sign In Failed' : 'Signing You In'}
        </h1>
        <p className="text-sm text-zinc-400 mb-6">{message}</p>

        {isError && (
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Back to Sign In
          </a>
        )}
      </motion.div>
    </div>
  );
};
