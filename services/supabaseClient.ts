
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION STRATEGY ---
// 
// 1. PROTOTYPE MODE (Current):
//    We use `localStorage` to persist your API Key so the AI doesn't overwrite it 
//    every time it regenerates this file. You configure this via the "Connection" button in the UI.
//
// 2. PRODUCTION MODE (Deployment):
//    When you deploy to Vercel/Netlify, you should use Environment Variables.
//    Uncomment the lines below and delete the localStorage logic.
//
//    const targetUrl = import.meta.env.VITE_SUPABASE_URL;
//    const targetKey = import.meta.env.VITE_SUPABASE_KEY;

const HARDCODED_URL = 'https://psrofmaojlttfyrsarrc.supabase.co'; 
const HARDCODED_KEY = 'INSERT_YOUR_ANON_KEY_HERE'; 

// --------------------------------

// 1. Try to get config from Browser Storage (Persistent across AI edits)
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('homestead_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('homestead_supabase_key') : null;

// 2. Helper to clean strings
const clean = (str: string | null | undefined) => (str || '').trim().replace(/\/$/, '');

// 3. Determine final credentials (Storage > Hardcoded)
// In a real app, `import.meta.env.VITE_SUPABASE_URL` would take precedence here.
const targetUrl = clean(storedUrl || HARDCODED_URL);
const targetKey = clean(storedKey || HARDCODED_KEY);

// 4. Validation
const isPlaceholder = targetKey.includes('INSERT_YOUR_ANON_KEY');
const isConfigured = targetUrl !== '' && targetKey.length > 20 && !isPlaceholder;

let client;

if (isConfigured) {
    if (storedKey) {
        console.log(`[Supabase] Connecting using PERSISTED key from Browser Storage.`);
    } else {
        console.log(`[Supabase] Connecting using HARDCODED key from source file.`);
    }

    try {
        client = createClient(targetUrl, targetKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        });
    } catch (e) {
        console.error("[Supabase] Init Failed (Falling back to Mock):", e);
        client = createClient('https://placeholder.supabase.co', 'placeholder');
    }
} else {
    // Fallback dummy client
    console.warn("[Supabase] No valid key found. App is running in Mock Mode.");
    client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
export const isSupabaseConfigured = isConfigured;

// Helper to save config from UI
export const saveConnectionConfig = (url: string, key: string) => {
    localStorage.setItem('homestead_supabase_url', url);
    localStorage.setItem('homestead_supabase_key', key);
    window.location.reload();
};

// Helper to reset
export const resetConnectionConfig = () => {
    localStorage.removeItem('homestead_supabase_url');
    localStorage.removeItem('homestead_supabase_key');
    window.location.reload();
};
