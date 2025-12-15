
import React, { useState } from 'react';
import { FeedLog } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, Wheat } from 'lucide-react';

interface LogFeedModalProps {
  herdId: string;
  onSave: (log: FeedLog) => void;
  onClose: () => void;
}

export const LogFeedModal: React.FC<LogFeedModalProps> = ({ herdId, onSave, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('lbs');
  const [type, setType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: FeedLog = {
      id: crypto.randomUUID(),
      herdGroupId: herdId,
      date: new Date(date).getTime(),
      quantity: Number(quantity),
      unit,
      type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    };
    onSave(log);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Wheat className="text-amber-600" /> Log Feed
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
           <Input label="Feed Type" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Layer Pellets" required />
           <div className="flex gap-2">
               <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required className="flex-1" />
               <div className="w-24">
                   <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">Unit</label>
                   <select 
                       value={unit} 
                       onChange={e => setUnit(e.target.value)} 
                       className="w-full bg-white dark:bg-night-950 border border-earth-300 dark:border-night-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-leaf-500 outline-none"
                   >
                       <option value="lbs">lbs</option>
                       <option value="kg">kg</option>
                       <option value="bales">bales</option>
                       <option value="scoops">scoops</option>
                   </select>
               </div>
           </div>
           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
