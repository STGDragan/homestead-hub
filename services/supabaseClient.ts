
import { createClient } from '@supabase/supabase-js';

// --- GLOBAL APP CONFIGURATION ---
// These are now hardcoded into the build. 
// Every user who loads the app will connect to this backend.

const HARDCODED_URL = 'https://psrofmaojlttfyrsarrc.supabase.co'; // Pre-filled from your logs
<<<<<<< HEAD
const HARDCODED_KEY = 'sb_secret_O3v9_48MTS6tL8CuQUo2Dg_4jbJ1hJK'; // <--- PASTE YOUR KEY HERE ONCE
=======
const HARDCODED_KEY = 'INSERT_YOUR_ANON_KEY_HERE'; // <--- PASTE YOUR KEY HERE ONCE
>>>>>>> 400f689925feb619fba7831bd5956ad0db7c636e

// --------------------------------

// Helper to clean strings
const clean = (str: string | null | undefined) => (str || '').trim().replace(/\/$/, '');

const targetUrl = clean(HARDCODED_URL);
const targetKey = clean(HARDCODED_KEY);

// Validation
const isUrlValid = (url: string) => {
    try { 
        const u = new URL(url); 
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
};

// Check if configured (User has replaced the placeholder)
const isConfigured = 
    targetUrl !== '' && 
    targetKey !== '' && 
<<<<<<< HEAD
    targetKey !== 'sb_secret_O3v9_48MTS6tL8CuQUo2Dg_4jbJ1hJK';
=======
    targetKey !== 'INSERT_YOUR_ANON_KEY_HERE';
>>>>>>> 400f689925feb619fba7831bd5956ad0db7c636e

let client;

if (isConfigured && isUrlValid(targetUrl)) {
    console.log(`[Supabase] Initializing global client: ${targetUrl}`);
    client = createClient(targetUrl, targetKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    });
} else {
    console.warn("[Supabase] Client not configured. Please edit services/supabaseClient.ts");
    // Fallback dummy client to prevent crash before config
    client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
export const isSupabaseConfigured = isConfigured;
