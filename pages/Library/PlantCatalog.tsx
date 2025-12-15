
import React, { useEffect, useState } from 'react';
import { libraryService } from '../../services/libraryService';
import { PlantTemplate } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CustomPlantModal } from '../../components/garden/CustomPlantModal';
import { Search, Sprout, Plus, ArrowRight, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlantCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<PlantTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const p = await libraryService.getAllPlants();
    setPlants(p.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleSaveCustom = async (template: PlantTemplate) => {
      await libraryService.savePlant(template); // Technically updates custom_plants store
      loadData();
      setShowAddModal(false);
  };

  const filtered = plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.defaultVariety.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in">
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                <Leaf className="text-leaf-600" /> Plant Library
             </h1>
             <p className="text-earth-600 dark:text-stone-400">Encyclopedia of crops, trees, and flowers.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} icon={<Plus size={18}/>}>Add Custom Plant</Button>
       </div>

       <div className="relative">
          <Input 
             placeholder="Search plants..." 
             icon={<Search size={18} />}
             value={search}
             onChange={e => setSearch(e.target.value)}
          />
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(plant => (
             <Card 
                key={plant.id} 
                interactive 
                onClick={() => navigate(`/library/plant/${plant.id}`)}
                className="p-0 overflow-hidden group"
             >
                <div className="h-40 bg-earth-100 dark:bg-stone-800 relative overflow-hidden">
                   {plant.imageUrl ? (
                      <img src={plant.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-400 dark:text-stone-600">
                         <Sprout size={48} />
                      </div>
                   )}
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                      <h3 className="font-bold text-white text-lg leading-none">{plant.name}</h3>
                      <p className="text-white/80 text-xs">{plant.defaultVariety}</p>
                   </div>
                </div>
                <div className="p-3">
                   <div className="flex justify-between text-xs text-earth-500 dark:text-stone-400 mb-2">
                      <span>{plant.daysToMaturity} days</span>
                      <span className="capitalize">{plant.season?.[0]}</span>
                   </div>
                   <div className="flex items-center gap-1 text-xs font-bold text-leaf-700 dark:text-leaf-400 group-hover:underline">
                      View Details <ArrowRight size={12} />
                   </div>
                </div>
             </Card>
          ))}
       </div>

       {showAddModal && (
          <CustomPlantModal 
             onSave={handleSaveCustom}
             onClose={() => setShowAddModal(false)}
          />
       )}
    </div>
  );
};
