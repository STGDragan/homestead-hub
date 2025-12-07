
import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth';
import { AuthUser } from '../../types';
import { DeviceManager } from '../../components/auth/DeviceManager';
import { MFASetup } from '../../components/auth/MFASetup';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Lock, Smartphone, Shield, AlertTriangle } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  const handleDisableMfa = async () => {
      if (confirm('Disable Two-Factor Authentication? This makes your account less secure.')) {
          if (user) {
              await authService.disableMfa(user.id);
              setUser({ ...user, mfaEnabled: false });
          }
      }
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
        <h2 className="text-xl font-bold font-serif text-earth-900 dark:text-earth-100 flex items-center gap-2">
            <Lock className="text-leaf-600" /> Security & Login
        </h2>

        {/* MFA Section */}
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Shield size={20} className={user.mfaEnabled ? "text-green-600" : "text-earth-400"} />
                        Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-earth-600 dark:text-stone-300 mt-1">
                        {user.mfaEnabled ? "Your account is protected with 2FA." : "Add an extra layer of security to your account."}
                    </p>
                </div>
                {user.mfaEnabled ? (
                    <Button variant="outline" className="text-red-600 border-red-200" onClick={handleDisableMfa}>Disable</Button>
                ) : (
                    !showMfaSetup && <Button onClick={() => setShowMfaSetup(true)}>Enable 2FA</Button>
                )}
            </div>

            {showMfaSetup && (
                <MFASetup 
                    userId={user.id} 
                    onComplete={() => { setShowMfaSetup(false); setUser({ ...user, mfaEnabled: true }); }}
                    onCancel={() => setShowMfaSetup(false)}
                />
            )}
        </Card>

        {/* Sessions Section */}
        <Card>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Smartphone size={20} className="text-blue-600" /> Active Sessions
            </h3>
            <DeviceManager />
        </Card>

        {/* Password Section */}
        <Card className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Password</h3>
                    <p className="text-sm text-earth-600">Last changed: {new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
                <Button variant="secondary">Change Password</Button>
            </div>
        </Card>
    </div>
  );
};
