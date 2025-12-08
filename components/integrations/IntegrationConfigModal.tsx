
import React, { useState } from 'react';
import { IntegrationConfig, IntegrationType } from '../../types';
import { integrationService } from '../../services/integrationService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, BookOpen } from 'lucide-react';
import { INTEGRATION_SETUP_GUIDES } from '../../constants';

interface IntegrationConfigModalProps {
  config?: IntegrationConfig | null;
  onSave: (config: IntegrationConfig) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({ config, onSave, onClose, onDelete }) => {
  const [name, setName] = useState(config?.name || '');
  const [provider, setProvider] = useState(config?.provider || 'openweathermap');
  const [status, setStatus] = useState<'active' | 'inactive'>(config?.status === 'active' ? 'active' : 'inactive');
  const [apiKey, setApiKey] = useState(config?.settings?.apiKey || '');
  const [endpoint, setEndpoint] = useState(config?.settings?.endpoint || '');
  
  const availableAdapters = integrationService.getAvailableAdapters();
  const guide = INTEGRATION_SETUP_GUIDES[provider];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adapter = availableAdapters.find(a => a.id === provider);
    
    const newConfig: IntegrationConfig = {
        id: config?.id || crypto.randomUUID(),
        name,
        provider,
        type: (adapter?.type as IntegrationType) || 'sensor_hardware',
        status: status as any,
        settings: { apiKey, endpoint },
        lastSyncAt: config?.lastSyncAt || 0,
        errorCount: config?.errorCount || 0,
        createdAt: config?.createdAt || Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };
    onSave(newConfig);
  };

  // Only show endpoint field if not Google Gemini (simplified UX)
  const showEndpoint = provider !== 'google_gemini';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">
             {config ? 'Edit Integration' : 'New Integration'}
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input 
                label="Integration Name"
                placeholder="e.g. Gemini AI"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
            />

            <div className="grid grid-cols-2 gap-4">
                <Select 
                    label="Service Provider"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    disabled={!!config} // Prevent changing provider on edit for simplicity
                >
                    {availableAdapters.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </Select>

                <Select
                    label="Status"
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Disabled</option>
                </Select>
            </div>

            {/* Setup Guide Panel */}
            {guide && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
                        <BookOpen size={16} /> {guide.title} Setup
                    </h3>
                    <p className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-line mb-3 leading-relaxed">
                        {guide.description}
                    </p>
                    <div className="text-xs font-mono bg-white/50 dark:bg-black/20 p-2 rounded text-blue-900 dark:text-blue-100">
                        <strong>Required Fields:</strong> {guide.fields.join(', ')}
                    </div>
                </div>
            )}

            <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700">
                <h3 className="text-xs font-bold text-earth-500 uppercase mb-3">Configuration</h3>
                <div className="space-y-3">
                    <Input 
                        label="API Key / Token"
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Paste key here..."
                    />
                    {showEndpoint && (
                        <Input 
                            label="Endpoint URL (Optional)"
                            value={endpoint}
                            onChange={e => setEndpoint(e.target.value)}
                            placeholder="https://api.example.com"
                        />
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {config && onDelete && (
                    <Button type="button" variant="outline" className="mr-auto text-red-600 border-red-200" onClick={() => onDelete(config.id)}>Delete</Button>
                )}
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Settings</Button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};
