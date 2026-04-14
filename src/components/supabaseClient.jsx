/**
 * src/components/supabaseClient.jsx
 *
 * COMPATIBILITY SHIM - do not add new code here.
 *
 * This file previously contained hardcoded Supabase credentials.
 * It now re-exports from the canonical client in @/api/base44Client
 * which reads credentials from environment variables (VITE_SUPABASE_URL
 * and VITE_SUPABASE_ANON_KEY) instead of hardcoding them.
 *
 * Move all new Supabase usage to:
 *   import { supabase } from '@/api/base44Client';
 */
export { supabase } from '@/api/base44Client';
