
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Mail, Lock, ArrowRight, Github, Smartphone } from 'lucide-react';
import { authService } from '../../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'magic' | 'mfa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [userId, setUserId] = useState(''); // For MFA step
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await authService.login(email, password);
        if (res.success) {
            if (res.mfaRequired && res.userId) {
                setUserId(res.userId);
                setMode('mfa');
            } else {
                onSuccess();
                onClose();
            }
        } else {
            setError(res.error || 'Login failed');
        }
      } else if (mode === 'register') {
        const res = await authService.register(email, password);
        if (res.success) {
            onSuccess();
            onClose();
        } else {
            setError(res.error || 'Registration failed');
        }
      } else if (mode === 'magic') {
        const res = await authService.magicLinkLogin(email);
        if (res.success) {
            setInfo('Magic link sent! Check your email (or wait for auto-login demo).');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } else {
            setError('User not found.');
        }
      } else if (mode === 'mfa') {
          const res = await authService.verifyMfa(userId, mfaCode);
          if (res.success) {
              onSuccess();
              onClose();
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
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-earth-200 dark:border-stone-800">
        
        <div className="h-32 bg-earth-800 dark:bg-stone-950 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40"></div>
           <h2 className="text-3xl font-serif font-bold text-white relative z-10 drop-shadow-md">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join the Hub' : mode === 'mfa' ? '2-Step Verification' : 'Magic Link'}
           </h2>
           <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20"
           >
              <X size={24} />
           </button>
        </div>

        <div className="p-8">
           <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              {info && <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">{info}</div>}

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
                      />
                  </div>
              ) : (
                  <>
                    <Input 
                        label="Email Address"
                        type="email"
                        icon={<Mail size={18} />}
                        placeholder="farmer@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoFocus
                    />

                    {mode !== 'magic' && (
                        <Input 
                            label="Password"
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    )}
                  </>
              )}

              <Button className="w-full py-3 mt-2" disabled={loading}>
                 {loading ? 'Processing...' : 'Continue'}
                 {!loading && <ArrowRight size={18} />}
              </Button>

              {mode === 'login' && (
                  <div className="text-center">
                      <button type="button" onClick={() => setMode('magic')} className="text-xs text-leaf-600 hover:underline">
                          Use Magic Link instead
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
        </div>
      </div>
    </div>
  );
};
