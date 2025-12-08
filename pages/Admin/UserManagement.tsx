
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { AuthUser, UserProfile } from '../../types';
import { authService } from '../../services/auth';
import { subscriptionService } from '../../services/subscriptionService';
import { Button } from '../../components/ui/Button';
import { UserEditModal } from '../../components/admin/UserEditModal';
import { Search, UserCog, Ban, Key, Edit } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<(AuthUser & { profile?: UserProfile })[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState<(AuthUser & { profile?: UserProfile }) | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const authUsers = await dbService.getAll<AuthUser>('auth_users');
    const profiles = await dbService.getAll<UserProfile>('user_profile');
    const currentUser = await authService.getCurrentUser();
    
    if (currentUser) setCurrentAdminId(currentUser.id);

    const merged = authUsers.map(u => ({
        ...u,
        profile: profiles.find(p => p.userId === u.id)
    }));
    setUsers(merged);
  };

  const handleImpersonate = async (userId: string) => {
      try {
          await authService.impersonateUser(currentAdminId, userId);
      } catch (e) {
          alert("Failed to impersonate");
      }
  };

  const handleSaveUser = async (updatedData: Partial<AuthUser>, planId?: string) => {
      if (!editingUser) return;

      // 1. Update Auth User
      const updatedAuth: AuthUser = { 
          ...editingUser, 
          ...updatedData, 
          updatedAt: Date.now(), 
          syncStatus: 'pending' as const 
      };
      await dbService.put('auth_users', updatedAuth);

      // 2. Update Subscription if changed
      if (planId) {
          // If different or new, subscribe them manually (bypassing payment for admin override)
          // We use subscribe() logic but it might need to handle 'admin override' implicitly or we just direct write
          // For simplicity/safety, we reuse the service which handles history logging
          const currentSub = await subscriptionService.getActiveSubscription(editingUser.id);
          if (currentSub?.planId !== planId) {
              await subscriptionService.subscribe(editingUser.id, planId);
          }
      }

      // 3. Sync role to profile for UI consistency
      if (updatedData.roles && editingUser.profile) {
          const updatedProfile = { ...editingUser.profile, role: updatedData.roles[0], updatedAt: Date.now() };
          await dbService.put('user_profile', updatedProfile);
      }

      await loadData();
      setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">User Management</h3>
            <div className="relative">
                <input 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg border border-earth-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
            </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Email / Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">2FA</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-earth-50 dark:hover:bg-stone-800/50">
                            <td className="px-4 py-3">
                                <div className="font-bold text-earth-900 dark:text-earth-100">{u.email}</div>
                                <div className="text-xs text-earth-500">{u.profile?.name}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.roles.includes('admin') ? 'bg-purple-100 text-purple-800' : 'bg-earth-100 text-earth-600'}`}>
                                    {u.roles.join(', ')}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`text-xs ${u.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                    {u.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {u.mfaEnabled ? <span className="text-green-600 font-bold text-xs">ON</span> : <span className="text-earth-400 text-xs">OFF</span>}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => setEditingUser(u)} title="Edit">
                                    <Edit size={14} />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleImpersonate(u.id)} title="Impersonate">
                                    <Key size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {editingUser && (
            <UserEditModal 
                user={editingUser} 
                onSave={handleSaveUser} 
                onClose={() => setEditingUser(null)} 
            />
        )}
    </div>
  );
};
