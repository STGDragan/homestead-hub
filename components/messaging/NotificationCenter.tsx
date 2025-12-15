import React, { useState, useEffect } from 'react';
import { Notification, NotificationPreference } from '../../types';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/Button';
import { X, Check, Bell, Settings, Filter } from 'lucide-react';
import { Card } from '../ui/Card';

interface NotificationCenterProps {
  userId: string;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await notificationService.getAll(userId);
    setNotifications(list);
    
    let p = await notificationService.getPreferences(userId);
    if (!p) {
        p = {
            id: 'pref_' + userId,
            userId,
            emailEnabled: true,
            pushEnabled: true,
            categories: { task: true, breeding: true, system: true, marketing: false },
            createdAt: Date.now(), updatedAt: Date.now(), syncStatus: 'pending'
        };
    }
    setPrefs(p);
  };

  const handleMarkAllRead = async () => {
      await notificationService.markAllRead(userId);
      loadData();
  };

  const handlePrefChange = async (key: string, val: boolean) => {
      if (!prefs) return;
      const updated = { ...prefs, [key]: val, updatedAt: Date.now(), syncStatus: 'pending' as const };
      await notificationService.savePreferences(updated);
      setPrefs(updated);
  };

  const handleCategoryChange = async (cat: string, val: boolean) => {
      if (!prefs) return;
      const updated = { ...prefs, categories: { ...prefs.categories, [cat]: val }, updatedAt: Date.now(), syncStatus: 'pending' as const };
      await notificationService.savePreferences(updated);
      setPrefs(updated);
  };

  return (
    <div className="absolute top-16 right-4 w-full max-w-sm z-50 animate-in fade-in zoom-in-95 origin-top-right">
       <Card className="shadow-2xl border-earth-200 dark:border-night-700 max-h-[80vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-night-900">
          <div className="p-4 border-b border-earth-100 dark:border-night-800 flex justify-between items-center bg-earth-50 dark:bg-night-800">
             <div className="flex gap-4">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`text-sm font-bold ${activeTab === 'list' ? 'text-earth-900 dark:text-earth-100 border-b-2 border-leaf-600' : 'text-earth-500'}`}
                >
                    Notifications
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`text-sm font-bold ${activeTab === 'settings' ? 'text-earth-900 dark:text-earth-100 border-b-2 border-leaf-600' : 'text-earth-500'}`}
                >
                    Settings
                </button>
             </div>
             <button onClick={onClose}><X size={18} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200" /></button>
          </div>

          {activeTab === 'list' ? (
              <div className="overflow-y-auto flex-1 p-2">
                  <div className="flex justify-between items-center px-2 mb-2">
                      <span className="text-xs text-earth-500 uppercase font-bold">Recent</span>
                      <button onClick={handleMarkAllRead} className="text-xs text-leaf-600 hover:underline flex items-center gap-1">
                          <Check size={12} /> Mark all read
                      </button>
                  </div>
                  {notifications.length === 0 ? (
                      <div className="text-center py-8 text-earth-400 text-sm">No notifications.</div>
                  ) : (
                      <div className="space-y-1">
                          {notifications.map(n => (
                              <div key={n.id} className={`p-3 rounded-xl border flex gap-3 ${n.read ? 'bg-white dark:bg-night-900 border-transparent' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'}`}>
                                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                                  <div>
                                      <h4 className="text-sm font-bold text-earth-900 dark:text-earth-100">{n.title}</h4>
                                      <p className="text-xs text-earth-600 dark:text-night-300">{n.content}</p>
                                      <span className="text-[10px] text-earth-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          ) : (
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {prefs && (
                      <>
                        <div>
                            <h4 className="text-sm font-bold text-earth-900 dark:text-earth-100 mb-2">Delivery Channels</h4>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-sm text-earth-700 dark:text-night-300">
                                    <span>Email Notifications</span>
                                    <input type="checkbox" checked={prefs.emailEnabled} onChange={e => handlePrefChange('emailEnabled', e.target.checked)} className="rounded text-leaf-600 focus:ring-leaf-500" />
                                </label>
                                <label className="flex items-center justify-between text-sm text-earth-700 dark:text-night-300">
                                    <span>Push Notifications</span>
                                    <input type="checkbox" checked={prefs.pushEnabled} onChange={e => handlePrefChange('pushEnabled', e.target.checked)} className="rounded text-leaf-600 focus:ring-leaf-500" />
                                </label>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-earth-900 dark:text-earth-100 mb-2">Subscriptions</h4>
                            <div className="space-y-2">
                                {Object.entries(prefs.categories).map(([cat, val]) => (
                                    <label key={cat} className="flex items-center justify-between text-sm text-earth-700 dark:text-night-300 capitalize">
                                        <span>{cat} Alerts</span>
                                        <input type="checkbox" checked={val} onChange={e => handleCategoryChange(cat, e.target.checked)} className="rounded text-leaf-600 focus:ring-leaf-500" />
                                    </label>
                                ))}
                            </div>
                        </div>
                      </>
                  )}
              </div>
          )}
       </Card>
    </div>
  );
};