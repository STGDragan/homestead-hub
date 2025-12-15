import { Medication, WithdrawalFlag, Animal, MedAdminLog } from '../types';
import { dbService } from './db';

export const medicalLogic = {
  
  /**
   * Calculate withdrawal end dates based on medication rules and administration time
   */
  calculateWithdrawal(medication: Medication, animalSpecies: string, adminDate: number): WithdrawalFlag[] {
    const rules = medication.withdrawalPeriods[animalSpecies];
    if (!rules) return [];

    const flags: Partial<WithdrawalFlag>[] = [];
    const oneDay = 24 * 60 * 60 * 1000;

    if (rules.milkDays > 0) {
      flags.push({
        productAffected: 'milk',
        endDate: adminDate + (rules.milkDays * oneDay)
      });
    }
    
    if (rules.meatDays > 0) {
      flags.push({
        productAffected: 'meat',
        endDate: adminDate + (rules.meatDays * oneDay)
      });
    }

    if (rules.eggsDays > 0) {
      flags.push({
        productAffected: 'eggs',
        endDate: adminDate + (rules.eggsDays * oneDay)
      });
    }

    return flags.map(f => ({
      id: crypto.randomUUID(),
      animalId: '', // Filled by caller
      medicationId: medication.id,
      medAdminLogId: '', // Filled by caller
      startDate: adminDate,
      endDate: f.endDate!,
      productAffected: f.productAffected!,
      resolved: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    }));
  },

  /**
   * Check for contraindications (Pregnancy)
   */
  checkSafety(medication: Medication, animal: Animal, isPregnant: boolean): { safe: boolean; warning?: string } {
    const guidance = medication.speciesGuidance[animal.species];
    
    if (!guidance) {
      return { safe: true, warning: 'No specific guidance for this species. Consult a vet.' };
    }

    if (isPregnant && guidance.contraindicatedPregnancy) {
      return { safe: false, warning: 'CONTRAINDICATED: Not safe for pregnant animals.' };
    }

    return { safe: true };
  },

  /**
   * Get active withdrawal flags for an animal
   */
  async getActiveWithdrawals(animalId: string): Promise<WithdrawalFlag[]> {
    const allFlags = await dbService.getAllByIndex<WithdrawalFlag>('withdrawal_flags', 'animalId', animalId);
    return allFlags.filter(f => f.endDate > Date.now() && !f.resolved);
  }
};
