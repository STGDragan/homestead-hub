import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { GardenBed, Plant, UserProfile } from '../../types';
import { BedCard } from '../../components/garden/BedCard';
import { PlantSuggestionsPanel } from '../../components/garden/PlantSuggestionsPanel';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Ruler, X, MapPin, Sprout, TreeDeciduous, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrchardDashboard } from '../Orchard/OrchardDashboard';

type GardenTab = 'beds' | 'orchard';

export const GardenDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GardenTab>('beds');
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLayoutSelect, setShowLayoutSelect] = useState(false);
  const [zone, setZone] = useState<string>('');
  const [isCreatingForLayout, setIsCreatingForLayout] = useState(false); 
  const navigate = useNavigate();

  // Form State
  const [newBedName, setNewBedName] = useState('');
  const [newBedWidth, setNewBedWidth] = useState(4);
  const [newBedLength, setNewBedLength] = useState(8);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const loadedBeds = await dbService.getAll<GardenBed>('garden_beds');
      const loadedPlants = await dbService.getAll<Plant>('plants');
      const profile = await dbService.get<UserProfile>('user_profile', 'main_user');
      
      setBeds(loadedBeds);
      setAllPlants(loadedPlants);
      if (profile?.hardinessZone) setZone(profile.hardinessZone);
    } catch (e) {
      console.error("Failed to load garden data", e);
    }
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBed: GardenBed = {
        id: crypto.randomUUID(),
        name: newBedName,
        width: newBedWidth,
        length: newBedLength,
        sunExposure: 'full', // Default
        type: 'raised', // Default
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };
    await dbService.put('garden_beds', newBed);
    
    // Workflow logic
    if (isCreatingForLayout) {
        navigate(`/garden/layout/${newBed.id}`);
    } else {
        setBeds([...beds, newBed]);
        setShowAddModal(false);
        setNewBedName('');
        setIsCreatingForLayout(false);
    }
  };

  const handleLayoutClick = () => {
      if (beds.length === 0) {
          setIsCreatingForLayout(true);
          setShowAddModal(true);
          return;
      }
      if (beds.length === 1) {
          navigate(`/garden/layout/${beds[0].id}`);
      } else {
          setShowLayoutSelect(true);
      }
  };

  const getPlantsForBed = (bedId: string) => allPlants.filter(p => p.bedId === bedId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Sprout className="text-leaf-600" /> Garden & Orchard
          </h1>
          <p className="text-earth-600 dark:text-earth-400 flex items-center gap-2">
            Manage your beds, trees, and harvests.
            {zone && <span className="bg-leaf-100 dark:bg-leaf-900/30 text-leaf-800 dark:text-leaf-300 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin size={10}/> Zone {zone}</span>}
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800">
         <button 
            onClick={() => setActiveTab('beds')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'beds' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
         >
            <Sprout size={16}/> Vegetable Beds
         </button>
         <button 
            onClick={() => setActiveTab('orchard')}
            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'orchard' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
         >
            <TreeDeciduous size={16}/> Fruit Orchard
         </button>
      </div>

      {activeTab === 'beds' && (
        <>
            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={handleLayoutClick} icon={<Ruler size={18} />}>Layout Tool</Button>
                <Button onClick={() => { setIsCreatingForLayout(false); setShowAddModal(true); }} icon={<Plus size={18} />}>New Bed</Button>
            </div>

            {/* AI Recommendations Section */}
            <PlantSuggestionsPanel />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beds.map(bed => (
                <BedCard key={bed.id} bed={bed} plants={getPlantsForBed(bed.id)} />
                ))}
                
                {/* Create New Bed Card Button */}
                <button 
                    onClick={() => { setIsCreatingForLayout(false); setShowAddModal(true); }}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-earth-300 dark:border-stone-700 rounded-2xl bg-earth-50 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700 hover:border-leaf-400 dark:hover:border-leaf-600 transition-all text-earth-500 dark:text-stone-400 hover:text-leaf-700 dark:hover:text-leaf-400 min-h-[200px]"
                >
                    <div className="w-12 h-12 rounded-full bg-earth-200 dark:bg-stone-700 flex items-center justify-center mb-3">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Create New Bed</span>
                </button>
            </div>
        </>
      )}

      {activeTab === 'orchard' && (
          <>
            <OrchardDashboard embedded />
          </>
      )}

      {/* Add Bed Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-earth-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">
                        {isCreatingForLayout ? "Create Bed to Design" : "Add New Bed"}
                    </h2>
                    <button onClick={() => setShowAddModal(false)} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
                </div>
                {isCreatingForLayout && (
                    <div className="bg-leaf-50 dark:bg-leaf-900/20 text-leaf-800 dark:text-leaf-200 p-3 rounded-lg text-sm mb-4">
                        Let's define your garden bed dimensions first, then we'll jump into the Layout Tool.
                    </div>
                )}
                <form onSubmit={handleCreateBed} className="space-y-4">
                    <Input 
                        label="Bed Name"
                        autoFocus
                        placeholder="e.g. South Raised Bed"
                        value={newBedName}
                        onChange={(e) => setNewBedName(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Width (ft)"
                            type="number" 
                            value={newBedWidth}
                            onChange={(e) => setNewBedWidth(Number(e.target.value))}
                        />
                        <Input 
                            label="Length (ft)"
                            type="number" 
                            value={newBedLength}
                            onChange={(e) => setNewBedLength(Number(e.target.value))}
                        />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">
                            {isCreatingForLayout ? "Create & Open Tool" : "Create Bed"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Bed Selection Modal for Layout */}
      {showLayoutSelect && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-earth-200 dark:border-stone-800">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif font-bold text-lg text-earth-900 dark:text-earth-100">Select Bed to Design</h2>
                  <button onClick={() => setShowLayoutSelect(false)}><X size={24} className="text-earth-400"/></button>
               </div>
               <div className="space-y-2">
                  {beds.map(bed => (
                     <button
                        key={bed.id}
                        onClick={() => {
                           setShowLayoutSelect(false);
                           navigate(`/garden/layout/${bed.id}`);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-earth-100 dark:hover:bg-stone-800 transition-colors font-bold text-earth-700 dark:text-stone-300 flex justify-between items-center"
                     >
                        {bed.name}
                        <span className="text-xs font-normal text-earth-500">{bed.width}x{bed.length}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};