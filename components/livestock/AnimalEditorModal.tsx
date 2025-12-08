
import React, { useState, useEffect } from 'react';
import { Animal, SpeciesType, AnimalSex, HerdGroup, AnimalStatus, AnimalTemplate } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { dbService } from '../../services/db';
import { libraryService } from '../../services/libraryService';
import { X, PawPrint, Upload, Image as ImageIcon, BookOpen } from 'lucide-react';
import { ANIMAL_SPECIES, ANIMAL_BREEDS } from '../../constants';

interface AnimalEditorModalProps {
  animal?: Animal | null;
  onSave: (animal: Partial<Animal>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AnimalEditorModal: React.FC<AnimalEditorModalProps> = ({ animal, onSave, onClose, onDelete }) => {
  const [name, setName] = useState(animal?.name || '');
  const [species, setSpecies] = useState<SpeciesType>(animal?.species || 'chicken');
  const [breed, setBreed] = useState(animal?.breed || '');
  const [sex, setSex] = useState<AnimalSex>(animal?.sex || 'female');
  const [herdId, setHerdId] = useState(animal?.herdId || '');
  const [dob, setDob] = useState(animal?.dateOfBirth ? new Date(animal.dateOfBirth).toISOString().split('T')[0] : '');
  const [sireId, setSireId] = useState(animal?.sireId || '');
  const [damId, setDamId] = useState(animal?.damId || '');
  const [status, setStatus] = useState<AnimalStatus>(animal?.status || 'active');
  const [notes, setNotes] = useState(animal?.notes || '');
  const [imagePreview, setImagePreview] = useState(animal?.imageUrl || '');

  // Options
  const [herds, setHerds] = useState<HerdGroup[]>([]);
  const [potentialSires, setPotentialSires] = useState<Animal[]>([]);
  const [potentialDams, setPotentialDams] = useState<Animal[]>([]);
  const [libraryAnimals, setLibraryAnimals] = useState<AnimalTemplate[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
       const h = await dbService.getAll<HerdGroup>('herds');
       setHerds(h);
       if(h.length > 0 && !herdId) setHerdId(h[0].id);

       const allAnimals = await dbService.getAll<Animal>('animals');
       setPotentialSires(allAnimals.filter(a => a.sex === 'male' && a.id !== animal?.id && a.species === species));
       setPotentialDams(allAnimals.filter(a => a.sex === 'female' && a.id !== animal?.id && a.species === species));

       // Load Library for Auto-Complete
       const lib = await libraryService.getSystemAnimals();
       setLibraryAnimals(lib.filter(a => a.species === species));
    };
    loadOptions();
  }, [species]);

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

  const handleLibrarySelect = (breedName: string) => {
      setBreed(breedName);
      const template = libraryAnimals.find(a => a.name === breedName);
      if (template) {
          if (template.imageUrl && !imagePreview) setImagePreview(template.imageUrl);
          if (template.description && !notes) setNotes(template.description);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: animal?.id,
      name,
      species,
      breed,
      sex,
      herdId,
      dateOfBirth: dob ? new Date(dob).getTime() : Date.now(),
      sireId: sireId || undefined,
      damId: damId || undefined,
      status,
      notes,
      imageUrl: imagePreview,
      createdAt: animal?.createdAt
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <PawPrint className="text-amber-600" /> {animal ? 'Edit Animal' : 'Add Animal'}
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           {/* Image Upload */}
           <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-earth-200 dark:border-stone-700 relative group cursor-pointer">
                 {imagePreview ? (
                    <img src={imagePreview} alt="Animal Preview" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-earth-400">
                       <ImageIcon size={32} />
                    </div>
                 )}
                 <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Upload size={24} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                 </label>
              </div>
              <span className="text-xs text-earth-500 mt-2">Tap to upload photo</span>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Select
                 label="Species"
                 value={species}
                 onChange={e => setSpecies(e.target.value as SpeciesType)}
              >
                 {ANIMAL_SPECIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
              <Input 
                 label="Name / Tag"
                 autoFocus
                 value={name}
                 onChange={e => setName(e.target.value)}
                 required
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="w-full relative">
                 <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1 flex items-center justify-between">
                     Breed
                     <BookOpen size={12} className="text-earth-400"/>
                 </label>
                 
                 <input
                    list="breed-list"
                    className="w-full bg-white dark:bg-night-950 text-earth-900 dark:text-earth-100 border border-earth-300 dark:border-night-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition-colors"
                    value={breed}
                    onChange={e => handleLibrarySelect(e.target.value)}
                    placeholder="Type or select..."
                 />
                 <datalist id="breed-list">
                    {/* First show any library items matching species */}
                    {libraryAnimals.map(a => (
                        <option key={a.id} value={a.name} />
                    ))}
                    {/* Then show the big constant list for the species */}
                    {(ANIMAL_BREEDS[species] || []).map(b => (
                        <option key={b} value={b} />
                    ))}
                 </datalist>
              </div>

              <Select
                 label="Sex"
                 value={sex}
                 onChange={e => setSex(e.target.value as AnimalSex)}
              >
                 <option value="female">Female</option>
                 <option value="male">Male</option>
              </Select>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Select
                 label="Herd / Group"
                 value={herdId}
                 onChange={e => setHerdId(e.target.value)}
              >
                 {herds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </Select>
              <Input 
                 label="Date of Birth"
                 type="date"
                 value={dob}
                 onChange={e => setDob(e.target.value)}
              />
           </div>

           {/* Lineage */}
           <div className="p-4 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
              <h3 className="text-xs font-bold text-earth-500 dark:text-stone-400 uppercase mb-3">Lineage (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                 <Select
                    label="Sire (Father)"
                    value={sireId}
                    onChange={e => setSireId(e.target.value)}
                 >
                    <option value="">Unknown</option>
                    {potentialSires.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </Select>
                 <Select
                    label="Dam (Mother)"
                    value={damId}
                    onChange={e => setDamId(e.target.value)}
                 >
                    <option value="">Unknown</option>
                    {potentialDams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </Select>
              </div>
           </div>

           <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value as AnimalStatus)}
           >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="deceased">Deceased</option>
              <option value="archived">Archived</option>
           </Select>

           <TextArea 
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
           />

           <div className="flex justify-end gap-2 pt-2">
              {animal && onDelete && (
                 <Button type="button" variant="outline" className="mr-auto text-red-600 border-red-200" onClick={() => onDelete(animal.id)}>Delete</Button>
              )}
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Animal</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
