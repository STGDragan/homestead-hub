
import React, { useState, useEffect } from 'react';
import { Offspring, Animal, SpeciesType, Sex, OffspringStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { dbService } from '../../services/db';
import { X, Baby } from 'lucide-react';
import { ANIMAL_SPECIES } from '../../constants';

interface OffspringModalProps {
  offspring?: Offspring | null;
  onSave: (data: Partial<Offspring>) => void;
  onClose: () => void;
}

export const OffspringModal: React.FC<OffspringModalProps> = ({ offspring, onSave, onClose }) => {
  const [name, setName] = useState(offspring?.name || '');
  const [species, setSpecies] = useState<SpeciesType>(offspring?.species || 'chicken');
  const [dob, setDob] = useState(offspring?.dateOfBirth ? new Date(offspring.dateOfBirth).toISOString().split('T')[0] : '');
  const [sex, setSex] = useState<Sex>(offspring?.sex || 'unknown');
  const [status, setStatus] = useState<OffspringStatus>(offspring?.status || 'active');
  const [sireId, setSireId] = useState(offspring?.sireId || '');
  const [damId, setDamId] = useState(offspring?.damId || '');
  const [birthWeight, setBirthWeight] = useState(offspring?.birthWeight?.toString() || '');
  const [notes, setNotes] = useState(offspring?.birthNotes || '');

  const [parents, setParents] = useState<Animal[]>([]);

  useEffect(() => {
    dbService.getAll<Animal>('animals').then(setParents);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: offspring?.id,
      name,
      species,
      dateOfBirth: dob ? new Date(dob).getTime() : Date.now(),
      sex,
      status,
      sireId: sireId || undefined,
      damId: damId || undefined,
      birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
      birthNotes: notes,
      createdAt: offspring?.createdAt
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Baby className="text-leaf-600" /> {offspring ? 'Edit Offspring' : 'Log Birth'}
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           <div className="grid grid-cols-2 gap-4">
              <Select
                 label="Species"
                 value={species}
                 onChange={e => setSpecies(e.target.value as SpeciesType)}
              >
                 {ANIMAL_SPECIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
              <Input 
                 label="Name / ID (Optional)"
                 value={name}
                 onChange={e => setName(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Input 
                 label="Date of Birth"
                 type="date"
                 value={dob}
                 onChange={e => setDob(e.target.value)}
                 required
              />
              <Select
                 label="Sex"
                 value={sex}
                 onChange={e => setSex(e.target.value as Sex)}
              >
                 <option value="unknown">Unknown</option>
                 <option value="male">Male</option>
                 <option value="female">Female</option>
              </Select>
           </div>

           <div className="p-4 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
              <h3 className="text-xs font-bold text-earth-500 dark:text-stone-400 uppercase mb-3">Parentage</h3>
              <div className="grid grid-cols-2 gap-4">
                 <Select
                    label="Sire"
                    value={sireId}
                    onChange={e => setSireId(e.target.value)}
                 >
                    <option value="">Unknown</option>
                    {parents.filter(p => p.sex === 'male' && p.species === species).map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </Select>
                 <Select
                    label="Dam"
                    value={damId}
                    onChange={e => setDamId(e.target.value)}
                 >
                    <option value="">Unknown</option>
                    {parents.filter(p => p.sex === 'female' && p.species === species).map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </Select>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Input 
                 label="Birth Weight"
                 type="number"
                 value={birthWeight}
                 onChange={e => setBirthWeight(e.target.value)}
              />
              <Select
                 label="Status"
                 value={status}
                 onChange={e => setStatus(e.target.value as OffspringStatus)}
              >
                 <option value="active">Active</option>
                 <option value="retained">Retained (Keeper)</option>
                 <option value="sold">Sold</option>
                 <option value="died">Died</option>
                 <option value="culled">Culled</option>
              </Select>
           </div>

           <TextArea 
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Birth conditions, vigor, etc."
           />

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Record</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
