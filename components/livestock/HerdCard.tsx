import React from 'react';
import { HerdGroup, AnimalTypeEntry } from '../../types';
import { Card, CardTitle } from '../ui/Card';
import { Bird, Milk, Mountain, Cloud, Rabbit, PiggyBank, Hexagon, HelpCircle, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ICONS: Record<string, React.FC<any>> = {
  chicken: Bird,
  duck: Bird,
  goat: Mountain,
  sheep: Cloud,
  cattle: Milk,
  rabbit: Rabbit,
  pig: PiggyBank,
  bee: Hexagon,
  other: HelpCircle,
};

interface HerdCardProps {
  herd: HerdGroup;
  entries: AnimalTypeEntry[];
}

export const HerdCard: React.FC<HerdCardProps> = ({ herd, entries }) => {
  const navigate = useNavigate();
  const Icon = ICONS[herd.speciesType] || HelpCircle;
  const totalCount = entries.reduce((acc, curr) => acc + curr.quantity, 0);
  const distinctBreeds = entries.map(e => e.typeName).join(', ');

  return (
    <Card 
      interactive 
      onClick={() => navigate(`/animals/herd/${herd.id}`)}
      className="bg-white group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 transform translate-x-4 -translate-y-2">
         <Icon size={100} className="text-earth-900" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-earth-100 rounded-xl text-earth-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                <Icon size={24} />
             </div>
             <div>
                <CardTitle>{herd.name}</CardTitle>
                <p className="text-xs text-earth-500 font-bold uppercase tracking-wider">{herd.speciesType}</p>
             </div>
          </div>
        </div>

        <div className="space-y-3">
           <div className="flex items-end gap-2">
              <span className="text-4xl font-serif font-bold text-earth-800 leading-none">{totalCount}</span>
              <span className="text-sm text-earth-500 mb-1">animals</span>
           </div>
           
           {entries.length > 0 ? (
             <div className="text-sm text-earth-600 truncate">
                <span className="font-bold">Breeds: </span>
                {distinctBreeds}
             </div>
           ) : (
             <div className="text-sm text-earth-400 italic">No animals added yet</div>
           )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-earth-100 flex items-center justify-between text-sm">
           <div className="flex items-center gap-1 text-leaf-700 font-bold bg-leaf-50 px-2 py-1 rounded-md">
              <Activity size={14} />
              <span>Healthy</span>
           </div>
           <span className="text-earth-400 group-hover:text-earth-600 flex items-center gap-1 transition-colors">
             Manage <ChevronRight size={16} />
           </span>
        </div>
      </div>
    </Card>
  );
};
