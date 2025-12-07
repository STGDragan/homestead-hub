
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { Recipe, PantryItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { RecipeCard } from '../../components/recipes/RecipeCard';
import { RecipeEditorModal } from '../../components/recipes/RecipeEditorModal';
import { PantryList } from '../../components/recipes/PantryList';
import { KitchenSuggestionsPanel } from '../../components/recipes/KitchenSuggestionsPanel';
import { Plus, BookOpen, ShoppingBasket } from 'lucide-react';

export const RecipeDashboard: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'cookbook' | 'pantry'>('cookbook');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const r = await dbService.getAll<Recipe>('recipes');
    const p = await dbService.getAll<PantryItem>('pantry');
    setRecipes(r);
    setPantry(p);
  };

  const handleSaveRecipe = async (data: Partial<Recipe>) => {
    const recipe: Recipe = {
      id: data.id || crypto.randomUUID(),
      title: data.title!,
      instructions: data.instructions || '',
      prepTimeMinutes: data.prepTimeMinutes,
      servings: data.servings,
      ingredients: data.ingredients || [],
      tags: data.tags || [],
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    };
    await dbService.put('recipes', recipe);
    loadData();
    setIsEditorOpen(false);
    setEditingRecipe(null);
  };

  const handlePantryUpdate = async (item: PantryItem, delta: number) => {
    const updated = { ...item, quantity: Math.max(0, item.quantity + delta), syncStatus: 'pending' as const };
    await dbService.put('pantry', updated);
    loadData();
  };
  
  const handlePantryDelete = async (id: string) => {
    if(confirm('Remove item?')) {
        await dbService.delete('pantry', id);
        loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">Kitchen</h1>
          <p className="text-earth-600 dark:text-night-300">Cookbook & Pantry Manager</p>
        </div>
        <div className="flex gap-2">
           <Button variant={activeTab === 'cookbook' ? 'primary' : 'outline'} onClick={() => setActiveTab('cookbook')} icon={<BookOpen size={18} />}>Recipes</Button>
           <Button variant={activeTab === 'pantry' ? 'primary' : 'outline'} onClick={() => setActiveTab('pantry')} icon={<ShoppingBasket size={18} />}>Pantry</Button>
        </div>
      </div>

      {/* AI Suggestions (Only visible on Cookbook tab) */}
      {activeTab === 'cookbook' && <KitchenSuggestionsPanel />}

      {activeTab === 'cookbook' ? (
        <div className="space-y-4">
           <Button className="w-full md:w-auto" onClick={() => { setEditingRecipe(null); setIsEditorOpen(true); }} icon={<Plus size={18} />}>Add Recipe</Button>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
           </div>
           {recipes.length === 0 && <div className="text-center py-12 text-earth-500 dark:text-night-400 italic">No recipes yet. Add one!</div>}
        </div>
      ) : (
        <div className="space-y-4">
           <div className="bg-white dark:bg-night-900 p-6 rounded-2xl border border-earth-200 dark:border-night-800 shadow-sm">
              <h2 className="font-serif font-bold text-xl text-earth-900 dark:text-earth-100 mb-4">Pantry Inventory</h2>
              <PantryList items={pantry} onUpdateQuantity={handlePantryUpdate} onDelete={handlePantryDelete} />
              <Button 
                variant="ghost" 
                className="w-full mt-4 border-dashed border-2 border-earth-200 dark:border-night-700" 
                icon={<Plus size={16} />}
                onClick={async () => {
                    const name = prompt("Item Name:");
                    if(name) {
                        const item: PantryItem = {
                            id: crypto.randomUUID(),
                            name,
                            quantity: 1,
                            unit: 'count',
                            category: 'other',
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            syncStatus: 'pending'
                        };
                        await dbService.put('pantry', item);
                        loadData();
                    }
                }}
              >
                Quick Add Item
              </Button>
           </div>
        </div>
      )}

      {isEditorOpen && (
        <RecipeEditorModal 
          recipe={editingRecipe}
          onSave={handleSaveRecipe}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
