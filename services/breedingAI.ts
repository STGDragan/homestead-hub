
import { Animal, PairRecommendation, TraitProfile, GeneticTrait } from '../types';
import { dbService } from './db';
import { livestockAI } from './livestockAI';

export const breedingAI = {
  
  /**
   * Calculate Inbreeding Coefficient (Simplified Path Method)
   * In a real app, this would use the Wright's equation over full pedigree.
   * Here we check for shared ancestors in the immediate 3 generations.
   */
  async calculateInbreeding(sireId: string, damId: string): Promise<number> {
    const sireTree = await livestockAI.buildPedigree(sireId, 3);
    const damTree = await livestockAI.buildPedigree(damId, 3);
    
    if (!sireTree || !damTree) return 0;

    const sireAncestors = new Set<string>();
    const damAncestors = new Set<string>();

    const traverse = (node: any, set: Set<string>) => {
        if (!node) return;
        set.add(node.id);
        if (node.sire) traverse(node.sire, set);
        if (node.dam) traverse(node.dam, set);
    };

    traverse(sireTree.sire, sireAncestors);
    traverse(sireTree.dam, sireAncestors);
    traverse(damTree.sire, damAncestors);
    traverse(damTree.dam, damAncestors);

    let sharedCount = 0;
    sireAncestors.forEach(id => {
        if (damAncestors.has(id)) sharedCount++;
    });

    // Extremely simplified coefficient estimate
    return sharedCount * 0.125; 
  },

  /**
   * Score a potential pairing based on traits and genetic risk
   */
  async scorePairing(sire: Animal, dam: Animal, preferences: TraitProfile[]): Promise<PairRecommendation> {
    const inbreeding = await this.calculateInbreeding(sire.id, dam.id);
    let score = 100;
    const reasons: string[] = [];

    // 1. Genetic Penalty
    if (inbreeding > 0) {
        score -= (inbreeding * 100);
        reasons.push(`Genetic Risk: ${(inbreeding * 100).toFixed(1)}% overlapping ancestry`);
    } else {
        reasons.push("Low genetic risk (No recent shared ancestors)");
    }

    // 2. Age/Status Checks
    if (sire.status !== 'active' || dam.status !== 'active') {
        score = 0;
        reasons.push("One or both animals are inactive");
    }

    // 3. Trait Matching (Mock logic - would compare actual trait values)
    if (sire.breed === dam.breed) {
        score += 10;
        reasons.push("Purebred pairing");
    } else {
        reasons.push("Crossbreeding (Hybrid Vigor)");
    }

    return {
        id: crypto.randomUUID(),
        userId: 'me',
        candidateSireId: sire.id,
        candidateDamId: dam.id,
        score: Math.max(0, Math.min(100, score)),
        inbreedingCoefficient: inbreeding,
        traitImpacts: { growth: 5, hardiness: 10 },
        reasons,
        confidence: 0.85,
        createdAt: Date.now(),
        generatedBy: 'local-heuristic',
        synced: false
    };
  },

  /**
   * Generate recommendations for a specific animal
   */
  async getRecommendations(targetId: string): Promise<PairRecommendation[]> {
    const target = await dbService.get<Animal>('animals', targetId);
    if (!target) return [];

    const allAnimals = await dbService.getAll<Animal>('animals');
    
    // Find opposites
    const candidates = allAnimals.filter(a => 
        a.species === target.species && 
        a.sex !== target.sex && 
        a.status === 'active' &&
        a.id !== target.id
    );

    const recommendations: PairRecommendation[] = [];

    for (const candidate of candidates) {
        const sire = target.sex === 'male' ? target : candidate;
        const dam = target.sex === 'female' ? target : candidate;
        
        const rec = await this.scorePairing(sire, dam, []);
        recommendations.push(rec);
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }
};
