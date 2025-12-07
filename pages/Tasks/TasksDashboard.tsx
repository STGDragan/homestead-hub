import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { Task, Season } from '../../types';
import { TaskCard } from '../../components/tasks/TaskCard';
import { SeasonWheel } from '../../components/tasks/SeasonWheel';
import { TaskEditorModal } from '../../components/tasks/TaskEditorModal';
import { Button } from '../../components/ui/Button';
import { Plus, CheckCircle2, ListFilter } from 'lucide-react';
import { SEASONS } from '../../constants';

export const TasksDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season>('spring');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const allTasks = await dbService.getAll<Task>('tasks');
    allTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const dateA = a.dueDate || 9999999999999;
        const dateB = b.dueDate || 9999999999999;
        return dateA - dateB;
    });
    setTasks(allTasks);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const taskToSave: Task = {
        id: taskData.id || crypto.randomUUID(),
        title: taskData.title!,
        description: taskData.description || '',
        season: taskData.season || activeSeason,
        category: taskData.category || 'maintenance',
        dueDate: taskData.dueDate || null,
        completed: taskData.completed || false,
        priority: taskData.priority || 'medium',
        isRecurring: taskData.isRecurring || false,
        recurrencePattern: taskData.recurrencePattern,
        createdAt: taskData.createdAt || Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await dbService.put('tasks', taskToSave);
    await loadTasks();
    setIsEditorOpen(false);
    setEditingTask(null);
  };

  const handleToggleComplete = async (task: Task) => {
     const updatedTask = { ...task, completed: !task.completed, updatedAt: Date.now(), syncStatus: 'pending' as const };
     await dbService.put('tasks', updatedTask);
     
     if (updatedTask.completed && task.isRecurring) {
        await handleRecurrenceGeneration(task);
     }
     
     await loadTasks();
  };

  const handleRecurrenceGeneration = async (originalTask: Task) => {
      const baseDate = originalTask.dueDate || Date.now();
      const nextDate = new Date(baseDate);
      
      switch(originalTask.recurrencePattern) {
          case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
          case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
          case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
          case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
      }

      const nextTask: Task = {
          ...originalTask,
          id: crypto.randomUUID(),
          dueDate: nextDate.getTime(),
          completed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };

      await dbService.put('tasks', nextTask);
  };

  const handleDeleteTask = async (id: string) => {
      if (confirm('Delete this task?')) {
          await dbService.delete('tasks', id);
          await loadTasks();
          setIsEditorOpen(false);
      }
  };

  const openEditor = (task?: Task) => {
      setEditingTask(task || null);
      setIsEditorOpen(true);
  };

  const filteredTasks = tasks.filter(t => {
      const seasonMatch = activeSeason === 'all' || t.season === activeSeason || t.season === 'all';
      const completionMatch = showCompleted ? true : !t.completed;
      return seasonMatch && completionMatch;
  });

  const activeSeasonLabel = SEASONS.find(s => s.id === activeSeason)?.label;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">Seasonal Tasks</h1>
          <p className="text-earth-600 dark:text-night-300">Plan your homestead year.</p>
        </div>
        <Button onClick={() => openEditor()} icon={<Plus size={18} />} className="w-full md:w-auto">
            Add Task
        </Button>
      </div>

      <div className="bg-earth-50 dark:bg-night-800 -mx-4 px-4 py-4 md:mx-0 md:rounded-2xl md:p-6 border-y md:border border-earth-200 dark:border-night-700">
         <h3 className="text-xs font-bold text-earth-500 dark:text-night-400 uppercase tracking-wider mb-3">Select Season Context</h3>
         <SeasonWheel activeSeason={activeSeason} onSelect={setActiveSeason} />
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-earth-800 dark:text-earth-200 text-lg flex items-center gap-2">
                {activeSeasonLabel} Checklist
                <span className="bg-earth-200 dark:bg-night-700 text-earth-700 dark:text-earth-300 text-xs px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
            </h2>
            <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${showCompleted ? 'bg-leaf-100 text-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-300' : 'text-earth-500 dark:text-night-400 hover:bg-earth-100 dark:hover:bg-night-800'}`}
            >
                {showCompleted ? <CheckCircle2 size={14} /> : <ListFilter size={14} />}
                {showCompleted ? 'Hide Done' : 'Show Done'}
            </button>
         </div>

         {filteredTasks.length === 0 ? (
             <div className="text-center py-16 bg-white dark:bg-night-900 rounded-2xl border-2 border-dashed border-earth-200 dark:border-night-700">
                <div className="w-16 h-16 bg-earth-50 dark:bg-night-800 rounded-full flex items-center justify-center mx-auto mb-4 text-earth-400 dark:text-night-500">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-earth-700 dark:text-earth-300">No tasks found</h3>
                <p className="text-sm text-earth-500 dark:text-night-400 mb-4">You're all caught up for {activeSeasonLabel}!</p>
                <Button variant="secondary" onClick={() => openEditor()}>Add New Task</Button>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {filteredTasks.map(task => (
                     <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggleComplete={handleToggleComplete}
                        onClick={openEditor}
                     />
                 ))}
             </div>
         )}
      </div>

      {isEditorOpen && (
          <TaskEditorModal 
             task={editingTask}
             initialSeason={activeSeason}
             onSave={handleSaveTask}
             onClose={() => setIsEditorOpen(false)}
             onDelete={handleDeleteTask}
          />
      )}
    </div>
  );
};