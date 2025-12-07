
// services/kitchenAI.ts
import { Recipe, PantryItem, Plant, PlantTemplate, UserProfile } from '../types';
import { COMMON_PLANTS } from '../constants';

export interface PlantingSuggestion {
  plantTemplate: PlantTemplate;
  reason: string;
  recipeCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface IngredientStatus {
  name: string;
  quantity: number;
  unit: string;
  source: 'garden' | 'pantry' | 'missing';
  sourceDetails?: string; // e.g. "Ready to harvest" or "In stock"
}

export const kitchenAI = {
  
  /**
   * Analyze recipes to find what the user cooks but doesn't grow.
   */
  generatePlantingSuggestions(
    recipes: Recipe[], 
    plants: Plant[], 
    pantry: PantryItem[]
  ): PlantingSuggestion[] {
    const suggestions: PlantingSuggestion[] = [];
    const ingredientFrequency: Record<string, number> = {};

    // 1. Calculate Demand (Ingredient Frequency)
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const normalizedName = ing.name.toLowerCase();
        ingredientFrequency[normalizedName] = (ingredientFrequency[normalizedName] || 0) + 1;
      });
    });

    // 2. Match High Demand Ingredients to Plant Templates
    // Filter for ingredients used in at least 1 recipe
    Object.entries(ingredientFrequency).forEach(([ingName, count]) => {
      // Fuzzy match ingredient name to plant names
      const match = COMMON_PLANTS.find(p => 
        ingName.includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(ingName)
      );

      if (match) {
        // 3. Check Supply (Do we have this planted?)
        const isPlanted = plants.some(p => 
          p.name.toLowerCase() === match.name.toLowerCase() ||
          p.name.toLowerCase().includes(ingName)
        );

        // 4. Check Pantry (Do we have it stocked?)
        const inPantry = pantry.some(p => p.name.toLowerCase().includes(ingName));

        // Logic: Suggest if used frequently AND (not planted OR (not planted AND not in pantry))
        if (!isPlanted) {
          suggestions.push({
            plantTemplate: match,
            recipeCount: count,
            reason: inPantry 
              ? `Used in ${count} recipes. You have some in pantry, but could grow fresh.` 
              : `Used in ${count} recipes and currently out of stock.`,
            priority: count > 2 ? 'high' : 'medium'
          });
        }
      }
    });

    return suggestions.sort((a, b) => b.recipeCount - a.recipeCount);
  },

  /**
   * Check where ingredients for a specific recipe can be found
   */
  analyzeRecipeIngredients(
    recipe: Recipe,
    plants: Plant[],
    pantry: PantryItem[]
  ): IngredientStatus[] {
    return recipe.ingredients.map(ing => {
      const normName = ing.name.toLowerCase();
      
      // Check Pantry First
      const pantryMatch = pantry.find(p => p.name.toLowerCase().includes(normName));
      if (pantryMatch && pantryMatch.quantity > 0) {
        return {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          source: 'pantry',
          sourceDetails: `In Stock: ${pantryMatch.quantity} ${pantryMatch.unit}`
        };
      }

      // Check Garden Second
      const gardenMatch = plants.find(p => p.name.toLowerCase().includes(normName));
      if (gardenMatch) {
        return {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          source: 'garden',
          sourceDetails: `Growing: ${gardenMatch.status}`
        };
      }

      return {
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        source: 'missing'
      };
    });
  }
};
