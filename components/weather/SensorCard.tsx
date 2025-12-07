
import React from 'react';
import { Sensor, SensorReading } from '../../types';
import { Card } from '../ui/Card';
import { Thermometer, Droplets, Wifi, Battery, MapPin } from 'lucide-react';

// Use a union type or subset to support both SensorEntity and SensorDevice if they diverge
interface SensorCardProps {
  sensor: {
      name: string;
      location?: string;
      batteryLevel?: number;
      status?: string;
  };
  latestReading?: {
      value: number;
      unit: string;
      type: string;
  };
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, latestReading }) => {
  return (
    <Card className="bg-white dark:bg-stone-900 p-4 border border-earth-200 dark:border-stone-800">
       <div className="flex justify-between items-start mb-4">
          <div>
             <h3 className="font-bold text-earth-800 dark:text-earth-100">{sensor.name}</h3>
             <p className="text-xs text-earth-500 dark:text-stone-400 flex items-center gap-1">
                {sensor.location && <MapPin size={10} />}
                {sensor.location || 'Unknown Location'}
             </p>
          </div>
          <div className="flex items-center gap-2 text-earth-400">
             {sensor.batteryLevel !== undefined && (
                 <div className="flex items-center gap-0.5 text-[10px]">
                    <Battery size={14} className={sensor.batteryLevel < 20 ? "text-red-500" : ""} /> {sensor.batteryLevel}%
                 </div>
             )}
             <Wifi size={14} className={sensor.status === 'offline' ? 'text-red-400' : 'text-green-500'} />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="bg-earth-50 dark:bg-stone-800 p-3 rounded-xl">
             <div className="flex items-center gap-2 text-earth-500 dark:text-stone-400 mb-1">
                <Thermometer size={16} />
                <span className="text-xs font-bold uppercase">Temp</span>
             </div>
             <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">
                {latestReading && latestReading.type === 'temp' ? latestReading.value : '--'}°
             </p>
          </div>
          
          <div className="bg-earth-50 dark:bg-stone-800 p-3 rounded-xl">
             <div className="flex items-center gap-2 text-earth-500 dark:text-stone-400 mb-1">
                <Droplets size={16} />
                <span className="text-xs font-bold uppercase">Humid</span>
             </div>
             <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">
                {latestReading && latestReading.type === 'humidity' ? latestReading.value : '--'}%
             </p>
          </div>
       </div>

       <div className="mt-4 text-xs text-earth-400 text-center">
          {latestReading ? 'Live Data' : 'Waiting for sync...'}
       </div>
    </Card>
  );
};
