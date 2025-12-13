import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psrofmaojlttfyrsarrc.supabase.co';
const supabaseAnonKey = 'sb_secret_O3v9_48MTS6tL8CuQUo2Dg_4jbJ1hJK';

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
