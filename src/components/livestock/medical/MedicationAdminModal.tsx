import React, { useState, useEffect } from 'react';
import { Medication, MedAdminLog, Animal, MedRoute } from '../../../types';
import { Button } from '../../ui/Button';
import { Input, TextArea } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { X, Syringe, AlertCircle } from 'lucide-react';
import { medicalLogic } from '../../../services/medicalLogic';

interface MedicationAdminModalProps {
  animal: Animal;
  medications: Medication[];
  isPregnant: boolean;
  onSave: (log: MedAdminLog, withdrawalFlags: any[]) => void;
  onClose: () => void;
}

export const MedicationAdminModal: React.FC<MedicationAdminModalProps> = ({ animal, medications, isPregnant, onSave, onClose }) => {
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState('ml');
  const [route, setRoute] = useState<MedRoute>('subcutaneous');
  const [site, setSite] = useState('');
  const [batch, setBatch] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [warning, setWarning] = useState<string | null>(null);
  const [withdrawalPreview, setWithdrawalPreview] = useState<string[]>([]);

  const selectedMed = medications.find(m => m.id === selectedMedId);

  useEffect(() => {
    if (selectedMed) {
        // 1. Safety Check
        const safety = medicalLogic.checkSafety(selectedMed, animal, isPregnant);
        setWarning(safety.warning || null);

        // 2. Withdrawal Preview
        const flags = medicalLogic.calculateWithdrawal(selectedMed, animal.species, Date.now());
        if (flags.length > 0) {
            setWithdrawalPreview(flags.map(f => `${f.productAffected.toUpperCase()}: ${Math.ceil((f.endDate - f.startDate) / 86400000)} days`));
        } else {
            setWithdrawalPreview([]);
        }

        // 3. Auto-fill defaults
        const guidance = selectedMed.speciesGuidance[animal.species];
        if (guidance) {
            // Rough calculation if weight existed, for now just placeholder logic
            if (selectedMed.form === 'injectable') setUnit('ml');
            else setUnit('mg');
        }
    } else {
        setWarning(null);
        setWithdrawalPreview([]);
    }
  }, [selectedMedId, animal, isPregnant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    const adminDate = new Date(date).getTime();
    
    const log: MedAdminLog = {
        id: crypto.randomUUID(),
        animalId: animal.id,
        medicationId: selectedMed.id,
        administeredBy: 'me', // User ID
        administeredAt: adminDate,
        doseAmount: parseFloat(dose),
        doseUnit: unit,
        route,
        site,
        batchNumber: batch,
        notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    const flags = medicalLogic.calculateWithdrawal(selectedMed, animal.species, adminDate).map(f => ({
        ...f,
        animalId: animal.id,
        medAdminLogId: log.id
    }));

    onSave(log, flags);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Syringe className="text-blue-600" /> Administer Med
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           <Select 
              label="Medication"
              value={selectedMedId}
              onChange={e => setSelectedMedId(e.target.value)}
              required
           >
              <option value="">Select Medication...</option>
              {medications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
           </Select>

           {warning && (
               <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-800">
                   <AlertCircle size={16} className="shrink-0 mt-0.5" />
                   <span className="font-bold">{warning}</span>
               </div>
           )}

           {withdrawalPreview.length > 0 && (
               <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                   <p className="font-bold mb-1 flex items-center gap-2"><AlertCircle size={14}/> Withdrawal Impacts:</p>
                   <ul className="list-disc list-inside">
                       {withdrawalPreview.map((w, i) => <li key={i}>{w}</li>)}
                   </ul>
               </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                  <Input 
                     label="Dose"
                     type="number"
                     step="0.1"
                     value={dose}
                     onChange={e => setDose(e.target.value)}
                     required
                     className="flex-1"
                  />
                  <div className="w-20 mt-6">
                      <Input 
                         value={unit}
                         onChange={e => setUnit(e.target.value)}
                         placeholder="ml"
                      />
                  </div>
              </div>
              
              <Select
                 label="Route"
                 value={route}
                 onChange={e => setRoute(e.target.value as MedRoute)}
              >
                 <option value="subcutaneous">Sub-Q</option>
                 <option value="intramuscular">IM</option>
                 <option value="oral">Oral</option>
                 <option value="topical">Topical</option>
              </Select>
           </div>

           <Input 
              label="Date Administered"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
           />

           <Input 
              label="Injection Site (Optional)"
              placeholder="e.g. Left Neck"
              value={site}
              onChange={e => setSite(e.target.value)}
           />

           <TextArea 
              label="Notes / Batch #"
              placeholder="Lot number, reaction observations..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
           />

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" className={warning ? 'bg-red-600 hover:bg-red-700' : ''}>
                  {warning ? 'Confirm Risk & Save' : 'Record Dose'}
              </Button>
           </div>
        </form>
      </div>
    </div>
  );
};
