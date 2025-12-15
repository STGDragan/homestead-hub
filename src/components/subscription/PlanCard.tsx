
import React from 'react';
import { SubscriptionPlan } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, Star, Edit2 } from 'lucide-react';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrent?: boolean;
  onSelect?: (planId: string) => void;
  onEdit?: (plan: SubscriptionPlan) => void;
  isAdmin?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrent, onSelect, onEdit, isAdmin }) => {
  const isPro = plan.slug === 'pro';

  return (
    <div 
        className={`
        relative rounded-2xl p-6 border-2 flex flex-col transition-all
        ${isCurrent ? 'border-leaf-600 bg-leaf-50 dark:bg-leaf-900/10' : 'border-earth-200 dark:border-stone-800 bg-white dark:bg-stone-900'}
        ${isPro && !isCurrent ? 'border-amber-400 shadow-lg z-10' : ''}
        `}
    >
        {isPro && !isAdmin && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Most Popular</div>}
        
        <div className="mb-4">
            <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-lg text-earth-900 dark:text-earth-100">{plan.name}</h3>
                {isAdmin && (
                    <button onClick={() => onEdit && onEdit(plan)} className="text-earth-400 hover:text-earth-600">
                        <Edit2 size={16} />
                    </button>
                )}
            </div>
            <p className="text-xs text-earth-500 mb-2">{plan.description}</p>
            <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-earth-800 dark:text-white">${(plan.priceCents || 0) / 100}</span>
                <span className="text-earth-500 text-sm">/{plan.billingInterval}</span>
            </div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
            {(plan.features || []).map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-earth-600 dark:text-stone-300">
                    <Check size={16} className="text-leaf-600 mt-0.5 shrink-0" />
                    <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                </li>
            ))}
        </ul>

        {onSelect && (
            <Button 
                variant={isCurrent ? 'outline' : isPro ? 'primary' : 'secondary'}
                className="w-full"
                disabled={isCurrent}
                onClick={() => onSelect(plan.id)}
            >
                {isCurrent ? 'Current Plan' : plan.priceCents === 0 ? 'Downgrade' : 'Subscribe'}
            </Button>
        )}
    </div>
  );
};
