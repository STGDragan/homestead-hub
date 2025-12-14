
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Mail, Lock, ArrowRight, AlertTriangle, Cloud, Check, Trash2, Terminal, Copy, WifiOff, RefreshCw, PlusCircle, Settings, Save, User, Phone } from 'lucide-react';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, canClose = true }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'magic' | 'mfa'>('login');
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState(''); // For MFA step
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  
  // Settings Config State
  const [showSettings, setShowSettings] = useState(false);
  const [configUrl, setConfigUrl] = useState(localStorage.getItem('homestead_supabase_url') || '');
  const [configKey, setConfigKey] = useState(localStorage.getItem('homestead_supabase_key') || '');
  
  // New state to detect if we have any users at all
  const [hasLocalUsers, setHasLocalUsers] = useState<boolean | null>(null);

  useEffect(() => {
      const checkUsers = async () => {
          const users = await dbService.getAll<AuthUser>('auth_users');
          setHasLocalUsers(users.length > 0);
          // If we have NO users, default to register mode for better UX
          if (users.length === 0) setMode('register');
      };
      checkUsers();
  }, []);
  
  const FIX_SQL = `
/* FIX REGISTRATION & PERMISSIONS */
-- 1. Reset Trigger (Safe Drop)
drop function if exists public.handle_new_user() cascade;

-- 2. Create Profiles Table (Crucial for app logic)
create table if not exists public.user_profile (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'user',
  created_at timestamptz default now()
);
alter table public.user_profile enable row level security;

-- 3. Create Profile Policies
do $$ begin
  if not exists (select from pg_policies where tablename = 'user_profile' and policyname = 'Users manage own profile') then
    create policy "Users manage own profile" on public.user_profile for all using (auth.uid() = id);
  end if;
  if not exists (select from pg_policies where tablename = 'user_profile' and policyname = 'Read all profiles') then
    create policy "Read all profiles" on public.user_profile for select using (true);
  end if;
end $$;

-- 4. Create App Data Table (For Sync)
create table if not exists public.app_data (
  collection text not null,
  id text not null,
  data jsonb not null,
  updated_at bigint,
  deleted boolean default false,
  user_id uuid default auth.uid(),
  primary key (collection, id)
);
alter table public.app_data enable row level security;
do $$ begin
  if not exists (select from pg_policies where tablename = 'app_data' and policyname = 'Users manage own data') then
    create policy "Users manage own data" on public.app_data for all using (auth.uid() = user_id);
  end if;
end $$;
`;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await authService.login(email, password, rememberMe);
        if (res.success) {
            if (res.mfaRequired && res.userId) {
                setUserId(res.userId);
                setMode('mfa');
            } else {
                onSuccess();
                if (canClose) onClose();
            }
        } else {
            setError(res.error || 'Login failed');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
            setError("Display name is required.");
            setLoading(false);
            return;
        }
        
        // Pass name/phone to auth service for metadata
        const res = await authService.register(email, password, { name, phone });
        
        if (res.success) {
            onSuccess();
            if (canClose) onClose();
        } else {
            setError(res.error || 'Registration failed');
        }
      } else if (mode === 'magic') {
        const res = await authService.magicLinkLogin(email);
        if (res.success) {
            setInfo('Magic link sent! Check your email (or wait for auto-login demo).');
            setTimeout(() => {
                onSuccess();
                if (canClose) onClose();
            }, 1500);
        } else {
            setError('User not found.');
        }
      } else if (mode === 'mfa') {
          const res = await authService.verifyMfa(userId, mfaCode, rememberMe);
          if (res.success) {
              onSuccess();
              if (canClose) onClose();
          } else {
              setError('Invalid code');
          }
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
      if (!configUrl.startsWith('http')) {
          alert('URL must start with http:// or https://');
          return;
      }
      localStorage.setItem('homestead_supabase_url', configUrl);
      localStorage.setItem('homestead_supabase_key', configKey);
      localStorage.removeItem('homestead_force_offline');
      window.location.reload();
  };

  const handleDisconnect = (e: React.MouseEvent) => {
      e.preventDefault();
      if (confirmDisconnect) {
          localStorage.removeItem('homestead_supabase_url');
          localStorage.removeItem('homestead_supabase_key');
          window.location.reload();
      } else {
          setConfirmDisconnect(true);
          setTimeout(() => setConfirmDisconnect(false), 3000);
      }
  };

  const handleForceOffline = (e: React.MouseEvent) => {
      e.preventDefault();
      localStorage.setItem('homestead_force_offline', 'true');
      localStorage.removeItem('homestead_supabase_url');
      localStorage.removeItem('homestead_supabase_key');
      window.location.reload();
  };

  const handleFactoryReset = async (e: React.MouseEvent) => {
      e.preventDefault();
      // Use standard confirm here only if critical, otherwise rely on UI feedback
      if (window.confirm("WARNING: This will delete ALL local data (animals, plants, settings) and reset the app to a fresh state. This cannot be undone. Are you sure?")) {
          localStorage.clear();
          await dbService.clearDatabase();
          window.location.reload();
      }
  };

  const copySql = () => {
      navigator.clipboard.writeText(FIX_SQL);
      alert("SQL copied! Run this in Supabase SQL Editor.");
  };

  // Error Classification
  const is500Error = error.includes('500') || error.toLowerCase().includes('database error') || error.toLowerCase().includes('violates row-level security');
  const isConnectionError = error.includes('Invalid API key') || error.includes('Failed to fetch') || error.includes('400') || error.includes('401') || error.includes('Cloud Error') || error.includes('Not configured');
  const isFatalError = is500Error || isConnectionError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-earth-200 dark:border-stone-800 max-h-[90vh]">
        
        <div className="h-32 bg-earth-800 dark:bg-stone-950 relative overflow-hidden flex items-center justify-center flex-shrink-0">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40"></div>
           <h2 className="text-3xl font-serif font-bold text-white relative z-10 drop-shadow-md">
              {showSettings ? 'Connection' : mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'mfa' ? '2-Step Verification' : 'Magic Link'}
           </h2>
           
           <div className="absolute top-4 right-4 z-20 flex gap-2">
               {!showSettings && (
                   <button 
                      onClick={() => setShowSettings(true)}
                      className="text-white/70 hover:text-white transition-colors"
                      title="Settings"
                   >
                      <Settings size={24} />
                   </button>
               )}
               {canClose && (
                   <button 
                      onClick={onClose}
                      className="text-white/70 hover:text-white transition-colors"
                   >
                      <X size={24} />
                   </button>
               )}
           </div>
        </div>

        <div className="p-8 overflow-y-auto">
           {/* CONNECTION SETTINGS PANEL */}
           {showSettings ? (
               <div className="space-y-4 animate-in slide-in-from-right-4">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/50">
                       <p className="font-bold flex items-center gap-2 mb-1"><Cloud size={16}/> Configure Cloud</p>
                       <p>Enter your Supabase URL and Anon Key to enable real user registration and syncing.</p>
                   </div>
                   
                   <div className="space-y-3">
                       <Input 
                           label="Supabase URL" 
                           placeholder="https://your-project.supabase.co"
                           value={configUrl}
                           onChange={e => setConfigUrl(e.target.value)}
                       />
                       <Input 
                           label="Anon Key" 
                           type="password" 
                           placeholder="your-anon-key..."
                           value={configKey}
                           onChange={e => setConfigKey(e.target.value)}
                       />
                   </div>

                   <div className="flex gap-2 pt-2">
                       <Button variant="ghost" onClick={() => setShowSettings(false)} className="flex-1">Back</Button>
                       <Button onClick={handleSaveConfig} className="flex-1" icon={<Save size={16}/>}>Save & Connect</Button>
                   </div>
               </div>
           ) : (
               <>
                   {/* STATUS INDICATORS */}
                   {isSupabaseConfigured ? (
                       <div className="mb-6 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                           <div className="flex items-center gap-2">
                               <Cloud size={16} className="text-green-600 dark:text-green-400" />
                               <span className="text-xs font-bold text-green-800 dark:text-green-200">Cloud Sync Active</span>
                           </div>
                           <button onClick={handleDisconnect} className={`text-[10px] ${confirmDisconnect ? 'text-red-700 bg-red-100 px-2 py-0.5 rounded' : 'text-red-500 hover:underline'} font-bold flex items-center gap-1 transition-all`}>
                               <Trash2 size={10} /> {confirmDisconnect ? 'Confirm Reset?' : 'Disconnect'}
                           </button>
                       </div>
                   ) : (
                       <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-col gap-2">
                           <div className="flex gap-3">
                               <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0" size={20} />
                               <div className="text-xs text-amber-800 dark:text-amber-200">
                                   <strong>Offline Mode Active</strong>
                                   <p>Data is stored locally on this device.</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <button onClick={() => setShowSettings(true)} className="text-xs text-amber-700 underline font-bold">
                                   Configure Cloud &rarr;
                               </button>
                           </div>
                       </div>
                   )}

                   <form onSubmit={handleSubmit} className="space-y-4">
                      {error && !isFatalError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
                      
                      {!isSupabaseConfigured && (
                          <div className="text-center pb-2">
                              <button type="button" onClick={handleFactoryReset} className="text-xs text-red-500 hover:underline flex items-center justify-center gap-1 w-full">
                                  <Trash2 size={10} /> Factory Reset (Clear All Data)
                              </button>
                          </div>
                      )}

                      {isFatalError && (
                          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                  <AlertTriangle className="text-red-600 shrink-0" size={20} />
                                  <div>
                                      <h4 className="font-bold text-red-900 dark:text-red-100 text-sm">
                                          {isConnectionError ? 'Cloud Connection Failed' : 'Backend Setup Required'}
                                      </h4>
                                      <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                                          {isConnectionError 
                                            ? 'The API Key or URL is invalid. Please update settings.'
                                            : 'Database setup incomplete.'}
                                      </p>
                                  </div>
                              </div>
                              
                              {isConnectionError && (
                                  <Button size="sm" onClick={() => setShowSettings(true)} className="w-full mt-2" variant="outline">
                                      Fix Connection Settings
                                  </Button>
                              )}
                              
                              {is500Error && (
                                  <details className="text-xs">
                                      <summary className="cursor-pointer font-bold text-red-700 dark:text-red-300 hover:underline mb-2">View SQL Fix</summary>
                                      <div className="relative">
                                          <pre className="bg-black/80 text-green-400 p-3 rounded-lg overflow-x-auto font-mono mb-2">
                                              {FIX_SQL}
                                          </pre>
                                          <button type="button" onClick={copySql} className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded transition-colors">
                                              <Copy size={12} />
                                          </button>
                                      </div>
                                      <p className="text-red-800 dark:text-red-200">Run this script in Supabase SQL Editor.</p>
                                  </details>
                              )}

                              <div className="pt-2 border-t border-red-200 dark:border-red-800 flex justify-between items-center">
                                  <span className="text-xs text-red-800 dark:text-red-300 font-medium">Alternative:</span>
                                  <button type="button" onClick={handleForceOffline} className="text-xs bg-white text-red-700 border border-red-200 px-3 py-2 rounded-lg font-bold hover:bg-red-50 flex items-center gap-1 shadow-sm">
                                      <WifiOff size={12} /> Work Offline
                                  </button>
                              </div>
                          </div>
                      )}

                      {info && <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">{info}</div>}

                      {mode === 'mfa' ? (
                          <div className="space-y-4">
                              <p className="text-sm text-earth-600 dark:text-stone-300 text-center">Enter the 6-digit code from your authenticator app.</p>
                              <Input 
                                label="Code"
                                value={mfaCode}
                                onChange={e => setMfaCode(e.target.value)}
                                placeholder="123456"
                                className="text-center text-2xl tracking-widest"
                                autoFocus
                                autoComplete="one-time-code"
                              />
                          </div>
                      ) : (
                          <>
                            {/* --- REGISTRATION FIELDS --- */}
                            {mode === 'register' && (
                                <div className="space-y-4">
                                    <Input 
                                        label="Display Name"
                                        type="text"
                                        icon={<User size={18} />}
                                        placeholder="Jane Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <Input 
                                        label="Phone Number (Optional)"
                                        type="tel"
                                        icon={<Phone size={18} />}
                                        placeholder="+1..."
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </div>
                            )}

                            <Input 
                                label="Email Address"
                                type="email"
                                name="email"
                                autoComplete="username"
                                icon={<Mail size={18} />}
                                placeholder="farmer@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus={mode !== 'register'}
                            />

                            {mode !== 'magic' && (
                                <Input 
                                    label="Password"
                                    type="password"
                                    name="password"
                                    autoComplete={mode === 'register' ? "new-password" : "current-password"}
                                    icon={<Lock size={18} />}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            )}
                          </>
                      )}

                      {mode === 'login' && (
                          <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 cursor-pointer text-sm text-earth-600 dark:text-stone-400 select-none">
                                  <input 
                                      type="checkbox" 
                                      checked={rememberMe} 
                                      onChange={e => setRememberMe(e.target.checked)}
                                      className="w-4 h-4 rounded text-leaf-600 focus:ring-leaf-500 bg-white dark:bg-stone-800 border-earth-300 dark:border-stone-700"
                                  />
                                  Remember Me
                              </label>
                              <button type="button" onClick={() => setMode('magic')} className="text-xs text-leaf-600 hover:underline">
                                  Forgot Password?
                              </button>
                          </div>
                      )}

                      <Button className="w-full py-3 mt-2" disabled={loading}>
                         {loading ? 'Processing...' : 'Continue'}
                         {!loading && <ArrowRight size={18} />}
                      </Button>

                      {mode === 'login' && (
                          <div className="text-center">
                              <button type="button" onClick={() => setMode('magic')} className="text-xs text-earth-500 hover:text-leaf-600 transition-colors">
                                  Or sign in with Magic Link
                              </button>
                          </div>
                      )}
                   </form>

                   {mode !== 'mfa' && (
                       <div className="mt-6 text-center text-sm text-earth-600 dark:text-stone-400">
                          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                          <button 
                             onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                             className="font-bold text-leaf-700 hover:underline"
                          >
                             {mode === 'login' ? 'Sign Up' : 'Log In'}
                          </button>
                       </div>
                   )}
                   
                   {hasLocalUsers === false && mode === 'login' && (
                       <div className="mt-4 p-3 bg-leaf-50 dark:bg-leaf-900/10 border border-leaf-200 dark:border-leaf-800 rounded-xl text-center">
                           <p className="text-xs text-leaf-800 dark:text-leaf-200 mb-2">No local users found.</p>
                           <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => setMode('register')} icon={<PlusCircle size={14}/>}>
                               Create Offline Admin
                           </Button>
                       </div>
                   )}
               </>
           )}
        </div>
      </div>
    </div>
  );
};
