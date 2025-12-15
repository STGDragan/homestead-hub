
import React, { useState, useEffect } from 'react';
import { SeedPacket, GardenBed, PlantingLog } from '../../types';
import { dbService } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Sprout } from 'lucide-react';

interface PlantingLogModalProps {
  seed?: SeedPacket; // Optional: can start with seed or select one
  onClose: () => void;
  onSave: (log: PlantingLog) => void;
}

export const PlantingLogModal: React.FC<PlantingLogModalProps> = ({ seed, onClose, onSave }) => {
  const [seeds, setSeeds] = useState<SeedPacket[]>([]);
  const [beds, setBeds] = useState<GardenBed[]>([]);
  
  const [selectedSeedId, setSelectedSeedId] = useState(seed?.id || '');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [spacing, setSpacing] = useState('12');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
       setSeeds(await dbService.getAll<SeedPacket>('seeds'));
       setBeds(await dbService.getAll<GardenBed>('garden_beds'));
    };
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: PlantingLog = {
       id: crypto.randomUUID(),
       seedLotId: selectedSeedId,
       bedId: selectedBedId,
       plantingDate: new Date(date).getTime(),
       spacing: Number(spacing),
       quantity: Number(quantity),
       notes,
       createdAt: Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };
    onSave(log);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Sprout className="text-leaf-600" /> Log Planting
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           {!seed && (
              <Select 
                 label="Select Seed"
                 value={selectedSeedId}
                 onChange={e => setSelectedSeedId(e.target.value)}
                 required
              >
                 <option value="">Choose Variety...</option>
                 {seeds.map(s => <option key={s.id} value={s.id}>{s.plantType} - {s.variety}</option>)}
              </Select>
           )}

           <Select 
              label="Garden Bed"
              value={selectedBedId}
              onChange={e => setSelectedBedId(e.target.value)}
              required
           >
              <option value="">Choose Bed...</option>
              {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
           </Select>

           <div className="grid grid-cols-2 gap-4">
              <Input 
                 label="Quantity"
                 type="number"
                 value={quantity}
                 onChange={e => setQuantity(e.target.value)}
              />
              <Input 
                 label="Spacing (in)"
                 type="number"
                 value={spacing}
                 onChange={e => setSpacing(e.target.value)}
              />
           </div>

           <Input 
              label="Date Planted"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
           />

           <TextArea 
              label="Notes"
              placeholder="Soil amendments used, weather..."
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
