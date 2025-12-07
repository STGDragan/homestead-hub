
import React, { useState } from 'react';
import { Plant, PlantTemplate, UserProfile, Task } from '../../types';
import { dbService } from '../../services/db';
import { gardenAIService } from '../../services/gardenAI';
import { Button } from '../ui/Button';
import { X, Sprout, Calendar, Bell, Check, Info, Trash2 } from 'lucide-react';

interface PlantDetailModalProps {
    plant: Plant;
    template?: PlantTemplate;
    onClose: () => void;
    onRemove?: (id: string) => void;
    userProfile?: UserProfile | null;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, template, onClose, onRemove, userProfile }) => {
    const [scheduleAdded, setScheduleAdded] = useState(false);

    if (!template) return null;

    const schedule = userProfile ? gardenAIService.getPlantingSchedule(template, userProfile.hardinessZone) : null;

    const handleScheduleTask = async () => {
        if (!schedule) return;
        
        const task: Task = {
            id: crypto.randomUUID(),
            title: `${schedule.method === 'transplant' ? 'Transplant' : 'Sow'} ${template.name}`,
            description: `Planned via Garden Layout. ${schedule.advice}`,
            season: 'spring', // simplified, could infer from date
            category: 'garden',
            dueDate: schedule.startDate.getTime(),
            completed: false,
            priority: 'high',
            isRecurring: false,
            recurrencePattern: 'none',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        
        await dbService.put('tasks', task);
        setScheduleAdded(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header Image */}
                <div className="h-40 bg-earth-100 relative overflow-hidden flex-shrink-0">
                    {template.imageUrl ? (
                        <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-leaf-300">
                            <Sprout size={64} />
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h2 className="text-2xl font-serif font-bold text-white leading-tight">{template.name}</h2>
                        <p className="text-white/80 text-sm">{template.defaultVariety}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Stats Row */}
                    <div className="flex justify-between mb-6 text-center bg-earth-50 dark:bg-stone-800 p-3 rounded-xl border border-earth-100 dark:border-stone-700">
                        <div>
                            <p className="text-[10px] font-bold text-earth-400 uppercase">Days</p>
                            <p className="font-bold text-earth-800 dark:text-earth-200 text-sm">{template.daysToMaturity}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-earth-400 uppercase">Spacing</p>
                            <p className="font-bold text-earth-800 dark:text-earth-200 text-sm">{template.spacing}"</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-earth-400 uppercase">Height</p>
                            <p className="font-bold text-earth-800 dark:text-earth-200 text-sm capitalize">{template.height}</p>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    {schedule && (
                        <div className="mb-6 p-4 rounded-xl border border-leaf-200 bg-leaf-50 dark:bg-leaf-900/10 dark:border-leaf-800">
                            <h3 className="font-bold text-leaf-800 dark:text-leaf-300 mb-2 flex items-center gap-2 text-sm">
                                <Calendar size={16} /> Planting Schedule
                            </h3>
                            <p className="text-sm text-earth-700 dark:text-stone-300 font-medium mb-1">
                                {schedule.advice}
                            </p>
                            <p className="text-xs text-earth-500 dark:text-stone-400 mb-3">
                                Based on Zone {userProfile?.hardinessZone}
                            </p>
                            
                            <Button 
                                size="sm" 
                                onClick={handleScheduleTask} 
                                disabled={scheduleAdded}
                                className={`w-full ${scheduleAdded ? 'bg-green-600' : ''}`}
                                icon={scheduleAdded ? <Check size={14}/> : <Bell size={14}/>}
                            >
                                {scheduleAdded ? 'Reminder Added' : 'Add to Tasks'}
                            </Button>
                        </div>
                    )}

                    {/* Description */}
                    {template.description && (
                        <div className="mb-4">
                            <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-1 flex items-center gap-2 text-sm">
                                <Info size={16} className="text-earth-400" /> About
                            </h3>
                            <p className="text-sm text-earth-600 dark:text-stone-300 leading-relaxed">
                                {template.description}
                            </p>
                        </div>
                    )}

                    {/* Care Instructions */}
                    {template.careInstructions && (
                        <div className="mb-6">
                            <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-1 flex items-center gap-2 text-sm">
                                <Sprout size={16} className="text-earth-400" /> Care Tips
                            </h3>
                            <div className="bg-earth-50 dark:bg-stone-800 p-3 rounded-xl text-sm text-earth-700 dark:text-stone-300 border border-earth-100 dark:border-stone-700 italic">
                                {template.careInstructions}
                            </div>
                        </div>
                    )}

                    {onRemove && (
                        <div className="pt-2 border-t border-earth-100 dark:border-stone-800 mt-2">
                            <Button 
                                variant="ghost" 
                                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => onRemove(plant.id)}
                                icon={<Trash2 size={16} />}
                            >
                                Remove from Layout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
