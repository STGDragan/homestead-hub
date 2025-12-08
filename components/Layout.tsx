
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
  BookOpen
} from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { dbService } from '../services/db';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/auth';
import { UserProfile, AuthUser } from '../types';
import { NotificationCenter } from './messaging/NotificationCenter';
import { SyncIndicator } from './sync/SyncIndicator'; // Import Sync Indicator

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
  const [unreadCount, setUnreadCount] = useState(0);
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
            const count = await notificationService.getUnreadCount('main_user');
            if (isMounted.current) setUnreadCount(count);
            
            const user = await authService.getCurrentUser();
            // Check if admin or owner
            if (isMounted.current) {
                const hasAdmin = authService.hasRole(user, 'admin');
                setIsAdmin(hasAdmin);
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
            <SyncIndicator /> {/* Add Sync Indicator */}
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
        <div className="mb-10 flex justify-between items-start">
          <div>
            <Link to="/">
                <h1 className="font-serif font-black text-2xl text-leaf-800 dark:text-leaf-500 tracking-tight cursor-pointer">Homestead Hub</h1>
            </Link>
            <div className="flex items-center gap-2 mt-1">
               <SyncIndicator /> {/* Add Sync Indicator */}
               <span className="text-earth-500 dark:text-night-400 text-sm font-medium">Sync Active</span>
            </div>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group mt-4 border border-transparent ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-leaf-100 dark:bg-leaf-900/30 text-leaf-900 dark:text-leaf-300 font-bold shadow-sm' 
                    : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-100 dark:border-purple-900/30'
                }`}
             >
                <Shield size={20} />
                Admin Console
             </NavLink>
          )}
        </nav>

        <div className="mt-auto space-y-4">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 max-w-5xl mx-auto w-full transition-colors duration-200 relative">
        {showNotifications && (
            <NotificationCenter userId="main_user" onClose={() => setShowNotifications(false)} />
        )}
        {children}
      </main>

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
