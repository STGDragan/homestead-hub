
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { healthAIService } from '../../services/healthAI';
import { HealthRecord, HealthSubjectType } from '../../types';
import { DiagnosisCard } from '../../components/health/DiagnosisCard';
import { ScannerModal } from '../../components/health/ScannerModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Plus, Activity, Stethoscope, AlertTriangle, CloudOff } from 'lucide-react';

export const HealthDashboard: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadRecords();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadRecords = async () => {
    try {
      const data = await dbService.getAll<HealthRecord>('health_records');
      // Sort desc
      data.sort((a, b) => b.createdAt - a.createdAt);
      setRecords(data);
    } catch (e) {
      console.error("Failed to load health records", e);
    }
  };

  const handleScan = async (blob: Blob, type: HealthSubjectType) => {
    setIsScannerOpen(false);

    const recordId = crypto.randomUUID();
    const photoUrl = URL.createObjectURL(blob);

    // 1. Create Initial Pending Record
    const newRecord: HealthRecord = {
       id: recordId,
       subjectType: type,
       photoBlobUrl: photoUrl,
       status: 'analyzing',
       createdAt: Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };

    // Save strictly local first
    await dbService.put('health_records', newRecord);
    setRecords(prev => [newRecord, ...prev]);

    // 2. Process with AI Service
    if (isOnline) {
       try {
          const diagnosis = await healthAIService.analyzePhoto(blob, type);
          
          const updatedRecord: HealthRecord = {
             ...newRecord,
             status: 'completed',
             diagnosis: diagnosis,
             syncStatus: 'synced' // Mocking successful sync
          };
          
          await dbService.put('health_records', updatedRecord);
          setRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
       } catch (error) {
          console.error("Analysis failed", error);
          const failedRecord: HealthRecord = { ...newRecord, status: 'failed' };
          await dbService.put('health_records', failedRecord);
          setRecords(prev => prev.map(r => r.id === recordId ? failedRecord : r));
       }
    } else {
       // Offline: Stay pending upload
       // Optional: Run local heuristic if we had notes
       const pendingRecord: HealthRecord = {
         ...newRecord,
         status: 'pending_upload'
       };
       await dbService.put('health_records', pendingRecord);
       setRecords(prev => prev.map(r => r.id === recordId ? pendingRecord : r));
    }
  };

  const pendingCount = records.filter(r => r.status === 'pending_upload' || r.status === 'analyzing').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Stethoscope className="text-leaf-700 dark:text-leaf-400" /> Health Solver
          </h1>
          <p className="text-earth-600 dark:text-stone-400">AI-assisted diagnostics for plants and animals.</p>
        </div>
        <Button onClick={() => setIsScannerOpen(true)} icon={<Plus size={18} />} className="shadow-lg shadow-leaf-900/20">
            New Scan
        </Button>
      </div>

      {/* Connection / Queue Status */}
      {!isOnline && (
        <div className="bg-clay-50 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-900/30 rounded-xl p-4 flex items-center gap-3 text-clay-800 dark:text-clay-200">
           <CloudOff size={20} />
           <div className="text-sm">
              <p className="font-bold">Offline Mode Active</p>
              <p>Scans will be queued and analyzed when connection returns.</p>
           </div>
        </div>
      )}
      
      {isOnline && pendingCount > 0 && (
         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex items-center gap-3 text-blue-800 dark:text-blue-200 animate-pulse">
            <Activity size={20} className="animate-spin" />
            <div className="text-sm">
               <p className="font-bold">Analyzing {pendingCount} item{pendingCount > 1 ? 's' : ''}...</p>
               <p>AI is processing your images.</p>
            </div>
         </div>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-2 space-y-6">
            <h2 className="font-bold text-earth-800 dark:text-earth-100 text-lg border-b border-earth-200 dark:border-stone-800 pb-2">Recent History</h2>
            
            {records.length === 0 ? (
               <div className="text-center py-16 bg-white dark:bg-night-900 rounded-2xl border-2 border-dashed border-earth-200 dark:border-night-800">
                  <div className="w-16 h-16 bg-leaf-50 dark:bg-leaf-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-leaf-500 dark:text-leaf-400">
                     <Stethoscope size={32} />
                  </div>
                  <h3 className="font-serif font-bold text-earth-800 dark:text-earth-100 mb-2">No Health Records</h3>
                  <p className="text-earth-500 dark:text-stone-400 mb-6 max-w-sm mx-auto">Take a photo of a sick plant or animal to get treatment advice.</p>
                  <Button variant="secondary" onClick={() => setIsScannerOpen(true)}>Start First Scan</Button>
               </div>
            ) : (
               <div className="space-y-4">
                  {records.map(record => (
                     <DiagnosisCard key={record.id} record={record} />
                  ))}
               </div>
            )}
         </div>

         {/* Sidebar Stats / Early Warning */}
         <div className="space-y-6">
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
               <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                  <div>
                     <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Early Warning</h3>
                     <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                        Conditions are favorable for <strong>Potato Blight</strong> this week due to high humidity.
                     </p>
                     <p className="text-xs text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">Preventative Action</p>
                     <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">Ensure good airflow and avoid overhead watering.</p>
                  </div>
               </div>
            </Card>

            <Card>
               <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-4">Quick Tips</h3>
               <ul className="space-y-3 text-sm text-earth-600 dark:text-stone-300">
                  <li className="flex gap-2">
                     <div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5 shrink-0" />
                     Isolate sick animals immediately to prevent spread.
                  </li>
                  <li className="flex gap-2">
                     <div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5 shrink-0" />
                     Sanitize garden shears between cuts on different plants.
                  </li>
                  <li className="flex gap-2">
                     <div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5 shrink-0" />
                     Take photos of issues early, even if you don't treat them yet.
                  </li>
               </ul>
            </Card>
         </div>
      </div>

      {isScannerOpen && (
         <ScannerModal 
            onScan={handleScan}
            onClose={() => setIsScannerOpen(false)}
         />
      )}
    </div>
  );
};
