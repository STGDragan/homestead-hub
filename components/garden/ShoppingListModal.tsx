
import React, { useState } from 'react';
import { Plant, PlantTemplate } from '../../types';
import { Button } from '../ui/Button';
import { X, Clipboard, Check, Sprout, Leaf } from 'lucide-react';

interface ShoppingListModalProps {
  plants: Plant[];
  allTemplates: PlantTemplate[];
  onClose: () => void;
}

interface ShoppingItem {
  id: string;
  name: string;
  variety: string;
  count: number;
  method: 'direct' | 'transplant' | 'both' | 'unknown';
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ plants, allTemplates, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Aggregate Items
  const itemsMap: Record<string, ShoppingItem> = {};

  plants.forEach(plant => {
    const key = `${plant.name}-${plant.variety}`;
    if (!itemsMap[key]) {
        const template = allTemplates.find(t => t.name === plant.name) || allTemplates.find(t => t.name.includes(plant.name));
        itemsMap[key] = {
            id: key,
            name: plant.name,
            variety: plant.variety,
            count: 0,
            method: template?.plantingMethod || 'unknown'
        };
    }
    itemsMap[key].count += (plant.quantity || 1);
  });

  const items = Object.values(itemsMap).sort((a, b) => a.name.localeCompare(b.name));

  const handleCopy = () => {
    const text = items.map(i => {
        const type = i.method === 'transplant' ? '(Starts)' : '(Seeds)';
        return `- ${i.count}x ${i.name} (${i.variety}) ${type}`;
    }).join('\n');
    
    navigator.clipboard.writeText(`Garden Shopping List:\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Shopping List</h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
            {items.length === 0 ? (
                <div className="text-center py-8 text-earth-500 italic">No plants in this bed yet.</div>
            ) : items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.method === 'transplant' ? 'bg-leaf-100 text-leaf-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.method === 'transplant' ? <Sprout size={16} /> : <Leaf size={16} />}
                        </div>
                        <div>
                            <p className="font-bold text-earth-900 dark:text-earth-100 text-sm">{item.name}</p>
                            <p className="text-xs text-earth-500 dark:text-stone-400">{item.variety}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-lg text-earth-800 dark:text-earth-200">{item.count}</span>
                        <p className="text-[10px] uppercase font-bold text-earth-400">
                            {item.method === 'transplant' ? 'Starts' : 'Seeds'}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex gap-3 pt-2 border-t border-earth-100 dark:border-stone-800">
            <Button variant="secondary" className="flex-1" onClick={handleCopy} icon={copied ? <Check size={16}/> : <Clipboard size={16}/>}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button className="flex-1" onClick={() => window.print()}>Print</Button>
        </div>
      </div>
    </div>
  );
};
