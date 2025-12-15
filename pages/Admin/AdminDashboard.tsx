
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { AdminStat, FlaggedItem, AuthUser, Sponsor, AdCampaign } from '../../types';
import { authService } from '../../services/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, BookOpen, Search, Check, AlertTriangle, X, Database, Users as UsersIcon, Megaphone, Briefcase, Leaf, Link, Cloud, Copy, Terminal, CloudOff, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SponsorManager } from '../../components/monetization/SponsorManager';
import { CampaignManager } from './CampaignManager';
import { UserManagement } from './UserManagement';
import { SubscriptionAdmin } from './SubscriptionAdmin';
import { LibraryAdmin } from './LibraryAdmin';
import { IntegrationManager } from '../../components/admin/IntegrationManager';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'cloud' | 'users' | 'moderation' | 'sponsors' | 'campaigns' | 'billing' | 'library' | 'integrations'>('overview');
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [flags, setFlags] = useState<FlaggedItem[]>([
     { id: 'f1', targetId: 'm1', targetType: 'listing', reason: 'Prohibited Item', reportedBy: 'u2', timestamp: Date.now() - 100000, status: 'pending' },
     { id: 'f2', targetId: 'm2', targetType: 'listing', reason: 'Spam', reportedBy: 'u5', timestamp: Date.now() - 500000, status: 'pending' }
  ]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [pendingSponsors, setPendingSponsors] = useState(0);
  const [pendingCampaigns, setPendingCampaigns] = useState(0);

  const [showSql, setShowSql] = useState(true); 
  const [isForcedOffline, setIsForcedOffline] = useState(localStorage.getItem('homestead_force_offline') === 'true');

  const SQL_SCRIPT = `
/* 
  FIX: "Database error saving new user" + "Missing columns in user_profile"
  Run this in the Supabase SQL Editor to patch the schema.
*/

-- 1. CLEANUP OLD TRIGGERS ON AUTH.USERS
DO $$
DECLARE
    trg text;
    tab text;
BEGIN
    FOR trg, tab IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' 
        AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trg || ' ON auth.users CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trg;
    END LOOP;
END $$;

-- 2. CLEANUP OLD FUNCTIONS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_custom() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;

-- 3. ENSURE PROFILE TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.user_profile (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ADD ALL REQUIRED COLUMNS IF MISSING
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- 5. CREATE PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Users manage own profile" ON public.user_profile;
DROP POLICY IF EXISTS "Read all profiles" ON public.user_profile;
DROP POLICY IF EXISTS "Insert own profile" ON public.user_profile;

-- Allow users to INSERT their own profile
CREATE POLICY "Insert own profile" 
ON public.user_profile 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE/SELECT their own profile
CREATE POLICY "Users manage own profile" 
ON public.user_profile 
FOR ALL 
USING (auth.uid() = id);

-- Allow public read (for marketplace/community features)
CREATE POLICY "Read all profiles" 
ON public.user_profile 
FOR SELECT 
USING (true);

-- 6. APP DATA TABLE (For Offline Sync)
CREATE TABLE IF NOT EXISTS public.app_data (
  collection text NOT NULL,
  id text NOT NULL,
  data jsonb NOT NULL,
  updated_at bigint,
  deleted boolean DEFAULT false,
  user_id uuid DEFAULT auth.uid(),
  PRIMARY KEY (collection, id)
);

ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own data" ON public.app_data;

CREATE POLICY "Users manage own data" 
ON public.app_data 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
`;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    const user = await authService.getCurrentUser();
    setAuthUser(user);

    const sponsors = await dbService.getAll<Sponsor>('sponsors');
    const campaigns = await dbService.getAll<AdCampaign>('campaigns');
    
    setPendingSponsors(sponsors.filter(s => s.status === 'lead').length);
    setPendingCampaigns(campaigns.filter(c => c.status === 'reviewing').length);

    setStats([
       { label: 'Total Users', value: 1243, change: 12, trend: 'up' },
       { label: 'MRR', value: '$4,200', change: 8, trend: 'up' },
       { label: 'Pending Reports', value: flags.length, change: 0, trend: 'neutral' },
       { label: 'Active Ads', value: 4, trend: 'neutral' }
    ]);
  };

  const handleResolveFlag = (id: string, action: 'dismiss' | 'ban') => {
     setFlags(flags.filter(f => f.id !== id));
  };

  const handleReconnect = () => {
      localStorage.removeItem('homestead_force_offline');
      window.location.reload();
  };

  const copySql = () => {
      navigator.clipboard.writeText(SQL_SCRIPT);
      alert("SQL Copied! Run this in your Supabase SQL Editor to fix backend errors.");
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
         
         <button onClick={() => setActiveTab('cloud')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'cloud' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>
            <Cloud size={14}/> Cloud
         </button>

         {isOwner && <button onClick={() => setActiveTab('users')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>Users</button>}
         
         {(isAdmin || isOwner) && <button onClick={() => setActiveTab('library')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'library' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}><Leaf size={14}/> Library</button>}

         {(isAdmin || isOwner) && <button onClick={() => setActiveTab('integrations')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'integrations' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}><Link size={14}/> Connections</button>}

         <button onClick={() => setActiveTab('moderation')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap ${activeTab === 'moderation' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>Moderation</button>
         
         <button onClick={() => setActiveTab('sponsors')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 relative ${activeTab === 'sponsors' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>
            <Briefcase size={14} /> Sponsors
            {pendingSponsors > 0 && <span className="absolute top-0 right-0 text-orange-500 text-xl leading-none -mt-1">*</span>}
         </button>
         
         <button onClick={() => setActiveTab('campaigns')} className={`pb-3 px-2 font-bold text-sm border-b-2 capitalize transition-colors whitespace-nowrap flex items-center gap-1 relative ${activeTab === 'campaigns' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-300'}`}>
            <Megaphone size={14} /> Ad Campaigns
            {pendingCampaigns > 0 && <span className="absolute top-0 right-0 text-orange-500 text-xl leading-none -mt-1">*</span>}
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
                     <h3 className="font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2"><Cloud size={18}/> App Config</h3>
                     <Button size="sm" onClick={() => setActiveTab('cloud')}>Status</Button>
                  </div>
                  <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">
                     Configuration is hardcoded for production reliability.
                  </p>
                  <div className="flex items-center gap-2">
                     {isSupabaseConfigured ? (
                        <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1"><Check size={12}/> Cloud Connected</span>
                     ) : (
                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={12}/> Mock Mode</span>
                     )}
                  </div>
               </Card>
            </div>
         </div>
      )}

      {/* CLOUD CONFIG TAB */}
      {activeTab === 'cloud' && (
          <div className="space-y-6">
            <Card className="max-w-2xl mx-auto animate-in fade-in">
                <div className="flex justify-between items-start mb-6">
                    <div>
                    <h2 className="text-xl font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Cloud className="text-blue-500" /> Cloud Connection
                    </h2>
                    <p className="text-earth-600 dark:text-stone-300 text-sm mt-1">
                        Credentials are hardcoded in application build.
                    </p>
                    </div>
                    {isSupabaseConfigured ? (
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">
                            Connected
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
                            Disconnected
                        </div>
                    )}
                </div>

                {isForcedOffline && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CloudOff className="text-red-600" />
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-100 text-sm">Forced Offline Mode Active</h4>
                                <p className="text-xs text-red-800 dark:text-red-200">System is skipping connection attempts.</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={handleReconnect} icon={<RefreshCw size={14}/>}>
                            Try Reconnect
                        </Button>
                    </div>
                )}
                
                <div className="p-4 bg-earth-50 dark:bg-stone-800 rounded-xl text-sm font-mono break-all">
                    https://psrofmaojlttfyrsarrc.supabase.co
                </div>
            </Card>

            <Card className="max-w-2xl mx-auto border-t-4 border-t-blue-500">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Terminal size={20} className="text-blue-500" /> Backend Setup (Fix 400 Errors)
                    </h3>
                    <Button size="sm" variant="ghost" onClick={() => setShowSql(!showSql)}>
                        {showSql ? 'Hide SQL' : 'Show SQL'}
                    </Button>
                </div>
                
                <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">
                    If you see <strong>Database error</strong> or <strong>400 Bad Request</strong>, it means your Supabase schema is missing the `name` or `phone` columns. Run this in Supabase SQL Editor.
                </p>

                {showSql && (
                    <div className="relative">
                        <pre className="bg-black text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar max-h-64">
                            {SQL_SCRIPT}
                        </pre>
                        <button 
                            onClick={copySql} 
                            className="absolute top-2 right-2 bg-white/20 text-white p-2 rounded hover:bg-white/40 transition-colors"
                            title="Copy to Clipboard"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                )}
            </Card>
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
