
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yywtssolialsiwlsmssm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5d3Rzc29saWFsc2l3bHNtc3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODQxOTksImV4cCI6MjA3OTI2MDE5OX0.dVzTiSfvN_sSsNbqnmNON81uEcUsW75QEhWMIDUMr98'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
