
import React, { useState, useEffect } from 'react';
import { AuthUser, UserProfile, UserRole, SubscriptionPlan } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { subscriptionService } from '../../services/subscriptionService';
import { X, Shield, CreditCard, User } from 'lucide-react';

interface UserEditModalProps {
  user: AuthUser & { profile?: UserProfile };
  onSave: (updatedUser: Partial<AuthUser>, planId?: string) => void;
  onClose: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onSave, onClose }) => {
  const [role, setRole] = useState<UserRole>(user.roles[0] || 'user');
  const [status, setStatus] = useState<'active' | 'suspended'>(user.status);
  const [planId, setPlanId] = useState<string>('');
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
        const plans = await subscriptionService.getPlans();
        setAvailablePlans(plans);
        // Try to find current plan from profile
        if (user.profile?.subscriptionId) {
            const sub = await subscriptionService.getActiveSubscription(user.id);
            if (sub) setPlanId(sub.planId);
        }
    };
    loadPlans();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        id: user.id,
        roles: [role],
        status
    }, planId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <User className="text-leaf-600" /> Manage User
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <div className="mb-6 p-4 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
            <p className="text-sm font-bold text-earth-900 dark:text-earth-100">{user.email}</p>
            <p className="text-xs text-earth-500">{user.profile?.name || 'No Profile'}</p>
            <p className="text-xs text-earth-400 mt-1">ID: {user.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           <div className="grid grid-cols-2 gap-4">
               <Select 
                  label="System Role"
                  icon={<Shield size={14}/>}
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
               >
                  <option value="user">User</option>
                  <option value="contributor">Contributor</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
               </Select>

               <Select
                  label="Account Status"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
               >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
               </Select>
           </div>

           <Select
              label="Subscription Plan"
              icon={<CreditCard size={14}/>}
              value={planId}
              onChange={e => setPlanId(e.target.value)}
           >
              <option value="">No Active Plan</option>
              {availablePlans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.billingInterval})</option>
              ))}
           </Select>

           <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
