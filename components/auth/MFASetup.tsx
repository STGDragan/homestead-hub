
import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, Check } from 'lucide-react';

interface MFASetupProps {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ userId, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const startSetup = async () => {
      const s = await authService.enableMfa(userId, 'totp');
      setSecret(s);
      setStep(2);
  };

  const verify = async () => {
      if (code.length !== 6) return;
      await authService.confirmMfa(userId, code);
      onComplete();
  };

  return (
    <div className="bg-earth-50 dark:bg-stone-800 p-6 rounded-xl border border-earth-200 dark:border-stone-700">
        <h3 className="font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2 mb-4">
            <Shield size={20} className="text-leaf-600" /> Setup Two-Factor Auth
        </h3>

        {step === 1 && (
            <div className="text-sm text-earth-600 dark:text-stone-300 space-y-4">
                <p>Protect your homestead with an extra layer of security. We recommend using Google Authenticator or Authy.</p>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button onClick={startSetup}>Start Setup</Button>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg text-center border border-earth-200">
                    {/* Mock QR */}
                    <div className="w-32 h-32 bg-earth-200 mx-auto mb-2 flex items-center justify-center text-xs text-earth-500">[QR CODE PLACEHOLDER]</div>
                    <p className="font-mono text-xs font-bold text-earth-700">{secret}</p>
                </div>
                
                <Input 
                    label="Enter 6-digit code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                />
                
                <Button className="w-full" onClick={verify} disabled={code.length !== 6}>Verify & Enable</Button>
            </div>
        )}
    </div>
  );
};
