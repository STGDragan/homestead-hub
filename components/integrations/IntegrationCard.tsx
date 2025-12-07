
import React from 'react';
import { IntegrationConfig } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Cloud, Cpu, ShoppingBag, Database, Activity, RefreshCw, Settings, AlertTriangle } from 'lucide-react';

interface IntegrationCardProps {
  config: IntegrationConfig;
  onSync: (id: string) => void;
  onEdit: (config: IntegrationConfig) => void;
  isSyncing?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ config, onSync, onEdit, isSyncing }) => {
  const Icon = {
      weather: Cloud,
      sensor_hardware: Cpu,
      market_feed: ShoppingBag,
      seed_catalog: Database,
      animal_registry: Activity
  }[config.type] || Database;

  return (
    <Card className={`border-l-4 ${config.status === 'active' ? 'border-l-leaf-500' : config.status === 'error' ? 'border-l-red-500' : 'border-l-earth-300'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-earth-100 dark:bg-stone-800 rounded-lg text-earth-600 dark:text-stone-300">
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-earth-900 dark:text-earth-100">{config.name}</h3>
                    <p className="text-xs text-earth-500 font-mono">{config.provider}</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${config.status === 'active' ? 'bg-green-100 text-green-800' : config.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                    {config.status}
                </span>
                {config.lastSyncAt > 0 && (
                    <span className="text-[10px] text-earth-400 mt-1">
                        Synced: {new Date(config.lastSyncAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                )}
            </div>
        </div>

        {config.status === 'error' && config.lastErrorMessage && (
            <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded flex items-center gap-2">
                <AlertTriangle size={12} /> {config.lastErrorMessage}
            </div>
        )}

        <div className="flex gap-2 border-t border-earth-100 dark:border-stone-800 pt-3 mt-auto">
            <Button size="sm" variant="ghost" onClick={() => onEdit(config)} className="flex-1" icon={<Settings size={14} />}>
                Config
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onSync(config.id)} className="flex-1" disabled={isSyncing}>
                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
        </div>
    </Card>
  );
};
