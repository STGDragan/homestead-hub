
import React, { useEffect, useState } from 'react';
import { syncEngine } from '../../services/syncEngine';
import { dbService } from '../../services/db';
import { SyncQueueItem, ConflictLog } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConflictResolver } from '../../components/sync/ConflictResolver';
import { RefreshCw, Database, AlertTriangle, CheckCircle2, Server, Wifi, WifiOff } from 'lucide-react';

export const SyncDashboard: React.FC = () => {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const q = await dbService.getAll<SyncQueueItem>('sync_queue');
    const c = await dbService.getAll<ConflictLog>('conflict_log');
    
    setQueue(q.filter(i => i.status !== 'processing')); // Don't show transient
    setConflicts(c.filter(i => !i.resolved));
  };

  const handleForceSync = async () => {
      setIsSyncing(true);
      const res = await syncEngine.runSyncCycle();
      setLastSyncResult(res);
      await loadData();
      setIsSyncing(false);
  };

  const handleResolveConflict = async (id: string, resolution: 'local_wins' | 'remote_wins') => {
      await syncEngine.resolveConflict(id, resolution);
      await loadData();
  };

  // Debug Helper: Create a fake remote update to test conflict
  const simulateRemoteChange = async () => {
      // Find a local item to conflict with
      const plants = await dbService.getAll<any>('plants');
      if (plants.length > 0) {
          const p = plants[0];
          await syncEngine.simulateRemoteUpdate('plants', p.id, { ...p, name: p.name + ' (Remote Edit)', quantity: 999 });
          alert(`Simulated remote update for plant: ${p.name}. Now edit it locally to trigger conflict.`);
      } else {
          alert("Create a plant first.");
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                    <RefreshCw className={isSyncing ? "animate-spin text-leaf-600" : "text-leaf-600"} /> Sync Engine
                </h1>
                <p className="text-earth-600 dark:text-stone-400">Monitor offline queue and resolve data conflicts.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={simulateRemoteChange} className="hidden md:flex">Simulate Remote Change</Button>
                <Button onClick={handleForceSync} disabled={isSyncing} icon={<RefreshCw size={18}/>}>
                    {isSyncing ? 'Syncing...' : 'Force Sync'}
                </Button>
            </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="flex flex-col justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2"><Database size={14}/> Pending Uploads</span>
                <span className="text-3xl font-bold text-earth-900 dark:text-earth-100">{queue.filter(i => i.status === 'pending').length}</span>
            </Card>
            <Card className="flex flex-col justify-between p-4 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
                <span className="text-xs font-bold text-red-800 uppercase flex items-center gap-2"><AlertTriangle size={14}/> Sync Errors</span>
                <span className="text-3xl font-bold text-earth-900 dark:text-earth-100">{queue.filter(i => i.status === 'failed').length}</span>
            </Card>
            <Card className="flex flex-col justify-between p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-2"><AlertTriangle size={14}/> Conflicts</span>
                <span className="text-3xl font-bold text-earth-900 dark:text-earth-100">{conflicts.length}</span>
            </Card>
            <Card className="flex flex-col justify-between p-4">
                <span className="text-xs font-bold text-earth-500 uppercase flex items-center gap-2">
                    {navigator.onLine ? <Wifi size={14} className="text-green-600"/> : <WifiOff size={14} className="text-red-600"/>} 
                    Network Status
                </span>
                <span className={`text-xl font-bold ${navigator.onLine ? 'text-green-600' : 'text-red-500'}`}>
                    {navigator.onLine ? 'Online' : 'Offline'}
                </span>
            </Card>
        </div>

        {/* Conflicts Section */}
        {conflicts.length > 0 && (
            <div className="space-y-4">
                <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100">Pending Conflicts</h2>
                {conflicts.map(c => (
                    <ConflictResolver key={c.id} conflict={c} onResolve={handleResolveConflict} />
                ))}
            </div>
        )}

        {/* Queue List */}
        <div className="space-y-4">
            <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100">Outbox Queue</h2>
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-earth-200 dark:border-stone-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Store</th>
                            <th className="px-4 py-3">Operation</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                        {queue.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-earth-400 italic">Queue is empty. All changes synced.</td></tr>
                        ) : queue.map(item => (
                            <tr key={item.id} className="hover:bg-earth-50 dark:hover:bg-stone-800/50">
                                <td className="px-4 py-3 font-medium text-earth-900 dark:text-earth-100">{item.storeName}</td>
                                <td className="px-4 py-3 uppercase text-xs font-bold">{item.operation}</td>
                                <td className="px-4 py-3 text-earth-500">{new Date(item.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {item.status}
                                    </span>
                                    {item.error && <p className="text-xs text-red-500 mt-1 truncate max-w-xs">{item.error}</p>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
