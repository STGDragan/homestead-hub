import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Mail, Lock, ArrowRight, User, Phone, Settings, Link, AlertTriangle, Cloud, CloudOff } from 'lucide-react';
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
  const [mode, setMode] = useState<'login' | 'register' | 'magic' | 'mfa' | 'config'>(
      !isSupabaseConfigured ? 'config' : 'login'
  );
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [configUrl, setConfigUrl] = useState(localStorage.getItem('homestead_supabase_url') || 'https://psrofmaojlttfyrsarrc.supabase.co');
  const [configKey, setConfigKey] = useState(localStorage.getItem('homestead_supabase_key') || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [hasLocalUsers, setHasLocalUsers] = useState(false);
  
  useEffect(() => {
      const checkUsers = async () => {
          const users = await dbService.getAll<AuthUser>('auth_users');
          setHasLocalUsers(users.length > 0);
          // If configured and no users, default to register
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
  };

  const handleSkipConfig = () => {
      // Bypass config screen, go to registration (or login if users exist)
      setMode(hasLocalUsers ? 'login' : 'register');
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

  // Header Title Logic
  const getTitle = () => {
      switch(mode) {
          case 'login': return 'Welcome Back';
          case 'register': return 'Join the Farm';
          case 'config': return 'Cloud Setup';
          case 'mfa': return 'Verify Identity';
          case 'magic': return 'Magic Link';
          default: return 'Homestead Hub';
      }
  };

  return (
    <div 
        style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        style={{
            width: '100%', maxWidth: '450px', maxHeight: '90vh',
            backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-earth-200 dark:border-stone-800 max-h-[90vh]"
      >
        
        {/* Header with visual fallback */}
        <div 
            className="h-32 bg-earth-800 dark:bg-stone-950 relative overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
                height: '140px',
                background: 'linear-gradient(to bottom right, #5c412f, #4d3628)',
                position: 'relative'
            }}
        >
           {/* Fallback Image Overlay */}
           <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0.4
                }}
           ></div>
           
           <div className="relative z-10 text-center p-4">
               {mode === 'config' ? (
                   <div className="flex flex-col items-center">
                       <Cloud size={48} className="text-blue-300 mx-auto mb-2 opacity-90" />
                       <h2 className="text-2xl font-bold text-white">Setup Connection</h2>
                   </div>
               ) : (
                   <h2 className="text-3xl font-serif font-bold text-white drop-shadow-md tracking-tight">
                      {getTitle()}
                   </h2>
               )}
           </div>
           
           <div className="absolute top-4 right-4 z-20 flex gap-2" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
               {mode !== 'config' && (
                   <button onClick={() => setMode('config')} className="text-white/70 hover:text-white transition-colors" title="Connection Settings">
                       <Settings size={20} color="white" />
                   </button>
               )}
               {canClose && (
                   <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                      <X size={24} color="white" />
                   </button>
               )}
           </div>
        </div>

        <div className="p-8 overflow-y-auto bg-white dark:bg-stone-900 flex-1" style={{ padding: '2rem' }}>
           {mode === 'config' ? (
               <div className="space-y-4">
                   <div 
                        className="p-4 bg-amber-50 text-amber-900 text-sm rounded-lg border border-amber-200 mb-4 flex items-start gap-3"
                        style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#92400e', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}
                   >
                       <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                       <div>
                           <strong>Cloud Connection Required for Sync</strong>
                           <p className="mt-1 text-xs text-amber-800">
                               Enter Supabase details to sync across devices. You can skip this to work offline.
                           </p>
                       </div>
                   </div>
                   
                   <form onSubmit={handleSaveConfig} className="space-y-4">
                       <Input 
                           label="Supabase URL" 
                           value={configUrl} 
                           onChange={e => setConfigUrl(e.target.value)} 
                           placeholder="https://..." 
                           className="bg-white"
                       />
                       <Input 
                           label="Supabase Anon Key" 
                           value={configKey} 
                           onChange={e => setConfigKey(e.target.value)} 
                           placeholder="eyJh..." 
                           type="password"
                           className="bg-white"
                       />
                       {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
                       <Button type="submit" icon={<Link size={16}/>} className="w-full">Save & Connect</Button>
                   </form>

                   <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-earth-200"></div>
                        <span className="flex-shrink-0 mx-4 text-earth-400 text-xs font-bold uppercase">Or</span>
                        <div className="flex-grow border-t border-earth-200"></div>
                   </div>

                   <Button 
                        type="button" 
                        variant="secondary" 
                        className="w-full"
                        onClick={handleSkipConfig}
                        icon={<CloudOff size={16} />}
                   >
                       Continue Offline (Demo Mode)
                   </Button>
               </div>
           ) : (
               <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                      <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem' }}>
                          {error}
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

                        {mode !== 'magic' && (
                            <>
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
                            </>
                        )}
                        {mode === 'magic' && (
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
                                autoFocus
                            />
                        )}
                      </>
                  )}

                  {mode === 'login' && (
                      <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-earth-600 dark:text-stone-400 select-none">
                              <input 
                                  type="checkbox" 
                                  checked={rememberMe} 
                                  onChange={e => setRememberMe(e.target.checked)}
                                  className="w-4 h-4 rounded text-leaf-600 focus:ring-leaf-500 bg-white dark:bg-stone-800 border-earth-300 dark:border-stone-700"
                              />
                              Remember Me
                          </label>
                          <button type="button" onClick={() => setMode('magic')} className="text-xs text-leaf-600 hover:underline" style={{ color: '#16a34a' }}>
                              Forgot Password?
                          </button>
                      </div>
                  )}

                  <div style={{ marginTop: '1rem' }}>
                    <Button className="w-full py-3" disabled={loading} size="lg">
                        {loading ? 'Processing...' : 'Continue'}
                        {!loading && <ArrowRight size={18} />}
                    </Button>
                  </div>

                  {mode === 'login' && (
                      <div className="text-center mt-2">
                          <button type="button" onClick={() => setMode('magic')} className="text-xs text-earth-500 hover:text-leaf-600 transition-colors">
                              Or sign in with Magic Link
                          </button>
                      </div>
                  )}
               </form>
           )}

           {mode !== 'mfa' && mode !== 'config' && (
               <div className="mt-6 text-center text-sm text-earth-600 dark:text-stone-400" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                     onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                     className="font-bold text-leaf-700 hover:underline"
                     style={{ color: '#15803d', fontWeight: 'bold' }}
                  >
                     {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
               </div>
           )}
           
           {!isSupabaseConfigured && mode !== 'config' && (
               <div className="mt-4 flex justify-center" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                   <button 
                       onClick={() => setMode('config')} 
                       className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-amber-100"
                       style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none', cursor: 'pointer' }}
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