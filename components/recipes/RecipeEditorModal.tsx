import React, { useState } from 'react';
import { Recipe, Ingredient, MeasurementUnit } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { MEASUREMENT_UNITS } from '../../constants';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';

interface RecipeEditorModalProps {
  recipe?: Recipe | null;
  onSave: (recipe: Partial<Recipe>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({ recipe, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(recipe?.title || '');
  const [instructions, setInstructions] = useState(recipe?.instructions || '');
  const [prepTime, setPrepTime] = useState(recipe?.prepTimeMinutes?.toString() || '');
  const [servings, setServings] = useState(recipe?.servings?.toString() || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients || []);

  // New Ingredient State
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState('');
  const [newIngUnit, setNewIngUnit] = useState<MeasurementUnit>('count');

  const handleAddIngredient = () => {
    if (!newIngName || !newIngQty) return;
    setIngredients([...ingredients, { 
      name: newIngName, 
      quantity: parseFloat(newIngQty), 
      unit: newIngUnit 
    }]);
    setNewIngName('');
    setNewIngQty('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  
  const simulateAIParse = () => {
     setIngredients([
        { name: 'Tomato', quantity: 4, unit: 'count' },
        { name: 'Basil', quantity: 1, unit: 'bunch' },
        { name: 'Garlic', quantity: 2, unit: 'count' }
     ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: recipe?.id,
      title,
      instructions,
      prepTimeMinutes: prepTime ? parseInt(prepTime) : undefined,
      servings: servings ? parseInt(servings) : undefined,
      ingredients,
      tags: recipe?.tags || [],
      createdAt: recipe?.createdAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6 border-b border-earth-100 dark:border-stone-800 pb-4">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">{recipe ? 'Edit Recipe' : 'New Recipe'}</h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">Title</label>
            <div className="flex gap-2">
                <Input 
                  autoFocus
                  className="flex-1"
                  placeholder="e.g. Grandma's Tomato Sauce"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                {!recipe && (
                    <Button type="button" variant="secondary" onClick={simulateAIParse} icon={<Sparkles size={16} />} title="Simulate AI Import" />
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
               label="Prep Time (min)"
               type="number"
               value={prepTime}
               onChange={e => setPrepTime(e.target.value)}
            />
            <Input 
               label="Servings"
               type="number"
               value={servings}
               onChange={e => setServings(e.target.value)}
            />
          </div>

          <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-100 dark:border-stone-700">
            <h3 className="text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-3 flex justify-between">
                Ingredients
                <span className="text-[10px] text-earth-400 font-normal">AI Match Enabled</span>
            </h3>
            <div className="space-y-2 mb-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-stone-700 px-3 py-2 rounded-lg border border-earth-200 dark:border-stone-600 shadow-sm text-sm">
                  <span className="text-earth-800 dark:text-earth-100">{ing.quantity} {ing.unit} <strong>{ing.name}</strong></span>
                  <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-earth-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <Input 
                className="flex-1"
                placeholder="Item"
                value={newIngName}
                onChange={e => setNewIngName(e.target.value)}
              />
              <Input 
                type="number"
                className="w-20"
                placeholder="Qty"
                value={newIngQty}
                onChange={e => setNewIngQty(e.target.value)}
              />
              <Select 
                className="w-24"
                value={newIngUnit}
                onChange={e => setNewIngUnit(e.target.value as MeasurementUnit)}
              >
                {MEASUREMENT_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </Select>
              <Button type="button" size="sm" onClick={handleAddIngredient} icon={<Plus size={16} />} className="h-[42px] w-[42px]" />
            </div>
          </div>

          <TextArea 
             label="Instructions"
             className="min-h-[100px]"
             placeholder="Step 1..."
             value={instructions}
             onChange={e => setInstructions(e.target.value)}
          />

          <div className="pt-2 flex gap-3">
            {recipe && onDelete && (
               <Button type="button" variant="outline" onClick={() => onDelete(recipe.id)} className="text-red-600 border-red-200 dark:border-red-900/50">Delete</Button>
            )}
            <div className="flex-1 flex gap-3 justify-end">
               <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
               <Button type="submit" className="px-6">Save Recipe</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
