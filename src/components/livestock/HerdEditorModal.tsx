
import React, { useState } from 'react';
import { HerdGroup, SpeciesType, HiveType, BeeBreed } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, PawPrint, Hexagon } from 'lucide-react';
import { ANIMAL_SPECIES, HIVE_TYPES, BEE_BREEDS } from '../../constants';

interface HerdEditorModalProps {
  onSave: (herd: Partial<HerdGroup>, isHive?: boolean, hiveDetails?: any) => void;
  onClose: () => void;
}

export const HerdEditorModal: React.FC<HerdEditorModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<SpeciesType>('chicken');
  
  // Hive Specific
  const [hiveType, setHiveType] = useState<HiveType>('langstroth');
  const [queenBreed, setQueenBreed] = useState<BeeBreed>('italian');
  const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (species === 'bee') {
        onSave({}, true, {
            name,
            type: hiveType,
            queenBreed,
            installedDate: new Date(installDate).getTime()
        });
    } else {
        onSave({
            name,
            speciesType: species
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             {species === 'bee' ? <Hexagon className="text-amber-500"/> : <PawPrint className="text-leaf-600"/>}
             {species === 'bee' ? 'New Bee Colony' : 'New Herd Group'}
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           
           <div>
              <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Select Species</label>
              <div className="grid grid-cols-3 gap-2">
                  {ANIMAL_SPECIES.map(s => (
                      <button
                          key={s.id}
                          type="button"
                          onClick={() => setSpecies(s.id)}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${species === s.id ? 'bg-earth-800 text-white border-earth-800 dark:bg-leaf-600 dark:border-leaf-600' : 'bg-white dark:bg-stone-800 border-earth-200 dark:border-stone-700 text-earth-600 dark:text-stone-400 hover:bg-earth-50'}`}
                      >
                          {s.label}
                      </button>
                  ))}
              </div>
           </div>

           <Input 
              label={species === 'bee' ? "Hive Name" : "Group Name"}
              placeholder={species === 'bee' ? "e.g. Hive #1" : "e.g. Main Chicken Coop"}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
           />

           {species === 'bee' && (
              <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      <Select label="Hive Type" value={hiveType} onChange={e => setHiveType(e.target.value as any)}>
                          {HIVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </Select>
                      <Select label="Queen Breed" value={queenBreed} onChange={e => setQueenBreed(e.target.value as any)}>
                          {BEE_BREEDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                      </Select>
                  </div>
                  <Input label="Install Date" type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} required />
              </div>
           )}

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">{species === 'bee' ? 'Create Hive' : 'Create Group'}</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
