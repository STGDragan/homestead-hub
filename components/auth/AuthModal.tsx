
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Mail, Lock, ArrowRight, User, Phone, Settings, Link, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { isSupabaseConfigured, saveConnectionConfig } from '../../services/supabaseClient';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, canClose = true }) => {
  // Default to config mode if not configured, otherwise login
  const [mode, setMode] = useState<'login' | 'register' | 'magic' | 'mfa' | 'config'>(
      !isSupabaseConfigured ? 'config' : 'login'
  );
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState(''); // For MFA step
  
  // Config Fields - Load from localStorage first
  const [configUrl, setConfigUrl] = useState(localStorage.getItem('homestead_supabase_url') || 'https://psrofmaojlttfyrsarrc.supabase.co');
  const [configKey, setConfigKey] = useState(localStorage.getItem('homestead_supabase_key') || '');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  
  const [hasLocalUsers, setHasLocalUsers] = useState<boolean | null>(null);

  useEffect(() => {
      const checkUsers = async () => {
          const users = await dbService.getAll<AuthUser>('auth_users');
          setHasLocalUsers(users.length > 0);
          if (users.length === 0 && isSupabaseConfigured) setMode('register');
      };
      checkUsers();
  }, []);
  
  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
      e.preventDefault();
      if (!configKey.trim()) {
          setError("API Key is required");
          return;
      }
      saveConnectionConfig(configUrl, configKey);
      // Page will reload via saveConnectionConfig
  };

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
            setInfo('Magic link sent! Check your email.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-earth-200 dark:border-stone-800 max-h-[90vh]">
        
        <div className="h-32 bg-earth-800 dark:bg-stone-950 relative overflow-hidden flex items-center justify-center flex-shrink-0">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40"></div>
           <h2 className="text-3xl font-serif font-bold text-white relative z-10 drop-shadow-md">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'config' ? 'Cloud Setup' : mode === 'mfa' ? '2-Step Verification' : 'Magic Link'}
           </h2>
           
           <div className="absolute top-4 right-4 z-20 flex gap-2">
               {/* Config Toggle */}
               {mode !== 'config' && (
                   <button onClick={() => setMode('config')} className="text-white/70 hover:text-white transition-colors" title="Connection Settings">
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
           {mode === 'config' ? (
               <form onSubmit={handleSaveConfig} className="space-y-4">
                   <div className="p-4 bg-amber-50 text-amber-900 text-sm rounded-lg border border-amber-200 mb-4 flex items-start gap-3">
                       <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                       <div>
                           <strong>Persist your Connection:</strong>
                           <p className="mt-1 text-xs">Entering your key here saves it to your browser. This ensures you stay connected even when the application code updates.</p>
                       </div>
                   </div>
                   <Input 
                       label="Supabase URL" 
                       value={configUrl} 
                       onChange={e => setConfigUrl(e.target.value)} 
                       placeholder="https://..." 
                   />
                   <Input 
                       label="Supabase Anon Key" 
                       value={configKey} 
                       onChange={e => setConfigKey(e.target.value)} 
                       placeholder="eyJh..." 
                       type="password"
                   />
                   <div className="flex gap-2 pt-2">
                       {isSupabaseConfigured && (
                           <Button type="button" variant="ghost" onClick={() => setMode('login')}>Cancel</Button>
                       )}
                       <Button type="submit" icon={<Link size={16}/>}>Save & Connect</Button>
                   </div>
               </form>
           ) : (
               <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
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
           )}

           {mode !== 'mfa' && mode !== 'config' && (
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
           
           {!isSupabaseConfigured && mode !== 'config' && (
               <div className="mt-4 flex justify-center">
                   <button 
                       onClick={() => setMode('config')} 
                       className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-amber-100"
                   >
                       ⚠️ Setup Cloud Connection
                   </button>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
