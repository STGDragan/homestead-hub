import React from 'react';
import { WithdrawalFlag, Medication } from '../../../types';
import { AlertTriangle, Clock } from 'lucide-react';

interface WithdrawalAlertWidgetProps {
  flags: WithdrawalFlag[];
  medications: Medication[];
}

export const WithdrawalAlertWidget: React.FC<WithdrawalAlertWidgetProps> = ({ flags, medications }) => {
  if (flags.length === 0) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 animate-in slide-in-from-top-2">
       <div className="flex items-start gap-3">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full text-red-600 dark:text-red-400">
             <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
             <h3 className="font-bold text-red-900 dark:text-red-100 text-lg">Active Withdrawal Period</h3>
             <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                Products from this animal are currently unsafe for consumption.
             </p>
             
             <div className="space-y-2">
                {flags.map(flag => {
                   const medName = medications.find(m => m.id === flag.medicationId)?.name || 'Medication';
                   const daysLeft = Math.ceil((flag.endDate - Date.now()) / (1000 * 60 * 60 * 24));
                   
                   return (
                      <div key={flag.id} className="bg-white/60 dark:bg-black/20 p-2 rounded-lg flex justify-between items-center text-sm">
                         <span className="font-bold text-red-900 dark:text-red-100 capitalize flex items-center gap-2">
                            {flag.productAffected} <span className="text-xs font-normal opacity-80">({medName})</span>
                         </span>
                         <span className="flex items-center gap-1 font-bold text-red-700 dark:text-red-300">
                            <Clock size={14} /> {daysLeft} days left
                         </span>
                      </div>
                   );
                })}
             </div>
          </div>
       </div>
    </div>
  );
};
