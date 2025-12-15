

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { beekeepingService } from '../../services/beekeepingService';
import { Hive, HiveInspection, HiveProduction } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InspectionModal } from '../../components/beekeeping/InspectionModal';
import { HoneyHarvestModal } from '../../components/beekeeping/HoneyHarvestModal';
import { ArrowLeft, Search, Droplets, History, Activity, AlertTriangle } from 'lucide-react';
import { beekeepingAI } from '../../services/beekeepingAI';

export const HiveDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [hive, setHive] = useState<Hive | null>(null);
    const [inspections, setInspections] = useState<HiveInspection[]>([]);
    const [production, setProduction] = useState<HiveProduction[]>([]);
    const [activeTab, setActiveTab] = useState<'inspections' | 'production'>('inspections');
    const [healthStatus, setHealthStatus] = useState<{ status: string, message: string } | null>(null);

    // Modals
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [showHarvestModal, setShowHarvestModal] = useState(false);

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (hiveId: string) => {
        const h = await beekeepingService.getHive(hiveId);
        if (h) {
            setHive(h);
            const i = await beekeepingService.getInspections(hiveId);
            setInspections(i);
            const p = await beekeepingService.getProduction(hiveId);
            setProduction(p);
            
            setHealthStatus(beekeepingAI.analyzeHealth(h, i));
        }
    };

    const handleSaveInspection = async (log: HiveInspection) => {
        await beekeepingService.addInspection(log);
        if (hive) loadData(hive.id);
        setShowInspectionModal(false);
    };

    const handleSaveHarvest = async (prod: HiveProduction) => {
        await beekeepingService.addProduction(prod);
        if (hive) loadData(hive.id);
        setShowHarvestModal(false);
    };

    if (!hive) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/animals')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        {hive.name} <span className="text-sm font-sans font-normal text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full uppercase tracking-wider">{hive.type.replace('_',' ')}</span>
                    </h1>
                    <p className="text-earth-500 text-sm">{hive.queenBreed} Queen • Installed {new Date(hive.installedDate).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card className={`p-4 border-l-4 ${healthStatus?.status === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : healthStatus?.status === 'at_risk' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'border-green-500 bg-green-50 dark:bg-green-900/10'}`}>
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Activity size={20} /> Health Status
                        </h3>
                        <p className="text-sm font-medium">{healthStatus?.message}</p>
                    </Card>

                    <Button className="w-full" onClick={() => setShowInspectionModal(true)} icon={<Search size={16}/>}>Log Inspection</Button>
                    <Button variant="secondary" className="w-full" onClick={() => setShowHarvestModal(true)} icon={<Droplets size={16}/>}>Log Harvest</Button>
                </div>

                <div className="md:col-span-2">
                    <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800 mb-4">
                        <button 
                            onClick={() => setActiveTab('inspections')}
                            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inspections' ? 'border-amber-500 text-amber-700 dark:text-amber-400' : 'border-transparent text-earth-500 dark:text-stone-500'}`}
                        >
                            <History size={16}/> Inspections
                        </button>
                        <button 
                            onClick={() => setActiveTab('production')}
                            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'production' ? 'border-amber-500 text-amber-700 dark:text-amber-400' : 'border-transparent text-earth-500 dark:text-stone-500'}`}
                        >
                            <Droplets size={16}/> Production
                        </button>
                    </div>

                    {activeTab === 'inspections' && (
                        <div className="space-y-3">
                            {inspections.length === 0 && <p className="text-earth-400 italic text-center py-8">No inspections yet.</p>}
                            {inspections.map(log => (
                                <div key={log.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-earth-900 dark:text-earth-100">{new Date(log.date).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            {log.queenSeen && <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">Queen Seen</span>}
                                            {log.eggsSeen && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Eggs Seen</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-earth-500 mb-2">
                                        <span>Pop: <strong>{log.population}</strong></span>
                                        <span>Brood: <strong>{log.broodPattern}</strong></span>
                                        <span>Mood: <strong>{log.temperament}</strong></span>
                                    </div>
                                    {log.notes && <p className="text-sm text-earth-700 dark:text-stone-300 bg-earth-50 dark:bg-stone-800 p-2 rounded">{log.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'production' && (
                        <div className="space-y-3">
                            {production.length === 0 && <p className="text-earth-400 italic text-center py-8">No harvests yet.</p>}
                            {production.map(prod => (
                                <div key={prod.id} className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm">
                                    <div>
                                        <p className="font-bold text-earth-900 dark:text-earth-100 capitalize">{prod.product}</p>
                                        <p className="text-xs text-earth-500">{new Date(prod.date).toLocaleDateString()} {prod.batchCode ? `• Batch ${prod.batchCode}` : ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-lg text-amber-600">{prod.quantity} {prod.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showInspectionModal && (
                <InspectionModal hiveId={hive.id} onSave={handleSaveInspection} onClose={() => setShowInspectionModal(false)} />
            )}

            {showHarvestModal && (
                <HoneyHarvestModal hiveId={hive.id} onSave={handleSaveHarvest} onClose={() => setShowHarvestModal(false)} />
            )}
        </div>
    );
};