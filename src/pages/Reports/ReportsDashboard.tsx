
import React, { useEffect, useState } from 'react';
import { reportingLogic, KPIResult } from '../../services/reportingLogic';
import { KPICard } from '../../components/reports/KPICard';
import { ExportModal } from '../../components/reports/ExportModal';
import { Button } from '../../components/ui/Button';
import { FileBarChart, Download, Calendar, Activity, GitBranch, History } from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const [breedingKPIs, setBreedingKPIs] = useState<KPIResult[]>([]);
  const [complianceKPIs, setComplianceKPIs] = useState<KPIResult[]>([]);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    const b = await reportingLogic.getBreedingKPIs();
    const c = await reportingLogic.getComplianceKPIs();
    setBreedingKPIs(b);
    setComplianceKPIs(c);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                <FileBarChart className="text-leaf-700 dark:text-leaf-400" /> Reports & Compliance
             </h1>
             <p className="text-earth-600 dark:text-stone-400">Track performance and generate regulatory documents.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" icon={<Calendar size={18} />}>Schedule</Button>
             <Button onClick={() => setShowExport(true)} icon={<Download size={18} />}>Export Data</Button>
          </div>
       </div>

       {/* KPIs */}
       <section>
          <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4">Breeding Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {breedingKPIs.map((kpi, i) => (
                <KPICard key={i} kpi={kpi} icon={<Activity size={20}/>} />
             ))}
          </div>
       </section>

       <section>
          <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4">Compliance & Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {complianceKPIs.map((kpi, i) => (
                <KPICard key={i} kpi={kpi} icon={<Activity size={20}/>} />
             ))}
          </div>
       </section>

       {/* Recent Activity / Audit Log Preview */}
       <section className="bg-white dark:bg-stone-900 rounded-2xl border border-earth-200 dark:border-stone-800 p-6">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                <History size={20} className="text-earth-500" /> Audit Log
             </h2>
             <Button variant="ghost" size="sm">View Full Log</Button>
          </div>
          <div className="space-y-4">
             {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 items-start text-sm border-b border-earth-100 dark:border-stone-800 pb-3 last:border-0">
                   <div className="w-2 h-2 rounded-full bg-leaf-500 mt-1.5 shrink-0" />
                   <div>
                      <p className="font-bold text-earth-800 dark:text-earth-200">Export Generated (Lineage Trace)</p>
                      <p className="text-earth-500 text-xs">Performed by Admin • {i * 15} mins ago</p>
                   </div>
                </div>
             ))}
          </div>
       </section>

       {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
};
