
import React, { useState, useEffect } from 'react';
import { BreedingLog, Animal } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { dbService } from '../../services/db';
import { X, Heart } from 'lucide-react';

interface BreedingLogModalProps {
  onSave: (log: BreedingLog) => void;
  onClose: () => void;
}

export const BreedingLogModal: React.FC<BreedingLogModalProps> = ({ onSave, onClose }) => {
  const [sires, setSires] = useState<Animal[]>([]);
  const [dams, setDams] = useState<Animal[]>([]);
  
  const [sireId, setSireId] = useState('');
  const [damId, setDamId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'mated'|'pregnant'|'birthed'>('mated');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadAnimals = async () => {
       const all = await dbService.getAll<Animal>('animals');
       setSires(all.filter(a => a.sex === 'male' && a.status === 'active'));
       setDams(all.filter(a => a.sex === 'female' && a.status === 'active'));
    };
    loadAnimals();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
       id: crypto.randomUUID(),
       sireId,
       damId,
       matingDate: new Date(date).getTime(),
       status,
       notes,
       createdAt: Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Heart className="text-red-500 fill-red-500" /> Log Breeding Event
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           <div className="grid grid-cols-2 gap-4">
              <Select 
                 label="Sire (Male)"
                 value={sireId}
                 onChange={e => setSireId(e.target.value)}
                 required
              >
                 <option value="">Select...</option>
                 {sires.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select 
                 label="Dam (Female)"
                 value={damId}
                 onChange={e => setDamId(e.target.value)}
                 required
              >
                 <option value="">Select...</option>
                 {dams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
           </div>

           <Input 
              label="Date of Mating"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
           />

           <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
           >
              <option value="mated">Mated (Unconfirmed)</option>
              <option value="pregnant">Pregnant / Gravid</option>
              <option value="birthed">Birthed / Hatched</option>
           </Select>

           <TextArea 
              label="Notes"
              placeholder="Behavior, estimated due date..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
           />

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Log</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
