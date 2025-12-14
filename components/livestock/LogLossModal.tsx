
import React, { useState } from 'react';
import { LossLog } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, AlertTriangle } from 'lucide-react';

interface LogLossModalProps {
  herdId: string;
  onSave: (log: LossLog) => void;
  onClose: () => void;
}

export const LogLossModal: React.FC<LogLossModalProps> = ({ herdId, onSave, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState('1');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: LossLog = {
      id: crypto.randomUUID(),
      herdGroupId: herdId,
      date: new Date(date).getTime(),
      count: Number(count),
      reason,
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
          <h2 className="text-xl font-serif font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
             <AlertTriangle className="text-red-600" /> Record Loss
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
           <Input label="Number of Animals" type="number" value={count} onChange={e => setCount(e.target.value)} required min={1} />
           <TextArea label="Reason / Notes" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Predator, Illness, Culling..." required />
           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 border-red-600">Save Record</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
