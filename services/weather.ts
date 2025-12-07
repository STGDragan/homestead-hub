
import { dbService } from './db';
import { WeatherForecast, WeatherAlert, WeatherCondition } from '../types';

// Mock Data Generators
const CONDITIONS: WeatherCondition[] = ['sunny', 'cloudy', 'rain', 'storm', 'clear'];

const generateForecast = (days: number): WeatherForecast[] => {
  const forecasts: WeatherForecast[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Simple seasonality simulation
    const baseTemp = 70; 
    const randomVar = Math.floor(Math.random() * 20) - 10;
    
    forecasts.push({
      date: date.getTime(),
      tempHigh: baseTemp + randomVar,
      tempLow: baseTemp + randomVar - 20,
      condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
      precipChance: Math.floor(Math.random() * 100),
      humidity: 40 + Math.floor(Math.random() * 40)
    });
  }
  return forecasts;
};

const generateAlerts = (forecasts: WeatherForecast[]): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  
  forecasts.forEach(f => {
    // Frost Logic
    if (f.tempLow <= 32) {
      alerts.push({
        id: crypto.randomUUID(),
        title: 'Frost Warning',
        description: `Temperatures dropping to ${f.tempLow}°F on ${new Date(f.date).toLocaleDateString()}. Cover sensitive crops.`,
        level: 'warning',
        type: 'frost',
        effectiveStart: f.date,
        effectiveEnd: f.date + 86400000,
        isActive: true
      });
    }
    
    // Storm Logic
    if (f.condition === 'storm' && f.precipChance > 70) {
      alerts.push({
        id: crypto.randomUUID(),
        title: 'Severe Storm Watch',
        description: 'High chance of thunderstorms. Secure loose equipment.',
        level: 'watch',
        type: 'storm',
        effectiveStart: f.date,
        effectiveEnd: f.date + 86400000,
        isActive: true
      });
    }
  });

  return alerts;
};

export const weatherService = {
  async getForecast(): Promise<WeatherForecast[]> {
    // 1. Try Cache
    const todayStr = new Date().toDateString();
    // In a real app we'd query IDB by range. 
    // Here we'll just return mock data for immediate UI rendering.
    return generateForecast(7);
  },

  async getAlerts(): Promise<WeatherAlert[]> {
    const forecasts = await this.getForecast();
    return generateAlerts(forecasts);
  }
};
