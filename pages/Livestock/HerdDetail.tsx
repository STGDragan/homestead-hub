
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { HerdGroup, AnimalTypeEntry, ProductionLog, FeedLog, MedicalLog, LossLog, Animal } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardTitle } from '../../components/ui/Card';
import { ArrowLeft, Egg, Wheat, Activity, AlertTriangle, Plus, Trash2, Calendar, Droplets, Bone, User } from 'lucide-react';
import { LogProductionModal } from '../../components/livestock/LogProductionModal';
import { LogFeedModal } from '../../components/livestock/LogFeedModal';
import { LogLossModal } from '../../components/livestock/LogLossModal';
import { AnimalEditorModal } from '../../components/livestock/AnimalEditorModal';
import { ANIMAL_BREEDS } from '../../constants';

type Tab = 'overview' | 'production' | 'feed' | 'health' | 'losses';

export const HerdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [herd, setHerd] = useState<HerdGroup | null>(null);
  const [entries, setEntries] = useState<AnimalTypeEntry[]>([]);
  const [individuals, setIndividuals] = useState<Animal[]>([]); // Tracked individuals in this herd
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Data States
  const [prodLogs, setProdLogs] = useState<ProductionLog[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<MedicalLog[]>([]);
  const [lossLogs, setLossLogs] = useState<LossLog[]>([]);

  // Modal states
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);

  // Form State for new Breed Entry
  const [entryName, setEntryName] = useState('');
  const [entryQty, setEntryQty] = useState(1);
  const [entryProduct, setEntryProduct] = useState('Egg');

  useEffect(() => {
    if (id) loadData(id);
  }, [id, activeTab]);

  const loadData = async (herdId: string) => {
    const h = await dbService.get<HerdGroup>('herds', herdId);
    if (h) {
      setHerd(h);
      // Load Bulk Entries
      setEntries(await dbService.getAllByIndex<AnimalTypeEntry>('animal_entries', 'herdGroupId', herdId));
      
      // Load Individual Animals assigned to this herd
      const allAnimals = await dbService.getAll<Animal>('animals');
      const herdAnimals = allAnimals.filter(a => a.herdId === herdId && a.status === 'active');
      setIndividuals(herdAnimals);

      if (activeTab === 'production') {
          const logs = await dbService.getAllByIndex<ProductionLog>('production_logs', 'herdGroupId', herdId);
          setProdLogs(logs.sort((a, b) => b.date - a.date));
      }
      if (activeTab === 'feed') {
          const logs = await dbService.getAllByIndex<FeedLog>('feed_logs', 'herdGroupId', herdId);
          setFeedLogs(logs.sort((a, b) => b.date - a.date));
      }
      if (activeTab === 'health') {
          const logs = await dbService.getAllByIndex<MedicalLog>('medical_logs', 'herdGroupId', herdId);
          setHealthLogs(logs.sort((a, b) => b.date - a.date));
      }
      if (activeTab === 'losses') {
          const logs = await dbService.getAllByIndex<LossLog>('loss_logs', 'herdGroupId', herdId);
          setLossLogs(logs.sort((a, b) => b.date - a.date));
      }
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!herd) return;
    const newEntry: AnimalTypeEntry = {
      id: crypto.randomUUID(),
      herdGroupId: herd.id,
      typeName: entryName,
      quantity: entryQty,
      dailyProduct: entryProduct,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    };
    await dbService.put('animal_entries', newEntry);
    loadData(herd.id);
    setShowAddEntry(false);
    setEntryName('');
    setEntryQty(1);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm("Remove this breed entry?")) {
      await dbService.delete('animal_entries', entryId);
      if (herd) loadData(herd.id);
    }
  };

  // --- Individual Animal Handlers ---
  const handleSaveAnimal = async (animalData: Partial<Animal>) => {
      if (!herd) return;
      const animal: Animal = {
          id: animalData.id || crypto.randomUUID(),
          name: animalData.name!,
          species: animalData.species!,
          breed: animalData.breed || 'Unknown',
          sex: animalData.sex || 'female',
          herdId: herd.id, // Enforce current herd
          dateOfBirth: animalData.dateOfBirth || Date.now(),
          status: 'active',
          notes: animalData.notes,
          imageUrl: animalData.imageUrl,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('animals', animal);
      setShowAddAnimal(false);
      loadData(herd.id);
  };

  // --- Handlers for Modals ---
  const handleSaveProduction = async (log: ProductionLog) => {
      await dbService.put('production_logs', log);
      setShowProdModal(false);
      loadData(herd!.id);
  };

  const handleSaveFeed = async (log: FeedLog) => {
      await dbService.put('feed_logs', log);
      setShowFeedModal(false);
      loadData(herd!.id);
  };

  const handleSaveLoss = async (log: LossLog) => {
      await dbService.put('loss_logs', log);
      setShowLossModal(false);
      loadData(herd!.id);
  };

  if (!herd) return <div className="p-8 text-center text-earth-500">Loading...</div>;

  const totalBulk = entries.reduce((a, b) => a + b.quantity, 0);
  const totalIndividual = individuals.length;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/animals')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 leading-none mb-1">{herd.name}</h1>
              <p className="text-earth-600 dark:text-earth-400 text-sm font-bold uppercase tracking-wider">{herd.speciesType} Group</p>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-2 border-b border-earth-200 dark:border-stone-800">
            {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'production', label: 'Production', icon: Egg },
                { id: 'feed', label: 'Feed', icon: Wheat },
                { id: 'health', label: 'Health', icon: Activity },
                { id: 'losses', label: 'Losses', icon: AlertTriangle },
            ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-t-lg font-bold text-sm transition-colors whitespace-nowrap
                            ${isActive 
                                ? 'bg-white dark:bg-stone-900 text-leaf-800 dark:text-leaf-400 border-b-2 border-leaf-600' 
                                : 'text-earth-500 dark:text-stone-500 hover:text-earth-800 dark:hover:text-stone-200 hover:bg-earth-50 dark:hover:bg-stone-800'}
                        `}
                    >
                        <Icon size={16} />
                        {tab.label}
                    </button>
                )
            })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    
                    {/* Individual Animals Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Individual Animals</h2>
                            <Button size="sm" variant="secondary" onClick={() => setShowAddAnimal(true)} icon={<Plus size={16} />}>Add Animal</Button>
                        </div>
                        <div className="space-y-2">
                            {individuals.length === 0 ? (
                                <p className="text-sm text-earth-400 italic">No individually tracked animals in this group.</p>
                            ) : (
                                individuals.map(animal => (
                                    <div 
                                        key={animal.id} 
                                        onClick={() => navigate(`/animals/profile/${animal.id}`)}
                                        className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-700 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:border-leaf-400 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-leaf-100 dark:bg-leaf-900/20 flex items-center justify-center text-leaf-700 font-bold">
                                                {animal.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-earth-900 dark:text-earth-100 text-sm">{animal.name}</h3>
                                                <p className="text-xs text-earth-500 dark:text-stone-400">{animal.breed} • {animal.sex}</p>
                                            </div>
                                        </div>
                                        <ArrowLeft size={16} className="text-earth-300 rotate-180" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bulk Counts Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Bulk Counts</h2>
                            <Button size="sm" variant="secondary" onClick={() => setShowAddEntry(!showAddEntry)} icon={<Plus size={16} />}>Add Count</Button>
                        </div>

                        {showAddEntry && (
                            <Card className="bg-leaf-50 dark:bg-leaf-900/10 border-leaf-200 dark:border-leaf-900 mb-4 animate-in fade-in zoom-in-95">
                               <form onSubmit={handleAddEntry} className="space-y-3">
                                  <div className="w-full relative">
                                     <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">Breed Name</label>
                                     <input
                                        list="breed-list"
                                        className="w-full bg-white dark:bg-night-950 text-earth-900 dark:text-earth-100 border border-earth-300 dark:border-night-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 transition-colors"
                                        value={entryName}
                                        onChange={e => setEntryName(e.target.value)}
                                        placeholder="Type or select..."
                                        required
                                     />
                                     <datalist id="breed-list">
                                        {(ANIMAL_BREEDS[herd.speciesType] || []).map(b => (
                                            <option key={b} value={b} />
                                        ))}
                                     </datalist>
                                  </div>
                                  <div className="flex gap-4">
                                     <div className="flex-1">
                                        <Input 
                                          label="Quantity"
                                          type="number"
                                          value={entryQty}
                                          onChange={e => setEntryQty(Number(e.target.value))}
                                          required
                                          min={1}
                                        />
                                     </div>
                                     <div className="flex-1">
                                        <Input 
                                          label="Product"
                                          value={entryProduct}
                                          onChange={e => setEntryProduct(e.target.value)}
                                          placeholder="e.g. Egg"
                                        />
                                     </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddEntry(false)}>Cancel</Button>
                                    <Button type="submit" size="sm">Save Count</Button>
                                  </div>
                               </form>
                            </Card>
                        )}

                        <div className="space-y-2">
                          {entries.length === 0 ? (
                            <div className="text-center p-4 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-200 dark:border-stone-700 text-earth-500 dark:text-stone-400 italic text-sm">
                               No bulk groups added.
                            </div>
                          ) : entries.map(entry => (
                            <div key={entry.id} className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-700 rounded-xl p-4 flex items-center justify-between shadow-sm">
                               <div>
                                 <h3 className="font-bold text-earth-800 dark:text-earth-100 text-lg">{entry.typeName}</h3>
                                 <p className="text-xs text-earth-500 dark:text-stone-400">Produces: {entry.dailyProduct}</p>
                               </div>
                               <div className="flex items-center gap-6">
                                  <div className="text-center">
                                     <span className="block text-2xl font-bold text-earth-700 dark:text-earth-200 leading-none">{entry.quantity}</span>
                                     <span className="text-[10px] text-earth-400 uppercase tracking-wide">Count</span>
                                  </div>
                                  <button onClick={() => handleDeleteEntry(entry.id)} className="text-earth-300 hover:text-red-500 transition-colors">
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            </div>
                          ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PRODUCTION TAB */}
            {activeTab === 'production' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Production Log</h2>
                        <Button size="sm" onClick={() => setShowProdModal(true)} icon={<Plus size={16} />}>Log Yield</Button>
                    </div>
                    {prodLogs.length === 0 ? (
                         <div className="text-center p-8 bg-earth-50 dark:bg-stone-800 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-700 text-earth-500 italic">No production logs found.</div>
                    ) : (
                        <div className="space-y-2">
                            {prodLogs.map(log => (
                                <div key={log.id} className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-earth-200 dark:border-stone-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-700">
                                            <Egg size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-earth-800 dark:text-earth-100">{new Date(log.date).toLocaleDateString()}</p>
                                            {log.notes && <p className="text-xs text-earth-500">{log.notes}</p>}
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg text-leaf-700 dark:text-leaf-400">{log.quantity} {log.unit}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* FEED TAB */}
            {activeTab === 'feed' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Feed Log</h2>
                        <Button size="sm" onClick={() => setShowFeedModal(true)} icon={<Plus size={16} />}>Log Feed</Button>
                    </div>
                    {feedLogs.length === 0 ? (
                         <div className="text-center p-8 bg-earth-50 dark:bg-stone-800 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-700 text-earth-500 italic">No feed logs found.</div>
                    ) : (
                        <div className="space-y-2">
                            {feedLogs.map(log => (
                                <div key={log.id} className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-earth-200 dark:border-stone-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700">
                                            <Wheat size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-earth-800 dark:text-earth-100">{log.type}</p>
                                            <p className="text-xs text-earth-500">{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg text-earth-700 dark:text-earth-300">{log.quantity} {log.unit}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* HEALTH TAB */}
            {activeTab === 'health' && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Health Events</h2>
                    </div>
                    {healthLogs.length === 0 ? (
                         <div className="text-center p-8 bg-earth-50 dark:bg-stone-800 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-700 text-earth-500 italic">No health events recorded.</div>
                    ) : (
                        <div className="space-y-2">
                            {healthLogs.map(log => (
                                <div key={log.id} className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-earth-200 dark:border-stone-800">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-earth-800 dark:text-earth-100">{log.type}</span>
                                        <span className="text-xs text-earth-500">{new Date(log.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-earth-600 dark:text-stone-300">{log.notes}</p>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            )}

            {/* LOSSES TAB */}
            {activeTab === 'losses' && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Loss Records</h2>
                        <Button size="sm" onClick={() => setShowLossModal(true)} icon={<Plus size={16} />} className="bg-red-600 hover:bg-red-700 border-red-600">Record Loss</Button>
                    </div>
                    {lossLogs.length === 0 ? (
                         <div className="text-center p-8 bg-earth-50 dark:bg-stone-800 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-700 text-earth-500 italic">No losses recorded.</div>
                    ) : (
                        <div className="space-y-2">
                            {lossLogs.map(log => (
                                <div key={log.id} className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-red-200 dark:border-red-900/30 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700">
                                            <Bone size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-earth-800 dark:text-earth-100">{log.reason}</p>
                                            <p className="text-xs text-earth-500">{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg text-red-600">-{log.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
           <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
              <CardTitle>Actions</CardTitle>
              <div className="space-y-2 mt-3">
                 <Button variant="secondary" className="w-full justify-start bg-white dark:bg-stone-800 dark:text-earth-100" onClick={() => setShowProdModal(true)} icon={<Egg size={16} />}>Log Collection</Button>
                 <Button variant="secondary" className="w-full justify-start bg-white dark:bg-stone-800 dark:text-earth-100" onClick={() => setShowFeedModal(true)} icon={<Wheat size={16} />}>Log Feed</Button>
              </div>
           </Card>
           <Card>
              <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-earth-500">Individuals</span>
                  <span className="font-bold text-lg">{totalIndividual}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-earth-500">Bulk</span>
                  <span className="font-bold text-lg">{totalBulk}</span>
              </div>
              <div className="pt-2 border-t border-earth-100 dark:border-stone-700 flex justify-between items-center">
                  <span className="text-earth-700 dark:text-earth-200 font-bold">Total Head</span>
                  <span className="font-bold text-xl text-leaf-700 dark:text-leaf-400">{totalBulk + totalIndividual}</span>
              </div>
           </Card>
        </div>
      </div>

      {/* Modals */}
      {showProdModal && herd && <LogProductionModal herdId={herd.id} onClose={() => setShowProdModal(false)} onSave={handleSaveProduction} />}
      {showFeedModal && herd && <LogFeedModal herdId={herd.id} onClose={() => setShowFeedModal(false)} onSave={handleSaveFeed} />}
      {showLossModal && herd && <LogLossModal herdId={herd.id} onClose={() => setShowLossModal(false)} onSave={handleSaveLoss} />}
      
      {showAddAnimal && herd && (
          <AnimalEditorModal 
             animal={{
                 id: '',
                 name: '',
                 species: herd.speciesType,
                 breed: '',
                 sex: 'female',
                 herdId: herd.id,
                 dateOfBirth: Date.now(),
                 status: 'active',
                 createdAt: 0,
                 updatedAt: 0,
                 syncStatus: 'pending'
             }}
             onSave={handleSaveAnimal}
             onClose={() => setShowAddAnimal(false)}
          />
      )}

    </div>
  );
};
