
import React, { useState, useEffect } from 'react';
import { GardenBed, HarvestLog } from '../../types';
import { dbService } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, ShoppingBasket } from 'lucide-react';
import { MEASUREMENT_UNITS } from '../../constants';

interface HarvestLogModalProps {
  onClose: () => void;
  onSave: (log: HarvestLog) => void;
  initialBedId?: string;
}

export const HarvestLogModal: React.FC<HarvestLogModalProps> = ({ onClose, onSave, initialBedId }) => {
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [selectedBedId, setSelectedBedId] = useState(initialBedId || '');
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('lb');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quality, setQuality] = useState<'poor'|'fair'|'good'|'excellent'>('good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dbService.getAll<GardenBed>('garden_beds').then(setBeds);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: HarvestLog = {
       id: crypto.randomUUID(),
       bedId: selectedBedId,
       cropName,
       quantity: Number(quantity),
       unit,
       harvestDate: new Date(date).getTime(),
       quality,
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
             <ShoppingBasket className="text-amber-600" /> Log Harvest
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <Select 
              label="Source Bed"
              value={selectedBedId}
              onChange={e => setSelectedBedId(e.target.value)}
              required
              disabled={!!initialBedId}
           >
              <option value="">Select Bed...</option>
              {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
           </Select>

           <Input 
              label="Crop Name"
              placeholder="e.g. Cherry Tomatoes"
              value={cropName}
              onChange={e => setCropName(e.target.value)}
              required
           />

           <div className="flex gap-2">
              <Input 
                 label="Quantity"
                 type="number"
                 value={quantity}
                 onChange={e => setQuantity(e.target.value)}
                 className="flex-1"
                 required
              />
              <Select 
                 label="Unit"
                 value={unit}
                 onChange={e => setUnit(e.target.value)}
                 className="w-24"
              >
                 {MEASUREMENT_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </Select>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Input 
                 label="Date"
                 type="date"
                 value={date}
                 onChange={e => setDate(e.target.value)}
              />
              <Select 
                 label="Quality"
                 value={quality}
                 onChange={e => setQuality(e.target.value as any)}
              >
                 <option value="poor">Poor</option>
                 <option value="fair">Fair</option>
                 <option value="good">Good</option>
                 <option value="excellent">Excellent</option>
              </Select>
           </div>

           <TextArea 
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
           />

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Yield</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
