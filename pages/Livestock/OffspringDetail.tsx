
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { livestockAI } from '../../services/livestockAI';
import { Offspring, GrowthLog, PedigreeNode } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GrowthChart } from '../../components/livestock/GrowthChart';
import { PedigreeTree } from '../../components/livestock/PedigreeTree';
import { OffspringModal } from '../../components/livestock/OffspringModal';
import { ArrowLeft, Scale, GitBranch, Edit2 } from 'lucide-react';

export const OffspringDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offspring, setOffspring] = useState<Offspring | null>(null);
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>([]);
  const [pedigree, setPedigree] = useState<PedigreeNode | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (oid: string) => {
    const o = await dbService.get<Offspring>('offspring', oid);
    if (o) {
       setOffspring(o);
       const logs = await dbService.getAllByIndex<GrowthLog>('growth_logs', 'offspringId', oid);
       setGrowthLogs(logs);
       
       const tree = await livestockAI.buildPedigree(oid);
       setPedigree(tree);
    }
  };

  const handleUpdate = async (data: Partial<Offspring>) => {
     if (!offspring) return;
     const updated = { ...offspring, ...data, updatedAt: Date.now(), syncStatus: 'pending' as const };
     await dbService.put('offspring', updated);
     loadData(offspring.id);
     setShowEditor(false);
  };

  const handleAddWeight = async () => {
     const weight = prompt("Enter weight:");
     if (weight && offspring) {
        const log: GrowthLog = {
           id: crypto.randomUUID(),
           offspringId: offspring.id,
           date: Date.now(),
           weight: parseFloat(weight),
           unit: 'lb', // Default for demo
           createdAt: Date.now(),
           updatedAt: Date.now(),
           syncStatus: 'pending'
        };
        await dbService.put('growth_logs', log);
        loadData(offspring.id);
     }
  };

  if (!offspring) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
       <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/animals/offspring')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
             <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
             <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">
                {offspring.name || 'Unnamed Offspring'}
             </h1>
             <p className="text-earth-500 capitalize">{offspring.species} • {offspring.sex}</p>
          </div>
          <Button variant="outline" onClick={() => setShowEditor(true)} icon={<Edit2 size={16} />}>Edit</Button>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
          {/* Growth Card */}
          <Card>
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-earth-900 dark:text-earth-100">
                   <Scale size={20} className="text-leaf-600" /> Growth Curve
                </h3>
                <Button size="sm" onClick={handleAddWeight}>Log Weight</Button>
             </div>
             <GrowthChart logs={growthLogs} />
          </Card>

          {/* Pedigree Card */}
          <Card>
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-earth-900 dark:text-earth-100">
                <GitBranch size={20} className="text-amber-600" /> Lineage
             </h3>
             <div className="bg-earth-50 dark:bg-stone-800 rounded-xl p-4 overflow-hidden">
                <PedigreeTree node={pedigree} />
             </div>
          </Card>
       </div>

       {showEditor && (
          <OffspringModal 
             offspring={offspring}
             onSave={handleUpdate}
             onClose={() => setShowEditor(false)}
          />
       )}
    </div>
  );
};
