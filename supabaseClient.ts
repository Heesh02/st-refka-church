import { createClient } from '@supabase/supabase-js';

// Expect these to be provided via Vite environment variables.
// Create a `.env` file in the project root with:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
      'Auth and remote content features will not work until these are configured.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');


