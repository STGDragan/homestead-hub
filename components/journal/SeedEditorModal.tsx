

import React, { useState } from 'react';
import { SeedPacket } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Sprout, BookOpen, Image as ImageIcon, Upload } from 'lucide-react';
import { PLANT_LIBRARY } from '../../constants';

interface SeedEditorModalProps {
  seed?: SeedPacket | null;
  onSave: (seed: Partial<SeedPacket>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const SeedEditorModal: React.FC<SeedEditorModalProps> = ({ seed, onSave, onClose, onDelete }) => {
  // Library selection
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedLibPlantName, setSelectedLibPlantName] = useState('');

  // Form State
  const [variety, setVariety] = useState(seed?.variety || '');
  const [plantType, setPlantType] = useState(seed?.plantType || '');
  const [brand, setBrand] = useState(seed?.brand || '');
  const [quantity, setQuantity] = useState(seed?.quantityRemaining?.toString() || '');
  const [unit, setUnit] = useState<'count' | 'grams' | 'packets'>(seed?.quantityUnit || 'count');
  const [daysToGerm, setDaysToGerm] = useState(seed?.daysToGerminate?.toString() || '7');
  const [expYear, setExpYear] = useState(seed?.expirationYear?.toString() || new Date().getFullYear().toString());
  const [notes, setNotes] = useState(seed?.notes || '');
  const [imagePreview, setImagePreview] = useState(seed?.imageUrl || '');

  const activeGroup = PLANT_LIBRARY.find(g => g.group === selectedGroup);
  const activeLibPlant = activeGroup?.items.find(i => i.name === selectedLibPlantName);

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedLibPlantName('');
  };

  const handleLibPlantChange = (name: string) => {
    setSelectedLibPlantName(name);
    const group = PLANT_LIBRARY.find(g => g.group === selectedGroup);
    const plant = group?.items.find(i => i.name === name);
    
    if (plant) {
        setPlantType(plant.name);
        setDaysToGerm(plant.germination ? plant.germination.toString() : '7');
        setVariety(''); // Reset variety
    }
  };

  const handleVarietyChange = (val: string) => {
      setVariety(val);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: seed?.id,
      variety,
      plantType,
      brand,
      quantityRemaining: parseFloat(quantity),
      quantityUnit: unit,
      daysToGerminate: parseInt(daysToGerm),
      expirationYear: parseInt(expYear),
      notes,
      germinationTests: seed?.germinationTests || [],
      archived: seed?.archived || false,
      tags: seed?.tags || [],
      imageUrl: imagePreview,
      createdAt: seed?.createdAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-earth-200 dark:border-stone-800">
        
        <div className="flex justify-between items-center mb-6 border-b border-earth-100 dark:border-stone-800 pb-4">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">{seed ? 'Edit Seed Packet' : 'Add Seeds'}</h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick Load Section */}
          <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700 space-y-3">
              <h3 className="text-xs font-bold text-earth-500 dark:text-stone-400 uppercase flex items-center gap-2">
                 <BookOpen size={14} /> Quick Fill
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 <Select 
                    label="Category"
                    value={selectedGroup}
                    onChange={e => handleGroupChange(e.target.value)}
                 >
                    <option value="">Select Group...</option>
                    {PLANT_LIBRARY.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
                 </Select>

                 <Select
                    label="Plant Type"
                    value={selectedLibPlantName}
                    onChange={e => handleLibPlantChange(e.target.value)}
                    disabled={!selectedGroup}
                 >
                    <option value="">Select Type...</option>
                    {activeGroup?.items.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                 </Select>
              </div>
              
              {activeLibPlant && (
                 <Select
                    label="Common Variety"
                    value={variety}
                    onChange={e => handleVarietyChange(e.target.value)}
                 >
                    <option value="">Select Variety...</option>
                    {activeLibPlant.varieties.map(v => <option key={v} value={v}>{v}</option>)}
                 </Select>
              )}
          </div>

          {/* Image Upload */}
          <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-full h-32 rounded-xl overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-dashed border-earth-300 dark:border-stone-700 relative group cursor-pointer flex items-center justify-center">
                 {imagePreview ? (
                    <img src={imagePreview} alt="Seed Packet" className="w-full h-full object-cover" />
                 ) : (
                    <div className="flex flex-col items-center text-earth-400">
                       <ImageIcon size={24} />
                       <span className="text-xs mt-2 font-medium">Add Photo of Packet</span>
                    </div>
                 )}
                 <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Upload size={24} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                 </label>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Plant Type"
               autoFocus
               placeholder="e.g. Tomato"
               value={plantType}
               onChange={e => setPlantType(e.target.value)}
               required
             />
             <Input 
               label="Variety"
               placeholder="e.g. Roma"
               value={variety}
               onChange={e => setVariety(e.target.value)}
               required
             />
          </div>

          <Input 
            label="Source / Brand"
            placeholder="e.g. Saved Seed 2023"
            value={brand}
            onChange={e => setBrand(e.target.value)}
          />

          <div className="p-4 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-200 dark:border-stone-700 grid grid-cols-2 gap-4">
             <div className="col-span-2 sm:col-span-1">
               <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">Quantity</label>
               <div className="flex gap-2">
                 <Input 
                   type="number"
                   className="w-full"
                   value={quantity}
                   onChange={e => setQuantity(e.target.value)}
                 />
                 <Select 
                   value={unit}
                   onChange={e => setUnit(e.target.value as any)}
                 >
                   <option value="count">Ct</option>
                   <option value="grams">g</option>
                   <option value="packets">Pkt</option>
                 </Select>
               </div>
             </div>
             
             <Input 
               label="Exp Year"
               type="number"
               value={expYear}
               onChange={e => setExpYear(e.target.value)}
             />

             <div className="col-span-2">
                <Input 
                   label="Days to Germinate"
                   type="number"
                   icon={<Sprout size={14} />}
                   value={daysToGerm}
                   onChange={e => setDaysToGerm(e.target.value)}
                />
             </div>
          </div>

          <TextArea 
             label="Notes"
             className="h-24"
             placeholder="Performance notes, sowing tips..."
             value={notes}
             onChange={e => setNotes(e.target.value)}
          />

          <div className="pt-2 flex gap-3">
             {seed && onDelete && (
                <Button type="button" variant="outline" onClick={() => onDelete(seed.id)} className="text-red-600 border-red-200 dark:border-red-900/50">
                   Delete
                </Button>
             )}
             <div className="flex-1 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="px-6">Save</Button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};