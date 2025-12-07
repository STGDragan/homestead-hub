import React, { useState, useEffect } from 'react';
import { Plant, PlantTemplate, Task, UserProfile } from '../../types';
import { gardenAIService } from '../../services/gardenAI';
import { Button } from '../ui/Button';
import { X, Calendar, CheckSquare, Sprout, Leaf, ShoppingBasket, Check, Square } from 'lucide-react';

interface TaskCreationModalProps {
  plants: { plant: Plant, template: PlantTemplate }[];
  userProfile: UserProfile;
  onConfirm: (tasks: Task[]) => void;
  onCancel: () => void;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ plants, userProfile, onConfirm, onCancel }) => {
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Generate tasks for unique plant types
    const uniqueTemplates = new Set<string>();
    const groups: Record<string, Task[]> = {};
    const allIds = new Set<string>();

    plants.forEach(({ plant, template }) => {
        if (!uniqueTemplates.has(template.name)) {
            uniqueTemplates.add(template.name);
            const newTasks = gardenAIService.generateSuggestedTasks(plant, template, userProfile);
            groups[template.name] = newTasks;
            newTasks.forEach(t => allIds.add(t.id));
        }
    });

    setGroupedTasks(groups);
    setSelectedTaskIds(allIds); // Default to all selected
  }, [plants, userProfile]);

  const toggleTask = (id: string) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTaskIds(newSet);
  };

  const toggleGroup = (plantName: string) => {
      const groupTasks = groupedTasks[plantName] as Task[];
      const allSelected = groupTasks.every(t => selectedTaskIds.has(t.id));
      
      const newSet = new Set(selectedTaskIds);
      groupTasks.forEach(t => {
          if (allSelected) newSet.delete(t.id);
          else newSet.add(t.id);
      });
      setSelectedTaskIds(newSet);
  };

  const handleConfirm = () => {
    const allTasks = Object.values(groupedTasks).flat() as Task[];
    const tasksToCreate = allTasks.filter(t => selectedTaskIds.has(t.id));
    onConfirm(tasksToCreate);
  };

  const getIcon = (title: string) => {
      if (title.includes('Start Seeds')) return <Leaf size={14} className="text-leaf-600" />;
      if (title.includes('Transplant')) return <Sprout size={14} className="text-leaf-700" />;
      if (title.includes('Harvest')) return <ShoppingBasket size={14} className="text-amber-600" />;
      return <Calendar size={14} className="text-earth-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Calendar className="text-leaf-600" /> Garden Tasks
          </h2>
          <button onClick={onCancel}><X size={24} className="text-earth-400" /></button>
        </div>

        <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">
            We've generated a custom schedule based on Zone {userProfile.hardinessZone}. Select the tasks you want to add to your calendar:
        </p>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
            {Object.entries(groupedTasks).map(([plantName, rawTasks]) => {
                const tasks = rawTasks as Task[];
                return (
                <div key={plantName} className="bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700 overflow-hidden">
                    <div 
                        className="p-3 bg-earth-100 dark:bg-stone-700 flex justify-between items-center cursor-pointer"
                        onClick={() => toggleGroup(plantName)}
                    >
                        <h4 className="font-bold text-earth-800 dark:text-earth-100 text-sm">{plantName}</h4>
                        <span className="text-xs text-earth-500 dark:text-stone-400 font-medium">
                            {tasks.filter(t => selectedTaskIds.has(t.id)).length} / {tasks.length} selected
                        </span>
                    </div>
                    
                    <div className="divide-y divide-earth-100 dark:divide-stone-700">
                        {tasks.map(task => (
                            <div 
                                key={task.id} 
                                onClick={() => toggleTask(task.id)}
                                className={`flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-earth-50 dark:hover:bg-stone-800 ${selectedTaskIds.has(task.id) ? 'bg-white dark:bg-stone-900' : 'opacity-75'}`}
                            >
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedTaskIds.has(task.id) ? 'bg-leaf-600 border-leaf-600 text-white' : 'bg-white dark:bg-stone-800 border-earth-300'}`}>
                                    {selectedTaskIds.has(task.id) && <Check size={14} strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {getIcon(task.title)}
                                        <h5 className="font-bold text-earth-900 dark:text-earth-100 text-sm truncate">{task.title}</h5>
                                    </div>
                                    <p className="text-xs text-earth-500 dark:text-stone-400">Due: {new Date(task.dueDate!).toLocaleDateString()}</p>
                                    <p className="text-xs text-earth-400 dark:text-stone-500 mt-1 line-clamp-1">{task.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )})}
        </div>

        <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel} className="flex-1">Skip</Button>
            <Button onClick={handleConfirm} className="flex-[2]">
                Save {selectedTaskIds.size} Tasks
            </Button>
        </div>
      </div>
    </div>
  );
};