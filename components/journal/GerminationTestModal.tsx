
import React, { useState } from 'react';
import { SeedPacket, GerminationTest } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, Sprout, Calculator } from 'lucide-react';
import { seedAI } from '../../services/seedAI';

interface GerminationTestModalProps {
  seed: SeedPacket;
  onSave: (test: GerminationTest) => void;
  onClose: () => void;
}

export const GerminationTestModal: React.FC<GerminationTestModalProps> = ({ seed, onSave, onClose }) => {
  const [total, setTotal] = useState('10');
  const [sprouted, setSprouted] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const rate = seedAI.calculateGerminationRate(Number(sprouted), Number(total));
  const status = seedAI.getViabilityStatus(rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: new Date(date).getTime(),
      seedsPlanted: Number(total),
      seedsSprouted: Number(sprouted),
      rate,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Sprout className="text-leaf-600" /> Germination Test
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="p-3 bg-earth-50 dark:bg-stone-800 rounded-xl mb-4">
              <p className="text-sm text-earth-600 dark:text-stone-300">Testing: <strong>{seed.variety}</strong></p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Input 
                 label="Seeds Planted"
                 type="number"
                 value={total}
                 onChange={e => setTotal(e.target.value)}
                 required
              />
              <Input 
                 label="Seeds Sprouted"
                 type="number"
                 value={sprouted}
                 onChange={e => setSprouted(e.target.value)}
                 required
              />
           </div>

           <Input 
              label="Test Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
           />

           {sprouted && (
              <div className="flex items-center justify-between p-4 border border-earth-200 dark:border-stone-700 rounded-xl">
                 <span className="font-bold text-earth-600 dark:text-stone-300">Calculated Rate:</span>
                 <span className={`text-xl font-bold ${status.color}`}>
                    {rate}% ({status.status})
                 </span>
              </div>
           )}

           <TextArea 
              label="Notes"
              placeholder="Conditions, issues observed..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
           />

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Record Result</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
