
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Mail, Lock, ArrowRight, AlertTriangle, Cloud, User, Phone, PlusCircle } from 'lucide-react';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { isSupabaseConfigured } from '../../services/supabaseClient';
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
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'mfa' ? '2-Step Verification' : 'Magic Link'}
           </h2>
           
           <div className="absolute top-4 right-4 z-20 flex gap-2">
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
           {/* STATUS INDICATORS */}
           {isSupabaseConfigured ? (
               <div className="mb-6 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-center gap-2">
                   <Cloud size={16} className="text-green-600 dark:text-green-400" />
                   <span className="text-xs font-bold text-green-800 dark:text-green-200">Cloud Connected</span>
               </div>
           ) : (
               <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col gap-2 items-center text-center">
                   <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm">
                       <AlertTriangle size={16} /> Backend Not Configured
                   </div>
                   <p className="text-xs text-red-600 dark:text-red-400">
                       Please set the API Key in <code>services/supabaseClient.ts</code>
                   </p>
               </div>
           )}

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
           
           {!isSupabaseConfigured && hasLocalUsers === false && mode === 'login' && (
               <div className="mt-4 p-3 bg-leaf-50 dark:bg-leaf-900/10 border border-leaf-200 dark:border-leaf-800 rounded-xl text-center">
                   <p className="text-xs text-leaf-800 dark:text-leaf-200 mb-2">No local users found.</p>
                   <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => setMode('register')} icon={<PlusCircle size={14}/>}>
                       Create Offline Admin
                   </Button>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
