
import React, { useEffect, useState } from 'react';
import { Animal, PairRecommendation } from '../../types';
import { breedingAI } from '../../services/breedingAI';
import { dbService } from '../../services/db';
import { Button } from '../ui/Button';
import { X, Heart, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface MatingRecommendationModalProps {
  animal: Animal;
  onClose: () => void;
}

export const MatingRecommendationModal: React.FC<MatingRecommendationModalProps> = ({ animal, onClose }) => {
  const [recommendations, setRecommendations] = useState<(PairRecommendation & { mate?: Animal })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
       const recs = await breedingAI.getRecommendations(animal.id);
       // Hydrate with mate info
       const hydrated = await Promise.all(recs.map(async (r) => {
           const mateId = animal.sex === 'male' ? r.candidateDamId : r.candidateSireId;
           const mate = await dbService.get<Animal>('animals', mateId);
           return { ...r, mate };
       }));
       setRecommendations(hydrated);
       setLoading(false);
    };
    load();
  }, [animal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center p-6 border-b border-earth-100 dark:border-stone-800">
          <div>
             <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                <Heart className="text-pink-600 fill-pink-600" /> Matchmaker
             </h2>
             <p className="text-sm text-earth-500 dark:text-stone-400">Recommended mates for <strong>{animal.name}</strong></p>
          </div>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
           {loading && <div className="text-center py-8 animate-pulse text-earth-500">Analyzing genetics...</div>}
           
           {!loading && recommendations.length === 0 && (
              <div className="text-center py-12 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-200 dark:border-stone-700">
                 <p className="text-earth-500">No eligible mates found in your active herd.</p>
              </div>
           )}

           {recommendations.map(rec => (
              <div key={rec.id} className="border border-earth-200 dark:border-stone-700 rounded-xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all bg-white dark:bg-stone-900">
                 {/* Score Badge */}
                 <div className="flex flex-col items-center justify-center min-w-[80px]">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4
                        ${rec.score > 80 ? 'border-green-100 bg-green-50 text-green-700' : rec.score > 50 ? 'border-yellow-100 bg-yellow-50 text-yellow-700' : 'border-red-100 bg-red-50 text-red-700'}
                    `}>
                       {rec.score}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-earth-400 mt-1">Score</span>
                 </div>

                 {/* Mate Info */}
                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">{rec.mate?.name}</h3>
                       <span className="text-xs bg-earth-100 dark:bg-stone-800 px-2 py-1 rounded text-earth-600 dark:text-stone-400">{rec.mate?.breed}</span>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                       {rec.reasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-earth-600 dark:text-stone-300">
                             {r.includes('Risk') ? <AlertTriangle size={14} className="text-red-500"/> : <CheckCircle size={14} className="text-green-500"/>}
                             {r}
                          </div>
                       ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-earth-500 dark:text-stone-500 bg-earth-50 dark:bg-stone-800 p-2 rounded-lg">
                       <span>Inbreeding Coeff: {(rec.inbreedingCoefficient * 100).toFixed(1)}%</span>
                       <span className="flex items-center gap-1 text-leaf-600 dark:text-leaf-400"><TrendingUp size={12}/> Growth Potential</span>
                    </div>
                 </div>

                 <div className="flex flex-col justify-center gap-2">
                    <Button size="sm">Select Pair</Button>
                    <Button size="sm" variant="ghost">View Pedigree</Button>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};
