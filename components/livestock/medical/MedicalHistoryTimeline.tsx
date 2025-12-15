import React from 'react';
import { MedAdminLog, VetVisit, Medication } from '../../../types';
import { Activity, Syringe, Stethoscope } from 'lucide-react';

interface MedicalHistoryTimelineProps {
  logs: MedAdminLog[];
  visits: VetVisit[];
  medications: Medication[];
}

export const MedicalHistoryTimeline: React.FC<MedicalHistoryTimelineProps> = ({ logs, visits, medications }) => {
  const combined = [
    ...logs.map(l => ({ ...l, type: 'med', date: l.administeredAt })),
    ...visits.map(v => ({ ...v, type: 'vet', date: v.date }))
  ].sort((a, b) => b.date - a.date);

  if (combined.length === 0) return <div className="text-center text-earth-400 italic py-4">No medical history recorded.</div>;

  return (
    <div className="space-y-4 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-earth-200 dark:before:bg-stone-800">
      {combined.map((item: any) => {
        const isMed = item.type === 'med';
        const medName = isMed ? medications.find(m => m.id === item.medicationId)?.name || 'Unknown Med' : '';
        
        return (
          <div key={item.id} className="relative pl-10">
             <div className={`absolute left-2 top-1 w-4 h-4 rounded-full border-2 z-10 ${isMed ? 'bg-blue-100 border-blue-500' : 'bg-red-100 border-red-500'}`}></div>
             <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                   <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isMed ? 'text-blue-600' : 'text-red-600'}`}>
                      {isMed ? <Syringe size={12}/> : <Stethoscope size={12}/>}
                      {isMed ? 'Medication' : 'Vet Visit'}
                   </span>
                   <span className="text-xs text-earth-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                
                {isMed ? (
                   <div>
                      <p className="font-bold text-earth-900 dark:text-earth-100">{medName}</p>
                      <p className="text-sm text-earth-600 dark:text-stone-300">{item.doseAmount} {item.doseUnit} ({item.route})</p>
                   </div>
                ) : (
                   <div>
                      <p className="font-bold text-earth-900 dark:text-earth-100">{item.reason}</p>
                      <p className="text-sm text-earth-600 dark:text-stone-300">{item.diagnosis || 'No diagnosis'}</p>
                   </div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
};
