
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Sprout, 
  PawPrint, 
  Settings, 
  WifiOff, 
  Utensils,
  Stethoscope,
  DollarSign,
  HelpCircle,
  CloudSun,
  Book,
  Store,
  FileText,
  Moon,
  Sun,
  Shield, 
  FileBarChart,
  Bell,
  MessageSquare,
  BookOpen,
  Megaphone,
  LogOut,
  AlertCircle,
  Cloud,
  CloudOff
} from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { dbService } from '../services/db';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/auth';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { UserProfile, AuthUser, Sponsor, AdCampaign } from '../types';
import { NotificationCenter } from './messaging/NotificationCenter';
import { SyncIndicator } from './sync/SyncIndicator';
import { AuthModal } from './auth/AuthModal';

const icons: Record<string, React.FC<any>> = {
  LayoutDashboard,
  CheckSquare,
  Sprout,
  PawPrint,
  Settings,
  Utensils,
  Stethoscope,
  DollarSign,
  CloudSun,
  Book,
  Store,
  FileText,
  Shield,
  FileBarChart,
  MessageSquare,
  BookOpen
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);
  
  // Local state for logout confirmation to avoid sandboxed confirm() calls
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  
  const isMounted = useRef(true);
  
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check notifications & role
    const init = async () => {
        if (!isMounted.current) return;
        try {
            const user = await authService.getCurrentUser();
            const hasAdmin = authService.hasRole(user, 'admin');
            
            if (isMounted.current) {
                const count = await notificationService.getUnreadCount('main_user');
                setUnreadCount(count);
                setIsAdmin(hasAdmin);

                if (hasAdmin) {
                    const sponsors = await dbService.getAll<Sponsor>('sponsors');
                    const campaigns = await dbService.getAll<AdCampaign>('campaigns');
                    const pendingS = sponsors.filter(s => s.status === 'lead').length;
                    const pendingC = campaigns.filter(c => c.status === 'reviewing').length;
                    setPendingAdminCount(pendingS + pendingC);
                }
            }
        } catch (e) {
            console.error("Layout init error", e);
        }
    };
    init();
    
    // Polling for notifications
    const interval = setInterval(init, 10000);

    // Event listener for Auth Changes (avoids hard reload)
    const handleAuthChange = () => {
        console.log("Auth change detected, refreshing layout...");
        init();
    };
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      isMounted.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth-change', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = async () => {
      if (logoutConfirm) {
          await authService.logout();
          setLogoutConfirm(false);
      } else {
          setLogoutConfirm(true);
          // Reset confirmation state after 3 seconds if not clicked
          setTimeout(() => setLogoutConfirm(false), 3000);
      }
  };

  // Add Message Nav Item dynamically if not exists (Prevents dupes in strict mode)
  if (!NAV_ITEMS.find(i => i.id === 'messages')) {
      NAV_ITEMS.splice(1, 0, { id: 'messages', label: 'Messages', icon: 'MessageSquare', path: '/messages' });
  }

  return (
    <div className="min-h-screen bg-earth-100 dark:bg-night-950 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white dark:bg-night-900 border-b border-earth-200 dark:border-night-800 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <Link to="/" className="font-serif font-bold text-xl text-earth-800 dark:text-earth-100">Homestead Hub</Link>
        <div className="flex items-center gap-2">
            <SyncIndicator /> 
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-earth-500 dark:text-earth-400 relative">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-night-900"></span>}
            </button>
            <button onClick={toggleTheme} className="p-2 text-earth-500 dark:text-earth-400">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-earth-50 dark:bg-night-900 border-r border-earth-200 dark:border-night-800 h-screen sticky top-0 p-6 transition-colors duration-200">
        <div className="mb-6 flex flex-col items-start">
          <Link to="/">
              <h1 className="font-serif font-black text-2xl text-leaf-800 dark:text-leaf-500 tracking-tight cursor-pointer">Homestead Hub</h1>
          </Link>
          
          <div className="flex items-center gap-2 mt-2 bg-earth-100 dark:bg-stone-800 px-2 py-1 rounded-md cursor-pointer" onClick={() => setShowConfig(true)}>
             {isSupabaseConfigured ? (
                 <span className="text-[10px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                     <Cloud size={10} /> Cloud Connected
                 </span>
             ) : (
                 <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                     <CloudOff size={10} /> Connect Cloud
                 </span>
             )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = icons[item.icon] || HelpCircle;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-leaf-100 dark:bg-leaf-900/30 text-leaf-900 dark:text-leaf-300 font-bold shadow-sm' 
                    : 'text-earth-600 dark:text-night-400 hover:bg-earth-100 dark:hover:bg-night-800 hover:text-earth-900 dark:hover:text-earth-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-leaf-700 dark:text-leaf-400' : 'text-earth-400 dark:text-night-500 group-hover:text-earth-600 dark:group-hover:text-earth-300'} />
                {item.label}
              </NavLink>
            );
          })}
          
          {/* Admin Link (Conditional) */}
          {isAdmin && (
             <NavLink
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group mt-4 border border-transparent relative ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-leaf-100 dark:bg-leaf-900/30 text-leaf-900 dark:text-leaf-300 font-bold shadow-sm' 
                    : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-100 dark:border-purple-900/30'
                }`}
             >
                <Shield size={20} />
                Admin Console
                {pendingAdminCount > 0 && (
                    <span className="absolute right-3 top-3 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-sm"></span>
                )}
             </NavLink>
          )}
        </nav>

        <div className="mt-auto space-y-2 border-t border-earth-200 dark:border-night-800 pt-4">
            <NavLink 
                to="/partner"
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-xs font-bold ${location.pathname === '/partner' ? 'bg-earth-200 dark:bg-night-800 text-earth-900 dark:text-earth-100' : 'text-earth-500 dark:text-night-500 hover:bg-earth-100 dark:hover:bg-night-800'}`}
            >
                <Megaphone size={14} /> Partner Portal
            </NavLink>

            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-earth-600 dark:text-night-400 hover:bg-earth-100 dark:hover:bg-night-800 transition-colors relative"
            >
                <Bell size={20} />
                <span className="font-medium text-sm">Notifications</span>
                {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </button>

            <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-earth-600 dark:text-night-400 hover:bg-earth-100 dark:hover:bg-night-800 transition-colors"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button 
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${
                    logoutConfirm 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
            >
                {logoutConfirm ? <AlertCircle size={20} /> : <LogOut size={20} />}
                <span className="text-sm">{logoutConfirm ? 'Confirm Logout?' : 'Log Out'}</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 max-w-5xl mx-auto w-full transition-colors duration-200 relative">
        {showNotifications && (
            <NotificationCenter userId="main_user" onClose={() => setShowNotifications(false)} />
        )}
        {children}
      </main>

      {/* Config Modal (Always accessible) */}
      <AuthModal 
          isOpen={showConfig} 
          onClose={() => setShowConfig(false)} 
          onSuccess={() => setShowConfig(false)} 
      />

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-night-900 border-t border-earth-200 dark:border-night-800 pb-safe pt-2 px-4 flex justify-between items-center z-30 h-[80px] overflow-x-auto">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = icons[item.icon] || HelpCircle;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[64px] h-full gap-1 transition-colors ${
                isActive ? 'text-leaf-700 dark:text-leaf-400' : 'text-earth-400 dark:text-night-500'
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? 'bg-leaf-50 dark:bg-leaf-900/20' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
