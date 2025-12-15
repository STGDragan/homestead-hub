
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { billingService } from '../../services/billingService';
import { Sponsor, AdCampaign, Invoice, AdCreative } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { User, LogIn, Upload, CreditCard, CheckCircle, AlertTriangle, Clock, Megaphone, Plus, Calendar, Image as ImageIcon, X } from 'lucide-react';

export const PartnerPortal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'billing'>('campaigns');
  
  // Request Form State
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const allSponsors = await dbService.getAll<Sponsor>('sponsors');
      const found = allSponsors.find(s => s.contactEmail.toLowerCase() === email.toLowerCase());
      
      if (found) {
          setSponsor(found);
          loadSponsorData(found.id);
      } else {
          alert("Sponsor email not found. Please contact admin.");
      }
      setLoading(false);
  };

  const loadSponsorData = async (sponsorId: string) => {
      const allCamps = await dbService.getAll<AdCampaign>('campaigns');
      setCampaigns(allCamps.filter(c => c.sponsorId === sponsorId).sort((a,b) => b.updatedAt - a.updatedAt));
      
      const invs = await billingService.getInvoices(sponsorId);
      setInvoices(invs);
  };

  const handleRequestCampaign = async (data: { title: string, startDate: string, endDate: string, image: string, link: string, text: string }) => {
      if (!sponsor) return;

      const creative: AdCreative = {
          id: crypto.randomUUID(),
          fileUrl: data.image,
          clickUrl: data.link,
          altText: data.text,
          format: 'banner',
          approved: false
      };

      const campaign: AdCampaign = {
          id: crypto.randomUUID(),
          sponsorId: sponsor.id,
          title: data.title,
          type: 'banner', // Default, admin can change
          placements: ['dashboard_main'], // Default request
          startDate: new Date(data.startDate).getTime(),
          endDate: new Date(data.endDate).getTime(),
          priority: 5,
          status: 'reviewing', // Directly to review
          priceCents: 0, // TBD by Admin
          billingModel: 'flat',
          creatives: [creative],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };

      await dbService.put('campaigns', campaign);
      await loadSponsorData(sponsor.id);
      setShowRequestForm(false);
      alert("Campaign requested! An admin will review your submission shortly.");
  };

  const handlePayInvoice = async (invId: string) => {
      setLoading(true);
      setTimeout(async () => {
          await billingService.payInvoice(invId);
          if(sponsor) loadSponsorData(sponsor.id);
          setLoading(false);
          alert("Payment Successful!");
      }, 1500);
  };

  if (!sponsor) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-earth-100 dark:bg-stone-950 p-4">
              <Card className="w-full max-w-md p-8">
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-leaf-100 dark:bg-leaf-900/20 text-leaf-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Megaphone size={32} />
                      </div>
                      <h1 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">Partner Portal</h1>
                      <p className="text-earth-500">Manage your campaigns and billing.</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <Input 
                          label="Contact Email" 
                          type="email" 
                          icon={<User size={18}/>} 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          required 
                          placeholder="partner@company.com"
                      />
                      <Button className="w-full" disabled={loading}>
                          {loading ? 'Verifying...' : 'Access Portal'} <LogIn size={18} />
                      </Button>
                  </form>
                  <p className="text-xs text-center text-earth-400 mt-4">
                      Don't have an account? Contact sales@homesteadhub.com
                  </p>
              </Card>
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-earth-50 dark:bg-stone-950 p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-xl shadow-sm border border-earth-200 dark:border-stone-800">
                  <div>
                      <h1 className="text-xl font-bold text-earth-900 dark:text-earth-100">{sponsor.name}</h1>
                      <p className="text-xs text-earth-500">{sponsor.contactName} • {sponsor.contactEmail}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSponsor(null)}>Sign Out</Button>
              </div>

              <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800 overflow-x-auto">
                  <button onClick={() => setActiveTab('campaigns')} className={`pb-3 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'campaigns' ? 'border-leaf-600 text-leaf-700' : 'border-transparent text-earth-500'}`}>My Campaigns</button>
                  <button onClick={() => setActiveTab('billing')} className={`pb-3 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'billing' ? 'border-leaf-600 text-leaf-700' : 'border-transparent text-earth-500'}`}>Invoices</button>
              </div>

              {activeTab === 'campaigns' && (
                  <div className="space-y-4">
                      <div className="flex justify-end">
                          <Button onClick={() => setShowRequestForm(true)} icon={<Plus size={16}/>}>Request Campaign</Button>
                      </div>

                      {campaigns.length === 0 ? (
                          <div className="text-center py-12 text-earth-400 border-2 border-dashed border-earth-200 dark:border-stone-800 rounded-xl">
                              No campaigns yet. Request one to get started!
                          </div>
                      ) : (
                          <div className="grid gap-4">
                              {campaigns.map(c => (
                                  <CampaignCard key={c.id} campaign={c} />
                              ))}
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'billing' && (
                  <div className="bg-white dark:bg-stone-900 rounded-xl border border-earth-200 dark:border-stone-800 overflow-hidden">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                              <tr>
                                  <th className="px-4 py-3">Date</th>
                                  <th className="px-4 py-3">Details</th>
                                  <th className="px-4 py-3">Amount</th>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                              {invoices.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-earth-400">No invoices.</td></tr> : invoices.map(inv => (
                                  <tr key={inv.id}>
                                      <td className="px-4 py-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                      <td className="px-4 py-3">{inv.notes || 'Ad Campaign'}</td>
                                      <td className="px-4 py-3 font-bold">${(inv.amountCents/100).toFixed(2)}</td>
                                      <td className="px-4 py-3">
                                          <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                              {inv.status}
                                          </span>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                          {inv.status !== 'paid' && (
                                              <Button size="sm" disabled={loading} onClick={() => handlePayInvoice(inv.id)}>Pay Now</Button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>

          {showRequestForm && (
              <RequestCampaignModal 
                  onClose={() => setShowRequestForm(false)} 
                  onSubmit={handleRequestCampaign} 
              />
          )}
      </div>
  );
};

const CampaignCard: React.FC<{ campaign: AdCampaign }> = ({ campaign }) => {
    const creative = campaign.creatives[0];

    return (
        <Card className="flex flex-col md:flex-row gap-6 p-6">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100">{campaign.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : campaign.status === 'reviewing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        {campaign.status}
                    </span>
                </div>
                <p className="text-sm text-earth-600 dark:text-stone-300 mb-4 flex items-center gap-2">
                    <Calendar size={14} /> 
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </p>

                {creative && creative.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-lg text-sm mb-4 border border-red-200 dark:border-red-900/50">
                        <p className="font-bold flex items-center gap-2"><AlertTriangle size={14}/> Action Needed</p>
                        <p>{creative.rejectionReason}</p>
                    </div>
                )}

                {creative && (
                    <div className="flex gap-4 items-start">
                        <div className="w-24 h-16 bg-earth-100 dark:bg-stone-800 rounded-lg overflow-hidden border border-earth-200 dark:border-stone-700 shrink-0">
                            {creative.fileUrl ? (
                                <img src={creative.fileUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-earth-400"><ImageIcon size={16}/></div>
                            )}
                        </div>
                        <div className="text-sm space-y-1 overflow-hidden">
                            <p className="truncate"><strong>Alt:</strong> {creative.altText}</p>
                            <p className="truncate text-blue-600 underline text-xs">{creative.clickUrl}</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

const RequestCampaignModal: React.FC<{ onClose: () => void, onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [link, setLink] = useState('');
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, startDate, endDate, link, text, image: imagePreview });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Request New Campaign</h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Campaign Name" placeholder="e.g. Spring Sale" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Desired Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        <Input label="Desired End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                    </div>

                    <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700">
                        <h4 className="font-bold text-sm text-earth-700 dark:text-earth-300 mb-3">Creative Asset</h4>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Banner Image</label>
                            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-earth-300 dark:border-stone-600 rounded-lg cursor-pointer bg-white dark:bg-stone-900 relative overflow-hidden group">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-earth-400">
                                        <Upload size={24} />
                                        <span className="text-xs mt-1">Click to upload</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} required={!imagePreview} />
                            </div>
                        </div>

                        <Input label="Target Link URL" placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} required />
                        <Input label="Ad Text / Description" placeholder="Short text..." value={text} onChange={e => setText(e.target.value)} required />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Submit Request</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
