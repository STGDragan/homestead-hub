
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { Animal, SpeciesType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AnimalEditorModal } from '../../components/livestock/AnimalEditorModal';
import { Plus, Search, Filter, ArrowLeft, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ANIMAL_SPECIES } from '../../constants';

export const AnimalList: React.FC = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesType | 'all'>('all');
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dbService.getAll<Animal>('animals');
    setAnimals(data.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleSave = async (data: Partial<Animal>) => {
    const animal: Animal = {
       id: data.id || crypto.randomUUID(),
       name: data.name!,
       species: data.species!,
       breed: data.breed || 'Unknown',
       sex: data.sex || 'female',
       herdId: data.herdId!,
       dateOfBirth: data.dateOfBirth || Date.now(),
       sireId: data.sireId,
       damId: data.damId,
       status: data.status || 'active',
       notes: data.notes,
       createdAt: data.createdAt || Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };
    await dbService.put('animals', animal);
    loadData();
    setShowEditor(false);
    setEditingAnimal(null);
  };

  const handleDelete = async (id: string) => {
     if(confirm("Delete this animal record?")) {
        await dbService.delete('animals', id);
        loadData();
        setShowEditor(false);
     }
  };

  const filtered = animals.filter(a => {
     const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.breed.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesSpecies = speciesFilter === 'all' || a.species === speciesFilter;
     return matchesSearch && matchesSpecies;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => navigate('/animals')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">Individual Animals</h1>
                <p className="text-earth-600 dark:text-stone-400">Track lineage, weight, and history for specific stock.</p>
             </div>
          </div>
          <Button onClick={() => { setEditingAnimal(null); setShowEditor(true); }} icon={<Plus size={18} />}>Add Animal</Button>
       </div>

       <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
             <Input 
                icon={<Search size={18} />}
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
             <button 
                onClick={() => setSpeciesFilter('all')}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${speciesFilter === 'all' ? 'bg-earth-800 text-white border-earth-800' : 'bg-white dark:bg-stone-800 text-earth-600 dark:text-stone-300 border-earth-200 dark:border-stone-700'}`}
             >
                All
             </button>
             {ANIMAL_SPECIES.map(s => (
                <button 
                   key={s.id}
                   onClick={() => setSpeciesFilter(s.id)}
                   className={`px-3 py-2 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors ${speciesFilter === s.id ? 'bg-earth-800 text-white border-earth-800' : 'bg-white dark:bg-stone-800 text-earth-600 dark:text-stone-300 border-earth-200 dark:border-stone-700'}`}
                >
                   {s.label}
                </button>
             ))}
          </div>
       </div>

       {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed border-earth-200 dark:border-stone-800 text-earth-500 dark:text-stone-400">
             <PawPrint size={32} className="mx-auto mb-2 opacity-50" />
             <p>No animals found. Add your first one!</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filtered.map(animal => (
                <div 
                   key={animal.id} 
                   onClick={() => navigate(`/animals/profile/${animal.id}`)}
                   className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-earth-100 dark:bg-stone-800 flex items-center justify-center text-xl">
                            {animal.species === 'chicken' ? '🐔' : animal.species === 'goat' ? '🐐' : '🐾'}
                         </div>
                         <div>
                            <h3 className="font-bold text-earth-900 dark:text-earth-100 group-hover:text-leaf-700 transition-colors">{animal.name}</h3>
                            <p className="text-xs text-earth-500 dark:text-stone-400">{animal.breed} • {animal.sex}</p>
                         </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${animal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                         {animal.status}
                      </span>
                   </div>
                   <div className="mt-3 pt-3 border-t border-earth-100 dark:border-stone-800 flex justify-between text-xs text-earth-500 dark:text-stone-400">
                      <span>Born: {new Date(animal.dateOfBirth).toLocaleDateString()}</span>
                      <span>View Profile →</span>
                   </div>
                </div>
             ))}
          </div>
       )}

       {showEditor && (
          <AnimalEditorModal 
             animal={editingAnimal}
             onSave={handleSave}
             onClose={() => setShowEditor(false)}
             onDelete={handleDelete}
          />
       )}
    </div>
  );
};
