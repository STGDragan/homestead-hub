import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psrofmaojlttfyrsarrc.supabase.co';
const supabaseAnonKey = 'sb_publishable_rHUNPb6YjGECWkhOpKxU0w_1v8DiLr2';

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
