import { createClient } from '@supabase/supabase-js';

// Expect these to be provided via Vite environment variables.
// Create a `.env` file in the project root with:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const getSupabaseConfigError = (): string | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
  }

  try {
    const parsed = new URL(supabaseUrl);
    if (!parsed.hostname.endsWith('.supabase.co')) {
      return (
        'Invalid VITE_SUPABASE_URL. Use your Supabase project URL ' +
        '(https://YOUR_REF.supabase.co), not your Vercel app URL.'
      );
    }
  } catch {
    return 'Invalid VITE_SUPABASE_URL format.';
  }

  return null;
};

const configError = getSupabaseConfigError();
if (configError) {
  // eslint-disable-next-line no-console
  console.error(`[Supabase] ${configError}`);
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
});

const normalizeSiteOrigin = (value: string): string => {
  const trimmed = value.trim().replace(/\/$/, '');
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/** Public app origin used for Supabase OAuth/email redirects. */
export const getSiteOrigin = (): string => {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return normalizeSiteOrigin(configured);
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
};

export const getAuthRedirectUrl = (path = '/auth/callback'): string => {
  const origin = getSiteOrigin();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};


