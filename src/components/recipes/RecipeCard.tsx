import React from 'react';
import { Recipe } from '../../types';
import { Card } from '../ui/Card';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();

  return (
    <Card 
      interactive 
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="flex items-center gap-4 p-4"
    >
      <div className="w-16 h-16 bg-earth-200 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <span>🍳</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-serif font-bold text-earth-900 truncate">{recipe.title}</h3>
        <div className="flex items-center gap-3 text-xs text-earth-500 mt-1">
          {recipe.prepTimeMinutes && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {recipe.prepTimeMinutes}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {recipe.servings}
            </span>
          )}
          <span className="bg-earth-100 px-1.5 py-0.5 rounded text-earth-600">
            {recipe.ingredients.length} Ingred.
          </span>
        </div>
      </div>

      <ChevronRight size={20} className="text-earth-300" />
    </Card>
  );
};