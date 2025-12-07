
import React from 'react';
import { GardenBed, Plant } from '../../types';
import { Card, CardTitle } from '../ui/Card';
import { Sprout, Sun, Cloud, CloudOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gardenAIService } from '../../services/gardenAI';

interface BedCardProps {
  bed: GardenBed;
  plants: Plant[];
}

export const BedCard: React.FC<BedCardProps> = ({ bed, plants }) => {
  const navigate = useNavigate();

  // Use AI Service for utilization check
  const healthCheck = gardenAIService.calculateBedHealth(bed, plants);
  const utilization = healthCheck.utilPct;

  const SunIcon = {
    full: Sun,
    partial: Cloud,
    shade: CloudOff
  }[bed.sunExposure];

  return (
    <Card 
      interactive 
      onClick={() => navigate(`/garden/bed/${bed.id}`)}
      className="bg-white group"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-earth-100 rounded-lg text-earth-600 group-hover:bg-leaf-100 group-hover:text-leaf-700 transition-colors">
                <Sprout size={20} />
             </div>
             <div>
                <CardTitle>{bed.name}</CardTitle>
                <p className="text-xs text-earth-500 font-medium">{bed.width}' × {bed.length}' • {bed.type}</p>
             </div>
          </div>
          <div className="text-earth-400" title={`Sun Exposure: ${bed.sunExposure}`}>
            <SunIcon size={18} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
           <div className="flex justify-between text-xs text-earth-600 font-bold uppercase tracking-wider">
              <span>Utilization</span>
              <span>{utilization}%</span>
           </div>
           <div className="w-full bg-earth-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-clay-500' : 'bg-leaf-600'}`} 
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
           </div>
           {healthCheck.status === 'crowded' && (
             <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
               <AlertTriangle size={12} />
               <span>Overcrowded!</span>
             </div>
           )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-earth-100 flex items-center justify-between text-sm text-earth-500">
           <span>{plants.length} Plants</span>
           <span className="text-leaf-700 font-bold group-hover:underline">View Details →</span>
        </div>
      </div>
    </Card>
  );
};
