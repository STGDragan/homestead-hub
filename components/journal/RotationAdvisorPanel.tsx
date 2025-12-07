
import React, { useEffect, useState } from 'react';
import { GardenBed, RotationRecord } from '../../types';
import { dbService } from '../../services/db';
import { seedAI } from '../../services/seedAI';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export const RotationAdvisorPanel: React.FC = () => {
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [selectedBedId, setSelectedBedId] = useState('');
  const [history, setHistory] = useState<RotationRecord[]>([]);
  const [plannedCrop, setPlannedCrop] = useState('');
  const [advice, setAdvice] = useState<any>(null);

  useEffect(() => {
    dbService.getAll<GardenBed>('garden_beds').then(setBeds);
  }, []);

  useEffect(() => {
    if (selectedBedId) {
        dbService.getAllByIndex<RotationRecord>('rotation_records', 'bedId', selectedBedId)
            .then(recs => setHistory(recs.sort((a, b) => b.endDate - a.endDate)));
    } else {
        setHistory([]);
    }
  }, [selectedBedId]);

  useEffect(() => {
    if (plannedCrop && history.length > 0) {
        setAdvice(seedAI.checkRotation(plannedCrop, history));
    } else {
        setAdvice(null);
    }
  }, [plannedCrop, history]);

  return (
    <Card className="space-y-4">
       <div className="flex items-center gap-2 border-b border-earth-100 dark:border-stone-800 pb-2 mb-2">
          <RotateCcw className="text-leaf-600" />
          <h3 className="font-serif font-bold text-earth-900 dark:text-earth-100">Crop Rotation Advisor</h3>
       </div>

       <div className="grid md:grid-cols-2 gap-4">
          <Select 
             label="Check Bed"
             value={selectedBedId}
             onChange={e => setSelectedBedId(e.target.value)}
          >
             <option value="">Select Bed...</option>
             {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>

          <Select
             label="Planning to Plant"
             value={plannedCrop}
             onChange={e => setPlannedCrop(e.target.value)}
             disabled={!selectedBedId}
          >
             <option value="">Select Crop...</option>
             <option value="Tomato">Tomato (Solanaceae)</option>
             <option value="Potato">Potato (Solanaceae)</option>
             <option value="Broccoli">Broccoli (Brassicaceae)</option>
             <option value="Bean">Bean (Fabaceae)</option>
             <option value="Carrot">Carrot (Apiaceae)</option>
             <option value="Squash">Squash (Cucurbitaceae)</option>
          </Select>
       </div>

       {advice && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${advice.safe ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-900'}`}>
             {advice.safe ? <CheckCircle className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
             <div>
                <p className="font-bold">{advice.safe ? 'Rotation Safe' : 'Risk Detected'}</p>
                <p className="text-sm">{advice.message}</p>
             </div>
          </div>
       )}

       {selectedBedId && (
          <div className="mt-4">
             <h4 className="text-xs font-bold text-earth-500 uppercase mb-2">History for {beds.find(b => b.id === selectedBedId)?.name}</h4>
             {history.length === 0 ? (
                <p className="text-sm text-earth-400 italic">No history recorded.</p>
             ) : (
                <div className="space-y-2">
                   {history.map(rec => (
                      <div key={rec.id} className="flex justify-between items-center text-sm p-2 bg-earth-50 dark:bg-stone-800 rounded border border-earth-100 dark:border-stone-700">
                         <span className="font-bold text-earth-800 dark:text-earth-200">{rec.cropName}</span>
                         <span className="text-earth-500">{new Date(rec.endDate).getFullYear()}</span>
                      </div>
                   ))}
                </div>
             )}
          </div>
       )}
    </Card>
  );
};
