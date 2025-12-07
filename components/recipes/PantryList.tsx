
import React from 'react';
import { PantryItem } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface PantryListProps {
  items: PantryItem[];
  onUpdateQuantity: (item: PantryItem, delta: number) => void;
  onDelete: (id: string) => void;
}

export const PantryList: React.FC<PantryListProps> = ({ items, onUpdateQuantity, onDelete }) => {
  if (items.length === 0) {
    return <div className="text-center py-8 text-earth-400 italic text-sm">Pantry is empty.</div>;
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-night-900 border border-earth-200 dark:border-night-700 rounded-xl shadow-sm">
          <div>
            <p className="font-bold text-earth-800 dark:text-earth-100">{item.name}</p>
            <p className="text-xs text-earth-500 dark:text-night-400 capitalize">{item.category} • {item.quantity} {item.unit}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onUpdateQuantity(item, -1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-earth-100 dark:bg-night-800 text-earth-600 dark:text-night-300 hover:bg-earth-200 dark:hover:bg-night-700"
            >
              <Minus size={16} />
            </button>
            <button 
              onClick={() => onUpdateQuantity(item, 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-earth-100 dark:bg-night-800 text-earth-600 dark:text-night-300 hover:bg-earth-200 dark:hover:bg-night-700"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-earth-300 hover:bg-red-50 hover:text-red-500 ml-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
