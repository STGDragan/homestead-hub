import React from 'react';
import { Season } from '../../types';
import { Sun, Snowflake, CloudRain, Leaf, Calendar } from 'lucide-react';

interface SeasonWheelProps {
  activeSeason: Season;
  onSelect: (season: Season) => void;
}

export const SeasonWheel: React.FC<SeasonWheelProps> = ({ activeSeason, onSelect }) => {
  const seasons: { id: Season; label: string; icon: any; color: string }[] = [
    { id: 'spring', label: 'Spring', icon: Leaf, color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300' },
    { id: 'summer', label: 'Summer', icon: Sun, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300' },
    { id: 'fall', label: 'Fall', icon: CloudRain, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300' },
    { id: 'winter', label: 'Winter', icon: Snowflake, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`
          flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[80px] transition-all
          ${activeSeason === 'all' 
            ? 'bg-earth-800 text-white border-earth-800 shadow-md transform scale-105' 
            : 'bg-white text-earth-500 border-earth-200 hover:border-earth-300'}
        `}
      >
        <Calendar size={20} className="mb-1" />
        <span className="text-xs font-bold">All</span>
      </button>

      {seasons.map((s) => {
        const Icon = s.icon;
        const isActive = activeSeason === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[80px] transition-all
              ${isActive 
                ? `${s.color} border-current shadow-md transform scale-105` 
                : 'bg-white text-earth-400 border-earth-200 hover:bg-earth-50'}
            `}
          >
            <Icon size={20} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-bold">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};