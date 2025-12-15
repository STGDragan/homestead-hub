
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { AdCampaign, Sponsor } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, PlayCircle, PauseCircle, Trash2 } from 'lucide-react';

export const CampaignBuilder: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form
  const [title, setTitle] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [price, setPrice] = useState('500');

  useEffect(() => {
    Promise.all([
        dbService.getAll<AdCampaign>('campaigns'),
        dbService.getAll<Sponsor>('sponsors')
    ]).then(([c, s]) => {
        setCampaigns(c);
        setSponsors(s);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      const camp: AdCampaign = {
          id: crypto.randomUUID(),
          sponsorId,
          title,
          type: 'banner', // Default type
          placements: ['dashboard_main'],
          startDate: Date.now(),
          endDate: Date.now() + 2592000000, // 30 days
          priority: 5,
          status: 'draft',
          priceCents: parseInt(price) * 100,
          billingModel: 'flat',
          creatives: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('campaigns', camp);
      setCampaigns([...campaigns, camp]);
      setShowForm(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">Ad Campaigns</h3>
          <Button size="sm" onClick={() => setShowForm(!showForm)} icon={<Plus size={16}/>}>New Campaign</Button>
       </div>

       {showForm && (
           <form onSubmit={handleCreate} className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                   <Input label="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} required />
                   <Select label="Sponsor" value={sponsorId} onChange={e => setSponsorId(e.target.value)} required>
                       <option value="">Select Sponsor...</option>
                       {sponsors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <Input label="Price ($)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                   <div className="flex items-end">
                       <Button type="submit" className="w-full">Create Draft</Button>
                   </div>
               </div>
           </form>
       )}

       <div className="space-y-3">
          {campaigns.map(c => (
             <div key={c.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm flex justify-between items-center">
                <div>
                   <h4 className="font-bold text-earth-900 dark:text-earth-100">{c.title}</h4>
                   <p className="text-xs text-earth-500">{sponsors.find(s => s.id === c.sponsorId)?.name || 'Unknown Sponsor'} • ${c.priceCents / 100}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                   <Button size="sm" variant="ghost"><Trash2 size={16}/></Button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};
