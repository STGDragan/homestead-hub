
import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { AIPreference } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Brain, Cpu, Zap, Save } from 'lucide-react';

export const AgentSettings: React.FC = () => {
  const [pref, setPref] = useState<AIPreference | null>(null);

  useEffect(() => {
    aiService.getPreferences('main_user').then(setPref);
  }, []);

  const handleToggle = (module: keyof AIPreference['enabledModules']) => {
      if (!pref) return;
      const updated = {
          ...pref,
          enabledModules: { ...pref.enabledModules, [module]: !pref.enabledModules[module] }
      };
      setPref(updated);
  };

  const handleSave = async () => {
      if (pref) {
          await aiService.savePreferences(pref);
          alert("AI preferences saved.");
      }
  };

  if (!pref) return <div>Loading...</div>;

  return (
    <Card className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                    <Brain className="text-leaf-600" /> AI Agents Configuration
                </h3>
                <p className="text-sm text-earth-600 dark:text-stone-300 mt-1">
                    Control which intelligent agents are active on your homestead.
                </p>
            </div>
            <Button onClick={handleSave} icon={<Save size={16}/>}>Save Config</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-bold text-sm text-earth-500 uppercase">Active Modules</h4>
                
                <label className="flex items-center justify-between p-3 bg-earth-50 dark:bg-stone-800 rounded-xl cursor-pointer border border-transparent hover:border-earth-200">
                    <span className="font-bold text-earth-800 dark:text-earth-200">Garden Planner</span>
                    <input 
                        type="checkbox" 
                        checked={pref.enabledModules.garden} 
                        onChange={() => handleToggle('garden')}
                        className="w-5 h-5 text-leaf-600 rounded focus:ring-leaf-500" 
                    />
                </label>

                <label className="flex items-center justify-between p-3 bg-earth-50 dark:bg-stone-800 rounded-xl cursor-pointer border border-transparent hover:border-earth-200">
                    <span className="font-bold text-earth-800 dark:text-earth-200">Livestock Advisor</span>
                    <input 
                        type="checkbox" 
                        checked={pref.enabledModules.animals} 
                        onChange={() => handleToggle('animals')}
                        className="w-5 h-5 text-leaf-600 rounded focus:ring-leaf-500" 
                    />
                </label>

                <label className="flex items-center justify-between p-3 bg-earth-50 dark:bg-stone-800 rounded-xl cursor-pointer border border-transparent hover:border-earth-200">
                    <span className="font-bold text-earth-800 dark:text-earth-200">Task Optimizer</span>
                    <input 
                        type="checkbox" 
                        checked={pref.enabledModules.tasks} 
                        onChange={() => handleToggle('tasks')}
                        className="w-5 h-5 text-leaf-600 rounded focus:ring-leaf-500" 
                    />
                </label>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-sm text-earth-500 uppercase">Behavior</h4>
                
                <div className="p-4 bg-earth-50 dark:bg-stone-800 rounded-xl">
                    <label className="block text-sm font-bold text-earth-800 dark:text-earth-200 mb-2">Recommendation Style</label>
                    <div className="flex gap-2">
                        {['conservative', 'balanced', 'proactive'].map((style) => (
                            <button
                                key={style}
                                onClick={() => setPref({...pref, aggressiveness: style as any})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border-2 transition-all
                                    ${pref.aggressiveness === style 
                                        ? 'border-leaf-600 bg-leaf-100 text-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-300' 
                                        : 'border-transparent bg-white dark:bg-stone-700 text-earth-500'}
                                `}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-earth-500 mt-2">
                        {pref.aggressiveness === 'conservative' && "Only shows high-confidence critical alerts."}
                        {pref.aggressiveness === 'balanced' && "Standard mix of alerts and suggestions."}
                        {pref.aggressiveness === 'proactive' && "Frequent suggestions for optimization."}
                    </p>
                </div>

                <div className="flex items-center gap-3 p-3 text-sm text-earth-600 dark:text-stone-300 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <Cpu size={18} className="text-blue-600"/>
                    <span>Processing happens locally on-device.</span>
                </div>
            </div>
        </div>
    </Card>
  );
};
