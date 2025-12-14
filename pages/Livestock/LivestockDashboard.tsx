
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { beekeepingService } from '../../services/beekeepingService';
import { HerdGroup, AnimalTypeEntry, Hive, Animal } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { HerdCard } from '../../components/livestock/HerdCard';
import { HerdEditorModal } from '../../components/livestock/HerdEditorModal';
import { Plus, PawPrint, ChevronRight, Baby, Heart, Hexagon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiaryDashboard } from '../Beekeeping/ApiaryDashboard';

type LivestockTab = 'herds' | 'apiary';

export const LivestockDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LivestockTab>('herds');
  const [herds, setHerds] = useState<HerdGroup[]>([]);
  const [entries, setEntries] = useState<AnimalTypeEntry[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    const loadedHerds = await dbService.getAll<HerdGroup>('herds');
    const loadedEntries = await dbService.getAll<AnimalTypeEntry>('animal_entries');
    const loadedAnimals = await dbService.getAll<Animal>('animals');
    
    setHerds(loadedHerds);
    setEntries(loadedEntries);
    setAnimals(loadedAnimals);
  };

  const handleCreateHerd = async (herdData: Partial<HerdGroup>, isHive?: boolean, hiveDetails?: any) => {
    if (isHive) {
        const newHive: Hive = {
            id: crypto.randomUUID(),
            name: hiveDetails.name,
            type: hiveDetails.type,
            queenBreed: hiveDetails.queenBreed,
            installedDate: hiveDetails.installedDate,
            location: { x: 50, y: 50 }, 
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await beekeepingService.addHive(newHive);
        setActiveTab('apiary');
    } else {
        const newHerd: HerdGroup = {
          id: crypto.randomUUID(),
          name: herdData.name!,
          speciesType: herdData.speciesType!,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
        };
        await dbService.put('herds', newHerd);
        setHerds([...herds, newHerd]);
    }
    setShowAddModal(false);
  };

  const filteredHerds = herds.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <PawPrint className="text-earth-600 dark:text-stone-400" /> Livestock & Apiary
          </h1>
          <p className="text-earth-600 dark:text-stone-400">Manage flocks, herds, bees, and genetics.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800">
         <button 
            onClick={() => setActiveTab('herds')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'herds' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
         >
            <PawPrint size={16}/> Livestock
         </button>
         <button 
            onClick={() => setActiveTab('apiary')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'apiary' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
         >
            <Hexagon size={16}/> Apiary
         </button>
      </div>

      {activeTab === 'herds' && (
        <>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Input 
                        placeholder="Search herds..." 
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowAddModal(true)} icon={<Plus size={18} />}>New Herd Group</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {/* Breeding & Genetics Card */}
                <div 
                    onClick={() => navigate('/animals/list')}
                    className="bg-gradient-to-r from-earth-800 to-earth-900 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all flex justify-between items-center group"
                >
                    <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                        <PawPrint size={32} className="text-leaf-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Adult Animals</h2>
                        <p className="text-earth-200 text-sm">Manage breeding stock.</p>
                    </div>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={24} />
                    </div>
                </div>

                {/* Offspring Card */}
                <div 
                    onClick={() => navigate('/animals/offspring')}
                    className="bg-gradient-to-r from-leaf-700 to-leaf-800 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all flex justify-between items-center group"
                >
                    <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                        <Baby size={32} className="text-amber-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Nursery</h2>
                        <p className="text-leaf-100 text-sm">Track births & growth.</p>
                    </div>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={24} />
                    </div>
                </div>

                {/* Reproductive Health Card */}
                <div 
                    onClick={() => navigate('/animals/breeding')}
                    className="bg-gradient-to-r from-pink-700 to-pink-800 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all flex justify-between items-center group"
                >
                    <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                        <Heart size={32} className="text-pink-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Reproduction</h2>
                        <p className="text-pink-100 text-sm">Pregnancy & Vet Tasks.</p>
                    </div>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={24} />
                    </div>
                </div>
            </div>

            {/* Herds Grid */}
            <div>
                <h2 className="text-xl font-serif font-bold text-earth-800 dark:text-earth-200 mb-4">Herd Groups</h2>
                {filteredHerds.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-800 text-earth-500 dark:text-stone-400">
                        <p>No herd groups found.</p>
                        <p className="text-sm">Create a group (e.g., "Main Coop") to start tracking.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHerds.map(herd => (
                        <HerdCard 
                            key={herd.id} 
                            herd={herd} 
                            entries={entries.filter(e => e.herdGroupId === herd.id)}
                            animals={animals.filter(a => a.herdId === herd.id && a.status === 'active')}
                        />
                        ))}
                    </div>
                )}
            </div>
        </>
      )}

      {activeTab === 'apiary' && (
          <ApiaryDashboard embedded />
      )}

      {showAddModal && (
          <HerdEditorModal 
              onSave={handleCreateHerd} 
              onClose={() => setShowAddModal(false)} 
          />
      )}
    </div>
  );
};
