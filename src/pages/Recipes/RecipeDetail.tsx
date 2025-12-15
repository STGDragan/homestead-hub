
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { Recipe, Plant, PantryItem } from '../../types';
import { kitchenAI, IngredientStatus } from '../../services/kitchenAI';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Clock, Users, Flame, Sprout, ShoppingCart, Archive } from 'lucide-react';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredientStatuses, setIngredientStatuses] = useState<IngredientStatus[]>([]);

  useEffect(() => {
    if (id) {
        loadData(id);
    }
  }, [id]);

  const loadData = async (recipeId: string) => {
    const r = await dbService.get<Recipe>('recipes', recipeId);
    if (r) {
        setRecipe(r);
        const plants = await dbService.getAll<Plant>('plants');
        const pantry = await dbService.getAll<PantryItem>('pantry');
        
        const statuses = kitchenAI.analyzeRecipeIngredients(r, plants, pantry);
        setIngredientStatuses(statuses);
    }
  };

  if (!recipe) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <Button variant="ghost" onClick={() => navigate('/recipes')} icon={<ArrowLeft size={18} />}>Back to Cookbook</Button>
      
      <div className="bg-white rounded-2xl shadow-sm border border-earth-200 overflow-hidden">
         <div className="h-48 bg-earth-200 flex items-center justify-center text-6xl relative">
            {recipe.imageUrl ? (
                <img src={recipe.imageUrl} className="w-full h-full object-cover" />
            ) : (
                <span>🥘</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12">
               <h1 className="text-3xl font-serif font-bold text-white mb-1 drop-shadow-md">{recipe.title}</h1>
            </div>
         </div>
         <div className="p-6">
            <div className="flex gap-4 text-sm text-earth-600 mb-8 border-b border-earth-100 pb-4">
               {recipe.prepTimeMinutes && <span className="flex items-center gap-1"><Clock size={16} className="text-leaf-600"/> <strong>{recipe.prepTimeMinutes}</strong> mins</span>}
               {recipe.servings && <span className="flex items-center gap-1"><Users size={16} className="text-leaf-600"/> <strong>{recipe.servings}</strong> servings</span>}
               <span className="flex items-center gap-1"><Flame size={16} className="text-leaf-600"/> 100% Homemade</span>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="md:col-span-1 bg-earth-50 p-5 rounded-2xl h-fit border border-earth-100">
                  <h3 className="font-bold text-earth-800 mb-4 flex items-center gap-2">
                     <ShoppingCart size={18} /> Ingredients
                  </h3>
                  <ul className="space-y-3">
                     {ingredientStatuses.map((status, i) => (
                        <li key={i} className="flex flex-col gap-1 pb-2 border-b border-earth-200/50 last:border-0">
                           <div className="flex justify-between items-baseline">
                              <span className="font-bold text-earth-800">{status.name}</span>
                              <span className="text-earth-600 text-sm">{status.quantity} {status.unit}</span>
                           </div>
                           
                           {/* Availability Badge */}
                           {status.source === 'garden' && (
                              <div className="flex items-center gap-1 text-[10px] text-leaf-700 font-bold">
                                 <Sprout size={10} /> In Garden: {status.sourceDetails}
                              </div>
                           )}
                           {status.source === 'pantry' && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                                 <Archive size={10} /> Pantry: {status.sourceDetails}
                              </div>
                           )}
                           {status.source === 'missing' && (
                              <div className="flex items-center gap-1 text-[10px] text-clay-500 italic">
                                 <ShoppingCart size={10} /> Needed
                              </div>
                           )}
                        </li>
                     ))}
                  </ul>
                  <Button className="w-full mt-4" variant="secondary" size="sm">Add Missing to List</Button>
               </div>

               <div className="md:col-span-2">
                  <h3 className="font-bold text-earth-800 mb-4 flex items-center gap-2">
                     Instructions
                  </h3>
                  <div className="prose prose-earth">
                     <p className="whitespace-pre-wrap text-earth-700 leading-relaxed text-lg">{recipe.instructions}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
