
import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, TrialCode } from '../../types';
import { PlanCard } from '../../components/subscription/PlanCard';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Tag, RefreshCw, Trash2, CheckCircle, XCircle, Gift, Copy, Calendar, BarChart } from 'lucide-react';

export const SubscriptionAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'codes'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [codes, setCodes] = useState<TrialCode[]>([]);
  const [loading, setLoading] = useState(false);

  // Editors
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCodeForm, setShowCodeForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const p = await subscriptionService.getAdminPlans();
        const c = await subscriptionService.getAllCodes();
        setPlans(p);
        setCodes(c.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
        console.error("Failed to load data", e);
    } finally {
        setLoading(false);
    }
  };

  // --- PLAN HANDLERS ---

  const handleCreatePlan = () => {
      setEditingPlan({
          id: `plan_${Date.now()}`,
          name: '',
          slug: '',
          description: '',
          priceCents: 0,
          currency: 'usd',
          billingInterval: 'month',
          durationDays: 30,
          features: [],
          isTrialAllowed: false,
          trialDays: 0,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingPlan) return;
      await subscriptionService.savePlan(editingPlan);
      setEditingPlan(null);
      loadData();
  };

  const handleDeletePlan = async (id: string) => {
      if (confirm('Are you sure? Users on this plan may lose access.')) {
          await subscriptionService.deletePlan(id);
          loadData();
          setEditingPlan(null);
      }
  };

  // --- CODE HANDLERS ---

  const handleDeleteCode = async (id: string) => {
      if (confirm('Delete this code? It will no longer be redeemable.')) {
          await subscriptionService.deleteCode(id);
          loadData();
      }
  };

  const copyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      alert(`Copied ${code} to clipboard`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                    <Tag className="text-leaf-600" /> Billing & Promotions
                </h1>
                <p className="text-earth-600 dark:text-stone-400">Manage subscription tiers and discount campaigns.</p>
            </div>
            <Button onClick={loadData} variant="ghost" icon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}>
                Refresh
            </Button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800">
            <button 
                onClick={() => setActiveTab('plans')}
                className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'plans' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
            >
                Subscription Plans
            </button>
            <button 
                onClick={() => setActiveTab('codes')}
                className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'codes' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
            >
                Discount Codes
            </button>
        </div>

        {/* PLANS VIEW */}
        {activeTab === 'plans' && (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button onClick={handleCreatePlan} icon={<Plus size={16} />}>Create New Plan</Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="relative group">
                            <PlanCard plan={plan} isAdmin onEdit={setEditingPlan} />
                            {!plan.isActive && (
                                <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase border border-red-200">
                                    Archived
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* CODES VIEW */}
        {activeTab === 'codes' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="bg-earth-100 dark:bg-stone-800 px-3 py-1 rounded-lg text-sm">
                            <strong>{codes.length}</strong> Active Codes
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-lg text-sm">
                            <strong>{codes.reduce((acc, c) => acc + c.usageCount, 0)}</strong> Redemptions
                        </div>
                    </div>
                    <Button onClick={() => setShowCodeForm(true)} icon={<Plus size={16} />}>Create Promotion</Button>
                </div>

                <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Code / Campaign</th>
                                <th className="px-4 py-3">Target Plan</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Usage</th>
                                <th className="px-4 py-3">Expires</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                            {codes.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-earth-400 italic">No discount codes active. Create one to get started.</td></tr>
                            ) : codes.map(code => {
                                const planName = plans.find(p => p.id === code.planId)?.name || 'Unknown Plan';
                                const percentUsed = Math.min(100, (code.usageCount / code.usageLimit) * 100);
                                const isExpired = code.expirationDate < Date.now() || code.usageCount >= code.usageLimit;

                                return (
                                    <tr key={code.id} className="hover:bg-earth-50 dark:hover:bg-stone-800/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-earth-900 dark:text-earth-100 bg-earth-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-earth-200 dark:border-stone-700">
                                                    {code.code}
                                                </span>
                                                <button onClick={() => copyCode(code.code)} className="text-earth-400 hover:text-earth-600"><Copy size={12} /></button>
                                            </div>
                                            {code.campaign && <p className="text-xs text-earth-500 mt-1">{code.campaign}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-earth-700 dark:text-stone-300">
                                            {planName}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                {code.durationDays} Days Free
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 w-32">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>{code.usageCount} / {code.usageLimit}</span>
                                            </div>
                                            <div className="w-full bg-earth-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percentUsed}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-earth-500">
                                            {new Date(code.expirationDate).toLocaleDateString()}
                                            {isExpired && <span className="ml-2 text-red-500 font-bold">Expired</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteCode(code.id)} className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- PLAN EDITOR MODAL --- */}
        {editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 w-full max-w-lg border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">
                            {editingPlan.createdAt > Date.now() - 10000 ? 'Create Plan' : `Edit: ${editingPlan.name}`}
                        </h3>
                        <button onClick={() => setEditingPlan(null)} className="text-earth-400 hover:text-earth-600"><XCircle size={24} /></button>
                    </div>
                    
                    <form onSubmit={handleSavePlan} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Plan Name" 
                                value={editingPlan.name} 
                                onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} 
                                placeholder="e.g. Starter"
                                required
                            />
                            <Input 
                                label="Slug (ID)" 
                                value={editingPlan.slug} 
                                onChange={e => setEditingPlan({...editingPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '_')})} 
                                placeholder="e.g. starter_monthly"
                                required
                            />
                        </div>

                        <TextArea 
                            label="Description" 
                            value={editingPlan.description} 
                            onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} 
                            placeholder="Brief summary shown on pricing card..."
                        />

                        <div className="grid grid-cols-2 gap-4 bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-100 dark:border-stone-700">
                            <Input 
                                label="Price ($)" 
                                type="number" 
                                step="0.01"
                                value={(editingPlan.priceCents || 0) / 100} 
                                onChange={e => setEditingPlan({...editingPlan, priceCents: Math.round(parseFloat(e.target.value) * 100)})} 
                            />
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-earth-500 dark:text-earth-400 uppercase">Billing Cycle</label>
                                <select 
                                    className="w-full bg-white dark:bg-stone-900 border border-earth-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm text-earth-900 dark:text-earth-100 focus:ring-2 focus:ring-leaf-500 outline-none"
                                    value={editingPlan.billingInterval}
                                    onChange={e => setEditingPlan({...editingPlan, billingInterval: e.target.value as any})}
                                >
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                    <option value="one_time">One Time</option>
                                </select>
                            </div>
                            <Input 
                                label="Duration (Days)" 
                                type="number" 
                                value={editingPlan.durationDays} 
                                onChange={e => setEditingPlan({...editingPlan, durationDays: parseInt(e.target.value) || 30})} 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-earth-800 dark:text-earth-200">
                                <input 
                                    type="checkbox" 
                                    checked={editingPlan.isTrialAllowed} 
                                    onChange={e => setEditingPlan({...editingPlan, isTrialAllowed: e.target.checked})}
                                    className="rounded text-leaf-600 focus:ring-leaf-500 bg-white dark:bg-stone-800 border-earth-300 dark:border-stone-700"
                                />
                                Allow Free Trial?
                            </label>
                            {editingPlan.isTrialAllowed && (
                                <Input 
                                    label="Trial Days" 
                                    type="number" 
                                    value={editingPlan.trialDays} 
                                    onChange={e => setEditingPlan({...editingPlan, trialDays: parseInt(e.target.value) || 0})} 
                                />
                            )}
                        </div>

                        <TextArea 
                            label="Features (comma separated keys)" 
                            value={(editingPlan.features || []).join(', ')} 
                            onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(s => s.trim())})} 
                            placeholder="ai_agents, advanced_reports, ..."
                        />

                        <div className="flex items-center gap-2 border-t border-earth-100 dark:border-stone-800 pt-4">
                            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer text-earth-800 dark:text-earth-200">
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${editingPlan.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${editingPlan.isActive ? 'translate-x-4' : ''}`} />
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={editingPlan.isActive} 
                                    onChange={e => setEditingPlan({...editingPlan, isActive: e.target.checked})}
                                    className="hidden"
                                />
                                {editingPlan.isActive ? 'Active Plan' : 'Archived / Inactive'}
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setEditingPlan(null)}>Cancel</Button>
                            <Button type="submit">Save Plan</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- PROMO CODE MODAL --- */}
        {showCodeForm && (
            <PromoCodeModal 
                plans={plans} 
                onClose={() => setShowCodeForm(false)} 
                onRefresh={loadData}
            />
        )}
    </div>
  );
};

// Sub-component for Promo Code Form
const PromoCodeModal: React.FC<{ plans: SubscriptionPlan[], onClose: () => void, onRefresh: () => void }> = ({ plans, onClose, onRefresh }) => {
    const [campaign, setCampaign] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [planId, setPlanId] = useState(plans[0]?.id || '');
    const [duration, setDuration] = useState('30');
    const [limit, setLimit] = useState('100');
    const [isCustom, setIsCustom] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await subscriptionService.createPromoCode(
                planId,
                isCustom ? customCode.toUpperCase() : null,
                campaign,
                parseInt(duration),
                parseInt(limit)
            );
            onRefresh();
            onClose();
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 w-full max-w-md border border-earth-200 dark:border-stone-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Gift size={20} className="text-leaf-600"/> Create Promotion
                    </h3>
                    <button onClick={onClose}><XCircle size={24} className="text-earth-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Campaign Name"
                        value={campaign}
                        onChange={e => setCampaign(e.target.value)}
                        placeholder="e.g. Spring Sale 2024"
                        required
                        autoFocus
                    />

                    <div>
                        <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Promo Code String</label>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => setIsCustom(false)} 
                                className={`flex-1 py-2 text-xs font-bold rounded border ${!isCustom ? 'bg-leaf-100 text-leaf-800 border-leaf-500' : 'border-earth-200 dark:border-stone-700 text-earth-500'}`}
                            >
                                Auto-Generate
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsCustom(true)} 
                                className={`flex-1 py-2 text-xs font-bold rounded border ${isCustom ? 'bg-leaf-100 text-leaf-800 border-leaf-500' : 'border-earth-200 dark:border-stone-700 text-earth-500'}`}
                            >
                                Custom Code
                            </button>
                        </div>
                        {isCustom && (
                            <div className="mt-2">
                                <Input 
                                    value={customCode}
                                    onChange={e => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                                    placeholder="e.g. SAVE20"
                                    className="font-mono uppercase"
                                />
                            </div>
                        )}
                    </div>

                    <Select 
                        label="Target Plan" 
                        value={planId} 
                        onChange={e => setPlanId(e.target.value)}
                    >
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.priceCents/100})</option>)}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Free Duration (Days)" 
                            type="number"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                        <Input 
                            label="Usage Limit" 
                            type="number"
                            value={limit}
                            onChange={e => setLimit(e.target.value)}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Create Code</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
