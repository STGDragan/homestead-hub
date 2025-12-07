import React, { useState } from 'react';
import { Task, Season, TaskCategory, RecurrenceType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { SEASONS, TASK_CATEGORIES } from '../../constants';
import { X, Calendar, RotateCw } from 'lucide-react';

interface TaskEditorModalProps {
  task?: Task | null;
  initialSeason: Season;
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ 
  task, 
  initialSeason, 
  onSave, 
  onClose,
  onDelete
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'maintenance');
  const [season, setSeason] = useState<Season>(task?.season || (initialSeason === 'all' ? 'spring' : initialSeason));
  const [dueDate, setDueDate] = useState<string>(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrenceType>(task?.recurrencePattern || 'monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: task?.id, // Keep ID if editing
      title,
      category,
      season,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : 'none',
      completed: task?.completed || false,
      priority: task?.priority || 'medium',
      createdAt: task?.createdAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6 border-b border-earth-100 dark:border-stone-800 pb-4">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
          {/* Title */}
          <Input 
            label="Task Title"
            autoFocus
            placeholder="e.g. Clean Coop Bedding"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Season & Category Row */}
          <div className="grid grid-cols-2 gap-4">
             <Select
                label="Season"
                value={season}
                onChange={(e) => setSeason(e.target.value as Season)}
             >
                {SEASONS.filter(s => s.id !== 'all').map(s => (
                   <option key={s.id} value={s.id}>{s.label}</option>
                ))}
                <option value="all">Anytime</option>
             </Select>
             
             <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
             >
                {TASK_CATEGORIES.map(c => (
                   <option key={c.id} value={c.id}>{c.label}</option>
                ))}
             </Select>
          </div>

          {/* Due Date */}
          <Input 
            label="Due Date (Optional)"
            type="date"
            icon={<Calendar size={16} />}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* Recurrence Toggle */}
          <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700">
             <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-earth-700 dark:text-earth-300 cursor-pointer select-none">
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isRecurring ? 'bg-leaf-600 border-leaf-600 text-white' : 'bg-white dark:bg-stone-700 border-earth-300 dark:border-stone-500'}`}>
                      {isRecurring && <X size={14} className="rotate-45" />} 
                   </div>
                   <input type="checkbox" className="hidden" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                   Repeat Task
                </label>
                <RotateCw size={18} className="text-earth-400 dark:text-stone-500" />
             </div>
             
             {isRecurring && (
                <div className="mt-3 animate-in slide-in-from-top-2">
                   <Select
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value as RecurrenceType)}
                   >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                   </Select>
                   <p className="text-xs text-earth-500 dark:text-stone-400 mt-2">Task will regenerate upon completion.</p>
                </div>
             )}
          </div>
          
          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
             {task && onDelete && (
                <Button type="button" variant="outline" onClick={() => onDelete(task.id)} className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/50">
                   Delete
                </Button>
             )}
             <div className="flex-1 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="px-8">Save Task</Button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};
