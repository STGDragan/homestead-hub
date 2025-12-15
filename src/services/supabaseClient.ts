
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION STRATEGY ---
// 1. PROTOTYPE MODE: Persistent localStorage key.
// 2. PRODUCTION MODE: Env vars.

const HARDCODED_URL = 'https://psrofmaojlttfyrsarrc.supabase.co'; 
const HARDCODED_KEY = 'INSERT_YOUR_ANON_KEY_HERE'; 

// --------------------------------

// 1. Try to get config from Browser Storage (Persistent across AI edits)
let storedUrl = null;
let storedKey = null;

try {
    if (typeof window !== 'undefined') {
        storedUrl = localStorage.getItem('homestead_supabase_url');
        storedKey = localStorage.getItem('homestead_supabase_key');
    }
} catch (e) {
    console.warn("LocalStorage access denied or unavailable.");
}

// 2. Helper to clean strings
const clean = (str: string | null | undefined) => (str || '').trim().replace(/\/$/, '');

// 3. Determine final credentials (Storage > Hardcoded)
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
                detectSessionInUrl: false,
                storage: typeof window !== 'undefined' ? window.localStorage : undefined
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
    try {
        localStorage.setItem('homestead_supabase_url', url);
        localStorage.setItem('homestead_supabase_key', key);
        window.location.reload();
    } catch(e) {
        alert("Cannot save config: Storage access denied.");
    }
};

// Helper to reset
export const resetConnectionConfig = () => {
    try {
        localStorage.removeItem('homestead_supabase_url');
        localStorage.removeItem('homestead_supabase_key');
        window.location.reload();
    } catch(e) {}
};
