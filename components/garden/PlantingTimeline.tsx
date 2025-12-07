import React from 'react';
import { Plant } from '../../types';
import { Card } from '../ui/Card';

interface PlantingTimelineProps {
  plants: Plant[];
}

export const PlantingTimeline: React.FC<PlantingTimelineProps> = ({ plants }) => {
  const today = Date.now();
  const ONE_DAY = 86400000;
  
  // Calculate display range: start 2 weeks ago, end 3 months from now
  const startDate = today - (ONE_DAY * 14);
  const totalDays = 120; // Show approx 4 months
  const endDate = startDate + (ONE_DAY * totalDays);

  const getPosition = (date: number) => {
    const pos = ((date - startDate) / (endDate - startDate)) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const getWidth = (start: number, days: number) => {
    const end = start + (days * ONE_DAY);
    const startPos = getPosition(start);
    const endPos = getPosition(end);
    return Math.max(2, endPos - startPos); // Min 2% width
  };

  return (
    <Card className="overflow-hidden">
      <div className="mb-4 flex justify-between items-end">
        <h3 className="font-serif font-bold text-earth-800">Season Timeline</h3>
        <span className="text-xs text-earth-500 font-medium">120 Day View</span>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Today Marker */}
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-clay-500 z-10 flex flex-col items-center"
          style={{ left: `${getPosition(today)}%` }}
        >
          <div className="bg-clay-500 text-white text-[9px] font-bold px-1 rounded-sm -mt-5">
            TODAY
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-between pointer-events-none opacity-20">
            <div className="border-l border-earth-800 h-full"></div>
            <div className="border-l border-earth-800 h-full"></div>
            <div className="border-l border-earth-800 h-full"></div>
            <div className="border-l border-earth-800 h-full"></div>
        </div>

        <div className="space-y-4">
          {plants.length === 0 && <div className="text-center text-sm text-earth-400 py-4">Add plants to see their schedule</div>}
          
          {plants.map(plant => {
            const startPos = getPosition(plant.plantedDate);
            const durationWidth = getWidth(plant.plantedDate, plant.daysToMaturity);
            const harvestWidth = getWidth(plant.plantedDate + (plant.daysToMaturity * ONE_DAY), 14); // Assume 2 week harvest window

            return (
              <div key={plant.id} className="relative h-8 w-full flex items-center">
                 {/* Plant Name Label (Sticky-ish) */}
                 <div className="absolute left-0 w-24 z-10 truncate text-xs font-bold text-earth-700 bg-white/80 pr-2">
                    {plant.name}
                 </div>

                 {/* Growth Bar */}
                 <div 
                    className="absolute h-4 rounded-l-md bg-leaf-200 border border-leaf-300"
                    style={{ 
                        left: `${startPos}%`, 
                        width: `${durationWidth}%` 
                    }}
                    title={`Growing: ${Math.round(durationWidth)} days`}
                 >
                     {durationWidth > 15 && <span className="text-[9px] text-leaf-800 pl-2 leading-4 block">Growing</span>}
                 </div>

                 {/* Harvest Window */}
                 <div 
                    className="absolute h-4 rounded-r-md bg-amber-200 border border-amber-300 border-l-0"
                    style={{ 
                        left: `${startPos + durationWidth}%`, 
                        width: `${harvestWidth}%` 
                    }}
                    title="Estimated Harvest"
                 >
                     {harvestWidth > 5 && <span className="text-[9px] text-amber-800 pl-1 leading-4 block">Harvest</span>}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-earth-500 justify-end">
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-leaf-200 rounded"></div> Growing</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-200 rounded"></div> Harvest</div>
      </div>
    </Card>
  );
};