/**
 * app-params.js
 *
 * Replaces the old Base44 app-params helper.
 * All configuration now comes from Vite env vars (import.meta.env.VITE_*).
 *
 * Add your keys to .env (see .env.example).
 */

export const appParams = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',

  // Add any other app-level config here, e.g.:
  // stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
  // openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
};

export default appParams;
