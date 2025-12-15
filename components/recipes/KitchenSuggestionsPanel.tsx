
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { kitchenAI, PlantingSuggestion } from '../../services/kitchenAI';
import { Recipe, Plant, PantryItem } from '../../types';
import { Card } from '../ui/Card';
import { Sprout, ChefHat, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const KitchenSuggestionsPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<PlantingSuggestion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const runAnalysis = async () => {
      const recipes = await dbService.getAll<Recipe>('recipes');
      const plants = await dbService.getAll<Plant>('plants');
      const pantry = await dbService.getAll<PantryItem>('pantry');
      
      const results = kitchenAI.generatePlantingSuggestions(recipes, plants, pantry);
      setSuggestions(results.slice(0, 3)); // Top 3
    };
    runAnalysis();
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
           <ChefHat size={16} />
        </div>
        <h2 className="font-serif font-bold text-earth-900 text-sm">Grow What You Eat</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((s, idx) => (
          <Card key={idx} className="bg-gradient-to-br from-white to-leaf-50 border-leaf-200">
             <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-earth-800">{s.plantTemplate.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${s.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-leaf-100 text-leaf-700'}`}>
                   {s.priority} Priority
                </span>
             </div>
             <p className="text-xs text-earth-600 mb-3 min-h-[2.5em]">{s.reason}</p>
             <button 
               onClick={() => navigate('/garden')}
               className="text-xs font-bold text-leaf-700 flex items-center gap-1 hover:underline"
             >
               <Sprout size={12} /> Plan in Garden <ArrowRight size={12} />
             </button>
          </Card>
        ))}
      </div>
    </div>
  );
};
