
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { Sponsor } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Plus, Phone, Mail } from 'lucide-react';

export const SponsorManager: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    dbService.getAll<Sponsor>('sponsors').then(setSponsors);
  }, []);

  const handleAddSponsor = async (e: React.FormEvent) => {
      e.preventDefault();
      const sponsor: Sponsor = {
          id: crypto.randomUUID(),
          name: newName,
          contactName: 'Primary Contact',
          contactEmail: newEmail,
          status: 'lead',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('sponsors', sponsor);
      setSponsors([...sponsors, sponsor]);
      setShowForm(false);
      setNewName('');
      setNewEmail('');
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">Sponsor CRM</h3>
          <Button size="sm" onClick={() => setShowForm(!showForm)} icon={<Plus size={16}/>}>New Lead</Button>
       </div>

       {showForm && (
           <form onSubmit={handleAddSponsor} className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700 grid gap-4 md:grid-cols-3 items-end">
               <Input label="Company Name" value={newName} onChange={e => setNewName(e.target.value)} required />
               <Input label="Contact Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
               <Button type="submit">Create Sponsor</Button>
           </form>
       )}

       <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
             <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                <tr>
                   <th className="px-4 py-3">Company</th>
                   <th className="px-4 py-3">Contact</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3 text-right">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                {sponsors.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-earth-400">No sponsors found.</td></tr>
                ) : sponsors.map(s => (
                   <tr key={s.id}>
                      <td className="px-4 py-3 font-bold">{s.name}</td>
                      <td className="px-4 py-3 text-earth-600 dark:text-stone-400 flex flex-col">
                         <span className="flex items-center gap-1"><Mail size={12}/> {s.contactEmail}</span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {s.status}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                         <Button size="sm" variant="ghost">Edit</Button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};
