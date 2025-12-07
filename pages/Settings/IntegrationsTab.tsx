
import React, { useState, useEffect } from 'react';
import { integrationService } from '../../services/integrationService';
import { IntegrationConfig } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { IntegrationConfigModal } from '../../components/integrations/IntegrationConfigModal';
import { Button } from '../../components/ui/Button';
import { Plus, Link, RefreshCw } from 'lucide-react';

export const IntegrationsTab: React.FC = () => {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IntegrationConfig | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await integrationService.getAllConfigs();
    setConfigs(list);
  };

  const handleSave = async (config: IntegrationConfig) => {
    await integrationService.saveConfig(config);
    loadData();
    setShowModal(false);
    setEditingConfig(null);
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this integration? Connected data may stop updating.')) {
        await integrationService.deleteConfig(id);
        loadData();
        setShowModal(false);
    }
  };

  const handleSync = async (id: string) => {
      setSyncingId(id);
      await integrationService.syncIntegration(id);
      setSyncingId(null);
      loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       
       <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
             <div className="p-4 bg-earth-800 rounded-xl text-white">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                   <Link size={20} className="text-leaf-300" /> Connections
                </h3>
                <p className="text-xs text-earth-200 mt-1 opacity-80">
                   Connect external hardware, weather providers, and seed catalogs.
                </p>
             </div>
             
             <Button onClick={() => { setEditingConfig(null); setShowModal(true); }} className="w-full" icon={<Plus size={16}/>}>
                Add Integration
             </Button>
          </div>

          <div className="flex-1">
             {configs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-800">
                   <div className="w-16 h-16 bg-earth-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-earth-500">
                      <Link size={32} />
                   </div>
                   <h3 className="font-serif font-bold text-earth-800 dark:text-earth-100 mb-2">No Active Integrations</h3>
                   <p className="text-earth-500 dark:text-stone-400 mb-6">Connect your IoT devices or 3rd party APIs.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {configs.map(config => (
                      <IntegrationCard 
                         key={config.id} 
                         config={config} 
                         onSync={handleSync}
                         onEdit={(c) => { setEditingConfig(c); setShowModal(true); }}
                         isSyncing={syncingId === config.id}
                      />
                   ))}
                </div>
             )}
          </div>
       </div>

       {showModal && (
          <IntegrationConfigModal 
             config={editingConfig}
             onSave={handleSave}
             onClose={() => setShowModal(false)}
             onDelete={handleDelete}
          />
       )}
    </div>
  );
};
