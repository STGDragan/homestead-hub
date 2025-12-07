
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { AuthUser, UserProfile } from '../../types';
import { authService } from '../../services/auth';
import { Button } from '../../components/ui/Button';
import { Search, UserCog, Ban, Key } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<(AuthUser & { profile?: UserProfile })[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState('');

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

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">User Management</h3>
            <div className="relative">
                <input 
                    placeholder="Search users..." 
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
                    {users.map(u => (
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
                                <Button size="sm" variant="ghost" onClick={() => handleImpersonate(u.id)} title="Impersonate">
                                    <Key size={14} />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500" title="Suspend">
                                    <Ban size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
