
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { billingService } from '../../services/billingService';
import { AdCampaign, Sponsor, CampaignType, AdStatus, AdCreative, AdEvent } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Plus, Search, Filter, PlayCircle, PauseCircle, Trash2, Eye, MousePointer2, Image as ImageIcon, CheckCircle, XCircle, FileText, Check } from 'lucide-react';
import { AD_PLACEMENT_AREAS, CAMPAIGN_TYPES } from '../../constants';
import { CreativeReviewModal } from '../../components/admin/CreativeReviewModal';

// --- Components ---

const CampaignList: React.FC<{ 
    campaigns: AdCampaign[]; 
    sponsors: Sponsor[]; 
    onEdit: (c: AdCampaign) => void; 
    onToggleStatus: (c: AdCampaign) => void;
    onReview: (c: AdCampaign) => void;
    onInvoice: (c: AdCampaign) => void;
}> = ({ campaigns, sponsors, onEdit, onToggleStatus, onReview, onInvoice }) => {
    return (
        <div className="bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Campaign</th>
                        <th className="px-4 py-3">Sponsor</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Dates</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-stone-800">
                    {campaigns.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-earth-400">No campaigns found.</td></tr>
                    ) : campaigns.map(c => (
                        <tr key={c.id} className="hover:bg-earth-50 dark:hover:bg-stone-800/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-earth-900 dark:text-earth-100">{c.title}</td>
                            <td className="px-4 py-3 text-earth-600 dark:text-stone-400">
                                {sponsors.find(s => s.id === c.sponsorId)?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3">
                                <span className="bg-earth-100 dark:bg-stone-800 px-2 py-1 rounded text-xs font-mono">{c.type}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-800' : c.status === 'reviewing' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-earth-500">
                                {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                {c.status === 'reviewing' && (
                                    <Button size="sm" className="h-7 text-xs px-2" onClick={() => onReview(c)}>Review</Button>
                                )}
                                {c.status === 'approved' && (
                                    <Button size="sm" variant="secondary" className="h-7 text-xs px-2" onClick={() => onInvoice(c)}>Bill</Button>
                                )}
                                {c.status === 'active' || c.status === 'paused' ? (
                                    <button onClick={() => onToggleStatus(c)} className="text-earth-400 hover:text-leaf-600">
                                        {c.status === 'active' ? <PauseCircle size={16}/> : <PlayCircle size={16}/>}
                                    </button>
                                ) : null}
                                <button onClick={() => onEdit(c)} className="text-earth-400 hover:text-earth-700 font-bold text-xs ml-2">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CampaignEditor: React.FC<{
    campaign?: AdCampaign;
    sponsors: Sponsor[];
    onSave: (c: AdCampaign) => void;
    onCancel: () => void;
}> = ({ campaign, sponsors, onSave, onCancel }) => {
    // Form State
    const [title, setTitle] = useState(campaign?.title || '');
    const [sponsorId, setSponsorId] = useState(campaign?.sponsorId || (sponsors[0]?.id || ''));
    const [type, setType] = useState<CampaignType>(campaign?.type || 'banner');
    const [placements, setPlacements] = useState<string[]>(campaign?.placements || []);
    const [startDate, setStartDate] = useState(campaign?.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(campaign?.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '');
    const [priority, setPriority] = useState(campaign?.priority?.toString() || '3');
    const [price, setPrice] = useState(campaign?.priceCents ? (campaign.priceCents / 100).toString() : '500');
    
    // Creative State
    const [creativeUrl, setCreativeUrl] = useState(campaign?.creatives?.[0]?.fileUrl || '');
    const [targetUrl, setTargetUrl] = useState(campaign?.creatives?.[0]?.clickUrl || '');
    const [altText, setAltText] = useState(campaign?.creatives?.[0]?.altText || '');

    const handlePlacementToggle = (id: string) => {
        if (placements.includes(id)) {
            setPlacements(placements.filter(p => p !== id));
        } else {
            setPlacements([...placements, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const creative: AdCreative = {
            id: campaign?.creatives?.[0]?.id || crypto.randomUUID(),
            fileUrl: creativeUrl,
            clickUrl: targetUrl,
            altText,
            format: 'card', 
            approved: campaign?.creatives?.[0]?.approved || false // Reset approval on edit unless already approved? Keeping simple.
        };

        const newCampaign: AdCampaign = {
            id: campaign?.id || crypto.randomUUID(),
            sponsorId,
            title,
            type,
            placements,
            startDate: new Date(startDate).getTime(),
            endDate: endDate ? new Date(endDate).getTime() : Date.now() + 2592000000,
            priority: parseInt(priority),
            status: campaign?.status || 'draft',
            priceCents: parseFloat(price) * 100,
            billingModel: 'flat',
            creatives: [creative],
            createdAt: campaign?.createdAt || Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        onSave(newCampaign);
    };

    return (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-earth-200 dark:border-stone-800">
            <h2 className="text-xl font-bold mb-6 text-earth-900 dark:text-earth-100">{campaign ? 'Edit Campaign' : 'New Campaign'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basics */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <Select label="Sponsor" value={sponsorId} onChange={e => setSponsorId(e.target.value)} required>
                        <option value="">Select Sponsor...</option>
                        {sponsors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>

                {/* Configuration */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Select label="Ad Type" value={type} onChange={e => setType(e.target.value as CampaignType)}>
                        {CAMPAIGN_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </Select>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase">Target Placements</label>
                        <div className="flex flex-wrap gap-2">
                            {AD_PLACEMENT_AREAS.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handlePlacementToggle(p.id)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${placements.includes(p.id) ? 'bg-leaf-600 text-white border-leaf-600' : 'bg-white dark:bg-stone-800 text-earth-600 dark:text-stone-300 border-earth-300 dark:border-stone-600'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Schedule & Priority */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <Input label="Priority (1-10)" type="number" min="1" max="10" value={priority} onChange={e => setPriority(e.target.value)} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Price ($)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                </div>

                {/* Creative Assets */}
                <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700">
                    <h3 className="font-bold text-sm text-earth-700 dark:text-earth-300 mb-3 flex items-center gap-2">
                        <ImageIcon size={16}/> Creative Asset
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Input label="Image URL" placeholder="https://..." value={creativeUrl} onChange={e => setCreativeUrl(e.target.value)} />
                            <Input label="Target URL" placeholder="https://sponsor.com" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} />
                            <Input label="Alt Text" placeholder="Ad description" value={altText} onChange={e => setAltText(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-lg border-2 border-dashed border-earth-300 dark:border-stone-600 min-h-[150px]">
                            {creativeUrl ? (
                                <img src={creativeUrl} alt="Preview" className="max-h-40 object-contain" />
                            ) : (
                                <p className="text-xs text-earth-400">Image Preview</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-earth-200 dark:border-stone-800">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Campaign</Button>
                </div>
            </form>
        </div>
    );
};

const CampaignAnalytics: React.FC<{ campaignId?: string }> = ({ campaignId }) => {
    // Mock Data
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-earth-500 uppercase">Impressions</p>
                        <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">12,450</p>
                    </div>
                    <Eye size={20} className="text-blue-500" />
                </div>
            </Card>
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-earth-500 uppercase">Clicks</p>
                        <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">342</p>
                    </div>
                    <MousePointer2 size={20} className="text-green-500" />
                </div>
            </Card>
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-earth-500 uppercase">CTR</p>
                        <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">2.75%</p>
                    </div>
                    <div className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">+0.4%</div>
                </div>
            </Card>
        </div>
    );
};

// --- Main Page ---

export const CampaignManager: React.FC = () => {
    const [view, setView] = useState<'list' | 'editor' | 'analytics'>('list');
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [editingCampaign, setEditingCampaign] = useState<AdCampaign | undefined>(undefined);
    
    // Modals
    const [reviewCampaign, setReviewCampaign] = useState<AdCampaign | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const c = await dbService.getAll<AdCampaign>('campaigns');
        const s = await dbService.getAll<Sponsor>('sponsors');
        setCampaigns(c.sort((a,b) => b.updatedAt - a.updatedAt));
        setSponsors(s);
    };

    const handleSave = async (campaign: AdCampaign) => {
        await dbService.put('campaigns', campaign);
        await loadData();
        setView('list');
        setEditingCampaign(undefined);
    };

    const handleToggleStatus = async (campaign: AdCampaign) => {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        const updated = { ...campaign, status: newStatus, syncStatus: 'pending' as const };
        await dbService.put('campaigns', updated);
        await loadData();
    };

    const handleInvoice = async (campaign: AdCampaign) => {
        if (confirm(`Generate invoice for $${(campaign.priceCents/100).toFixed(2)}?`)) {
            await billingService.createInvoice(campaign.sponsorId, campaign.id, campaign.priceCents, `Campaign: ${campaign.title}`);
            const updated = { ...campaign, status: 'active' as const, syncStatus: 'pending' as const };
            await dbService.put('campaigns', updated);
            await loadData();
            alert("Invoice generated & Campaign Activated!");
        }
    };

    const handleReviewComplete = async (campaign: AdCampaign, approved: boolean, feedback?: string) => {
        // Update Creatives
        const updatedCreatives = campaign.creatives.map(c => ({
            ...c,
            approved: approved,
            rejectionReason: approved ? undefined : feedback
        }));

        const updatedCampaign: AdCampaign = {
            ...campaign,
            creatives: updatedCreatives,
            status: approved ? 'approved' : 'draft', // Send back to draft if rejected
            syncStatus: 'pending'
        };

        await dbService.put('campaigns', updatedCampaign);
        setReviewCampaign(null);
        await loadData();
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setView('list')} 
                        className={`font-bold text-sm ${view === 'list' ? 'text-leaf-700 border-b-2 border-leaf-700' : 'text-earth-500'}`}
                    >
                        All Campaigns
                    </button>
                    <button 
                        onClick={() => setView('analytics')} 
                        className={`font-bold text-sm ${view === 'analytics' ? 'text-leaf-700 border-b-2 border-leaf-700' : 'text-earth-500'}`}
                    >
                        Analytics
                    </button>
                </div>
                {view === 'list' && (
                    <Button size="sm" onClick={() => { setEditingCampaign(undefined); setView('editor'); }} icon={<Plus size={16}/>}>
                        New Campaign
                    </Button>
                )}
            </div>

            {/* Content */}
            {view === 'list' && (
                <CampaignList 
                    campaigns={campaigns} 
                    sponsors={sponsors} 
                    onEdit={(c) => { setEditingCampaign(c); setView('editor'); }}
                    onToggleStatus={handleToggleStatus}
                    onReview={setReviewCampaign}
                    onInvoice={handleInvoice}
                />
            )}

            {view === 'editor' && (
                <CampaignEditor 
                    campaign={editingCampaign} 
                    sponsors={sponsors}
                    onSave={handleSave} 
                    onCancel={() => { setView('list'); setEditingCampaign(undefined); }}
                />
            )}

            {view === 'analytics' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Select className="w-48">
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </Select>
                    </div>
                    <CampaignAnalytics />
                    <div className="p-12 text-center bg-earth-50 rounded-xl border border-dashed border-earth-200 text-earth-400 italic">
                        Detailed reporting charts placeholder.
                    </div>
                </div>
            )}

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
