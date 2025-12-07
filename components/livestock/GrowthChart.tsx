
import React from 'react';
import { GrowthLog } from '../../types';
import { Card } from '../ui/Card';

interface GrowthChartProps {
  logs: GrowthLog[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ logs }) => {
  if (logs.length < 2) return <div className="text-center text-xs text-earth-400 p-4">Add at least 2 weight logs to see growth curve.</div>;

  const sorted = [...logs].sort((a, b) => a.date - b.date);
  const minWeight = Math.min(...logs.map(l => l.weight));
  const maxWeight = Math.max(...logs.map(l => l.weight));
  
  // Normalize for SVG
  const height = 150;
  const width = 300;
  const padding = 20;

  const getX = (index: number) => padding + (index / (logs.length - 1)) * (width - 2 * padding);
  const getY = (weight: number) => height - padding - ((weight - minWeight) / ((maxWeight - minWeight) || 1)) * (height - 2 * padding);

  const points = sorted.map((log, i) => `${getX(i)},${getY(log.weight)}`).join(' ');

  return (
    <div className="w-full overflow-hidden">
       <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-earth-50 dark:bg-stone-800 rounded-xl">
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d6c4b0" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d6c4b0" strokeWidth="1" />
          
          {/* Trend Line */}
          <polyline 
             fill="none" 
             stroke="#15803d" 
             strokeWidth="2" 
             points={points} 
          />
          
          {/* Data Points */}
          {sorted.map((log, i) => (
             <circle 
                key={log.id} 
                cx={getX(i)} 
                cy={getY(log.weight)} 
                r="3" 
                fill="white" 
                stroke="#15803d" 
                strokeWidth="2"
             />
          ))}
       </svg>
       <div className="flex justify-between text-[10px] text-earth-500 mt-2 px-2">
          <span>Start: {sorted[0].weight} {sorted[0].unit}</span>
          <span>Current: {sorted[sorted.length - 1].weight} {sorted[sorted.length - 1].unit}</span>
       </div>
    </div>
  );
};
