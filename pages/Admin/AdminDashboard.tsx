
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { AdminStat, FlaggedItem, AuthUser } from '../../types';
import { authService } from '../../services/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, Activity, DollarSign, BookOpen, Search, Check, AlertTriangle, X, Database, CreditCard, Users as UsersIcon, Megaphone, Briefcase, Leaf, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SponsorManager } from '../../components/monetization/SponsorManager';
import { CampaignManager } from './CampaignManager';
import { UserManagement } from './UserManagement';
import { SubscriptionAdmin } from './SubscriptionAdmin';
import { LibraryAdmin } from './LibraryAdmin';
import { IntegrationManager } from '../../components/admin/IntegrationManager';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'sponsors' | 'campaigns' | 'billing' | 'library' | 'integrations'>('overview');
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [flags, setFlags] = useState<FlaggedItem[]>([
     { id: 'f1', targetId: 'm1', targetType: 'listing', reason: 'Prohibited Item', reportedBy: 'u2', timestamp: Date.now() - 100000, status: 'pending' },
     { id: 'f2', targetId: 'm2', targetType: 'listing', reason: 'Spam', reportedBy: 'u5', timestamp: Date.now() - 500000, status: 'pending' }
  ]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await authService.getCurrentUser();
    setAuthUser(user);

    // In real implementation, these would come from aggregated queries
    setStats([
       { label: 'Total Users', value: 1243, change: 12, trend: 'up' },
       { label: 'MRR', value: '$4,200', change: 8, trend: 'up' },
       { label: 'Pending Reports', value: flags.length, change: 0, trend: 'neutral' },
       { label: 'Active Ads', value: 4, trend: 'neutral' }
    ]);
  };

  const handleResolveFlag = (id: string, action: 'dismiss' | 'ban') => {
     setFlags(flags.filter(f => f.id !== id));
     alert(`${action === 'dismiss' ? 'Flag Dismissed' : 'Content Removed'} - Action synced.`);
  };

  const isOwner = authService.hasRole(authUser, 'owner');
  const isAdmin = authService.hasRole(authUser, 'admin');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-3">
             <Shield className="text-leaf-700 dark:text-leaf-400" /> Admin Console
          </h1>
          <p className="text-earth-600 dark:text-stone-400">System management, monetization, and moderation.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => navigate('/admin/docs')} icon={<BookOpen size={18} />}>System Docs</Button>
           <Button variant="outline" icon={<Database size={18} />}>Logs</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800 overflow-x-auto pb-1">
         <button onClick={() => setActiveTab('overview')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>Overview</button>
         
         {isOwner && <button onClick={() => setActiveTab('users')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>Users</button>}
         
         {(isAdmin || isOwner) && <button onClick={() => setActiveTab('library')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'library' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}><Leaf size={14}/> Library</button>}

         {(isAdmin || isOwner) && <button onClick={() => setActiveTab('integrations')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'integrations' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}><Link size={14}/> Connections</button>}

         <button onClick={() => setActiveTab('moderation')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === 'moderation' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>Moderation</button>
         
         <button onClick={() => setActiveTab('sponsors')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'sponsors' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>
            <Briefcase size={14} /> Sponsors
         </button>
         
         <button onClick={() => setActiveTab('campaigns')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'campaigns' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>
            <Megaphone size={14} /> Ad Campaigns
         </button>
         
         {(isAdmin || isOwner) && <button onClick={() => setActiveTab('billing')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === 'billing' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>Billing & Plans</button>}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
         <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {stats.map((stat, i) => (
                  <Card key={i} className="p-4 flex flex-col justify-between">
                     <p className="text-xs font-bold text-earth-500 dark:text-stone-400 uppercase">{stat.label}</p>
                     <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">{stat.value}</span>
                        {stat.change !== undefined && (
                           <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-earth-100 text-earth-600'}`}>
                              {stat.trend === 'up' ? '+' : ''}{stat.change}%
                           </span>
                        )}
                     </div>
                  </Card>
               ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <Card>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2"><Link size={18}/> System Connections</h3>
                     <Button size="sm" onClick={() => setActiveTab('integrations')}>Configure</Button>
                  </div>
                  <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">
                     Manage API keys for required services (Weather, IoT, AI, Market Data).
                  </p>
               </Card>

               <Card>
                  <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-4 flex items-center gap-2"><DollarSign size={18}/> Revenue Pipeline</h3>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs font-bold text-earth-600 dark:text-stone-400 mb-1">
                           <span>Monthly Goal ($5k)</span>
                           <span>84%</span>
                        </div>
                        <div className="w-full h-2 bg-earth-100 dark:bg-stone-800 rounded-full overflow-hidden">
                           <div className="h-full bg-leaf-600 w-[84%]" />
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      )}

      {/* INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (isAdmin || isOwner) && <IntegrationManager />}

      {/* USERS TAB (Owner Only) */}
      {activeTab === 'users' && isOwner && <UserManagement />}

      {/* LIBRARY TAB */}
      {activeTab === 'library' && (isAdmin || isOwner) && <LibraryAdmin />}

      {/* MODERATION TAB */}
      {activeTab === 'moderation' && (
         <div className="space-y-4">
            {flags.length === 0 ? (
               <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border border-earth-200 dark:border-stone-800 text-earth-500 dark:text-stone-400 italic">
                  <Check className="mx-auto mb-2 text-leaf-500" />
                  All caught up! No pending reports.
               </div>
            ) : (
               <div className="space-y-3">
                  {flags.map(flag => (
                     <div key={flag.id} className="bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/30 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-3">
                           <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 h-fit">
                              <AlertTriangle size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-earth-900 dark:text-earth-100 text-sm">Reported {flag.targetType}</h4>
                              <p className="text-sm text-earth-600 dark:text-stone-300 mt-1">Reason: <strong className="text-red-700 dark:text-red-400">{flag.reason}</strong></p>
                              <p className="text-xs text-earth-400 mt-2">ID: {flag.targetId} • Reported by {flag.reportedBy}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 items-center">
                           <Button size="sm" variant="outline" onClick={() => handleResolveFlag(flag.id, 'dismiss')} icon={<X size={14}/>}>Dismiss</Button>
                           <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-none" onClick={() => handleResolveFlag(flag.id, 'ban')} icon={<Shield size={14}/>}>Remove Content</Button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      )}

      {/* SPONSOR CRM TAB */}
      {activeTab === 'sponsors' && (
         <div className="grid grid-cols-1">
            <SponsorManager />
         </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
         <div className="grid grid-cols-1">
            <CampaignManager />
         </div>
      )}

      {/* BILLING TAB (Admin & Owner) */}
      {activeTab === 'billing' && (isAdmin || isOwner) && (
         <div className="space-y-6">
            <SubscriptionAdmin />
         </div>
      )}
    </div>
  );
};
