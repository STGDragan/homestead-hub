
import { WeatherForecast, WeatherAlert, WeatherCondition } from '../types';

// Mock Data Generators
const CONDITIONS: WeatherCondition[] = ['sunny', 'cloudy', 'rain', 'storm', 'clear', 'snow'];

// Helper to get base temperature from USDA Zone (rough approximation for demo)
const getBaseTempForZone = (zoneStr: string = '7a'): number => {
    // Safety check for undefined/null/empty string
    if (!zoneStr || typeof zoneStr !== 'string') zoneStr = '7a';

    // Extract number from string like "4b" -> 4
    const match = zoneStr.match(/(\d+)/);
    const zone = match ? parseInt(match[0]) : 7; // Default to zone 7 if unknown
    
    // Simple logic: Lower zone = Colder base temp
    // Zone 1 = 20F, Zone 7 = 65F, Zone 13 = 90F (Arbitrary seasonal baseline)
    return 15 + (zone * 7); 
};

// Deterministic random number generator based on seed
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const generateForecast = (days: number, zone: string = '7a'): WeatherForecast[] => {
  const forecasts: WeatherForecast[] = [];
  const today = new Date();
  const baseTemp = getBaseTempForZone(zone);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Create a unique seed based on date string to ensure consistency across the app
    // e.g. "2023-10-25" -> consistent seed
    const dateKey = date.toDateString();
    const seed = dateKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const rand1 = seededRandom(seed);
    const rand2 = seededRandom(seed + 1);
    
    // Daily variance +/- 10 degrees
    const dailyVariance = (rand1 * 20) - 10;
    
    const high = Math.round(baseTemp + dailyVariance);
    const low = Math.round(high - 15 - (rand2 * 10)); // Low is 15-25 deg lower than high
    
    const conditionIndex = Math.floor(rand1 * CONDITIONS.length);
    
    forecasts.push({
      date: date.getTime(),
      tempHigh: high,
      tempLow: low,
      condition: CONDITIONS[conditionIndex],
      precipChance: Math.floor(rand2 * 100),
      humidity: 40 + Math.floor(rand1 * 40)
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
        id: `alert_frost_${f.date}`,
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
    if (f.condition === 'storm' && f.precipChance > 60) {
      alerts.push({
        id: `alert_storm_${f.date}`,
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
  async getForecast(zone: string = '7a'): Promise<WeatherForecast[]> {
    return generateForecast(7, zone);
  },

  async getAlerts(zone: string = '7a'): Promise<WeatherAlert[]> {
    const forecasts = await this.getForecast(zone);
    return generateAlerts(forecasts);
  },
  
  async getCurrentConditions(zone: string = '7a'): Promise<WeatherForecast> {
      const forecast = await this.getForecast(zone);
      return forecast[0];
  }
};
