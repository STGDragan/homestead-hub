
import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { Card } from '../ui/Card';
import { Lock, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showBanner?: boolean; // If true, shows a "Upgrade to Access" banner instead of just null
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback, showBanner = true }) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
        // Assume 'main_user' for context in this single-user-per-device PWA
        const access = await subscriptionService.canAccess('main_user', feature);
        setHasAccess(access);
    };
    check();
  }, [feature]);

  if (hasAccess === null) return null; // Loading state

  if (hasAccess) {
      return <>{children}</>;
  }

  if (fallback) {
      return <>{fallback}</>;
  }

  if (showBanner) {
      return (
          <Card className="bg-earth-50 dark:bg-stone-900 border border-earth-200 dark:border-stone-800 text-center py-8">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-earth-900 dark:text-earth-100 mb-2">
                  Feature Locked
              </h3>
              <p className="text-earth-600 dark:text-stone-400 text-sm max-w-xs mx-auto mb-6">
                  This feature is available on the <strong>Pro</strong> plan. Upgrade to unlock advanced tools.
              </p>
              <Button onClick={() => navigate('/settings')} icon={<Crown size={16} />}>
                  View Plans
              </Button>
          </Card>
      );
  }

  return null;
};
