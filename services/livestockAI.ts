
import { dbService } from './db';
import { Animal, Offspring, PedigreeNode } from '../types';

export const livestockAI = {
  /**
   * Recursively build a pedigree tree for an animal or offspring
   */
  async buildPedigree(animalId: string, depth: number = 3): Promise<PedigreeNode | null> {
    // Try to find in Animals first, then Offspring
    let subject: any = await dbService.get<Animal>('animals', animalId);
    if (!subject) {
      subject = await dbService.get<Offspring>('offspring', animalId);
    }
    
    if (!subject) return null;

    const node: PedigreeNode = {
      id: subject.id,
      name: subject.name || 'Unknown',
      sex: subject.sex,
      generation: 0,
      sireId: subject.sireId,
      damId: subject.damId
    };

    if (depth > 0) {
      if (node.sireId) {
        const sireNode = await this.buildPedigree(node.sireId, depth - 1);
        if (sireNode) {
            sireNode.generation = node.generation + 1;
            node.sire = sireNode;
        }
      }
      if (node.damId) {
        const damNode = await this.buildPedigree(node.damId, depth - 1);
        if (damNode) {
            damNode.generation = node.generation + 1;
            node.dam = damNode;
        }
      }
    }

    return node;
  },

  /**
   * Predict next expected weight based on linear regression of last 3 points
   * (Simplified logic for offline MVP)
   */
  predictNextWeight(history: { date: number; weight: number }[]): number | null {
    if (history.length < 2) return null;
    
    // Sort by date
    const sorted = [...history].sort((a, b) => a.date - b.date);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    const daysDiff = (last.date - prev.date) / (1000 * 60 * 60 * 24);
    if (daysDiff === 0) return last.weight;

    const dailyGain = (last.weight - prev.weight) / daysDiff;
    
    // Predict weight in 7 days
    return last.weight + (dailyGain * 7);
  }
};
