
import React, { useEffect, useState } from 'react';
import { weatherService } from '../../services/weather';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { WeatherForecast, WeatherAlert, Sensor, UserProfile } from '../../types';
import { ForecastCard } from '../../components/weather/ForecastCard';
import { SensorCard } from '../../components/weather/SensorCard';
import { Button } from '../../components/ui/Button';
import { CloudSun, AlertTriangle, Settings, Plus, MapPin } from 'lucide-react';

export const WeatherDashboard: React.FC = () => {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [locationInfo, setLocationInfo] = useState<{ zip: string, zone: string }>({ zip: 'Local', zone: '7a' });

  // Mock sensors
  const [sensors] = useState<Sensor[]>([
     { id: 's1', name: 'Greenhouse 1', location: 'South Garden', type: 'temp_humidity', lastSync: Date.now(), batteryLevel: 85, createdAt: Date.now(), updatedAt: Date.now(), syncStatus: 'synced' },
     { id: 's2', name: 'Root Cellar', location: 'Basement', type: 'temp_humidity', lastSync: Date.now(), batteryLevel: 92, createdAt: Date.now(), updatedAt: Date.now(), syncStatus: 'synced' }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        // Resolve correct User ID (Auth or Local)
        const currentUser = await authService.getCurrentUser();
        const profileId = currentUser ? currentUser.id : 'main_user';
        
        let profile = await dbService.get<UserProfile>('user_profile', profileId);
        
        // Fallback: If logged in but profile hasn't synced/migrated yet, try main_user
        if (!profile && profileId !== 'main_user') {
            profile = await dbService.get<UserProfile>('user_profile', 'main_user');
        }
        
        let zone = '7a'; // Default
        if (profile) {
            zone = profile.hardinessZone || '7a';
            setLocationInfo({ 
                zip: profile.zipCode || 'Local', 
                zone: zone
            });
        }

        // Pass the ZONE to the service to ensure consistent data across app
        const f = await weatherService.getForecast(zone);
        const a = await weatherService.getAlerts(zone);
        
        setForecasts(f);
        setAlerts(a);
    } catch(e) {
        console.error("Weather load failed", e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-3">
              <CloudSun className="text-amber-500" /> Weather Station
           </h1>
           <p className="text-earth-600 dark:text-stone-400 flex items-center gap-2 mt-1">
              <MapPin size={14} /> 
              Forecast for <strong>{locationInfo.zip}</strong> (Zone {locationInfo.zone})
           </p>
        </div>
        <Button variant="outline" icon={<Settings size={18} />}>Configure Alerts</Button>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
         <div className="space-y-2">
            {alerts.map(alert => (
               <div key={alert.id} className={`p-4 rounded-xl border flex gap-3 ${alert.level === 'warning' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100'}`}>
                  <AlertTriangle className="shrink-0" />
                  <div>
                     <h3 className="font-bold">{alert.title}</h3>
                     <p className="text-sm opacity-90">{alert.description}</p>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Forecast Strip */}
      <section>
         <h2 className="text-lg font-bold text-earth-800 dark:text-earth-200 mb-4">7-Day Forecast</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecasts.map((f, idx) => (
               <ForecastCard key={idx} forecast={f} isToday={idx === 0} />
            ))}
         </div>
      </section>

      {/* Sensors Grid */}
      <section>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-earth-800 dark:text-earth-200">Microclimate Sensors</h2>
            <Button size="sm" variant="ghost" icon={<Plus size={16} />}>Add Sensor</Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sensors.map(sensor => (
               <SensorCard 
                  key={sensor.id} 
                  sensor={sensor} 
                  latestReading={{ 
                      id: 'r1', 
                      sensorId: sensor.id, 
                      timestamp: Date.now(), 
                      value: 72, 
                      unit: 'F', 
                      type: 'temp', 
                      createdAt: Date.now(), 
                      updatedAt: Date.now(), 
                      syncStatus: 'synced' 
                  }} 
               />
            ))}
         </div>
      </section>
    </div>
  );
};
