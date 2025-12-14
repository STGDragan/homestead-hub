
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { GardenBed, Plant, GardenLog, GardenPhoto, PhotoAnnotation, UserProfile, PlantTemplate, HarvestLog, Task } from '../../types';
import { gardenAIService, ScoredPlant } from '../../services/gardenAI';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PlantingTimeline } from '../../components/garden/PlantingTimeline';
import { GardenPhotoAnnotator } from '../../components/garden/GardenPhotoAnnotator';
import { LayoutGrid } from '../../components/garden/LayoutGrid';
import { PlantDetailModal } from '../../components/garden/PlantDetailModal';
import { ShoppingListModal } from '../../components/garden/ShoppingListModal';
import { HarvestLogModal } from '../../components/journal/HarvestLogModal';
import { TaskCreationModal } from '../../components/garden/TaskCreationModal';
import { CustomPlantModal } from '../../components/garden/CustomPlantModal';
import { ArrowLeft, Plus, Calendar, Droplets, Leaf, Clock, Camera, History, Star, Grid, Edit, ShoppingCart, ShoppingBasket, Trophy, ListTodo } from 'lucide-react';
import { COMMON_PLANTS } from '../../constants';

type Tab = 'plants' | 'layout' | 'timeline' | 'photos' | 'logs' | 'harvest';

export const GardenBedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bed, setBed] = useState<GardenBed | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [logs, setLogs] = useState<GardenLog[]>([]);
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [activeTab, setActiveTab] = useState<Tab>('plants');
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [showCustomPlantModal, setShowCustomPlantModal] = useState(false);
  
  // Tasks Logic
  const [plantsForTaskGen, setPlantsForTaskGen] = useState<{ plant: Plant, template: PlantTemplate }[]>([]);

  const [plantTemplates, setPlantTemplates] = useState<ScoredPlant[]>([]);
  const [allTemplates, setAllTemplates] = useState<PlantTemplate[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    if (id) loadBedData(id);
  }, [id, activeTab]);

  const loadBedData = async (bedId: string) => {
    const loadedBed = await dbService.get<GardenBed>('garden_beds', bedId);
    if (loadedBed) {
      setBed(loadedBed);
      setPlants(await dbService.getAllByIndex<Plant>('plants', 'bedId', bedId));
      setLogs(await dbService.getAllByIndex<GardenLog>('garden_logs', 'bedId', bedId));
      setPhotos(await dbService.getAllByIndex<GardenPhoto>('garden_photos', 'bedId', bedId));
      
      const bedHarvests = await dbService.getAllByIndex<HarvestLog>('harvest_logs', 'bedId', bedId);
      setHarvests(bedHarvests.sort((a, b) => b.harvestDate - a.harvestDate));
      
      const user = await dbService.get<UserProfile>('user_profile', 'main_user');
      setProfile(user);
      
      const customPlants = await dbService.getAll<PlantTemplate>('custom_plants') || [];
      const fullList = [...customPlants, ...COMMON_PLANTS];
      setAllTemplates(fullList);

      if (user) {
          const scored = gardenAIService.getRecommendations(user);
          const recommendedIds = new Set(scored.map(s => s.id));
          const others = COMMON_PLANTS.filter(p => !recommendedIds.has(p.id)).map(p => ({...p, score: 0, reasons: []}));
          
          // Inject custom plants at top for visibility
          const scoredCustom = customPlants.map(p => ({ ...p, score: 100, reasons: [{type: 'goal', message: 'Custom Plant'}] as any }));
          
          setPlantTemplates([...scoredCustom, ...scored, ...others]);
      } else {
          setPlantTemplates(fullList.map(p => ({...p, score: 0, reasons: []})));
      }
    }
  };

  // Group plants for list view
  const groupedPlants = useMemo(() => {
      const groups: Record<string, { representative: Plant; count: number }> = {};
      
      plants.forEach(p => {
          // Group by Name + Variety to aggregate "like" plants
          const key = `${p.name}::${p.variety}`;
          if (!groups[key]) {
              groups[key] = {
                  representative: p,
                  count: 0
              };
          }
          groups[key].count += (p.quantity || 1);
      });

      return Object.values(groups).sort((a, b) => a.representative.name.localeCompare(b.representative.name));
  }, [plants]);

  const handleAddPlant = async (templateId: string) => {
     const template = plantTemplates.find(p => p.id === templateId);
     if (!template || !bed) return;

     // Smart Date Calculation
     let plantDate = Date.now();
     if (profile) {
         const schedule = gardenAIService.getPlantingSchedule(template, profile.hardinessZone);
         plantDate = schedule.startDate.getTime();
     }

     const newPlant: Plant = {
        id: crypto.randomUUID(),
        bedId: bed.id,
        name: template.name,
        variety: template.defaultVariety,
        plantedDate: plantDate,
        daysToMaturity: template.daysToMaturity,
        status: 'seeded',
        quantity: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
     };

     await dbService.put('plants', newPlant);
     setPlants([...plants, newPlant]);
     
     await addLog('note', `Planted ${template.name}`, newPlant.id);
     setIsAddingPlant(false);

     setPlantsForTaskGen([{ plant: newPlant, template }]);
     setShowTaskPrompt(true);
  };

  const handleGenerateAllTasks = () => {
      if (!profile) return;
      const batch = plants.map(p => ({
          plant: p,
          template: allTemplates.find(t => t.name === p.name) || COMMON_PLANTS.find(t => t.name === p.name)!
      })).filter(x => x.template);
      
      if (batch.length > 0) {
          setPlantsForTaskGen(batch);
          setShowTaskPrompt(true);
      } else {
          alert("No valid plants found to generate tasks for.");
      }
  };

  const handleSaveTasks = async (tasks: Task[]) => {
      for (const t of tasks) {
          await dbService.put('tasks', t);
      }
      setShowTaskPrompt(false);
      setPlantsForTaskGen([]);
  };

  const removePlant = async (plantId: string) => {
      await dbService.delete('plants', plantId);
      setPlants(plants.filter(p => p.id !== plantId));
      setSelectedPlant(null);
  };

  const addLog = async (type: GardenLog['type'], content: string, plantId?: string) => {
    if (!bed) return;
    const newLog: GardenLog = {
        id: crypto.randomUUID(),
        bedId: bed.id,
        plantId,
        type,
        date: Date.now(),
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };
    await dbService.put('garden_logs', newLog);
    setLogs([newLog, ...logs]);
  };

  const handleSavePhoto = async (blobUrl: string, annotations: PhotoAnnotation[]) => {
      if (!bed) return;
      const newPhoto: GardenPhoto = {
          id: crypto.randomUUID(),
          bedId: bed.id,
          blobUrl,
          timestamp: Date.now(),
          annotations,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('garden_photos', newPhoto);
      setPhotos([newPhoto, ...photos]);
      setIsAddingPhoto(false);
      setActiveTab('photos');
  };

  const handleSaveHarvest = async (log: HarvestLog) => {
      await dbService.put('harvest_logs', log);
      setShowHarvestModal(false);
      if (bed) loadBedData(bed.id);
  };

  const handleCreateCustomPlant = async (plant: PlantTemplate) => {
      const newCustomPlant = {
          ...plant,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending' as const
      };
      await dbService.put('custom_plants', newCustomPlant as any);
      setShowCustomPlantModal(false);
      if (bed) loadBedData(bed.id);
  };

  if (!bed) return <div className="p-8 text-center text-earth-500">Loading bed details...</div>;

  const selectedPlantTemplate = selectedPlant 
    ? allTemplates.find(p => p.name === selectedPlant.name) 
    : undefined;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/garden')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 leading-none mb-1">{bed.name}</h1>
                    <p className="text-earth-600 dark:text-night-400 text-sm flex items-center gap-2">
                        <span className="bg-earth-200 dark:bg-night-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{bed.sunExposure} Sun</span>
                        <span>•</span>
                        <span>{bed.width}' × {bed.length}' {bed.type}</span>
                    </p>
                </div>
            </div>
            
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowShoppingList(true)} icon={<ShoppingCart size={16} />}>
                    Shopping List
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/garden/layout/${bed.id}`)} icon={<Grid size={16} />}>
                    Layout Tool
                </Button>
            </div>
        </div>
        
        <div className="flex overflow-x-auto pb-1 gap-2 border-b border-earth-200 dark:border-night-700 scrollbar-hide">
            {[
                { id: 'plants', label: 'Crops', icon: Leaf },
                { id: 'layout', label: 'Plan', icon: Grid },
                { id: 'harvest', label: 'Harvest', icon: ShoppingBasket },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'photos', label: 'Photos', icon: Camera },
                { id: 'logs', label: 'History', icon: History },
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
                                ? 'bg-white dark:bg-night-900 text-leaf-800 dark:text-leaf-400 border-b-2 border-leaf-600' 
                                : 'text-earth-500 dark:text-night-400 hover:text-earth-800 dark:hover:text-earth-200 hover:bg-earth-50 dark:hover:bg-night-800'}
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
            
            {activeTab === 'plants' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100 hidden md:block">Current Crops</h2>
                        <div className="flex gap-2 w-full md:w-auto">
                            {plants.length > 0 && (
                                <Button size="sm" variant="secondary" onClick={handleGenerateAllTasks} icon={<ListTodo size={16}/>}>
                                    Generate Schedule
                                </Button>
                            )}
                            <Button size="sm" onClick={() => setIsAddingPlant(!isAddingPlant)} icon={<Plus size={16} />}>Add Plant</Button>
                        </div>
                    </div>

                    {isAddingPlant && (
                        <div className="p-4 bg-white dark:bg-night-900 border border-leaf-200 dark:border-night-700 rounded-xl shadow-sm mb-4 animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-earth-700 dark:text-earth-300">Select Plant</h3>
                                <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => setShowCustomPlantModal(true)}>
                                    <Plus size={12} className="mr-1" /> Create Custom
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {plantTemplates.map(p => (
                                    <button 
                                      key={p.id}
                                      onClick={() => handleAddPlant(p.id)}
                                      className={`flex flex-col items-start gap-1 px-3 py-2 border rounded-lg transition-colors text-left
                                        ${p.score > 0 
                                            ? 'bg-leaf-50 dark:bg-leaf-900/20 border-leaf-200 dark:border-night-700 hover:bg-leaf-100 dark:hover:bg-leaf-900/30' 
                                            : 'bg-earth-50 dark:bg-night-800 border-earth-200 dark:border-night-700 hover:bg-earth-100 dark:hover:bg-night-700'}
                                      `}
                                    >
                                      <div className="flex items-center gap-1">
                                        <span className="font-bold text-earth-800 dark:text-earth-200 text-sm">{p.name}</span>
                                        {p.score > 0 && <Star size={10} className="text-amber-500 fill-amber-500" />}
                                      </div>
                                      {p.score > 0 && <span className="text-[10px] text-leaf-700 dark:text-leaf-400 font-medium">Recommended</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {groupedPlants.length === 0 ? (
                             <div className="text-center p-12 bg-earth-50 dark:bg-night-800 rounded-xl border-2 border-dashed border-earth-200 dark:border-night-700 text-earth-500 dark:text-night-400">
                                <Leaf className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No plants here yet.</p>
                             </div>
                        ) : groupedPlants.map(({ representative, count }) => (
                            <Card 
                                key={representative.id} 
                                className="flex items-center p-3 gap-3 cursor-pointer group hover:border-leaf-300 dark:hover:border-leaf-700 transition-colors"
                                onClick={() => setSelectedPlant(representative)}
                                interactive
                            >
                                <div className="w-10 h-10 rounded-full bg-leaf-100 dark:bg-leaf-900/20 flex items-center justify-center text-leaf-700 dark:text-leaf-400 font-serif font-bold text-lg shrink-0 overflow-hidden relative">
                                    {/* Try to find matching template image, else initial */}
                                    {allTemplates.find(t => t.name === representative.name)?.imageUrl ? (
                                        <img src={allTemplates.find(t => t.name === representative.name)?.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        representative.name[0]
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-leaf-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-night-900 shadow-sm">
                                        x{count}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-earth-800 dark:text-earth-100 truncate group-hover:text-leaf-700 dark:group-hover:text-leaf-400 transition-colors">{representative.name}</h3>
                                    <p className="text-xs text-earth-500 dark:text-night-400 truncate">{representative.variety}</p>
                                    <p className="text-[10px] text-earth-400 mt-0.5">Planted: {new Date(representative.plantedDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 bg-leaf-50 dark:bg-leaf-900/20 text-leaf-800 dark:text-leaf-400 text-xs font-bold rounded capitalize">
                                        {representative.status}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'layout' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-earth-800 dark:text-earth-100">Garden Plan</h2>
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/garden/layout/${bed.id}`)} icon={<Edit size={16} />}>
                            Edit Layout
                        </Button>
                    </div>
                    
                    <div className="bg-earth-50 dark:bg-night-800 rounded-2xl border border-earth-200 dark:border-night-700 p-4 min-h-[300px] flex items-center justify-center">
                        {plants.length > 0 ? (
                            <div className="w-full h-full max-w-lg aspect-square">
                                <LayoutGrid 
                                    bed={bed}
                                    plants={plants}
                                    activePlantTemplate={null}
                                    toolMode="inspect"
                                    onPlacePlant={() => {}} 
                                    onRemovePlant={() => {}}
                                    onPlantSelect={setSelectedPlant}
                                    allTemplates={allTemplates}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-earth-500 dark:text-night-400">
                                <Grid size={32} className="mx-auto mb-2 opacity-30" />
                                <p>No layout plan created.</p>
                                <Button className="mt-4" onClick={() => navigate(`/garden/layout/${bed.id}`)}>Open Layout Tool</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'harvest' && (
                <div className="space-y-6">
                    <div className="flex gap-4 overflow-x-auto">
                        <Card className="flex-1 min-w-[140px] bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Total Harvests</p>
                            <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 mt-1">{harvests.length}</p>
                        </Card>
                        <Card className="flex-1 min-w-[140px] bg-leaf-50 dark:bg-leaf-900/10 border-leaf-200 dark:border-leaf-900/30">
                            <p className="text-xs font-bold text-leaf-800 dark:text-leaf-300 uppercase">Last Harvest</p>
                            <p className="text-lg font-bold text-earth-900 dark:text-earth-100 mt-1">
                                {harvests.length > 0 ? new Date(harvests[0].harvestDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '--'}
                            </p>
                        </Card>
                    </div>

                    <Button onClick={() => setShowHarvestModal(true)} icon={<Plus size={18} />} className="w-full">
                        Log New Harvest
                    </Button>

                    <div className="space-y-3">
                        <h3 className="font-bold text-earth-900 dark:text-earth-100">Harvest History</h3>
                        {harvests.length === 0 ? (
                            <div className="text-center py-8 text-earth-500 dark:text-night-400 italic bg-earth-50 dark:bg-night-800 rounded-xl">
                                No harvests recorded yet.
                            </div>
                        ) : harvests.map(log => (
                            <div key={log.id} className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-800 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400">
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-earth-800 dark:text-earth-100">{log.cropName}</p>
                                        <p className="text-xs text-earth-500 dark:text-night-400">
                                            {new Date(log.harvestDate).toLocaleDateString()} • {log.quality} Quality
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-lg text-leaf-700 dark:text-leaf-400">
                                        {log.quantity} <span className="text-sm font-normal text-earth-500 dark:text-night-400">{log.unit}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'timeline' && <PlantingTimeline plants={plants} />}

            {activeTab === 'photos' && (
                <div className="space-y-6">
                    {isAddingPhoto ? (
                        <GardenPhotoAnnotator onSave={handleSavePhoto} onCancel={() => setIsAddingPhoto(false)} />
                    ) : (
                        <>
                             <Button onClick={() => setIsAddingPhoto(true)} icon={<Camera size={18} />} className="w-full">
                                Log New Photo
                             </Button>
                             <div className="grid grid-cols-2 gap-4">
                                {photos.length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-earth-400 dark:text-night-500 italic">No photos yet.</div>
                                )}
                                {photos.map(photo => (
                                    <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-earth-200 dark:border-night-800 bg-black aspect-square">
                                        <img src={photo.blobUrl} alt="Log" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                            <p className="text-xs text-white font-bold">{new Date(photo.timestamp).toLocaleDateString()}</p>
                                            {photo.annotations.length > 0 && (
                                                <p className="text-[10px] text-gray-300">{photo.annotations.length} notes</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </>
                    )}
                </div>
            )}
            
            {activeTab === 'logs' && (
                <div className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={() => addLog('note', 'General checkup')}>Quick Note</Button>
                    <div className="space-y-4 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-earth-200 dark:before:bg-night-800">
                        {logs.map(log => (
                            <div key={log.id} className="relative pl-10">
                                <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-white dark:bg-night-900 border-2 border-leaf-500 z-10"></div>
                                <div className="bg-white dark:bg-night-900 p-3 rounded-lg border border-earth-200 dark:border-night-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-leaf-700 dark:text-leaf-400 uppercase tracking-wider">{log.type}</span>
                                        <span className="text-xs text-earth-400 dark:text-night-500">{new Date(log.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-earth-800 dark:text-earth-200 text-sm">{log.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

         </div>

         <div className="space-y-4">
            <Card className="bg-earth-50 dark:bg-night-800 border-earth-200 dark:border-night-700">
               <h3 className="font-serif font-bold text-earth-900 dark:text-earth-100 mb-4 text-sm">Vital Stats</h3>
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-earth-600 dark:text-night-300">
                     <span className="flex items-center gap-2"><Calendar size={16} /> Active Plants</span>
                     <span className="font-bold">{plants.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-earth-600 dark:text-night-300">
                     <span className="flex items-center gap-2"><Droplets size={16} /> Watered</span>
                     <span className="font-bold text-leaf-700 dark:text-leaf-400">2d ago</span>
                  </div>
               </div>
               <div className="mt-6 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => addLog('water', 'Watered bed')}>Water</Button>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => addLog('fertilize', 'Added Compost')}>Feed</Button>
               </div>
            </Card>
         </div>
      </div>

      {selectedPlant && (
          <PlantDetailModal 
             plant={selectedPlant}
             template={selectedPlantTemplate}
             onClose={() => setSelectedPlant(null)}
             onRemove={removePlant}
             userProfile={profile}
          />
      )}

      {showShoppingList && (
          <ShoppingListModal 
             plants={plants}
             allTemplates={allTemplates}
             onClose={() => setShowShoppingList(false)}
          />
      )}

      {showHarvestModal && (
          <HarvestLogModal 
             onClose={() => setShowHarvestModal(false)}
             onSave={handleSaveHarvest}
             initialBedId={bed.id}
          />
      )}

      {showCustomPlantModal && (
          <CustomPlantModal 
             onClose={() => setShowCustomPlantModal(false)}
             onSave={handleCreateCustomPlant}
          />
      )}

      {showTaskPrompt && plantsForTaskGen.length > 0 && profile && (
          <TaskCreationModal 
             plants={plantsForTaskGen}
             userProfile={profile}
             onConfirm={handleSaveTasks}
             onCancel={() => { setShowTaskPrompt(false); setPlantsForTaskGen([]); }}
          />
      )}
    </div>
  );
};
