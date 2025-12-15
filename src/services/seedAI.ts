
// services/seedAI.ts
import { RotationRecord } from '../types';

// Simple map of plant families for rotation logic
export const FAMILY_MAP: Record<string, string[]> = {
  'Solanaceae': ['Tomato', 'Pepper', 'Potato', 'Eggplant'],
  'Brassicaceae': ['Broccoli', 'Kale', 'Cabbage', 'Radish', 'Cauliflower'],
  'Fabaceae': ['Bean', 'Pea', 'Lentil', 'Clover'],
  'Cucurbitaceae': ['Cucumber', 'Squash', 'Zucchini', 'Pumpkin', 'Melon'],
  'Alliaceae': ['Onion', 'Garlic', 'Leek', 'Shallot'],
  'Apiaceae': ['Carrot', 'Parsnip', 'Parsley', 'Dill', 'Cilantro'],
  'Asteraceae': ['Lettuce', 'Sunflower', 'Artichoke']
};

export interface RotationAdvice {
  safe: boolean;
  message: string;
  familyConflict?: string;
  yearsSince?: number;
}

export const seedAI = {
  
  /**
   * Determine plant family from common name
   */
  getFamily(plantName: string): string | null {
    const lowerName = plantName.toLowerCase();
    for (const [family, plants] of Object.entries(FAMILY_MAP)) {
      if (plants.some(p => lowerName.includes(p.toLowerCase()))) {
        return family;
      }
    }
    return null;
  },

  /**
   * Check if it's safe to plant a specific crop in a bed based on history
   */
  checkRotation(cropName: string, history: RotationRecord[]): RotationAdvice {
    const family = this.getFamily(cropName);
    if (!family) {
      return { safe: true, message: "Crop family unknown. General rotation recommended." };
    }

    // Filter history for matching family
    const conflicts = history
      .filter(r => r.cropFamily === family)
      .sort((a, b) => b.endDate - a.endDate); // Newest first

    if (conflicts.length > 0) {
      const lastPlanted = conflicts[0];
      const yearsSince = (Date.now() - lastPlanted.endDate) / (1000 * 60 * 60 * 24 * 365);
      
      if (yearsSince < 3) {
        return {
          safe: false,
          message: `Avoid planting ${cropName} here. ${lastPlanted.cropName} (${family}) was grown ${(yearsSince * 12).toFixed(1)} months ago. Wait 3 years for disease break.`,
          familyConflict: family,
          yearsSince
        };
      }
    }

    return {
      safe: true,
      message: `Safe to plant. No ${family} crops grown here recently.`
    };
  },

  /**
   * Calculate germination rate percentage
   */
  calculateGerminationRate(sprouted: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((sprouted / total) * 100);
  },

  /**
   * Get viability status
   */
  getViabilityStatus(rate: number): { status: 'excellent' | 'good' | 'poor', color: string } {
    if (rate >= 90) return { status: 'excellent', color: 'text-green-600' };
    if (rate >= 70) return { status: 'good', color: 'text-yellow-600' };
    return { status: 'poor', color: 'text-red-600' };
  }
};
