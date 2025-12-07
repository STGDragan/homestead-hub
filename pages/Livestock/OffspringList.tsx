
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { Offspring } from '../../types';
import { Button } from '../../components/ui/Button';
import { OffspringModal } from '../../components/livestock/OffspringModal';
import { Plus, ArrowLeft, Baby, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OffspringList: React.FC = () => {
  const navigate = useNavigate();
  const [offspring, setOffspring] = useState<Offspring[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'sold'>('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dbService.getAll<Offspring>('offspring');
    setOffspring(data.sort((a, b) => b.dateOfBirth - a.dateOfBirth));
  };

  const handleSave = async (data: Partial<Offspring>) => {
    const record: Offspring = {
       id: data.id || crypto.randomUUID(),
       name: data.name,
       species: data.species!,
       dateOfBirth: data.dateOfBirth!,
       sex: data.sex!,
       status: data.status!,
       sireId: data.sireId,
       damId: data.damId,
       birthWeight: data.birthWeight,
       birthNotes: data.birthNotes,
       createdAt: data.createdAt || Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };
    await dbService.put('offspring', record);
    loadData();
    setShowModal(false);
  };

  const filtered = offspring.filter(o => {
     if (activeFilter === 'all') return true;
     if (activeFilter === 'active') return ['active', 'retained'].includes(o.status);
     return !['active', 'retained'].includes(o.status);
  });

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={() => navigate('/animals')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h1 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">Offspring & Nursery</h1>
                <p className="text-earth-600 dark:text-stone-400 text-sm">Track births, growth rates, and sales.</p>
             </div>
          </div>
          <Button onClick={() => setShowModal(true)} icon={<Plus size={18}/>}>Log Birth</Button>
       </div>

       <div className="flex gap-2">
          {['active', 'sold', 'all'].map(f => (
             <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${activeFilter === f ? 'bg-earth-800 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}
             >
                {f} ({offspring.filter(o => f === 'all' ? true : f === 'active' ? ['active', 'retained'].includes(o.status) : !['active', 'retained'].includes(o.status)).length})
             </button>
          ))}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
             <div 
                key={item.id} 
                onClick={() => navigate(`/animals/offspring/${item.id}`)}
                className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
             >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-leaf-50 dark:bg-leaf-900/20 rounded-full flex items-center justify-center text-leaf-600">
                         <Baby size={20} />
                      </div>
                      <div>
                         <h3 className="font-bold text-earth-900 dark:text-earth-100 group-hover:text-leaf-700 transition-colors">
                            {item.name || 'Unnamed'}
                         </h3>
                         <p className="text-xs text-earth-500 dark:text-stone-400 capitalize">{item.species} • {item.sex}</p>
                      </div>
                   </div>
                   <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {item.status}
                   </span>
                </div>
                <div className="mt-2 text-xs text-earth-500 dark:text-stone-400 flex items-center gap-2">
                   <Tag size={12} />
                   <span>Born: {new Date(item.dateOfBirth).toLocaleDateString()}</span>
                </div>
             </div>
          ))}
       </div>

       {showModal && (
          <OffspringModal onSave={handleSave} onClose={() => setShowModal(false)} />
       )}
    </div>
  );
};
