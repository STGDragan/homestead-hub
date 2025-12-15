


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { gardenAIService, ScoredPlant, AutoFillOptions } from '../../services/gardenAI';
import { GardenBed, Plant, PlantTemplate, UserProfile, Task } from '../../types';
import { COMMON_PLANTS } from '../../constants';
import { LayoutGrid } from '../../components/garden/LayoutGrid';
import { CustomPlantModal } from '../../components/garden/CustomPlantModal';
import { PlantDetailModal } from '../../components/garden/PlantDetailModal';
import { TaskCreationModal } from '../../components/garden/TaskCreationModal';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, Plus, Sprout, Wand2, Star, X, Check, Bug, Flower, Eraser, MousePointer2 } from 'lucide-react';

type ToolMode = 'inspect' | 'paint' | 'eraser';

const AutoFillModal: React.FC<{ 
    onConfirm: (options: AutoFillOptions) => void; 
    onCancel: () => void; 
}> = ({ onConfirm, onCancel }) => {
    const [pollinators, setPollinators] = useState(true);
    const [companions, setCompanions] = useState(true);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Wand2 className="text-leaf-600" /> Auto-Fill Wizard
                    </h2>
                    <button onClick={onCancel}><X size={24} className="text-earth-400" /></button>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${pollinators ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-900/20' : 'border-earth-200 dark:border-stone-700'}`}
                        onClick={() => setPollinators(!pollinators)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pollinators ? 'bg-leaf-100 text-leaf-700' : 'bg-earth-100 text-earth-400'}`}>
                            <Flower size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-earth-900 dark:text-earth-100">Pollinator Pathway</h3>
                            <p className="text-xs text-earth-500 dark:text-stone-400">Add flowers to corners & edges to attract bees.</p>
                        </div>
                        {pollinators && <Check size={20} className="ml-auto text-leaf-600" />}
                    </div>

                    <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${companions ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-900/20' : 'border-earth-200 dark:border-stone-700'}`}
                        onClick={() => setCompanions(!companions)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${companions ? 'bg-leaf-100 text-leaf-700' : 'bg-earth-100 text-earth-400'}`}>
                            <Bug size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-earth-900 dark:text-earth-100">Companion Planting</h3>
                            <p className="text-xs text-earth-500 dark:text-stone-400">Mix beneficial plant partners to reduce pests.</p>
                        </div>
                        {companions && <Check size={20} className="ml-auto text-leaf-600" />}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
                    <Button onClick={() => onConfirm({ includePollinators: pollinators, includeCompanions: companions })} className="flex-1">
                        Generate Plan
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const GardenLayoutTool: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bed, setBed] = useState<GardenBed | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [existingPlants, setExistingPlants] = useState<Plant[]>([]); // To track differences
  
  // Tool State
  const [activeTemplate, setActiveTemplate] = useState<PlantTemplate | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('inspect');
  
  const [hasChanges, setHasChanges] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allPlants, setAllPlants] = useState<PlantTemplate[]>([]); // Merged list
  const [sortedTools, setSortedTools] = useState<ScoredPlant[]>([]);
  
  // Modals
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [newPlantsForTasks, setNewPlantsForTasks] = useState<{ plant: Plant, template: PlantTemplate }[]>([]);
  
  // Selection State
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (bedId: string) => {
    const b = await dbService.get<GardenBed>('garden_beds', bedId);
    const profile = await dbService.get<UserProfile>('user_profile', 'main_user');
    const customPlants = await dbService.getAll<PlantTemplate>('custom_plants') || [];
    
    // Merge System + Custom
    const fullList = [...customPlants, ...COMMON_PLANTS];
    setAllPlants(fullList);

    if (b) {
       setBed(b);
       const p = await dbService.getAllByIndex<Plant>('plants', 'bedId', bedId);
       setPlants(p);
       setExistingPlants(p);
    }

    if (profile) {
        setUserProfile(profile);
        // Get scored list for sidebar
        const scoredCommon = gardenAIService.getRecommendations(profile);
        const scoredCustom: ScoredPlant[] = customPlants.map(p => ({
            ...p,
            score: 50, // Neutral/High score for user created items
            reasons: [{ type: 'goal', message: 'Custom Plant' }]
        }));

        const recommendedIds = new Set(scoredCommon.map(s => s.id));
        const others = COMMON_PLANTS.filter(p => !recommendedIds.has(p.id))
            .map(p => ({...p, score: 0, reasons: []})); // Default score for non-recommended
        
        // Combine: Custom -> Recommended -> Others
        setSortedTools([...scoredCustom, ...scoredCommon, ...others]);
    } else {
        setSortedTools(fullList.map(p => ({...p, score: 0, reasons: []})));
    }
  };

  const handleToolSelect = (mode: ToolMode, template: PlantTemplate | null) => {
      setToolMode(mode);
      setActiveTemplate(template);
  };

  const handlePlacePlant = (x: number, y: number, template: PlantTemplate) => {
     if (!bed) return;
     
     // Calculate smart planting date based on schedule
     let plantDate = Date.now();
     if (userProfile) {
         const schedule = gardenAIService.getPlantingSchedule(template, userProfile.hardinessZone);
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
        quantity: 1, // Represents 1 square patch
        x,
        y,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
     };
     setPlants(prev => [...prev, newPlant]);
     setHasChanges(true);
  };

  const handleRemovePlant = (plantId: string) => {
     setPlants(prev => prev.filter(p => p.id !== plantId));
     setHasChanges(true);
     if (selectedPlant?.id === plantId) setSelectedPlant(null);
  };

  const handleAutoGenerate = (options: AutoFillOptions) => {
      if (!bed || !userProfile) return;
      const newLayout = gardenAIService.generateLayout(bed, userProfile, options);
      setPlants(newLayout);
      setHasChanges(true);
      setShowAutoFillModal(false);
  };

  const handleSaveClick = () => {
      // 1. Identify newly added plants
      // Only prompt for plants that were not present in the existingPlants list
      // This allows moving existing plants without triggering new seeding tasks
      const existingIds = new Set(existingPlants.map(p => p.id));
      const newlyAdded = plants.filter(p => !existingIds.has(p.id));

      if (newlyAdded.length > 0 && userProfile) {
          // Prepare data for task prompt
          const plantData = newlyAdded.map(p => ({
              plant: p,
              template: allPlants.find(t => t.name === p.name) || COMMON_PLANTS.find(t => t.name === p.name)!
          })).filter(item => !!item.template);

          if (plantData.length > 0) {
              setNewPlantsForTasks(plantData);
              setShowTaskPrompt(true);
              return; // Halt save to show prompt
          }
      }

      performSave();
  };

  const performSave = async (extraTasks: Task[] = []) => {
     if (!bed) return;
     
     // 1. Delete removed
     const currentIds = new Set(plants.map(p => p.id));
     const toDelete = existingPlants.filter(p => !currentIds.has(p.id));
     for (const p of toDelete) {
        await dbService.delete('plants', p.id);
     }

     // 2. Upsert current
     for (const p of plants) {
        await dbService.put('plants', p);
     }

     // 3. Save generated tasks
     for (const t of extraTasks) {
         await dbService.put('tasks', t);
     }

     setHasChanges(false);
     navigate(`/garden/bed/${bed.id}`);
  };

  const handleCreateCustomPlant = async (plant: PlantTemplate) => {
      const newCustomPlant = {
          ...plant,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending' as const
      };
      await dbService.put('custom_plants', newCustomPlant as any);
      setShowCustomModal(false);
      if (bed) loadData(bed.id);
  };

  if (!bed) return <div className="p-8">Loading layout...</div>;

  const selectedPlantTemplate = selectedPlant 
    ? allPlants.find(p => p.name === selectedPlant.name) || COMMON_PLANTS.find(p => p.name === selectedPlant.name)
    : undefined;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row gap-4 animate-in fade-in">
       
       {/* Sidebar / Tools */}
       <div className="w-full md:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-stone-900 border-r border-earth-200 dark:border-stone-800 overflow-hidden md:h-full rounded-xl md:rounded-none">
          <div className="p-4 border-b border-earth-200 dark:border-stone-800 space-y-3">
             <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => navigate('/garden')} className="pl-0 gap-1 text-earth-500 h-auto py-1">
                    <ArrowLeft size={16} /> Back
                </Button>
                {hasChanges && (
                    <Button onClick={handleSaveClick} size="sm" icon={<Save size={14} />} className="animate-pulse">
                        Save
                    </Button>
                )}
             </div>
             
             <div>
                <h2 className="font-bold text-earth-900 dark:text-earth-100">{bed.name}</h2>
                <p className="text-xs text-earth-500">{bed.width}' x {bed.length}' • Zone {userProfile?.hardinessZone || '?'}</p>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <Button 
                    onClick={() => {
                        if (plants.length > 0 && !confirm("This will clear your current layout. Continue?")) return;
                        setShowAutoFillModal(true);
                    }} 
                    variant="secondary" 
                    size="sm" 
                    className="bg-leaf-50 text-leaf-700 border-leaf-200" 
                    icon={<Wand2 size={14}/>}
                >
                    Auto-Fill
                </Button>
                <Button onClick={() => setShowCustomModal(true)} variant="secondary" size="sm" icon={<Plus size={14} />}>
                    Custom
                </Button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             <p className="text-xs font-bold text-earth-400 uppercase px-2 mt-2 mb-1">Tools</p>
             
             {/* Tool Buttons */}
             <div className="flex gap-2 px-2 mb-4">
                 <button
                    onClick={() => handleToolSelect('inspect', null)}
                    className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${toolMode === 'inspect' ? 'bg-earth-800 text-white border-earth-800' : 'bg-white dark:bg-stone-800 text-earth-600 dark:text-stone-300 border-earth-200 dark:border-stone-700'}`}
                 >
                    <MousePointer2 size={20} />
                    <span className="text-[10px] font-bold mt-1">Inspect</span>
                 </button>
                 <button
                    onClick={() => handleToolSelect('eraser', null)}
                    className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${toolMode === 'eraser' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-stone-800 text-earth-600 dark:text-stone-300 border-earth-200 dark:border-stone-700'}`}
                 >
                    <Eraser size={20} />
                    <span className="text-[10px] font-bold mt-1">Eraser</span>
                 </button>
             </div>

             <p className="text-xs font-bold text-earth-400 uppercase px-2 mb-1">Plants (Paint Mode)</p>
             {sortedTools.map(template => {
                const isRecommended = template.score > 0;
                const isCustom = template.id.startsWith('custom_');
                const isActive = activeTemplate?.id === template.id && toolMode === 'paint';
                
                return (
                    <button
                        key={template.id}
                        onClick={() => handleToolSelect('paint', template)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left relative group border
                            ${isActive
                                ? 'bg-leaf-600 text-white shadow-md border-leaf-600' 
                                : 'bg-white dark:bg-stone-800 border-transparent hover:border-earth-200 dark:hover:border-stone-700 hover:bg-earth-50 dark:hover:bg-stone-700 text-earth-800 dark:text-earth-200'}
                        `}
                    >
                        <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${isActive ? 'bg-white/20' : 'bg-earth-100 dark:bg-stone-700'}`}>
                            {template.imageUrl ? (
                                <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                            ) : (
                                <Sprout size={20} />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="font-bold block text-sm flex items-center gap-1 truncate">
                                {template.name}
                                {isRecommended && !isCustom && <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />}
                            </span>
                            <span className={`text-[10px] block truncate ${isActive ? 'text-leaf-100' : 'text-earth-500'}`}>
                                {template.spacing}" • {template.height}
                            </span>
                        </div>
                    </button>
                )
             })}
          </div>
       </div>

       {/* Main Stage */}
       <div className="flex-1 flex flex-col min-h-0 bg-earth-50 dark:bg-stone-950 relative overflow-hidden">
          {/* Active Tool Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
             {toolMode === 'paint' && activeTemplate && (
                 <div className="bg-leaf-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Sprout size={16} />
                    <span className="text-sm font-bold">Painting: {activeTemplate.name}</span>
                 </div>
             )}
             {toolMode === 'eraser' && (
                 <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Eraser size={16} />
                    <span className="text-sm font-bold">Eraser Active</span>
                 </div>
             )}
             {toolMode === 'inspect' && (
                 <div className="bg-white/80 dark:bg-black/60 text-earth-600 dark:text-stone-300 px-4 py-2 rounded-full shadow-lg border border-earth-200 dark:border-stone-700 flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <MousePointer2 size={16} />
                    <span className="text-sm font-bold">Inspect Mode</span>
                 </div>
             )}
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-8 touch-none">
             <LayoutGrid 
                bed={bed} 
                plants={plants} 
                activePlantTemplate={activeTemplate}
                toolMode={toolMode}
                onPlacePlant={handlePlacePlant}
                onRemovePlant={handleRemovePlant}
                onPlantSelect={setSelectedPlant}
                allTemplates={allPlants}
             />
          </div>
       </div>

       {/* Modals */}
       {showCustomModal && (
          <CustomPlantModal 
             onSave={handleCreateCustomPlant}
             onClose={() => setShowCustomModal(false)}
          />
       )}

       {showAutoFillModal && (
           <AutoFillModal 
              onConfirm={handleAutoGenerate}
              onCancel={() => setShowAutoFillModal(false)}
           />
       )}

       {selectedPlant && (
           <PlantDetailModal 
              plant={selectedPlant}
              template={selectedPlantTemplate}
              onClose={() => setSelectedPlant(null)}
              onRemove={handleRemovePlant}
              userProfile={userProfile}
           />
       )}

       {showTaskPrompt && userProfile && (
           <TaskCreationModal 
              plants={newPlantsForTasks}
              userProfile={userProfile}
              onConfirm={(tasks) => performSave(tasks)}
              onCancel={() => performSave([])}
           />
       )}
    </div>
  );
};
