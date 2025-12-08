
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { beekeepingService } from '../../services/beekeepingService';
import { HerdGroup, AnimalTypeEntry, Hive, HiveType, BeeBreed } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { HerdCard } from '../../components/livestock/HerdCard';
import { Plus, X, PawPrint, ChevronRight, Baby, Heart, Hexagon } from 'lucide-react';
import { ANIMAL_SPECIES, HIVE_TYPES, BEE_BREEDS } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { ApiaryDashboard } from '../Beekeeping/ApiaryDashboard';

type LivestockTab = 'herds' | 'apiary';

export const LivestockDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LivestockTab>('herds');
  const [herds, setHerds] = useState<HerdGroup[]>([]);
  const [entries, setEntries] = useState<AnimalTypeEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newHerdName, setNewHerdName] = useState('');
  const [newHerdType, setNewHerdType] = useState(ANIMAL_SPECIES[0].id);
  
  // Hive Specific State
  const [hiveType, setHiveType] = useState<HiveType>('langstroth');
  const [queenBreed, setQueenBreed] = useState<BeeBreed>('italian');
  const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    const loadedHerds = await dbService.getAll<HerdGroup>('herds');
    const loadedEntries = await dbService.getAll<AnimalTypeEntry>('animal_entries');
    setHerds(loadedHerds);
    setEntries(loadedEntries);
  };

  const handleCreateHerd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newHerdType === 'bee') {
        // Create specialized Hive entity instead of generic Herd
        const newHive: Hive = {
            id: crypto.randomUUID(),
            name: newHerdName,
            type: hiveType,
            queenBreed: queenBreed,
            installedDate: new Date(installDate).getTime(),
            location: { x: 50, y: 50 }, // Default map location
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await beekeepingService.addHive(newHive);
        setShowAddModal(false);
        setNewHerdName('');
        // Switch tab so user sees the new hive
        setActiveTab('apiary');
    } else {
        // Standard Livestock Herd
        const newHerd: HerdGroup = {
          id: crypto.randomUUID(),
          name: newHerdName,
          speciesType: newHerdType as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
        };
        await dbService.put('herds', newHerd);
        setHerds([...herds, newHerd]);
        setShowAddModal(false);
        setNewHerdName('');
    }
  };

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
            <div className="flex justify-end">
                <Button onClick={() => setShowAddModal(true)} icon={<Plus size={18} />}>New Herd Group</Button>
            </div>

            {/* Navigation Cards for New Modules */}
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
                {herds.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-800 text-earth-500 dark:text-stone-400">
                        <p>No herd groups yet.</p>
                        <p className="text-sm">Create a group (e.g., "Main Coop") to start tracking.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {herds.map(herd => (
                        <HerdCard 
                            key={herd.id} 
                            herd={herd} 
                            entries={entries.filter(e => e.herdGroupId === herd.id)} 
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

      {/* Add Herd/Hive Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-earth-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">
                        {newHerdType === 'bee' ? 'New Bee Colony' : 'New Herd Group'}
                    </h2>
                    <button onClick={() => setShowAddModal(false)} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreateHerd} className="space-y-4">
                    <Input 
                        label={newHerdType === 'bee' ? "Hive Name" : "Group Name"}
                        autoFocus
                        placeholder={newHerdType === 'bee' ? "e.g. Hive #1" : "e.g. Main Chicken Coop"}
                        value={newHerdName}
                        onChange={(e) => setNewHerdName(e.target.value)}
                        required
                    />
                    <div>
                        <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">Species</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ANIMAL_SPECIES.map(s => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setNewHerdType(s.id)}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${newHerdType === s.id ? 'bg-earth-800 text-white border-earth-800 dark:bg-leaf-600 dark:border-leaf-600' : 'bg-white dark:bg-stone-800 border-earth-200 dark:border-stone-700 text-earth-600 dark:text-stone-400'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hive Specific Options - Dynamic Render */}
                    {newHerdType === 'bee' && (
                        <div className="space-y-4 pt-2 border-t border-earth-100 dark:border-stone-800 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Hive Type" value={hiveType} onChange={e => setHiveType(e.target.value as any)}>
                                    {HIVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </Select>
                                <Select label="Queen Breed" value={queenBreed} onChange={e => setQueenBreed(e.target.value as any)}>
                                    {BEE_BREEDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                                </Select>
                            </div>
                            <Input label="Install Date" type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} required />
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">
                            {newHerdType === 'bee' ? 'Create Hive' : 'Create Group'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
