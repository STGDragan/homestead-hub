
import React, { useEffect, useState } from 'react';
import { AuthDevice } from '../../types';
import { authService } from '../../services/auth';
import { Button } from '../ui/Button';
import { Smartphone, Monitor, Trash2, Shield } from 'lucide-react';

export const DeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<AuthDevice[]>([]);
  const currentDeviceId = authService.getDeviceId();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const user = await authService.getCurrentUser();
    if (user) {
        const list = await authService.getDevices(user.id);
        setDevices(list.sort((a, b) => b.lastSeen - a.lastSeen));
    }
  };

  const handleRevoke = async (id: string) => {
      if (confirm('Revoke access for this device?')) {
          await authService.revokeDevice(id);
          loadDevices();
      }
  };

  return (
    <div className="space-y-4">
       {devices.map(device => (
           <div key={device.id} className="flex items-center justify-between p-4 bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl">
               <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${device.id === currentDeviceId ? 'bg-green-100 text-green-700' : 'bg-earth-100 text-earth-600'}`}>
                       {device.type === 'mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
                   </div>
                   <div>
                       <h4 className="font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                           {device.name}
                           {device.id === currentDeviceId && <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded">This Device</span>}
                       </h4>
                       <p className="text-xs text-earth-500">Last active: {new Date(device.lastSeen).toLocaleDateString()} {new Date(device.lastSeen).toLocaleTimeString()}</p>
                   </div>
               </div>
               {device.id !== currentDeviceId && (
                   <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleRevoke(device.id)}>
                       <Trash2 size={16} />
                   </Button>
               )}
           </div>
       ))}
    </div>
  );
};
