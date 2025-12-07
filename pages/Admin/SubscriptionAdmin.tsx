
import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, TrialCode } from '../../types';
import { PlanCard } from '../../components/subscription/PlanCard';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Plus, Tag, RefreshCw } from 'lucide-react';

export const SubscriptionAdmin: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [codes, setCodes] = useState<TrialCode[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const p = await subscriptionService.getAdminPlans();
    // Assuming we implement getCodes in service later, for now we skip or mock
    setPlans(p);
    setLoading(false);
  };

  const handleCreateCode = async (planId: string) => {
      const code = await subscriptionService.generateTrialCode(planId, 14, 10);
      alert(`Created Trial Code: ${code} (14 days, 10 uses)`);
      // Reload codes if we had a list
  };

  const handleSavePlan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingPlan) return;
      await subscriptionService.savePlan(editingPlan);
      setEditingPlan(null);
      loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-serif text-earth-900 dark:text-earth-100">Subscription Plans</h2>
            <Button onClick={loadData} variant="ghost" icon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}>Refresh</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
                <div key={plan.id} className="flex flex-col gap-2">
                    <PlanCard plan={plan} isAdmin onEdit={setEditingPlan} />
                    <Button size="sm" variant="outline" icon={<Tag size={14}/>} onClick={() => handleCreateCode(plan.id)}>Generate Promo</Button>
                </div>
            ))}
        </div>

        {editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 w-full max-w-lg border border-earth-200 dark:border-stone-800">
                    <h3 className="font-bold text-lg mb-4">Edit Plan: {editingPlan.name}</h3>
                    <form onSubmit={handleSavePlan} className="space-y-4">
                        <Input 
                            label="Name" 
                            value={editingPlan.name} 
                            onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Price (Cents)" 
                                type="number" 
                                value={editingPlan.priceCents} 
                                onChange={e => setEditingPlan({...editingPlan, priceCents: parseInt(e.target.value)})} 
                            />
                            <Input 
                                label="Duration (Days)" 
                                type="number" 
                                value={editingPlan.durationDays} 
                                onChange={e => setEditingPlan({...editingPlan, durationDays: parseInt(e.target.value)})} 
                            />
                        </div>
                        <TextArea 
                            label="Features (comma separated)" 
                            value={editingPlan.features.join(', ')} 
                            onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(s => s.trim())})} 
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setEditingPlan(null)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
