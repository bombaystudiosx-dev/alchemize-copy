import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co'
const supabaseAnonKey = 'SUPABASE_ANON_KEY_PLACEHOLDER'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)