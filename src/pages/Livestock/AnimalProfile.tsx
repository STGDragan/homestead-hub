

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { Animal, BreedingLog } from '../../types';
import { Button } from '../../components/ui/Button';
import { AnimalEditorModal } from '../../components/livestock/AnimalEditorModal';
import { MatingRecommendationModal } from '../../components/livestock/MatingRecommendationModal';
import { AnimalMedicalTab } from './AnimalMedicalTab';
import { ArrowLeft, Edit2, Activity, GitBranch, Heart, Stethoscope } from 'lucide-react';

export const AnimalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [sire, setSire] = useState<Animal | null>(null);
  const [dam, setDam] = useState<Animal | null>(null);
  const [breedingLogs, setBreedingLogs] = useState<BreedingLog[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'medical'>('overview');

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (animalId: string) => {
    const a = await dbService.get<Animal>('animals', animalId);
    if (a) {
       setAnimal(a);
       if (a.sireId) setSire(await dbService.get<Animal>('animals', a.sireId) || null);
       if (a.damId) setDam(await dbService.get<Animal>('animals', a.damId) || null);
       const allLogs = await dbService.getAll<BreedingLog>('breeding_logs');
       setBreedingLogs(allLogs.filter(l => l.sireId === animalId || l.damId === animalId));
    }
  };

  const handleUpdate = async (data: Partial<Animal>) => {
     if (!animal) return;
     const updated = { ...animal, ...data, updatedAt: Date.now(), syncStatus: 'pending' as const };
     await dbService.put('animals', updated);
     loadData(animal.id);
     setShowEditor(false);
  };

  if (!animal) return <div className="p-8">Loading...</div>;

  const age = Math.floor((Date.now() - animal.dateOfBirth) / (1000 * 60 * 60 * 24 * 30)); 

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
       <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" onClick={() => navigate('/animals/list')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
             <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
             <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                {animal.name} 
                <span className="text-sm font-sans font-normal text-earth-500 bg-earth-100 dark:bg-stone-800 px-2 py-1 rounded-full uppercase tracking-wider">{animal.breed}</span>
             </h1>
          </div>
          <Button onClick={() => setShowMatchmaker(true)} icon={<Heart size={16} />} className="bg-pink-600 hover:bg-pink-700 border-pink-600 hidden md:flex">Find Mate</Button>
          <Button variant="outline" onClick={() => setShowEditor(true)} icon={<Edit2 size={16} />}>Edit</Button>
       </div>

       {/* Tab Navigation */}
       <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800 mb-6">
          <button 
             onClick={() => setActiveTab('overview')}
             className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
          >
             <Activity size={16}/> Overview
          </button>
          <button 
             onClick={() => setActiveTab('medical')}
             className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'medical' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
          >
             <Stethoscope size={16}/> Medical Records
          </button>
       </div>

       {activeTab === 'overview' ? (
           <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                 <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-earth-200 dark:border-stone-800 shadow-sm grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-earth-500 uppercase font-bold">Status</p><p className="font-bold text-lg capitalize">{animal.status}</p></div>
                    <div><p className="text-xs text-earth-500 uppercase font-bold">Age</p><p className="font-bold text-lg">{age} months</p></div>
                    <div><p className="text-xs text-earth-500 uppercase font-bold">Sex</p><p className="font-bold text-lg capitalize">{animal.sex}</p></div>
                    <div><p className="text-xs text-earth-500 uppercase font-bold">DOB</p><p className="font-bold text-lg">{new Date(animal.dateOfBirth).toLocaleDateString()}</p></div>
                 </div>

                 <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-earth-200 dark:border-stone-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-earth-900 dark:text-earth-100">
                       <GitBranch size={20} className="text-leaf-600" /> Lineage
                    </h3>
                    <div className="flex items-center gap-8 justify-center p-4 bg-earth-50 dark:bg-stone-800 rounded-xl">
                       <div className="text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-700 font-bold border-2 border-blue-200">S</div>
                          <p className="font-bold text-sm">{sire?.name || 'Unknown'}</p>
                       </div>
                       <div className="h-px w-16 bg-earth-300"></div>
                       <div className="text-center transform scale-110">
                          <div className="w-16 h-16 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-2 text-leaf-700 font-bold border-2 border-leaf-300 text-xl">{animal.name[0]}</div>
                          <p className="font-bold text-base">{animal.name}</p>
                       </div>
                       <div className="h-px w-16 bg-earth-300"></div>
                       <div className="text-center">
                          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-700 font-bold border-2 border-pink-200">D</div>
                          <p className="font-bold text-sm">{dam?.name || 'Unknown'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-earth-200 dark:border-stone-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-earth-900 dark:text-earth-100">
                       <Activity size={20} className="text-amber-600" /> Breeding History
                    </h3>
                    <div className="space-y-3">
                       {breedingLogs.length === 0 ? <p className="text-sm text-earth-500 italic">No records.</p> : breedingLogs.map(log => (
                          <div key={log.id} className="text-sm border-l-2 border-earth-200 pl-3 py-1">
                             <p className="font-bold">{new Date(log.matingDate).toLocaleDateString()}</p>
                             <p className="text-earth-600 capitalize">{log.status}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
       ) : (
           <AnimalMedicalTab animal={animal} />
       )}

       {showEditor && <AnimalEditorModal animal={animal} onSave={handleUpdate} onClose={() => setShowEditor(false)} />}
       {showMatchmaker && animal && <MatingRecommendationModal animal={animal} onClose={() => setShowMatchmaker(false)} />}
    </div>
  );
};
