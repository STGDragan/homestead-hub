

import React from 'react';
import { SeedPacket } from '../../types';
import { Card } from '../ui/Card';
import { Leaf, Sprout, AlertCircle, Clock } from 'lucide-react';

interface SeedCardProps {
  seed: SeedPacket;
  onClick: () => void;
}

export const SeedCard: React.FC<SeedCardProps> = ({ seed, onClick }) => {
  const isExpired = seed.expirationYear && seed.expirationYear < new Date().getFullYear();
  const isLowStock = seed.quantityRemaining <= 5 && seed.quantityUnit === 'count';

  return (
    <Card 
      interactive 
      onClick={onClick}
      className="bg-white dark:bg-night-900 border-2 border-earth-100 dark:border-night-800 hover:border-earth-300 dark:hover:border-night-600 transition-all p-0 overflow-hidden relative"
    >
      {/* Header Image or Color Bar */}
      {seed.imageUrl ? (
          <div className="h-32 w-full overflow-hidden bg-earth-200 dark:bg-stone-800">
              <img src={seed.imageUrl} alt={seed.variety} className="w-full h-full object-cover" />
          </div>
      ) : (
          <div className="h-3 bg-leaf-600 w-full" />
      )}
      
      <div className="p-4">
         <div className="flex justify-between items-start mb-2">
            <div>
               <p className="text-xs font-bold text-earth-500 dark:text-night-400 uppercase tracking-wider mb-0.5">{seed.plantType}</p>
               <h3 className="font-serif font-bold text-xl text-earth-800 dark:text-earth-100 leading-tight">{seed.variety}</h3>
            </div>
            {isExpired && (
                <div className="text-amber-600" title="Expired">
                   <AlertCircle size={18} />
                </div>
            )}
         </div>

         <div className="space-y-2 mt-4">
             <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-night-300">
                <Leaf size={14} className="text-leaf-500" />
                <span className="font-medium">{seed.brand || 'Saved Seed'}</span>
             </div>
             
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-earth-600 dark:text-night-300">
                    <Clock size={14} className="text-leaf-500" />
                    <span>{seed.daysToGerminate}d germ.</span>
                </div>
                <div className={`font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-earth-700 dark:text-night-200'}`}>
                    {seed.quantityRemaining} {seed.quantityUnit}
                </div>
             </div>
         </div>
      </div>
      
      {/* Footer / Status Bar */}
      <div className="bg-earth-50 dark:bg-night-800 border-t border-earth-100 dark:border-night-700 p-2 flex justify-between items-center px-4">
         <span className="text-[10px] font-bold text-earth-400 uppercase">
             {seed.expirationYear ? `Exp: ${seed.expirationYear}` : 'No Exp Date'}
         </span>
         {seed.germinationTests && seed.germinationTests.length > 0 && (
             <span className="text-[10px] font-bold bg-leaf-100 text-leaf-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                 <Sprout size={10} />
                 {seed.germinationTests[seed.germinationTests.length - 1].rate}% Germ
             </span>
         )}
      </div>
    </Card>
  );
};