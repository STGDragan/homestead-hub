
import React, { useState, useEffect } from 'react';
import { dataTransferService } from '../../services/dataTransferService';
import { DataExportRecord, ExportScope, ExportFormat } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Download, FileText, FileJson, Clock } from 'lucide-react';

export const ExportPanel: React.FC = () => {
  const [scope, setScope] = useState<ExportScope>('full');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<DataExportRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const h = await dataTransferService.getExportHistory();
    setHistory(h);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const { url, filename } = await dataTransferService.exportData(scope, format, 'main_user');
      
      // Trigger Download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      await loadHistory();
    } catch (e) {
      alert("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl p-6">
          <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4 flex items-center gap-2">
             <Download size={20} className="text-leaf-600" /> Export Data
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
             <Select label="Data Scope" value={scope} onChange={e => setScope(e.target.value as ExportScope)}>
                <option value="full">Full Backup (All Data)</option>
                <option value="garden">Garden & Plants</option>
                <option value="livestock">Livestock & Breeding</option>
                <option value="tasks">Tasks & Schedule</option>
                <option value="finances">Finances</option>
             </Select>
             
             <Select label="Format" value={format} onChange={e => setFormat(e.target.value as ExportFormat)}>
                <option value="json">JSON (Complete Restore)</option>
                <option value="csv">CSV (Spreadsheet)</option>
             </Select>
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full md:w-auto">
             {loading ? 'Generating...' : 'Download Export'}
          </Button>
       </div>

       <div className="bg-earth-50 dark:bg-stone-800/50 rounded-xl p-4 border border-earth-100 dark:border-stone-800">
          <h4 className="text-xs font-bold text-earth-500 uppercase mb-3 flex items-center gap-2">
             <Clock size={12} /> Recent Exports
          </h4>
          <div className="space-y-2">
             {history.length === 0 ? (
                <p className="text-sm text-earth-400 italic">No recent exports.</p>
             ) : (
                history.slice(0, 5).map(rec => (
                   <div key={rec.id} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-stone-900 rounded border border-earth-200 dark:border-stone-700">
                      <div className="flex items-center gap-2">
                         {rec.format === 'json' ? <FileJson size={16} className="text-orange-500"/> : <FileText size={16} className="text-green-600"/>}
                         <span className="font-medium text-earth-700 dark:text-earth-200 capitalize">{rec.scope} Backup</span>
                      </div>
                      <span className="text-earth-500 text-xs">
                         {new Date(rec.createdAt).toLocaleDateString()} • {Math.round(rec.fileSize / 1024)} KB
                      </span>
                   </div>
                ))
             )}
          </div>
       </div>
    </div>
  );
};
