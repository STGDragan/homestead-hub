
import { dbService } from './db';
import { Recommendation, AIFeedback, AIPreference, Task, Plant, WeatherForecast, Animal, UserProfile } from '../types';
import { weatherService } from './weather';
import { gardenAIService } from './gardenAI';

export const aiService = {

  // --- Configuration ---

  async getPreferences(userId: string): Promise<AIPreference> {
    let pref = await dbService.get<AIPreference>('ai_settings', `pref_${userId}`);
    if (!pref) {
      pref = {
        id: `pref_${userId}`,
        userId,
        enabledModules: { garden: true, animals: true, tasks: true, orchard: true, apiary: true },
        aggressiveness: 'balanced',
        autoSync: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
      };
      await dbService.put('ai_settings', pref);
    }
    return pref;
  },

  async savePreferences(pref: AIPreference): Promise<void> {
    await dbService.put('ai_settings', pref);
  },

  // --- Insight Generation ---

  async generateAllInsights(userId: string): Promise<Recommendation[]> {
    const prefs = await this.getPreferences(userId);
    const recommendations: Recommendation[] = [];

    // Clear old active recommendations to regenerate fresh ones (Simulates a re-run)
    // In a real app, we might diff instead of clear
    const existing = await dbService.getAllByIndex<Recommendation>('ai_recommendations', 'userId', userId);
    const activeIds = existing.filter(r => !r.isDismissed && !r.isApplied).map(r => r.id);
    for (const id of activeIds) {
        await dbService.delete('ai_recommendations', id);
    }

    if (prefs.enabledModules.garden) {
        const gardenRecs = await this.runGardenAgent(userId);
        recommendations.push(...gardenRecs);
    }

    if (prefs.enabledModules.tasks) {
        const taskRecs = await this.runSchedulerAgent(userId);
        recommendations.push(...taskRecs);
    }

    if (prefs.enabledModules.animals) {
        const animalRecs = await this.runLivestockAgent(userId);
        recommendations.push(...animalRecs);
    }

    // Persist
    for (const rec of recommendations) {
        await dbService.put('ai_recommendations', rec);
    }

    return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
  },

  // --- Specialized Agents (Offline Heuristics) ---

  async runSchedulerAgent(userId: string): Promise<Recommendation[]> {
    const recs: Recommendation[] = [];
    const tasks = await dbService.getAll<Task>('tasks');
    const weather = await weatherService.getForecast();
    
    // Logic 1: Rain Interference
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowForecast = weather.find(f => new Date(f.date).getDate() === tomorrow.getDate());

    if (tomorrowForecast && (tomorrowForecast.condition === 'rain' || tomorrowForecast.condition === 'storm')) {
        const outdoorTasks = tasks.filter(t => 
            !t.completed && 
            t.category === 'garden' && 
            t.dueDate && 
            new Date(t.dueDate).getDate() === tomorrow.getDate()
        );

        if (outdoorTasks.length > 0) {
            recs.push({
                id: crypto.randomUUID(),
                userId,
                module: 'tasks',
                type: 'schedule_optimization',
                title: 'Rain Delay Suggested',
                description: `Heavy rain expected tomorrow. Consider rescheduling ${outdoorTasks.length} outdoor tasks.`,
                reasoning: `Forecast shows ${tomorrowForecast.precipChance}% chance of rain. Wet soil compaction risk.`,
                confidenceScore: 92,
                priority: 'high',
                isDismissed: false,
                isApplied: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });
        }
    }

    // Logic 2: Priority Drift
    const overdueHigh = tasks.filter(t => !t.completed && t.priority === 'high' && t.dueDate && t.dueDate < Date.now());
    if (overdueHigh.length > 2) {
        recs.push({
            id: crypto.randomUUID(),
            userId,
            module: 'tasks',
            type: 'schedule_optimization',
            title: 'Task Overload Detected',
            description: `You have ${overdueHigh.length} overdue high-priority tasks.`,
            reasoning: 'Accumulating critical tasks increases stress and failure rate. Suggest delegated or rescheduling non-essentials.',
            confidenceScore: 85,
            priority: 'critical',
            isDismissed: false,
            isApplied: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });
    }

    return recs;
  },

  async runGardenAgent(userId: string): Promise<Recommendation[]> {
    const recs: Recommendation[] = [];
    const plants = await dbService.getAll<Plant>('plants');
    const profile = await dbService.get<UserProfile>('user_profile', 'main_user'); // simplified auth
    
    if (!profile) return [];

    // Logic 1: Companion Planting Opportunity
    const tomatoPlants = plants.filter(p => p.name.toLowerCase().includes('tomato') && p.status === 'growing');
    const basilPlants = plants.filter(p => p.name.toLowerCase().includes('basil'));

    if (tomatoPlants.length > 0 && basilPlants.length === 0) {
        recs.push({
            id: crypto.randomUUID(),
            userId,
            module: 'garden',
            type: 'garden_action',
            title: 'Plant Basil with Tomatoes',
            description: 'Your tomatoes are growing well. Adding basil now can improve flavor and deter pests.',
            reasoning: 'Companion planting heuristic: Tomatoes + Basil = Mutual Benefit (Allellopathy).',
            confidenceScore: 88,
            priority: 'medium',
            actionPayload: { action: 'add_plant', plantName: 'Basil' },
            isDismissed: false,
            isApplied: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });
    }

    return recs;
  },

  async runLivestockAgent(userId: string): Promise<Recommendation[]> {
    const recs: Recommendation[] = [];
    const animals = await dbService.getAll<Animal>('animals');

    // Logic 1: Genetic Diversity Warning
    // Count sires per species
    const speciesCounts: Record<string, Set<string>> = {};
    animals.filter(a => a.sex === 'male' && a.status === 'active').forEach(a => {
        if (!speciesCounts[a.species]) speciesCounts[a.species] = new Set();
        speciesCounts[a.species].add(a.id);
    });

    Object.entries(speciesCounts).forEach(([species, sires]) => {
        if (sires.size === 1) {
            recs.push({
                id: crypto.randomUUID(),
                userId,
                module: 'animals',
                type: 'livestock_health',
                title: `Low Genetic Diversity: ${species}`,
                description: `You only have 1 active sire for your ${species} herd.`,
                reasoning: 'Single-sire herds risk "Founder Effect" and inbreeding depression if daughters are retained.',
                confidenceScore: 75,
                priority: 'high',
                isDismissed: false,
                isApplied: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });
        }
    });

    return recs;
  },

  // --- Feedback Loop ---

  async recordFeedback(userId: string, recommendationId: string, action: 'applied' | 'dismissed' | 'rated', rating?: number): Promise<void> {
      // 1. Update Recommendation Status
      const rec = await dbService.get<Recommendation>('ai_recommendations', recommendationId);
      if (rec) {
          if (action === 'applied') rec.isApplied = true;
          if (action === 'dismissed') rec.isDismissed = true;
          await dbService.put('ai_recommendations', rec);
      }

      // 2. Log Feedback
      const feedback: AIFeedback = {
          id: crypto.randomUUID(),
          userId,
          recommendationId,
          action,
          rating,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('ai_feedback', feedback);

      // In a real system, we would trigger a model re-train or weight adjustment here
  },

  async getActiveRecommendations(userId: string): Promise<Recommendation[]> {
      const all = await dbService.getAllByIndex<Recommendation>('ai_recommendations', 'userId', userId);
      return all
        .filter(r => !r.isDismissed && !r.isApplied)
        .sort((a, b) => {
            // Sort by Priority then Confidence
            const pRank = { critical: 4, high: 3, medium: 2, low: 1 };
            const diff = pRank[b.priority] - pRank[a.priority];
            if (diff !== 0) return diff;
            return b.confidenceScore - a.confidenceScore;
        });
  }
};
