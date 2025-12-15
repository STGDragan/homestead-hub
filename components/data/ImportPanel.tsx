
import React, { useState } from 'react';
import { dataTransferService } from '../../services/dataTransferService';
import { ImportConflictStrategy } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Upload, AlertTriangle, CheckCircle, FileJson } from 'lucide-react';

export const ImportPanel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<ImportConflictStrategy>('skip');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    if (!confirm("Importing data will modify your local database. Ensure you have a backup first. Continue?")) return;

    setStatus('processing');
    try {
      const res = await dataTransferService.importData(file, strategy, 'main_user');
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        setFile(null);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    } catch (e) {
      setStatus('error');
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl p-6">
          <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4 flex items-center gap-2">
             <Upload size={20} className="text-blue-600" /> Import / Restore
          </h3>

          <div className="border-2 border-dashed border-earth-300 dark:border-stone-700 rounded-xl p-8 text-center mb-6 hover:bg-earth-50 dark:hover:bg-stone-800 transition-colors relative">
             <input type="file" accept=".json" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
             <div className="flex flex-col items-center">
                {file ? (
                   <>
                      <FileJson size={32} className="text-leaf-600 mb-2" />
                      <p className="font-bold text-earth-800 dark:text-earth-200">{file.name}</p>
                      <p className="text-xs text-earth-500">{(file.size / 1024).toFixed(1)} KB</p>
                   </>
                ) : (
                   <>
                      <Upload size={32} className="text-earth-400 mb-2" />
                      <p className="text-earth-600 dark:text-stone-400 font-bold">Drag file or click to upload</p>
                      <p className="text-xs text-earth-400 mt-1">Supports JSON backups</p>
                   </>
                )}
             </div>
          </div>

          <div className="mb-6">
             <Select label="Conflict Strategy" value={strategy} onChange={e => setStrategy(e.target.value as ImportConflictStrategy)}>
                <option value="skip">Skip if ID exists (Safe)</option>
                <option value="overwrite">Overwrite existing (Restore)</option>
                <option value="copy">Create copies (Not recommended)</option>
             </Select>
             <p className="text-xs text-earth-500 mt-1">
                "Skip" preserves current data. "Overwrite" replaces local data with file data.
             </p>
          </div>

          {status === 'processing' && (
             <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-2 mb-4">
                <span className="animate-spin">⏳</span> Processing import...
             </div>
          )}

          {status === 'success' && (
             <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2 mb-4">
                <CheckCircle size={16} /> {message}
             </div>
          )}

          {status === 'error' && (
             <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm flex items-center gap-2 mb-4">
                <AlertTriangle size={16} /> {message}
             </div>
          )}

          <Button onClick={handleImport} disabled={!file || status === 'processing'} className="w-full">
             Start Import
          </Button>
       </div>
    </div>
  );
};
