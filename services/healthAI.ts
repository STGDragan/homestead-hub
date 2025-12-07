
import { HealthRecord, HealthSubjectType, DiagnosisResult } from '../types';
import { MOCK_DIAGNOSES } from '../constants';

// Simple heuristic rules for offline/local checking before hitting the "server"
interface LocalHeuristic {
  keywords: string[];
  result: DiagnosisResult;
}

const LOCAL_HEURISTICS: Record<HealthSubjectType, LocalHeuristic[]> = {
  plant: [
    {
      keywords: ['spot', 'brown', 'leaf'],
      result: MOCK_DIAGNOSES.plant.find(d => d.issueName === 'Early Blight')!
    },
    {
      keywords: ['bug', 'insect', 'fly', 'underside'],
      result: MOCK_DIAGNOSES.plant.find(d => d.issueName === 'Aphid Infestation')!
    }
  ],
  animal: [
    {
      keywords: ['leg', 'scale', 'rough'],
      result: MOCK_DIAGNOSES.animal.find(d => d.issueName === 'Scaly Leg Mites')!
    },
    {
      keywords: ['foot', 'limp', 'cut'],
      result: MOCK_DIAGNOSES.animal.find(d => d.issueName === 'Bumblefoot')!
    }
  ]
};

export const healthAIService = {
  /**
   * Simulates analyzing a photo. 
   * In a real PWA, this would use TensorFlow.js for local inference 
   * or queue the blob for a cloud API call.
   */
  async analyzePhoto(blob: Blob, type: HealthSubjectType): Promise<DiagnosisResult> {
    return new Promise((resolve) => {
      // Simulate processing delay
      setTimeout(() => {
        // 1. In a real app, we might check EXIF data or run a lightweight TF.js model here.
        // 2. For now, we pick a random result from our constants to simulate AI.
        
        const options = MOCK_DIAGNOSES[type];
        // Bias towards a specific result for demo consistency, or random
        const result = options[Math.floor(Math.random() * options.length)];
        
        resolve(result);
      }, 2500);
    });
  },

  /**
   * Run a quick heuristic check based on user notes/tags if available (Offline fallback)
   */
  runOfflineHeuristic(type: HealthSubjectType, notes: string): DiagnosisResult | null {
    const rules = LOCAL_HEURISTICS[type];
    const lowerNotes = notes.toLowerCase();
    
    for (const rule of rules) {
      if (rule.keywords.some(k => lowerNotes.includes(k))) {
        return { ...rule.result, probability: 60 }; // Lower confidence for heuristic
      }
    }
    return null;
  }
};
