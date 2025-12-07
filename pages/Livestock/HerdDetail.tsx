
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { HerdGroup, AnimalTypeEntry, ProductionLog, FeedLog, MedicalLog, LossLog } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input'; // Import Input
import { Card, CardTitle } from '../../components/ui/Card';
import { ArrowLeft, Egg, Wheat, Activity, AlertTriangle, Plus, Trash2 } from 'lucide-react';

type Tab = 'overview' | 'production' | 'feed' | 'health' | 'losses';

export const HerdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [herd, setHerd] = useState<HerdGroup | null>(null);
  const [entries, setEntries] = useState<AnimalTypeEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Modal states
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryName, setEntryName] = useState('');
  const [entryQty, setEntryQty] = useState(1);
  const [entryProduct, setEntryProduct] = useState('Egg');

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (herdId: string) => {
    const h = await dbService.get<HerdGroup>('herds', herdId);
    if (h) {
      setHerd(h);
      const e = await dbService.getAllByIndex<AnimalTypeEntry>('animal_entries', 'herdGroupId', herdId);
      setEntries(e);
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
    setEntries([...entries, newEntry]);
    setShowAddEntry(false);
    setEntryName('');
    setEntryQty(1);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm("Remove this breed entry?")) {
      await dbService.delete('animal_entries', entryId);
      setEntries(entries.filter(e => e.id !== entryId));
    }
  };

  if (!herd) return <div className="p-8 text-center text-earth-500">Loading...</div>;

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
                { id: 'overview', label: 'Breeds', icon: Activity },
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
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Breeds & Counts</h2>
                        <Button size="sm" onClick={() => setShowAddEntry(!showAddEntry)} icon={<Plus size={16} />}>Add Breed</Button>
                    </div>

                    {showAddEntry && (
                        <Card className="bg-leaf-50 dark:bg-leaf-900/10 border-leaf-200 dark:border-leaf-900 mb-4 animate-in fade-in zoom-in-95">
                           <form onSubmit={handleAddEntry} className="space-y-3">
                              <Input 
                                label="Breed Name"
                                autoFocus
                                placeholder="e.g. Rhode Island Red"
                                value={entryName}
                                onChange={e => setEntryName(e.target.value)}
                                required
                              />
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
                                <Button type="submit" size="sm">Save Breed</Button>
                              </div>
                           </form>
                        </Card>
                    )}

                    <div className="space-y-2">
                      {entries.length === 0 ? (
                        <div className="text-center p-8 bg-earth-50 dark:bg-stone-800 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-700 text-earth-500 dark:text-stone-400 italic">
                           No breeds added yet.
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
            )}

            {/* OTHER TABS PLACEHOLDERS (For Part 2/3) */}
            {activeTab !== 'overview' && (
               <div className="text-center py-12 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-200 dark:border-stone-700">
                  <div className="bg-earth-200 dark:bg-stone-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-earth-500 dark:text-stone-400">
                     <Activity size={24} />
                  </div>
                  <h3 className="font-serif font-bold text-earth-700 dark:text-earth-200">Coming Soon</h3>
                  <p className="text-sm text-earth-500 dark:text-stone-400">This feature will be available in the next update.</p>
               </div>
            )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
           <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
              <CardTitle>Daily Tasks</CardTitle>
              <div className="space-y-2 mt-3">
                 <Button variant="secondary" className="w-full justify-start bg-white dark:bg-stone-800 dark:text-earth-100" icon={<Egg size={16} />}>Log Collection</Button>
                 <Button variant="secondary" className="w-full justify-start bg-white dark:bg-stone-800 dark:text-earth-100" icon={<Wheat size={16} />}>Log Feed</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
