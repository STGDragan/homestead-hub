
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { breedingNotifications } from '../../services/breedingNotifications';
import { NotificationTask, BreedingLog, Animal } from '../../types';
import { ReproductionTaskCard } from '../../components/livestock/ReproductionTaskCard';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Bell, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BreedingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<NotificationTask[]>([]);
  const [activeEvents, setActiveEvents] = useState<BreedingLog[]>([]);
  const [stats, setStats] = useState({ pregnant: 0, dueSoon: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await breedingNotifications.getTasks();
    const activeTasks = t.filter(task => task.status !== 'completed');
    setTasks(activeTasks);

    const logs = await dbService.getAll<BreedingLog>('breeding_logs');
    const active = logs.filter(l => l.status === 'pregnant');
    setActiveEvents(active);

    setStats({
        pregnant: active.length,
        dueSoon: activeTasks.filter(t => t.type === 'due_date').length
    });
  };

  const handleCompleteTask = async (id: string) => {
      await breedingNotifications.completeTask(id);
      loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       
       <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/animals')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
             <ArrowLeft size={20} />
          </Button>
          <div>
             <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">Reproductive Health</h1>
             <p className="text-earth-600 dark:text-stone-400">Manage pregnancies, due dates, and vet checks.</p>
          </div>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border border-pink-100 dark:border-pink-900/30">
             <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300 font-bold mb-1">
                <Heart size={18} /> Pregnancies
             </div>
             <p className="text-3xl font-serif font-bold text-pink-900 dark:text-pink-100">{stats.pregnant}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
             <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold mb-1">
                <Calendar size={18} /> Due Soon
             </div>
             <p className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100">{stats.dueSoon}</p>
          </div>
       </div>

       <div className="grid md:grid-cols-3 gap-6">
          {/* Main Task List */}
          <div className="md:col-span-2 space-y-4">
             <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                <Bell size={20} className="text-leaf-600" /> Upcoming Tasks
             </h2>
             
             {tasks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border-2 border-dashed border-earth-200 dark:border-stone-800 text-earth-500">
                   <p>No pending reproductive tasks.</p>
                </div>
             ) : (
                <div className="space-y-3">
                   {tasks.map(task => (
                      <ReproductionTaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
                   ))}
                </div>
             )}
          </div>

          {/* Active Pregnancies Sidebar */}
          <div className="space-y-4">
             <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100">Active Events</h2>
             <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm">
                {activeEvents.length === 0 ? (
                   <p className="text-sm text-earth-500 italic">No active pregnancies recorded.</p>
                ) : (
                   <div className="space-y-3">
                      {activeEvents.map(evt => (
                         <div key={evt.id} className="text-sm pb-2 border-b border-earth-100 dark:border-stone-800 last:border-0">
                            <p className="font-bold text-earth-800 dark:text-earth-200">Mated: {new Date(evt.matingDate).toLocaleDateString()}</p>
                            <p className="text-xs text-earth-500">{evt.notes || 'No notes'}</p>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
