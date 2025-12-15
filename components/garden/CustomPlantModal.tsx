
import React, { useState } from 'react';
import { PlantTemplate, ExperienceLevel } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Sprout, Upload, Image as ImageIcon, BookOpen, ChevronRight } from 'lucide-react';
import { PLANT_LIBRARY, COMMON_PLANTS } from '../../constants';

interface CustomPlantModalProps {
  onSave: (plant: PlantTemplate) => void;
  onClose: () => void;
}

export const CustomPlantModal: React.FC<CustomPlantModalProps> = ({ onSave, onClose }) => {
  // Library Selection State
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedLibPlantName, setSelectedLibPlantName] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [spacing, setSpacing] = useState('12');
  const [height, setHeight] = useState<'short' | 'medium' | 'tall'>('medium');
  const [days, setDays] = useState('60');
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  // New Fields
  const [plantingMethod, setPlantingMethod] = useState<'direct' | 'transplant' | 'both'>('direct');
  const [weeksOffset, setWeeksOffset] = useState('0');

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

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedLibPlantName('');
  };

  const handleLibPlantChange = (plantName: string) => {
    setSelectedLibPlantName(plantName);
    const group = PLANT_LIBRARY.find(g => g.group === selectedGroup);
    const libraryItem = group?.items.find(i => i.name === plantName);
    const template = COMMON_PLANTS.find(p => p.name === plantName);
    
    if (template) {
        setName(template.name);
        setSpacing(template.spacing.toString());
        setHeight(template.height);
        setDays(template.daysToMaturity.toString());
        setPlantingMethod(template.plantingMethod || 'direct');
        setWeeksOffset(template.weeksRelativeToFrost?.toString() || '0');
        setVariety(''); // Reset variety
    } else if (libraryItem) {
        setName(libraryItem.name);
        // Defaults for items not in COMMON_PLANTS
        setSpacing('12');
        setHeight('medium');
        setDays('60');
        setPlantingMethod('direct');
        setWeeksOffset('0');
        setVariety('');
    }
  };

  const handleVarietyChange = (val: string) => {
      setVariety(val);
  };

  const activeGroup = PLANT_LIBRARY.find(g => g.group === selectedGroup);
  const activeLibPlant = activeGroup?.items.find(i => i.name === selectedLibPlantName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlant: PlantTemplate = {
      id: `custom_${crypto.randomUUID()}`,
      name,
      defaultVariety: variety,
      daysToMaturity: parseInt(days),
      spacing: parseInt(spacing),
      icon: 'Sprout',
      hardinessZones: [], // Default to all/none for now
      difficulty: 'beginner',
      companions: [],
      season: ['spring', 'summer'],
      height,
      imageUrl: imagePreview,
      description,
      careInstructions,
      plantingMethod,
      weeksRelativeToFrost: parseInt(weeksOffset),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    };
    onSave(newPlant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Sprout className="text-leaf-600" /> New Custom Plant
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           {/* Library Quick Load */}
           <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700 space-y-3">
              <h3 className="text-xs font-bold text-earth-500 dark:text-stone-400 uppercase flex items-center gap-2">
                 <BookOpen size={14} /> Quick Load from Library
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
                    <option value="">Select Plant...</option>
                    {activeGroup?.items.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                 </Select>
              </div>

              {activeLibPlant && (
                 <Select
                    label="Common Variety (Optional)"
                    value={variety}
                    onChange={e => handleVarietyChange(e.target.value)}
                 >
                    <option value="">Select Variety...</option>
                    {activeLibPlant.varieties.map(v => <option key={v} value={v}>{v}</option>)}
                 </Select>
              )}
           </div>

           {/* Manual Edit Fields */}
           <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-earth-200 dark:border-stone-700 relative group cursor-pointer">
                 {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-earth-400">
                       <ImageIcon size={24} />
                    </div>
                 )}
                 <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Upload size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                 </label>
              </div>
              <span className="text-xs text-earth-500 mt-2">Upload Photo</span>
           </div>

           <Input 
              label="Plant Name"
              placeholder="e.g. Heirloom Tomato"
              value={name}
              onChange={e => setName(e.target.value)}
              required
           />
           
           <Input 
              label="Variety"
              placeholder="e.g. Cherokee Purple"
              value={variety}
              onChange={e => setVariety(e.target.value)}
           />

           <div className="grid grid-cols-2 gap-4">
              <Input 
                 label="Spacing (inches)"
                 type="number"
                 value={spacing}
                 onChange={e => setSpacing(e.target.value)}
                 required
              />
              <Select
                 label="Height Category"
                 value={height}
                 onChange={e => setHeight(e.target.value as any)}
              >
                 <option value="short">Short (Ground)</option>
                 <option value="medium">Medium (Bush)</option>
                 <option value="tall">Tall (Trellis)</option>
              </Select>
           </div>

           <Input 
              label="Days to Harvest"
              type="number"
              value={days}
              onChange={e => setDays(e.target.value)}
           />

           {/* Schedule Settings */}
           <div className="grid grid-cols-2 gap-4">
              <Select
                 label="Method"
                 value={plantingMethod}
                 onChange={e => setPlantingMethod(e.target.value as any)}
              >
                 <option value="direct">Direct Sow</option>
                 <option value="transplant">Transplant</option>
                 <option value="both">Both</option>
              </Select>
              <Input 
                 label="Weeks from Frost"
                 type="number"
                 value={weeksOffset}
                 onChange={e => setWeeksOffset(e.target.value)}
                 placeholder="-2 = 2 weeks before"
              />
           </div>

           <TextArea 
              label="Description"
              placeholder="Brief summary of the plant..."
              value={description}
              onChange={e => setDescription(e.target.value)}
           />

           <TextArea 
              label="Care Instructions"
              placeholder="Tips for growing..."
              value={careInstructions}
              onChange={e => setCareInstructions(e.target.value)}
           />

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Create Plant</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
