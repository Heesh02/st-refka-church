import { useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface UseAuthOptions {
  passwordTooShort: string;
  passwordNeedsNumber: string;
  registrationSuccess: string;
}

export const useAuth = (options: UseAuthOptions) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    let didFinish = false;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (didFinish) return; // Timeout already fired
        if (error) {
          console.error('Error fetching session', error);
          if (!didFinish) {
            setCurrentUser(null);
            setIsAuthChecking(false);
            didFinish = true;
          }
          return;
        }

        if (data.session?.user) {
          const authUser = data.session.user;
          try {
            let { data: profile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', authUser.id)
              .maybeSingle();

            if (!profile) {
              const fullName = authUser.user_metadata?.full_name || authUser.email || 'User';
              const { data: newProfile } = await supabase
                .from('profiles')
                .upsert({ id: authUser.id, full_name: fullName, role: 'user' })
                .select('full_name, role')
                .single();
              if (newProfile) profile = newProfile;
            }

            if (!didFinish) {
              setCurrentUser({
                id: authUser.id,
                email: authUser.email || '',
                name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email || 'User',
                role: (profile?.role as User['role']) || 'user',
              });
            }
          } catch (profileError) {
            console.error('Error processing profile:', profileError);
            if (!didFinish) setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        if (!didFinish) setCurrentUser(null);
      } finally {
        if (!didFinish) {
          didFinish = true;
          setIsAuthChecking(false);
        }
      }
    };

    // Safety: if auth takes longer than 5 seconds, stop loading and show login
    const timeout = setTimeout(() => {
      if (!didFinish) {
        console.warn('Auth initialization timed out after 5s');
        didFinish = true;
        setIsAuthChecking(false);
      }
    }, 15000);

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const authUser = session.user;
        try {
          let { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, phone')
            .eq('id', authUser.id)
            .maybeSingle();

          if (!profile) {
            const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email || 'User';
            const { data: newProfile } = await supabase
              .from('profiles')
              .upsert({
                id: authUser.id,
                full_name: fullName,
                role: 'user',
                phone: authUser.user_metadata?.phone || authUser.phone || null,
              })
              .select('full_name, role, phone')
              .single();
            if (newProfile) profile = newProfile;
          }

          setCurrentUser({
            id: authUser.id,
            email: authUser.email || '',
            phone: profile?.phone || authUser.user_metadata?.phone || authUser.phone || '',
            name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email || 'User',
            role: (profile?.role as User['role']) || 'user',
          });
        } catch (profileError) {
          console.error('Error fetching profile on auth change:', profileError);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }

      // Always ensure we're not stuck loading after any auth event
      setIsAuthChecking(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (identifier: string, pass: string, method: 'email' | 'phone'): Promise<string | null> => {
    const credentials = method === 'email' ? { email: identifier, password: pass } : { phone: identifier, password: pass };
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) return error?.message || 'Invalid credentials';
    return null;
  };

  const handleRegister = async (email: string, pass: string, name: string, phone: string): Promise<string | null> => {
    const mapPasswordPolicyError = (errorMessage?: string): string | null => {
      if (!errorMessage) return null;
      const normalized = errorMessage.toLowerCase();
      if (normalized.includes('at least') && normalized.includes('8')) return options.passwordTooShort;
      if (normalized.includes('number') || normalized.includes('digit') || normalized.includes('numeric')) return options.passwordNeedsNumber;
      return null;
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name, phone },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error || !data.user) {
      return mapPasswordPolicyError(error?.message) || error?.message || 'Unable to register user';
    }

    try {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: name, phone, role: 'user' });
    } catch {
      // profile creation can happen on first login
    }

    return options.registrationSuccess;
  };

  const handleForgotPassword = async (email: string): Promise<string | null> => {
    if (!email) return 'Please enter your email first.';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? error.message : null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleGoogleSignIn = async (): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return error ? error.message : null;
  };

  return {
    currentUser,
    isAuthChecking,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleLogout,
    handleGoogleSignIn,
  };
};
