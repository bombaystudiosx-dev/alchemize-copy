/**
 * supabaseClient.js  (was: base44Client.js)
 *
 * Single Supabase client instance used throughout the app.
 * All former `base44` imports from this file now receive the
 * Supabase client instead.
 *
 * Required env vars (.env / Vercel dashboard):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─── Backward-compat shim ────────────────────────────────────────────────────
// Any file that still imports `base44` from this module receives an object
// that delegates to Supabase equivalents so we can migrate incrementally.
export const base44 = {
  auth: supabase.auth,
};
