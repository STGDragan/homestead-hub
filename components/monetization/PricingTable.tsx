
import React from 'react';
import { DEFAULT_PLANS as PLANS, billingService } from '../../services/billingService';
import { Button } from '../ui/Button';
import { Check, Star } from 'lucide-react';

interface PricingTableProps {
  currentPlanId?: string;
}

export const PricingTable: React.FC<PricingTableProps> = ({ currentPlanId }) => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
       {PLANS.map(plan => {
           const isCurrent = currentPlanId === plan.id;
           const isPro = plan.slug === 'pro';
           
           return (
               <div 
                  key={plan.id}
                  className={`
                    relative rounded-2xl p-6 border-2 flex flex-col
                    ${isCurrent ? 'border-leaf-600 bg-leaf-50 dark:bg-leaf-900/10' : 'border-earth-200 dark:border-stone-800 bg-white dark:bg-stone-900'}
                    ${isPro && !isCurrent ? 'border-amber-400 shadow-lg scale-105 z-10' : ''}
                  `}
               >
                  {isPro && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Most Popular</div>}
                  
                  <div className="mb-4">
                      <h3 className="font-serif font-bold text-lg text-earth-900 dark:text-earth-100">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold text-earth-800 dark:text-white">${plan.priceCents / 100}</span>
                          <span className="text-earth-500 text-sm">/mo</span>
                      </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-earth-600 dark:text-stone-300">
                              <Check size={16} className="text-leaf-600 mt-0.5 shrink-0" />
                              {feat}
                          </li>
                      ))}
                  </ul>

                  <Button 
                    variant={isCurrent ? 'outline' : isPro ? 'primary' : 'secondary'}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => billingService.subscribe('main_user', plan.id)}
                  >
                      {isCurrent ? 'Current Plan' : plan.priceCents === 0 ? 'Downgrade' : 'Subscribe'}
                  </Button>
               </div>
           );
       })}
    </div>
  );
};
