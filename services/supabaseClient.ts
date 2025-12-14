
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION START ---

// Helper to safely get env vars without crashing if process is undefined
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors during env lookup
  }
  return undefined;
};

// OPTION 1: Local Storage (UI Configured - Highest Priority)
let localUrl: string | null = null;
let localKey: string | null = null;
let forceOffline = false;

try {
    if (typeof window !== 'undefined' && window.localStorage) {
        localUrl = localStorage.getItem('homestead_supabase_url');
        localKey = localStorage.getItem('homestead_supabase_key');
        forceOffline = localStorage.getItem('homestead_force_offline') === 'true';
    }
} catch (e) {
    console.warn("LocalStorage access failed", e);
}

const DEFAULT_URL = 'https://placeholder-project.supabase.co';
const DEFAULT_KEY = 'placeholder-key';

// OPTION 2: Environment Variables
const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || getEnv('REACT_APP_SUPABASE_URL') || getEnv('SUPABASE_URL');
const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || getEnv('REACT_APP_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// OPTION 3: Hardcode (Lowest Priority - for testing)
const HARDCODED_URL = DEFAULT_URL; 
const HARDCODED_KEY = DEFAULT_KEY; 

// --- CONFIGURATION END ---

// Helper to normalize URLs (remove trailing slash)
const clean = (str: string | null | undefined) => (str || '').trim().replace(/\/$/, '');

const rawUrl = localUrl || envUrl || HARDCODED_URL;
const rawKey = localKey || envKey || HARDCODED_KEY;

const targetUrl = clean(rawUrl) || DEFAULT_URL;
const targetKey = clean(rawKey) || DEFAULT_KEY;

// Validation
const isUrlValid = (url: string) => {
    try { 
        const u = new URL(url); 
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
};

// Treat known placeholders as default (invalid)
const isUrlDefault = targetUrl === DEFAULT_URL || targetUrl.includes('your-project.supabase.co');
const isKeyDefault = targetKey === DEFAULT_KEY;

// Initialize Client Safely
let client;
let successfullyConfigured = false;

if (forceOffline) {
    console.warn(`[Supabase] Force Offline Mode Active.`);
    client = createClient(DEFAULT_URL, DEFAULT_KEY);
    successfullyConfigured = false;
} else {
    try {
        if (targetUrl && targetKey && isUrlValid(targetUrl) && !isUrlDefault && !isKeyDefault) {
            client = createClient(targetUrl, targetKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: false // Often causes issues in some envs
                }
            });
            successfullyConfigured = true;
            console.log(`[Supabase] Initialized client for ${targetUrl}`);
        } else {
            // Invalid config, use dummy
            throw new Error("Invalid configuration parameters");
        }
    } catch (e) {
        console.warn("[Supabase] Client init failed or invalid config. Using mock fallback.", e);
        client = createClient(DEFAULT_URL, DEFAULT_KEY);
        successfullyConfigured = false;
    }
}

export const supabase = client;
export const isSupabaseConfigured = successfullyConfigured;
