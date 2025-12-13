import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psrofmaojlttfyrsarrc.supabase.co';
const supabaseAnonKey = 'seyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcm9mbWFvamx0dGZ5cnNhcnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjc0NTIsImV4cCI6MjA4MDgwMzQ1Mn0.ewf5NP2-58aJL0Ucj_m2G0FVQU88GsKRRFRG9eriDa4';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
