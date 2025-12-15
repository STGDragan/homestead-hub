
import React, { useState } from 'react';
import { ExportPanel } from '../../components/data/ExportPanel';
import { ImportPanel } from '../../components/data/ImportPanel';
import { Card } from '../../components/ui/Card';
import { Database, AlertTriangle } from 'lucide-react';

export const DataManagementTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'export' | 'import'>('export');

  return (
    <div className="space-y-6 animate-in fade-in">
       
       <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
             <div className="p-4 bg-earth-800 rounded-xl text-white mb-4">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                   <Database size={20} className="text-leaf-300" /> Data Control
                </h3>
                <p className="text-xs text-earth-200 mt-1 opacity-80">
                   You own your data. Export backups or restore from files.
                </p>
             </div>

             <button 
                onClick={() => setActiveView('export')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeView === 'export' ? 'bg-white dark:bg-stone-800 text-leaf-700 shadow-sm border border-earth-200 dark:border-stone-700' : 'text-earth-500 hover:bg-earth-50 dark:hover:bg-stone-800'}`}
             >
                Export & Backup
             </button>
             <button 
                onClick={() => setActiveView('import')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeView === 'import' ? 'bg-white dark:bg-stone-800 text-leaf-700 shadow-sm border border-earth-200 dark:border-stone-700' : 'text-earth-500 hover:bg-earth-50 dark:hover:bg-stone-800'}`}
             >
                Import & Restore
             </button>
          </div>

          <div className="flex-1">
             {activeView === 'export' ? (
                <ExportPanel />
             ) : (
                <ImportPanel />
             )}

             <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                   <p className="font-bold mb-1">Privacy Notice</p>
                   <p>Your data is stored locally on this device. Exports contain sensitive information (logs, financials). Store your backup files securely.</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
