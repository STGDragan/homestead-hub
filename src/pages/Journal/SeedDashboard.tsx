
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { SeedPacket, JournalEntry, PlantingLog, HarvestLog } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SeedCard } from '../../components/journal/SeedCard';
import { SeedEditorModal } from '../../components/journal/SeedEditorModal';
import { GerminationTestModal } from '../../components/journal/GerminationTestModal';
import { PlantingLogModal } from '../../components/journal/PlantingLogModal';
import { HarvestLogModal } from '../../components/journal/HarvestLogModal';
import { JournalEntryEditor } from '../../components/journal/JournalEntryEditor';
import { RotationAdvisorPanel } from '../../components/journal/RotationAdvisorPanel';
import { Plus, Book, Search, Filter, Sprout, ShoppingBasket, History, RotateCcw, ClipboardList } from 'lucide-react';

type Tab = 'inventory' | 'planting' | 'harvest' | 'journal' | 'rotation';

export const SeedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data
  const [seeds, setSeeds] = useState<SeedPacket[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [plantingLogs, setPlantingLogs] = useState<PlantingLog[]>([]);
  const [harvestLogs, setHarvestLogs] = useState<HarvestLog[]>([]);

  // Modal States
  const [showSeedEditor, setShowSeedEditor] = useState(false);
  const [editingSeed, setEditingSeed] = useState<SeedPacket | null>(null);
  const [showGermModal, setShowGermModal] = useState(false);
  const [showPlantingModal, setShowPlantingModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showJournalEditor, setShowJournalEditor] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const s = await dbService.getAll<SeedPacket>('seeds');
      const j = await dbService.getAll<JournalEntry>('journal_entries');
      const p = await dbService.getAll<PlantingLog>('planting_logs');
      const h = await dbService.getAll<HarvestLog>('harvest_logs');
      
      setSeeds(s.sort((a, b) => a.plantType.localeCompare(b.plantType)));
      setJournalEntries(j.sort((a, b) => b.date - a.date));
      setPlantingLogs(p.sort((a, b) => b.plantingDate - a.plantingDate));
      setHarvestLogs(h.sort((a, b) => b.harvestDate - a.harvestDate));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  // Handlers
  const handleSaveSeed = async (data: Partial<SeedPacket>) => {
    const seed: SeedPacket = {
       id: data.id || crypto.randomUUID(),
       variety: data.variety!,
       plantType: data.plantType!,
       brand: data.brand,
       quantityRemaining: data.quantityRemaining || 0,
       quantityUnit: data.quantityUnit || 'count',
       daysToGerminate: data.daysToGerminate || 7,
       expirationYear: data.expirationYear,
       notes: data.notes,
       germinationTests: data.germinationTests || [],
       archived: data.archived || false,
       tags: data.tags || [],
       createdAt: data.createdAt || Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };
    await dbService.put('seeds', seed);
    loadData();
    setShowSeedEditor(false);
    setEditingSeed(null);
  };

  const handleSaveGermTest = async (test: any) => {
     if (!editingSeed) return;
     const updatedTests = [...(editingSeed.germinationTests || []), test];
     const updatedSeed = { ...editingSeed, germinationTests: updatedTests, updatedAt: Date.now(), syncStatus: 'pending' as const };
     await dbService.put('seeds', updatedSeed);
     loadData();
     setShowGermModal(false);
     setEditingSeed(null);
  };

  const handleSavePlanting = async (log: PlantingLog) => {
     await dbService.put('planting_logs', log);
     loadData();
     setShowPlantingModal(false);
  };

  const handleSaveHarvest = async (log: HarvestLog) => {
     await dbService.put('harvest_logs', log);
     loadData();
     setShowHarvestModal(false);
  };

  const handleSaveJournal = async (entry: JournalEntry) => {
     await dbService.put('journal_entries', entry);
     loadData();
     setShowJournalEditor(false);
  };

  const handleDeleteSeed = async (id: string) => {
    if (confirm("Delete this seed entry?")) {
        await dbService.delete('seeds', id);
        loadData();
        setShowSeedEditor(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Book className="text-leaf-700 dark:text-leaf-400" /> Garden Journal
          </h1>
          <p className="text-earth-600 dark:text-earth-400">Track seeds, planting history, and harvests.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setShowJournalEditor(true)} icon={<Plus size={18} />}>New Entry</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-earth-200 dark:border-night-800">
         {[
            { id: 'inventory', label: 'Seeds', icon: ClipboardList },
            { id: 'planting', label: 'Planting', icon: Sprout },
            { id: 'harvest', label: 'Harvest', icon: ShoppingBasket },
            { id: 'rotation', label: 'Rotation', icon: RotateCcw },
            { id: 'journal', label: 'Timeline', icon: History },
         ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                     flex items-center gap-2 px-4 py-3 rounded-t-lg font-bold text-sm transition-colors whitespace-nowrap
                     ${isActive 
                        ? 'bg-white dark:bg-night-900 text-leaf-800 dark:text-leaf-400 border-b-2 border-leaf-600' 
                        : 'text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-200 hover:bg-earth-50 dark:hover:bg-night-800'}
                  `}
               >
                  <Icon size={16} /> {tab.label}
               </button>
            )
         })}
      </div>

      {/* SEED INVENTORY TAB */}
      {activeTab === 'inventory' && (
         <div className="space-y-4">
             <div className="flex gap-3">
                <div className="flex-1">
                   <Input 
                      icon={<Search size={18} />}
                      placeholder="Search seeds..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
                <Button variant="secondary" icon={<Filter size={18} />}>Filter</Button>
                <Button onClick={() => { setEditingSeed(null); setShowSeedEditor(true); }} icon={<Plus size={18} />}>Add Seed</Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seeds.filter(s => s.variety.toLowerCase().includes(searchTerm.toLowerCase())).map(seed => (
                   <SeedCard 
                      key={seed.id} 
                      seed={seed} 
                      onClick={() => { setEditingSeed(seed); setShowSeedEditor(true); }}
                   />
                ))}
             </div>
         </div>
      )}

      {/* PLANTING TAB */}
      {activeTab === 'planting' && (
         <div className="space-y-4">
            <Button className="w-full md:w-auto" onClick={() => setShowPlantingModal(true)} icon={<Plus size={18}/>}>Log Planting</Button>
            <div className="space-y-3">
               {plantingLogs.map(log => (
                  <div key={log.id} className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-800 flex justify-between items-center shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-leaf-50 dark:bg-leaf-900/20 rounded-lg text-leaf-600">
                           <Sprout size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-earth-800 dark:text-earth-100">
                              {seeds.find(s => s.id === log.seedLotId)?.variety || 'Unknown Seed'}
                           </p>
                           <p className="text-xs text-earth-500 dark:text-night-400">
                              {new Date(log.plantingDate).toLocaleDateString()} • {log.quantity} planted
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* HARVEST TAB */}
      {activeTab === 'harvest' && (
         <div className="space-y-4">
            <Button className="w-full md:w-auto" onClick={() => setShowHarvestModal(true)} icon={<Plus size={18}/>}>Log Harvest</Button>
            <div className="space-y-3">
               {harvestLogs.map(log => (
                  <div key={log.id} className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-800 flex justify-between items-center shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                           <ShoppingBasket size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-earth-800 dark:text-earth-100">{log.cropName}</p>
                           <p className="text-xs text-earth-500 dark:text-night-400">
                              {new Date(log.harvestDate).toLocaleDateString()} • Quality: {log.quality}
                           </p>
                        </div>
                     </div>
                     <span className="text-lg font-bold text-leaf-700 dark:text-leaf-400">
                        {log.quantity} {log.unit}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* ROTATION TAB */}
      {activeTab === 'rotation' && <RotationAdvisorPanel />}

      {/* JOURNAL TAB */}
      {activeTab === 'journal' && (
         <div className="space-y-6">
            <div className="relative border-l-2 border-earth-200 dark:border-night-800 ml-4 pl-8 space-y-8 py-2">
               {journalEntries.map(entry => (
                  <div key={entry.id} className="relative">
                     <div className="absolute -left-[39px] top-1 w-5 h-5 bg-white dark:bg-night-900 border-2 border-leaf-500 rounded-full" />
                     <div className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-earth-800 dark:text-earth-100">{entry.title}</h3>
                           <span className="text-xs text-earth-400 dark:text-night-500">{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-earth-600 dark:text-night-300 leading-relaxed">{entry.content}</p>
                        <div className="mt-3 flex gap-2">
                           {entry.tags.map(tag => (
                              <span key={tag} className="text-xs bg-earth-100 dark:bg-night-800 text-earth-600 dark:text-night-400 px-2 py-1 rounded-md">#{tag}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* MODALS */}
      {showSeedEditor && (
        <SeedEditorModal 
           seed={editingSeed}
           onSave={handleSaveSeed}
           onClose={() => setShowSeedEditor(false)}
           onDelete={handleDeleteSeed}
        />
      )}

      {showGermModal && editingSeed && (
         <GerminationTestModal 
            seed={editingSeed}
            onSave={handleSaveGermTest}
            onClose={() => setShowGermModal(false)}
         />
      )}

      {showPlantingModal && (
         <PlantingLogModal 
            onClose={() => setShowPlantingModal(false)}
            onSave={handleSavePlanting}
         />
      )}

      {showHarvestModal && (
         <HarvestLogModal 
            onClose={() => setShowHarvestModal(false)}
            onSave={handleSaveHarvest}
         />
      )}

      {showJournalEditor && (
         <JournalEntryEditor 
            onClose={() => setShowJournalEditor(false)}
            onSave={handleSaveJournal}
         />
      )}
    </div>
  );
};
