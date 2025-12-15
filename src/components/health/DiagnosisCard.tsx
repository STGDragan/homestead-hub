
import React from 'react';
import { HealthRecord } from '../../types';
import { Card } from '../ui/Card';
import { AlertTriangle, CheckCircle, Leaf, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface DiagnosisCardProps {
  record: HealthRecord;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ record }) => {
  const [expanded, setExpanded] = React.useState(false);
  const diagnosis = record.diagnosis;

  if (record.status !== 'completed' || !diagnosis) {
    return (
      <Card className="opacity-80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-stone-800 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-stone-800 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-stone-800 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  const isHealthy = diagnosis.issueName.toLowerCase().includes('healthy');
  
  const SeverityBadge = () => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[diagnosis.severity]}`}>
        {diagnosis.severity}
      </span>
    );
  };

  return (
    <Card className={`overflow-hidden transition-all ${expanded ? 'ring-2 ring-leaf-500' : ''}`}>
      <div className="flex gap-4 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-earth-200 dark:bg-stone-800 shrink-0 relative">
          <img src={record.photoBlobUrl} alt="Diagnosis Subject" className="w-full h-full object-cover" />
          <div className={`absolute bottom-0 right-0 p-1 rounded-tl-lg ${isHealthy ? 'bg-leaf-500' : 'bg-clay-500'} text-white`}>
            {isHealthy ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="font-serif font-bold text-earth-900 dark:text-earth-100 truncate">{diagnosis.issueName}</h3>
                <p className="text-xs text-earth-500 dark:text-stone-400">{new Date(record.createdAt).toLocaleDateString()}</p>
             </div>
             {!isHealthy && <SeverityBadge />}
          </div>
          
          <p className="text-sm text-earth-600 dark:text-stone-300 mt-1 line-clamp-2">{diagnosis.description}</p>
          
          <div className="flex items-center gap-2 mt-2 text-xs font-bold text-earth-400 dark:text-stone-500">
             <span>{diagnosis.probability}% Confidence</span>
             <div className="flex-1" />
             {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-earth-100 dark:border-night-800 bg-earth-50/50 dark:bg-night-900/50">
           {diagnosis.treatments.length > 0 ? (
             <div className="mt-4 space-y-3">
               <h4 className="font-bold text-earth-800 dark:text-earth-200 text-sm flex items-center gap-2">
                 <Activity size={16} className="text-leaf-600 dark:text-leaf-400" /> Suggested Treatments
               </h4>
               {diagnosis.treatments.map((t, idx) => (
                 <div key={idx} className="bg-white dark:bg-night-900 p-3 rounded-lg border border-earth-200 dark:border-night-700 shadow-sm">
                   <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-earth-900 dark:text-earth-100 text-sm">{t.title}</span>
                     {t.organic && (
                       <span className="flex items-center gap-1 text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded border border-green-100 dark:border-green-900/30">
                         <Leaf size={10} /> Organic
                       </span>
                     )}
                   </div>
                   <p className="text-xs text-earth-600 dark:text-stone-300">{t.description}</p>
                 </div>
               ))}
             </div>
           ) : (
             <div className="mt-4 text-sm text-earth-500 dark:text-stone-400 italic">No specific treatments required. Keep monitoring!</div>
           )}
           
           <div className="mt-4 pt-4 border-t border-earth-200 dark:border-night-800">
              <p className="text-[10px] text-earth-400 dark:text-stone-500 text-center uppercase tracking-widest">
                AI Diagnosis • Verify before treating
              </p>
           </div>
        </div>
      )}
    </Card>
  );
};
