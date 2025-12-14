
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { Sponsor, AdCampaign } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Search, Plus, Phone, Mail, AlertCircle, Eye, Edit2, CheckCircle2 } from 'lucide-react';
import { CreativeReviewModal } from '../../components/admin/CreativeReviewModal';

export const SponsorManager: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState<'lead'|'active'|'inactive'>('lead');
  
  const [reviewCampaign, setReviewCampaign] = useState<AdCampaign | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await dbService.getAll<Sponsor>('sponsors');
    const c = await dbService.getAll<AdCampaign>('campaigns');
    setSponsors(s);
    setCampaigns(c);
  };

  const handleOpenForm = (sponsor?: Sponsor) => {
      if (sponsor) {
          setEditingSponsor(sponsor);
          setNewName(sponsor.name);
          setNewEmail(sponsor.contactEmail);
          setNewStatus(sponsor.status);
      } else {
          setEditingSponsor(null);
          setNewName('');
          setNewEmail('');
          setNewStatus('lead');
      }
      setShowForm(true);
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const sponsor: Sponsor = {
          id: editingSponsor ? editingSponsor.id : crypto.randomUUID(),
          name: newName,
          contactName: editingSponsor ? editingSponsor.contactName : 'Primary Contact',
          contactEmail: newEmail,
          status: newStatus,
          createdAt: editingSponsor ? editingSponsor.createdAt : Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      
      await dbService.put('sponsors', sponsor);
      loadData();
      setShowForm(false);
  };

  const handleReviewComplete = async (campaign: AdCampaign, approved: boolean, feedback?: string) => {
      const updatedCreatives = campaign.creatives.map(c => ({
          ...c,
          approved: approved,
          rejectionReason: approved ? undefined : feedback
      }));

      const updatedCampaign: AdCampaign = {
          ...campaign,
          creatives: updatedCreatives,
          status: approved ? 'approved' : 'draft',
          syncStatus: 'pending'
      };

      await dbService.put('campaigns', updatedCampaign);
      setReviewCampaign(null);
      loadData();
  };

  const getPendingCount = (sponsorId: string) => {
      return campaigns.filter(c => c.sponsorId === sponsorId && c.status === 'reviewing').length;
  };

  const openFirstReview = (sponsorId: string) => {
      const camp = campaigns.find(c => c.sponsorId === sponsorId && c.status === 'reviewing');
      if (camp) setReviewCampaign(camp);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">Sponsor CRM</h3>
          <Button size="sm" onClick={() => handleOpenForm()} icon={<Plus size={16}/>}>New Lead</Button>
       </div>

       {showForm && (
           <form onSubmit={handleSaveSponsor} className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700 grid gap-4 md:grid-cols-4 items-end animate-in slide-in-from-top-2">
               <Input label="Company Name" value={newName} onChange={e => setNewName(e.target.value)} required />
               <Input label="Contact Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
               <Select label="Status" value={newStatus} onChange={e => setNewStatus(e.target.value as any)}>
                   <option value="lead">Lead</option>
                   <option value="active">Active (Approved)</option>
                   <option value="inactive">Inactive</option>
               </Select>
               <div className="flex gap-2">
                   <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                   <Button type="submit">{editingSponsor ? 'Update' : 'Create'}</Button>
               </div>
           </form>
       )}

       <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
             <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                <tr>
                   <th className="px-4 py-3">Company</th>
                   <th className="px-4 py-3">Contact</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3">Pending Reviews</th>
                   <th className="px-4 py-3 text-right">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                {sponsors.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-earth-400">No sponsors found.</td></tr>
                ) : sponsors.map(s => {
                   const pending = getPendingCount(s.id);
                   return (
                   <tr key={s.id} className="hover:bg-earth-50 dark:hover:bg-stone-800/50">
                      <td className="px-4 py-3 font-bold text-earth-900 dark:text-earth-100">{s.name}</td>
                      <td className="px-4 py-3 text-earth-600 dark:text-stone-400 flex flex-col">
                         <span className="flex items-center gap-1"><Mail size={12}/> {s.contactEmail}</span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {s.status}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                         {pending > 0 ? (
                             <button onClick={() => openFirstReview(s.id)} className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline">
                                 <AlertCircle size={14} /> {pending} Campaign{pending > 1 ? 's' : ''}
                             </button>
                         ) : (
                             <span className="text-earth-400 text-xs">None</span>
                         )}
                      </td>
                      <td className="px-4 py-3 text-right">
                         <div className="flex justify-end gap-2">
                             {s.status === 'lead' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleOpenForm(s)} icon={<CheckCircle2 size={12} />}>Review</Button>
                             )}
                             <Button size="sm" variant="ghost" onClick={() => handleOpenForm(s)} icon={<Edit2 size={14} />}>Edit</Button>
                         </div>
                      </td>
                   </tr>
                )})}
             </tbody>
          </table>
       </div>

       {reviewCampaign && (
           <CreativeReviewModal 
               campaign={reviewCampaign}
               onClose={() => setReviewCampaign(null)}
               onReview={handleReviewComplete}
           />
       )}
    </div>
  );
};
