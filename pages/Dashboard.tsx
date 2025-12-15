
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, CloudRain, Sun, Sprout, AlertCircle, Database, Smartphone, BookOpen, Cloud, CloudLightning, Snowflake } from 'lucide-react';
import { dbService } from '../services/db';
import { authService } from '../services/auth';
import { weatherService } from '../services/weather';
import { Task, UserProfile, HarvestLog, WeatherForecast } from '../types';
import { AdPlacement } from '../components/monetization/AdPlacement';
import { AgentDashboardWidget } from '../components/ai/AgentDashboardWidget';
import { TaskEditorModal } from '../components/tasks/TaskEditorModal';
import { HarvestLogModal } from '../components/journal/HarvestLogModal';
import { gardenAIService } from '../services/gardenAI';

const ICONS: Record<string, React.FC<any>> = {
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  clear: Sun,
};

const WeatherWidget: React.FC<{ weather: WeatherForecast | null }> = ({ weather }) => {
  if (!weather) return (
      <Card className="bg-gradient-to-br from-leaf-700 to-leaf-900 text-white border-none shadow-lg animate-pulse h-40">
          <div className="p-6">Loading weather...</div>
      </Card>
  );

  const Icon = ICONS[weather.condition] || Sun;

  return (
    <Card className="bg-gradient-to-br from-leaf-700 to-leaf-900 text-white border-none shadow-lg">
        <div className="flex justify-between items-start">
        <div>
            <p className="text-leaf-100 text-sm font-bold uppercase tracking-wider mb-1">Today's Forecast</p>
            <h2 className="text-3xl font-serif font-bold capitalize">{weather.condition}</h2>
            <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-bold tracking-tighter">{weather.tempHigh}°</span>
            <span className="text-leaf-200">Low {weather.tempLow}°</span>
            </div>
        </div>
        <Icon size={48} className="text-leaf-300 opacity-80" />
        </div>
        <div className="mt-6 flex gap-6 text-sm font-medium text-leaf-100 border-t border-leaf-600/50 pt-4">
        <div className="flex items-center gap-2">
            <CloudRain size={16} />
            <span>Precip: {weather.precipChance}%</span>
        </div>
        <div className="flex items-center gap-2">
            <Cloud size={16} />
            <span>Humidity: {weather.humidity}%</span>
        </div>
        </div>
    </Card>
  );
};

const TaskList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTasks = async () => {
      try {
         const allTasks = await dbService.getAll<Task>('tasks');
         const pending = allTasks
            .filter(t => !t.completed)
            .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0)); // Sort by due date ASC to show soonest first
         setTasks(pending.slice(0, 3));
      } catch (e) {
         console.error(e);
      }
    };
    loadTasks();
  }, [refreshTrigger]);

  if (tasks.length === 0) {
    return (
        <div className="p-4 bg-earth-50 dark:bg-night-800 rounded-xl border border-earth-200 dark:border-night-700 text-center text-earth-500 dark:text-night-400 text-sm">
            No pending tasks. Enjoy your day!
        </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center p-3 bg-white dark:bg-night-900 border border-earth-200 dark:border-night-800 rounded-xl gap-3 shadow-sm">
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${task.completed ? 'bg-leaf-600 border-leaf-600' : 'border-earth-300 dark:border-night-600'}`}>
            {task.completed && <Plus className="rotate-45 text-white" size={16} />}
          </div>
          <div className="flex-1">
            <p className={`font-bold text-earth-800 dark:text-earth-100 ${task.completed ? 'line-through text-earth-400 dark:text-night-500' : ''}`}>{task.title}</p>
            <div className="flex gap-2 text-xs text-earth-500 dark:text-night-400">
               <span className="capitalize">{task.category}</span>
               {task.dueDate && <span>• Due {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
          </div>
          {task.syncStatus === 'pending' && (
            <div className="w-2 h-2 rounded-full bg-clay-500" title="Sync Pending" />
          )}
        </div>
      ))}
      <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/tasks')}>View All Tasks</Button>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
        const currentUser = await authService.getCurrentUser();
        const profileId = currentUser ? currentUser.id : 'main_user';
        
        let user = await dbService.get<UserProfile>('user_profile', profileId);
        
        if (!user && profileId !== 'main_user') {
            user = await dbService.get<UserProfile>('user_profile', 'main_user');
        }
        
        if (user) {
            setProfile(user);
            // Fetch weather using User's Zone to ensure consistency with Weather Tab
            const currentW = await weatherService.getCurrentConditions(user.hardinessZone);
            setWeather(currentW);
        } else {
            // Fallback for no profile
            const currentW = await weatherService.getCurrentConditions('7a');
            setWeather(currentW);
        }
    };
    loadData();
  }, []);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title!,
        description: taskData.description || '',
        season: taskData.season || 'spring',
        category: taskData.category || 'maintenance',
        dueDate: taskData.dueDate || null,
        completed: false,
        priority: taskData.priority || 'medium',
        isRecurring: taskData.isRecurring || false,
        recurrencePattern: taskData.recurrencePattern || 'none',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };
    await dbService.put('tasks', newTask);
    setShowTaskModal(false);
    setTaskRefreshKey(prev => prev + 1); // Trigger list refresh
  };

  const handleSaveHarvest = async (log: HarvestLog) => {
    await dbService.put('harvest_logs', log);
    setShowHarvestModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="mb-4">
         <AdPlacement placementId="dashboard_top_banner" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">
                {profile ? `Welcome, ${profile.name}` : 'Homestead Hub'}
            </h1>
            <p className="text-earth-600 dark:text-night-300">
                {profile 
                    ? `Your ${profile.experienceLevel} homestead dashboard.` 
                    : 'Manage your land, animals, and tasks.'}
            </p>
         </div>
         <div className="flex items-center gap-2 text-sm font-bold text-earth-500 dark:text-night-300 bg-earth-200 dark:bg-night-800 px-3 py-1 rounded-full">
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            {profile?.hardinessZone && <span>• Zone {profile.hardinessZone}</span>}
         </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
            onClick={() => setShowTaskModal(true)}
            variant="secondary" 
            className="h-auto flex-col py-4 bg-white dark:bg-night-900 border border-earth-200 dark:border-night-800 shadow-sm hover:border-leaf-500 dark:hover:border-leaf-500 hover:ring-1 hover:ring-leaf-500"
        >
          <div className="bg-leaf-100 dark:bg-leaf-900/30 text-leaf-700 dark:text-leaf-400 p-2 rounded-full mb-2">
            <Plus size={24} />
          </div>
          <span className="text-sm">New Task</span>
        </Button>
        <Button 
            onClick={() => setShowHarvestModal(true)}
            variant="secondary" 
            className="h-auto flex-col py-4 bg-white dark:bg-night-900 border border-earth-200 dark:border-night-800 shadow-sm hover:border-leaf-500 dark:hover:border-leaf-500 hover:ring-1 hover:ring-leaf-500"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-2 rounded-full mb-2">
            <Sprout size={24} />
          </div>
          <span className="text-sm">Log Harvest</span>
        </Button>
         <Button 
            onClick={() => navigate('/sync')}
            variant="secondary" 
            className="h-auto flex-col py-4 bg-white dark:bg-night-900 border border-earth-200 dark:border-night-800 shadow-sm hover:border-leaf-500 dark:hover:border-leaf-500 hover:ring-1 hover:ring-leaf-500"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-full mb-2">
            <Database size={24} />
          </div>
          <span className="text-sm">Sync Status</span>
        </Button>
        <Button 
            onClick={() => navigate('/health', { state: { autoScan: true } })}
            variant="secondary" 
            className="h-auto flex-col py-4 bg-white dark:bg-night-900 border border-earth-200 dark:border-night-800 shadow-sm hover:border-leaf-500 dark:hover:border-leaf-500 hover:ring-1 hover:ring-leaf-500"
        >
          <div className="bg-stone-100 dark:bg-night-800 text-stone-700 dark:text-night-300 p-2 rounded-full mb-2">
            <Smartphone size={24} />
          </div>
          <span className="text-sm">Scan Photo</span>
        </Button>
      </div>

      <AgentDashboardWidget />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 mb-4">Today's Weather</h2>
            <WeatherWidget weather={weather} />
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 mb-4">Priority Tasks</h2>
            <TaskList refreshTrigger={taskRefreshKey} />
          </section>
          
          <section>
             <AdPlacement placementId="seasonal_panel" />
          </section>
        </div>

        <div className="space-y-6">
          
          {weather && weather.tempLow <= 32 && (
              <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 animate-pulse">
                <div className="flex gap-3">
                  <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-100">Frost Warning</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-200/80 mt-1">Temperatures dropping to {weather.tempLow}°F. Cover sensitive crops.</p>
                  </div>
                </div>
              </Card>
          )}

          <AdPlacement placementId="dashboard_feature_block" />

          <Card className="bg-earth-50 dark:bg-night-800 border-earth-200 dark:border-night-700">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white dark:bg-night-900 p-3 rounded-xl border border-earth-100 dark:border-night-700">
                  <p className="text-2xl font-serif font-bold text-earth-800 dark:text-earth-100">12</p>
                  <p className="text-xs text-earth-500 dark:text-night-400 uppercase font-bold">Eggs Today</p>
                </div>
                <div className="bg-white dark:bg-night-900 p-3 rounded-xl border border-earth-100 dark:border-night-700">
                  <p className="text-2xl font-serif font-bold text-earth-800 dark:text-earth-100">5</p>
                  <p className="text-xs text-earth-500 dark:text-night-400 uppercase font-bold">Tasks Due</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {profile && (
              <Card className="bg-leaf-50 dark:bg-leaf-900/10 border-leaf-200 dark:border-leaf-900/30">
                  <h4 className="font-bold text-leaf-900 dark:text-leaf-200 mb-2 text-sm">Homestead Tip</h4>
                  <p className="text-xs text-leaf-800 dark:text-leaf-300 leading-relaxed">
                      {profile.experienceLevel === 'beginner' 
                        ? "Start small! Focus on one garden bed and master it before expanding."
                        : "Consider crop rotation this season to improve soil health and reduce pests."}
                  </p>
              </Card>
          )}
        </div>
      </div>
      
      <div className="mt-8">
         <AdPlacement placementId="footer_banner" />
      </div>

      {showTaskModal && (
          <TaskEditorModal 
             initialSeason={gardenAIService.getSeasonFromDate(new Date())} 
             onSave={handleSaveTask} 
             onClose={() => setShowTaskModal(false)} 
          />
      )}

      {showHarvestModal && (
          <HarvestLogModal 
             onSave={handleSaveHarvest} 
             onClose={() => setShowHarvestModal(false)} 
          />
      )}
    </div>
  );
};
