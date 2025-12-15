import React, { useState, useEffect } from 'react';
import { Animal, MedAdminLog, VetVisit, Medication, WithdrawalFlag, BreedingLog } from '../../types';
import { dbService } from '../../services/db';
import { Button } from '../../components/ui/Button';
import { MedicalHistoryTimeline } from '../../components/livestock/medical/MedicalHistoryTimeline';
import { WithdrawalAlertWidget } from '../../components/livestock/medical/WithdrawalAlertWidget';
import { MedicationAdminModal } from '../../components/livestock/medical/MedicationAdminModal';
import { MOCK_MEDICATIONS } from '../../constants';
import { Plus, FileText, Syringe } from 'lucide-react';
import { medicalLogic } from '../../services/medicalLogic';

interface AnimalMedicalTabProps {
  animal: Animal;
}

export const AnimalMedicalTab: React.FC<AnimalMedicalTabProps> = ({ animal }) => {
  const [logs, setLogs] = useState<MedAdminLog[]>([]);
  const [visits, setVisits] = useState<VetVisit[]>([]);
  const [flags, setFlags] = useState<WithdrawalFlag[]>([]);
  const [isPregnant, setIsPregnant] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    loadData();
  }, [animal.id]);

  const loadData = async () => {
    // 1. Load History
    const l = await dbService.getAllByIndex<MedAdminLog>('med_admin_logs', 'animalId', animal.id);
    const v = await dbService.getAllByIndex<VetVisit>('vet_visits', 'animalId', animal.id);
    setLogs(l);
    setVisits(v);

    // 2. Load Meds (Mock + DB)
    const dbMeds = await dbService.getAll<Medication>('medications');
    // Merge mock if empty for demo
    const allMeds = dbMeds.length > 0 ? dbMeds : MOCK_MEDICATIONS; 
    setMedications(allMeds);

    // 3. Check Withdrawal Status
    const activeFlags = await medicalLogic.getActiveWithdrawals(animal.id);
    setFlags(activeFlags);

    // 4. Check Pregnancy Status
    const breeding = await dbService.getAll<BreedingLog>('breeding_logs');
    const activePregnancy = breeding.some(b => b.damId === animal.id && b.status === 'pregnant');
    setIsPregnant(activePregnancy);
  };

  const handleLogSave = async (log: MedAdminLog, newFlags: WithdrawalFlag[]) => {
      await dbService.put('med_admin_logs', log);
      for (const f of newFlags) {
          await dbService.put('withdrawal_flags', f);
      }
      setShowAdminModal(false);
      loadData();
  };

  return (
    <div className="space-y-6">
       <WithdrawalAlertWidget flags={flags} medications={medications} />

       <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg text-earth-900 dark:text-earth-100">Medical History</h2>
          <div className="flex gap-2">
             <Button size="sm" variant="secondary" icon={<FileText size={14}/>}>Log Visit</Button>
             <Button size="sm" onClick={() => setShowAdminModal(true)} icon={<Syringe size={14}/>}>Administer Med</Button>
          </div>
       </div>

       <MedicalHistoryTimeline 
          logs={logs} 
          visits={visits} 
          medications={medications} 
       />

       {showAdminModal && (
          <MedicationAdminModal 
             animal={animal}
             medications={medications}
             isPregnant={isPregnant}
             onSave={handleLogSave}
             onClose={() => setShowAdminModal(false)}
          />
       )}
    </div>
  );
};
