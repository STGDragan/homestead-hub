
// components/garden/PlantSuggestionsPanel.tsx
import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../types';
import { gardenAIService, ScoredPlant } from '../../services/gardenAI';
import { Card } from '../ui/Card';
import { Sprout, Star, Info } from 'lucide-react';
import { dbService } from '../../services/db';

export const PlantSuggestionsPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ScoredPlant[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadRecs = async () => {
        const user = await dbService.get<UserProfile>('user_profile', 'main_user');
        if (user) {
            setProfile(user);
            const recs = gardenAIService.getRecommendations(user, 'spring'); // Hardcoded season for MVP
            setRecommendations(recs.slice(0, 5)); // Top 5
        }
    };
    loadRecs();
  }, []);

  if (!profile || recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
       <div className="flex items-center gap-2 mb-2">
          <Star size={18} className="text-amber-500 fill-amber-500" />
          <h2 className="font-serif font-bold text-earth-900">Recommended for Zone {profile.hardinessZone}</h2>
       </div>
       
       <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {recommendations.map(plant => (
             <Card key={plant.id} className="min-w-[200px] p-4 bg-white border-l-4 border-l-leaf-500 relative group">
                <div className="flex justify-between items-start mb-2">
                   <span className="font-bold text-lg text-earth-800">{plant.name}</span>
                   <div className="bg-leaf-100 text-leaf-800 p-1.5 rounded-lg">
                      <Sprout size={16} />
                   </div>
                </div>
                
                <p className="text-xs text-earth-500 mb-2 italic">{plant.defaultVariety}</p>
                
                <div className="space-y-1">
                   {plant.reasons.slice(0, 2).map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] bg-earth-50 px-2 py-1 rounded text-earth-600">
                         <Info size={10} /> {r.message}
                      </div>
                   ))}
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
};
