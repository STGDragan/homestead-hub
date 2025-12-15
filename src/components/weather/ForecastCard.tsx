
import React from 'react';
import { WeatherForecast } from '../../types';
import { Card } from '../ui/Card';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Droplets, Wind } from 'lucide-react';

interface ForecastCardProps {
  forecast: WeatherForecast;
  isToday?: boolean;
}

const ICONS: Record<string, React.FC<any>> = {
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  clear: Sun,
};

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, isToday = false }) => {
  const Icon = ICONS[forecast.condition] || Sun;
  const dateObj = new Date(forecast.date);
  
  return (
    <Card className={`text-center p-4 ${isToday ? 'bg-leaf-50 dark:bg-leaf-900/20 border-leaf-300 dark:border-leaf-700 ring-1 ring-leaf-200 dark:ring-leaf-800' : 'bg-white dark:bg-night-900'}`}>
       <div className="mb-2">
          <p className="text-xs font-bold text-earth-500 dark:text-night-400 uppercase">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</p>
          <p className="text-sm font-bold text-earth-900 dark:text-earth-100">{dateObj.getDate()}</p>
       </div>
       
       <div className="flex justify-center my-3 text-earth-600 dark:text-night-300">
          <Icon size={32} strokeWidth={1.5} />
       </div>

       <div className="space-y-1">
          <div className="flex justify-center gap-2 items-baseline">
             <span className="font-bold text-xl text-earth-800 dark:text-earth-200">{forecast.tempHigh}°</span>
             <span className="text-sm text-earth-400 dark:text-night-500">{forecast.tempLow}°</span>
          </div>
          
          <div className="flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
             <Droplets size={12} />
             <span>{forecast.precipChance}%</span>
          </div>
       </div>
    </Card>
  );
};
