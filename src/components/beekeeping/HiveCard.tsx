
import React from 'react';
import { Hive } from '../../types';
import { Card } from '../ui/Card';
import { Hexagon, Activity } from 'lucide-react';

interface HiveCardProps {
    hive: Hive;
    onClick: () => void;
}

export const HiveCard: React.FC<HiveCardProps> = ({ hive, onClick }) => {
    return (
        <Card interactive onClick={onClick} className="flex items-center gap-4 p-4 border-l-4 border-l-amber-400">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <Hexagon size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-earth-900 dark:text-earth-100 truncate">{hive.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${hive.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {hive.status}
                    </span>
                </div>
                <p className="text-xs text-earth-500 dark:text-stone-400 font-medium capitalize">
                    {hive.type.replace('_', ' ')} • {hive.queenBreed} Queen
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-earth-400">
                    <Activity size={12} />
                    <span>Health: Good (Est.)</span> 
                </div>
            </div>
        </Card>
    );
};
