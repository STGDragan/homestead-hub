
import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, Subscription } from '../../types';
import { PlanCard } from '../../components/subscription/PlanCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CreditCard, Gift } from 'lucide-react';

export const BillingTab: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allPlans = await subscriptionService.getPlans();
    setPlans(allPlans);
    
    const sub = await subscriptionService.getActiveSubscription('main_user');
    setActiveSub(sub);
    
    if (sub) {
        setActivePlan(allPlans.find(p => p.id === sub.planId) || null);
    } else {
        // Implicitly free
        setActivePlan(allPlans.find(p => p.slug === 'free') || null);
    }
  };

  const handleSubscribe = async (planId: string) => {
      try {
          await subscriptionService.subscribe('main_user', planId);
          await loadData();
          alert("Subscription Updated!");
      } catch (e) {
          console.error(e);
          alert("Failed to update subscription");
      }
  };

  const handleRedeem = async () => {
      try {
          await subscriptionService.redeemTrial('main_user', promoCode);
          await loadData();
          alert("Code Redeemed Successfully!");
          setPromoCode('');
      } catch (e: any) {
          alert(`Error: ${e.message}`);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
        
        {/* Status Card */}
        <div className="bg-earth-50 dark:bg-stone-800 p-6 rounded-2xl border border-earth-200 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                    <CreditCard size={20} className="text-leaf-600" /> Current Subscription
                </h2>
                <p className="text-earth-600 dark:text-stone-400 mt-1">
                    You are currently on the <strong>{activePlan?.name || 'Free Tier'}</strong>.
                </p>
                {activeSub && (
                    <p className="text-xs text-earth-500 mt-2">
                        Status: <span className="uppercase font-bold text-green-600">{activeSub.status}</span> • Expires: {new Date(activeSub.endDate).toLocaleDateString()}
                    </p>
                )}
            </div>
            
            {/* Promo Code Input */}
            <div className="flex gap-2 items-center w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                    <Input 
                        placeholder="Promo Code" 
                        value={promoCode} 
                        onChange={e => setPromoCode(e.target.value)}
                        className="pr-2"
                    />
                </div>
                <Button onClick={handleRedeem} size="sm" variant="secondary" icon={<Gift size={16}/>}>Redeem</Button>
            </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
                <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    isCurrent={activePlan?.id === plan.id}
                    onSelect={handleSubscribe}
                />
            ))}
        </div>

        <div className="text-center text-xs text-earth-400 pt-8 border-t border-earth-100 dark:border-stone-800">
            Payments processed securely. You can cancel anytime from this dashboard.
        </div>
    </div>
  );
};
