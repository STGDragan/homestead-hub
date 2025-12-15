
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { UserProfile, AuthUser, NotificationPreference } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { BillingTab } from './BillingTab'; 
import { SecuritySettings } from './SecuritySettings';
import { DataManagementTab } from './DataManagementTab'; 
import { AdvertisingTab } from './AdvertisingTab';
import { AgentSettings } from '../../components/ai/AgentSettings';
import { User, MapPin, Award, Target, Save, LogOut, CreditCard, Lock, Brain, Database, Mail, Loader2, Megaphone, Bell, Trash2, Phone, AlertCircle } from 'lucide-react';
import { EXPERIENCE_LEVELS, HOMESTEAD_GOALS, OWNER_EMAIL } from '../../constants';
import { authService } from '../../services/auth';
import { notificationService } from '../../services/notificationService';
import { syncEngine } from '../../services/syncEngine';
import { useLocation } from 'react-router-dom';

export const SettingsDashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'security' | 'ai' | 'data' | 'advertising' | 'notifications'>('profile');
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreference | null>(null);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Local state for immediate logout confirmation
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    loadData();
    // Handle deep linking to tabs from Admin Dashboard or Auth Modal
    if (location.state && (location.state as any).initialTab) {
        setActiveTab((location.state as any).initialTab);
    }
  }, [location]);

  const loadData = async () => {
    setLoading(true);
    try {
        const auth = await authService.getCurrentUser();
        setAuthUser(auth);

        // Determine correct Profile ID
        const targetProfileId = auth ? auth.id : 'main_user';
        
        let user = await dbService.get<UserProfile>('user_profile', targetProfileId);
        
        // MIGRATION / FALLBACK LOGIC
        if (!user && auth) {
            const localFallback = await dbService.get<UserProfile>('user_profile', 'main_user');
            if (localFallback) {
                user = {
                    ...localFallback,
                    id: auth.id,
                    userId: auth.id,
                    email: auth.email,
                    updatedAt: Date.now(),
                    syncStatus: 'pending'
                };
                await dbService.put('user_profile', user);
            }
        }

        // SELF-HEAL
        if (!user && auth) {
            user = {
                id: auth.id,
                userId: auth.id,
                name: auth.email.split('@')[0],
                email: auth.email,
                zipCode: '',
                hardinessZone: '',
                experienceLevel: 'beginner',
                goals: [],
                interests: [],
                preferences: { organicOnly: false, useMetric: false, enableNotifications: true },
                role: 'user', 
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };
            await dbService.put('user_profile', user);
        } else if (!user && !auth) {
             user = {
                id: 'main_user',
                userId: 'main_user',
                name: 'Homesteader',
                email: '',
                zipCode: '',
                hardinessZone: '',
                experienceLevel: 'beginner',
                goals: [],
                interests: [],
                preferences: { organicOnly: false, useMetric: false, enableNotifications: true },
                role: 'user', 
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };
            await dbService.put('user_profile', user);
        }

        // Notification Preferences
        const prefsId = auth ? auth.id : 'main_user';
        let np = await notificationService.getPreferences(prefsId);
        
        if (!np) {
            np = await notificationService.getPreferences('pref_' + prefsId);
        }

        if (!np) {
            const defaults: NotificationPreference = {
                id: 'pref_' + prefsId,
                userId: prefsId,
                emailEnabled: true,
                pushEnabled: true,
                categories: { task: true, breeding: true, system: true, marketing: false },
                createdAt: Date.now(), updatedAt: Date.now(), syncStatus: 'pending'
            };
            await notificationService.savePreferences(defaults);
            np = defaults;
        }
        
        if (user) {
           setProfile(user);
           setFormData(user);
        }
        
        setNotifPrefs(np);

    } catch(e) {
        console.error("Failed to load settings data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    
    try {
        const currentUser = await authService.getCurrentUser();
        
        // Sync profile changes to Supabase Auth Metadata
        await authService.syncProfileToAuth(formData.email, { 
            name: formData.name, 
            phone: formData.phone 
        });

        // Force the ID to match Auth UUID if logged in
        const correctId = currentUser ? currentUser.id : profile.id;

        const updated: UserProfile = {
           ...profile,
           ...formData,
           id: correctId,
           userId: correctId,
           updatedAt: Date.now(),
           syncStatus: 'pending' as const
        };

        // Save to Local DB
        await dbService.put('user_profile', updated);
        
        // Cleanup old local profile if we migrated IDs
        if (profile.id === 'main_user' && correctId !== 'main_user') {
            await dbService.delete('user_profile', 'main_user');
        }
        
        // Force Sync Immediately
        await syncEngine.pushChanges();
        
        setProfile(updated);
        setIsEditing(false);
        await loadData(); 
    } catch (e) {
        console.error("Save failed", e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleNotifPrefChange = async (key: string, val: any) => {
      if (!notifPrefs) return;
      
      let updated: NotificationPreference;
      
      if (['task', 'breeding', 'system', 'marketing'].includes(key)) {
          updated = { 
              ...notifPrefs, 
              categories: { ...notifPrefs.categories, [key]: val },
              updatedAt: Date.now(),
              syncStatus: 'pending' as const
          };
      } else {
          updated = { 
              ...notifPrefs, 
              [key]: val, 
              updatedAt: Date.now(),
              syncStatus: 'pending' as const
          };
      }
      
      await notificationService.savePreferences(updated);
      setNotifPrefs(updated);
  };

  const handleLogout = async () => {
      if (logoutConfirm) {
          await authService.logout();
      } else {
          setLogoutConfirm(true);
          setTimeout(() => setLogoutConfirm(false), 3000);
      }
  };

  const handleForceLogout = async () => {
      await authService.logout();
  };

  const handleFactoryReset = async () => {
      const url = localStorage.getItem('homestead_supabase_url');
      const key = localStorage.getItem('homestead_supabase_key');
      
      localStorage.clear();
      await dbService.clearDatabase();
      
      if (url) localStorage.setItem('homestead_supabase_url', url);
      if (key) localStorage.setItem('homestead_supabase_key', key);
      
      window.location.reload();
  };

  if (loading) return <div className="p-8 text-center text-earth-500">Loading settings...</div>;

  if (!profile) return (
      <div className="p-8 max-w-md mx-auto text-center space-y-6">
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Profile Load Error</h2>
              <p className="text-red-600 dark:text-red-300 mt-2 text-sm">
                  We couldn't load your user profile. This might happen if the initial setup didn't complete.
              </p>
          </div>
          <div className="grid gap-3">
              <Button onClick={handleForceLogout} className="w-full bg-earth-800" icon={<LogOut size={18}/>}>
                  Log Out & Retry
              </Button>
              <Button onClick={handleFactoryReset} variant="outline" className="w-full text-red-600 border-red-200" icon={<Trash2 size={18}/>}>
                  Factory Reset App
              </Button>
          </div>
      </div>
  );

  const isOwner = authService.hasRole(authUser, 'owner');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">Settings</h1>
          <p className="text-earth-600 dark:text-night-400">Manage your profile and app preferences.</p>
        </div>
        {activeTab === 'profile' && (
            isEditing ? (
            <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData(profile); }} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} icon={isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
            ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )
        )}
      </div>

      <div className="flex gap-4 border-b border-earth-200 dark:border-night-800 overflow-x-auto pb-1 scrollbar-hide">
         <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            Profile & Prefs
         </button>
         
         <button 
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'notifications' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            <Bell size={14} /> Notifications
         </button>

         <button 
            onClick={() => setActiveTab('billing')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'billing' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            My Plan
         </button>

         {isOwner && (
             <button 
                onClick={() => setActiveTab('security')}
                className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'security' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
             >
                Security
             </button>
         )}

         <button 
            onClick={() => setActiveTab('data')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'data' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            <Database size={14} /> Data
         </button>
         <button 
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'ai' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            <Brain size={14} /> AI Agents
         </button>
         <button 
            onClick={() => setActiveTab('advertising')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'advertising' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            <Megaphone size={14} /> Partner Program
         </button>
      </div>

      {activeTab === 'profile' && (
        <>
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="space-y-6">
                    <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100 flex items-center gap-2 border-b border-earth-100 dark:border-night-800 pb-2">
                    <User size={20} className="text-leaf-600" /> Basic Info
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Display Name</label>
                            {isEditing ? (
                                <Input 
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <p className="text-lg font-bold text-earth-900 dark:text-earth-100">{profile.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Email Address</label>
                            {isEditing ? (
                                <div className="space-y-1">
                                    <Input 
                                        type="email"
                                        icon={<Mail size={16} />}
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email to sync perms"
                                    />
                                    <p className="text-[10px] text-earth-500">
                                        Enter <strong>{OWNER_EMAIL}</strong> to enable Admin/Owner features.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-earth-800 dark:text-earth-200 font-medium flex items-center gap-2">
                                    <Mail size={14}/> {profile.email || 'Not set'}
                                    {isOwner && <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold uppercase">Owner</span>}
                                </p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Phone Number</label>
                            {isEditing ? (
                                <Input 
                                    type="tel"
                                    icon={<Phone size={16} />}
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+15550000000"
                                />
                            ) : (
                                <p className="text-earth-800 dark:text-earth-200 font-medium flex items-center gap-2">
                                    <Phone size={14}/> {formData.phone || 'Not set'}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Zip Code</label>
                                {isEditing ? (
                                    <Input 
                                    value={formData.zipCode || ''}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-earth-800 dark:text-earth-200 font-medium flex items-center gap-1"><MapPin size={14}/> {profile.zipCode}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Hardiness Zone</label>
                                {isEditing ? (
                                    <Input 
                                    value={formData.hardinessZone || ''}
                                    onChange={e => setFormData({ ...formData, hardinessZone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-earth-800 dark:text-earth-200 font-medium">{profile.hardinessZone || 'Unknown'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-6">
                    <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100 flex items-center gap-2 border-b border-earth-100 dark:border-night-800 pb-2">
                    <Target size={20} className="text-amber-600" /> Homestead Profile
                    </h2>

                    <div>
                    <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-2">Experience Level</label>
                    {isEditing ? (
                        <div className="flex gap-2">
                            {EXPERIENCE_LEVELS.map(l => (
                                <button
                                key={l.id}
                                onClick={() => setFormData({ ...formData, experienceLevel: l.id })}
                                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                    formData.experienceLevel === l.id 
                                    ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-900 dark:text-amber-100' 
                                    : 'bg-white dark:bg-night-800 border-earth-200 dark:border-night-700 text-earth-600 dark:text-night-300 hover:bg-earth-50 dark:hover:bg-night-700'
                                }`}
                                >
                                {l.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-earth-800 dark:text-earth-200 font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg w-fit">
                            <Award size={16} className="text-amber-600" /> 
                            <span className="capitalize">{profile.experienceLevel}</span>
                        </div>
                    )}
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-2">Primary Goals</label>
                    <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                            HOMESTEAD_GOALS.map(g => (
                                <button
                                key={g.id}
                                onClick={() => {
                                    const goals = formData.goals || [];
                                    if (goals.includes(g.id)) setFormData({ ...formData, goals: goals.filter(x => x !== g.id) });
                                    else setFormData({ ...formData, goals: [...goals, g.id] });
                                }}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                    formData.goals?.includes(g.id) 
                                    ? 'bg-earth-800 text-white border-earth-800 dark:bg-leaf-600 dark:border-leaf-600' 
                                    : 'bg-white dark:bg-night-800 text-earth-600 dark:text-night-300 border-earth-200 dark:border-night-700'
                                }`}
                                >
                                {g.label}
                                </button>
                            ))
                        ) : (
                            profile.goals.map(g => (
                                <span key={g} className="bg-earth-100 dark:bg-night-800 text-earth-700 dark:text-earth-300 px-3 py-1 rounded-full text-xs font-bold border border-earth-200 dark:border-night-700">
                                {HOMESTEAD_GOALS.find(hg => hg.id === g)?.label || g}
                                </span>
                            ))
                        )}
                    </div>
                    </div>
                </Card>

                <Card className="md:col-span-2 space-y-4">
                    <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100 border-b border-earth-100 dark:border-night-800 pb-2">App Preferences</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-between p-3 bg-earth-50 dark:bg-night-800 rounded-xl border border-transparent dark:border-night-700">
                            <span className="text-sm font-bold text-earth-700 dark:text-earth-300">Organic Only Suggestions</span>
                            {isEditing ? (
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded text-leaf-600 focus:ring-leaf-500 bg-white dark:bg-night-700 border-earth-300 dark:border-night-500"
                                checked={formData.preferences?.organicOnly}
                                onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences!, organicOnly: e.target.checked }})}
                            />
                            ) : (
                            <span className={profile.preferences.organicOnly ? "text-leaf-600 font-bold" : "text-earth-400"}>{profile.preferences.organicOnly ? "Yes" : "No"}</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-earth-50 dark:bg-night-800 rounded-xl border border-transparent dark:border-night-700">
                            <span className="text-sm font-bold text-earth-700 dark:text-earth-300">Use Metric Units</span>
                            {isEditing ? (
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded text-leaf-600 focus:ring-leaf-500 bg-white dark:bg-night-700 border-earth-300 dark:border-night-500"
                                checked={formData.preferences?.useMetric}
                                onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences!, useMetric: e.target.checked }})}
                            />
                            ) : (
                            <span className={profile.preferences.useMetric ? "text-leaf-600 font-bold" : "text-earth-400"}>{profile.preferences.useMetric ? "Yes" : "No"}</span>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="pt-8 border-t border-earth-200 dark:border-night-800 flex justify-end">
                <Button 
                    variant="outline" 
                    className={`text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 ${logoutConfirm ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' : ''}`} 
                    icon={<LogOut size={16} />} 
                    onClick={handleLogout}
                >
                    {logoutConfirm ? 'Confirm Logout?' : 'Log Out'}
                </Button>
            </div>
        </>
      )}

      {activeTab === 'notifications' && notifPrefs && (
          <div className="grid md:grid-cols-2 gap-6">
              <Card>
                  <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4 flex items-center gap-2">
                      <Bell size={20} className="text-leaf-600"/> Delivery Channels
                  </h2>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
                          <div>
                              <p className="font-bold text-earth-800 dark:text-earth-200 text-sm">Push Notifications</p>
                              <p className="text-xs text-earth-500">Receive alerts on this device</p>
                          </div>
                          <input 
                              type="checkbox" 
                              checked={notifPrefs.pushEnabled} 
                              onChange={(e) => handleNotifPrefChange('pushEnabled', e.target.checked)}
                              className="w-5 h-5 text-leaf-600 rounded focus:ring-leaf-500"
                          />
                      </div>
                      <div className="flex justify-between items-center p-3 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
                          <div>
                              <p className="font-bold text-earth-800 dark:text-earth-200 text-sm">Email Alerts</p>
                              <p className="text-xs text-earth-500">Weekly digests and critical warnings</p>
                          </div>
                          <input 
                              type="checkbox" 
                              checked={notifPrefs.emailEnabled} 
                              onChange={(e) => handleNotifPrefChange('emailEnabled', e.target.checked)}
                              className="w-5 h-5 text-leaf-600 rounded focus:ring-leaf-500"
                          />
                      </div>
                  </div>
              </Card>

              <Card>
                  <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4">Notification Types</h2>
                  <div className="space-y-2">
                      {Object.entries(notifPrefs.categories).map(([cat, enabled]) => (
                          <label key={cat} className="flex items-center justify-between p-3 hover:bg-earth-50 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors">
                              <span className="capitalize font-medium text-earth-700 dark:text-stone-300">{cat} Updates</span>
                              <input 
                                  type="checkbox" 
                                  checked={enabled} 
                                  onChange={(e) => handleNotifPrefChange(cat, e.target.checked)}
                                  className="w-5 h-5 text-leaf-600 rounded focus:ring-leaf-500"
                              />
                          </label>
                      ))}
                  </div>
              </Card>
          </div>
      )}

      {activeTab === 'billing' && <BillingTab />}

      {activeTab === 'security' && isOwner && <SecuritySettings />}

      {activeTab === 'data' && <DataManagementTab />}

      {activeTab === 'ai' && <AgentSettings />}

      {activeTab === 'advertising' && <AdvertisingTab />}
    </div>
  );
};
