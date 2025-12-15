
import React, { useEffect, useState } from 'react';
import { syncEngine } from '../../services/syncEngine';
import { RefreshCw, CloudOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SyncIndicator: React.FC = () => {
  const [stats, setStats] = useState({ pending: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const interval = setInterval(async () => {
        const s = await syncEngine.getQueueStats();
        setStats(s);
    }, 5000);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
      if (!online) return;
      setIsSyncing(true);
      await syncEngine.runSyncCycle();
      const s = await syncEngine.getQueueStats();
      setStats(s);
      setIsSyncing(false);
  };

  if (!online) {
      return (
          <div className="flex items-center gap-1 text-xs font-bold text-earth-500 bg-earth-100 px-2 py-1 rounded-full">
              <CloudOff size={12} /> <span>Offline</span>
          </div>
      );
  }

  if (stats.failed > 0) {
      return (
          <Link to="/sync" className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">
              <AlertCircle size={12} /> <span>{stats.failed} Errors</span>
          </Link>
      );
  }

  if (stats.pending > 0 || isSyncing) {
      return (
          <button onClick={handleSync} className="flex items-center gap-1 text-xs font-bold text-leaf-700 bg-leaf-100 px-2 py-1 rounded-full">
              <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> 
              <span>{isSyncing ? 'Syncing...' : `${stats.pending} Pending`}</span>
          </button>
      );
  }

  return (
      <button onClick={handleSync} className="text-earth-400 hover:text-leaf-600 transition-colors">
          <CheckCircle size={20} />
      </button>
  );
};
