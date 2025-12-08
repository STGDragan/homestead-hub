

import React, { useState, useEffect } from 'react';
import { libraryService } from '../../services/libraryService';
import { PlantTemplate, AnimalTemplate, SpeciesType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Plus, Search, Edit2, Trash2, Sprout, Image as ImageIcon, Upload, X, PawPrint } from 'lucide-react';
import { ANIMAL_SPECIES } from '../../constants';

// --- PLANT MODAL ---
const AdminPlantModal: React.FC<{ 
    plant?: PlantTemplate | null;
    onSave: (p: PlantTemplate) => void; 
    onClose: () => void; 
}> = ({ plant, onSave, onClose }) => {
    const [name, setName] = useState(plant?.name || '');
    const [variety, setVariety] = useState(plant?.defaultVariety || '');
    const [spacing, setSpacing] = useState(plant?.spacing?.toString() || '12');
    const [height, setHeight] = useState<'short' | 'medium' | 'tall'>(plant?.height || 'medium');
    const [days, setDays] = useState(plant?.daysToMaturity?.toString() || '60');
    const [imagePreview, setImagePreview] = useState(plant?.imageUrl || '');
    const [description, setDescription] = useState(plant?.description || '');
    const [careInstructions, setCareInstructions] = useState(plant?.careInstructions || '');
    const [plantingMethod, setPlantingMethod] = useState<'direct' | 'transplant' | 'both'>(plant?.plantingMethod || 'direct');
    const [weeksOffset, setWeeksOffset] = useState(plant?.weeksRelativeToFrost?.toString() || '0');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPlant: PlantTemplate = {
            id: plant?.id || `sys_${crypto.randomUUID()}`,
            name,
            defaultVariety: variety,
            daysToMaturity: parseInt(days),
            spacing: parseInt(spacing),
            icon: 'Sprout',
            hardinessZones: [], 
            difficulty: 'beginner',
            companions: [],
            season: ['spring', 'summer'],
            height,
            imageUrl: imagePreview,
            description,
            careInstructions,
            plantingMethod,
            weeksRelativeToFrost: parseInt(weeksOffset),
            createdAt: plant?.createdAt || Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        onSave(newPlant);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Sprout className="text-leaf-600" /> {plant ? 'Edit Plant' : 'New Plant'}
                    </h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center mb-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-earth-200 dark:border-stone-700 relative group cursor-pointer flex items-center justify-center">
                            {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-earth-400" />}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <Upload size={20} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <span className="text-xs text-earth-500 mt-2">Upload Default Image</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Tomato" />
                        <Input label="Default Variety" value={variety} onChange={e => setVariety(e.target.value)} placeholder="e.g. Roma" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Spacing (in)" type="number" value={spacing} onChange={e => setSpacing(e.target.value)} required />
                        <Input label="Days to Mature" type="number" value={days} onChange={e => setDays(e.target.value)} />
                        <Select label="Height" value={height} onChange={e => setHeight(e.target.value as any)}>
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="tall">Tall</option>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Planting Method" value={plantingMethod} onChange={e => setPlantingMethod(e.target.value as any)}>
                            <option value="direct">Direct Sow</option>
                            <option value="transplant">Transplant</option>
                            <option value="both">Both</option>
                        </Select>
                        <Input label="Weeks vs Frost" type="number" value={weeksOffset} onChange={e => setWeeksOffset(e.target.value)} />
                    </div>
                    <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
                    <TextArea label="Care Instructions" value={careInstructions} onChange={e => setCareInstructions(e.target.value)} />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ANIMAL MODAL ---
const AdminAnimalModal: React.FC<{ 
    animal?: AnimalTemplate | null;
    onSave: (a: AnimalTemplate) => void; 
    onClose: () => void; 
}> = ({ animal, onSave, onClose }) => {
    const [name, setName] = useState(animal?.name || '');
    const [species, setSpecies] = useState<SpeciesType>(animal?.species || 'chicken');
    const [description, setDescription] = useState(animal?.description || '');
    const [gestation, setGestation] = useState(animal?.gestationDays?.toString() || '');
    const [maturity, setMaturity] = useState(animal?.maturityMonths?.toString() || '');
    const [hardiness, setHardiness] = useState(animal?.hardiness || '');
    const [yieldType, setYieldType] = useState(animal?.yieldType || '');
    const [imagePreview, setImagePreview] = useState(animal?.imageUrl || '');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAnimal: AnimalTemplate = {
            id: animal?.id || `sys_ani_${crypto.randomUUID()}`,
            name,
            species,
            description,
            gestationDays: gestation ? parseInt(gestation) : undefined,
            maturityMonths: maturity ? parseInt(maturity) : 0,
            hardiness,
            yieldType,
            imageUrl: imagePreview,
            createdAt: animal?.createdAt || Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        onSave(newAnimal);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <PawPrint className="text-amber-600" /> {animal ? 'Edit Breed' : 'New Breed'}
                    </h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-earth-200 dark:border-stone-700 relative group cursor-pointer flex items-center justify-center">
                            {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-earth-400" />}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <Upload size={20} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <span className="text-xs text-earth-500 mt-2">Upload Default Image</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Breed Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Rhode Island Red" />
                        <Select label="Species" value={species} onChange={e => setSpecies(e.target.value as SpeciesType)}>
                            {ANIMAL_SPECIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Gestation (Days)" type="number" value={gestation} onChange={e => setGestation(e.target.value)} />
                        <Input label="Maturity (Months)" type="number" value={maturity} onChange={e => setMaturity(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Hardiness" value={hardiness} onChange={e => setHardiness(e.target.value)} placeholder="e.g. Cold Hardy" />
                        <Input label="Yield Type" value={yieldType} onChange={e => setYieldType(e.target.value)} placeholder="e.g. Eggs/Meat" />
                    </div>
                    <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Breed</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const LibraryAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'plants' | 'animals'>('plants');
    const [plants, setPlants] = useState<PlantTemplate[]>([]);
    const [animals, setAnimals] = useState<AnimalTemplate[]>([]);
    const [search, setSearch] = useState('');
    
    const [editingPlant, setEditingPlant] = useState<PlantTemplate | null>(null);
    const [editingAnimal, setEditingAnimal] = useState<AnimalTemplate | null>(null);
    
    const [showPlantModal, setShowPlantModal] = useState(false);
    const [showAnimalModal, setShowAnimalModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === 'plants') {
            const p = await libraryService.getSystemPlants();
            setPlants(p.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
            const a = await libraryService.getSystemAnimals();
            setAnimals(a.sort((x, y) => x.name.localeCompare(y.name)));
        }
    };

    const handleSavePlant = async (plant: PlantTemplate) => {
        await libraryService.saveSystemPlant(plant);
        loadData();
        setShowPlantModal(false);
        setEditingPlant(null);
    };

    const handleDeletePlant = async (id: string) => {
        if (confirm('Delete this system plant?')) {
            await libraryService.deleteSystemPlant(id);
            loadData();
        }
    };

    const handleSaveAnimal = async (animal: AnimalTemplate) => {
        await libraryService.saveSystemAnimal(animal);
        loadData();
        setShowAnimalModal(false);
        setEditingAnimal(null);
    };

    const handleDeleteAnimal = async (id: string) => {
        if (confirm('Delete this system animal breed?')) {
            await libraryService.deleteSystemAnimal(id);
            loadData();
        }
    };

    const filteredPlants = plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.defaultVariety.toLowerCase().includes(search.toLowerCase()));
    const filteredAnimals = animals.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.species.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800">
                    <button onClick={() => setActiveTab('plants')} className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'plants' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500'}`}>Plants</button>
                    <button onClick={() => setActiveTab('animals')} className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'animals' ? 'border-amber-600 text-amber-800 dark:text-amber-400' : 'border-transparent text-earth-500'}`}>Animals</button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Input icon={<Search size={18}/>} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {activeTab === 'plants' ? (
                        <Button onClick={() => { setEditingPlant(null); setShowPlantModal(true); }} icon={<Plus size={16}/>}>Add Plant</Button>
                    ) : (
                        <Button onClick={() => { setEditingAnimal(null); setShowAnimalModal(true); }} icon={<Plus size={16}/>}>Add Breed</Button>
                    )}
                </div>
            </div>

            {activeTab === 'plants' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlants.map(plant => (
                        <Card key={plant.id} className="p-4 flex gap-4 items-center">
                            <div className="w-16 h-16 bg-earth-100 dark:bg-stone-800 rounded-lg overflow-hidden flex-shrink-0">
                                {plant.imageUrl ? <img src={plant.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-earth-400"><Sprout size={24} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-earth-900 dark:text-earth-100">{plant.name}</h4>
                                <p className="text-xs text-earth-500">{plant.defaultVariety}</p>
                                <p className="text-xs text-earth-400 mt-1">{plant.daysToMaturity} days</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => { setEditingPlant(plant); setShowPlantModal(true); }} className="p-2 text-earth-500 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeletePlant(plant.id)} className="p-2 text-earth-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {activeTab === 'animals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAnimals.map(animal => (
                        <Card key={animal.id} className="p-4 flex gap-4 items-center border-l-4 border-l-amber-500">
                            <div className="w-16 h-16 bg-earth-100 dark:bg-stone-800 rounded-lg overflow-hidden flex-shrink-0">
                                {animal.imageUrl ? <img src={animal.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-earth-400"><PawPrint size={24} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-earth-900 dark:text-earth-100">{animal.name}</h4>
                                <p className="text-xs text-earth-500 capitalize">{animal.species}</p>
                                <p className="text-xs text-earth-400 mt-1">{animal.yieldType}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => { setEditingAnimal(animal); setShowAnimalModal(true); }} className="p-2 text-earth-500 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteAnimal(animal.id)} className="p-2 text-earth-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showPlantModal && <AdminPlantModal plant={editingPlant} onSave={handleSavePlant} onClose={() => setShowPlantModal(false)} />}
            {showAnimalModal && <AdminAnimalModal animal={editingAnimal} onSave={handleSaveAnimal} onClose={() => setShowAnimalModal(false)} />}
        </div>
    );
};
