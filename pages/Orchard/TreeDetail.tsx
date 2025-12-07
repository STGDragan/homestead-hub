

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orchardService } from '../../services/orchardService';
import { OrchardTree, TreeLog, TreeYield } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TreeEventModal } from '../../components/orchard/TreeEventModal';
import { HarvestEntryModal } from '../../components/orchard/HarvestEntryModal';
import { ArrowLeft, Activity, ShoppingBasket, History, Trash2, Edit2 } from 'lucide-react';

export const TreeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tree, setTree] = useState<OrchardTree | null>(null);
    const [logs, setLogs] = useState<TreeLog[]>([]);
    const [yields, setYields] = useState<TreeYield[]>([]);
    const [activeTab, setActiveTab] = useState<'timeline' | 'harvest'>('timeline');
    
    // Modals
    const [showLogModal, setShowLogModal] = useState(false);
    const [showHarvestModal, setShowHarvestModal] = useState(false);

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (treeId: string) => {
        const t = await orchardService.getTree(treeId);
        if (t) {
            setTree(t);
            setLogs(await orchardService.getLogs(treeId));
            setYields(await orchardService.getYields(treeId));
        }
    };

    const handleDelete = async () => {
        if (tree && confirm("Are you sure you want to remove this tree?")) {
            await orchardService.deleteTree(tree.id);
            navigate('/garden'); // Go back to garden dashboard
        }
    };

    const handleSaveLog = async (log: TreeLog) => {
        await orchardService.addLog(log);
        if (tree) loadData(tree.id);
        setShowLogModal(false);
    };

    const handleSaveHarvest = async (y: TreeYield) => {
        await orchardService.addYield(y);
        if (tree) loadData(tree.id);
        setShowHarvestModal(false);
    };

    if (!tree) return <div className="p-8">Loading...</div>;

    const totalYield = yields.reduce((acc, curr) => acc + curr.weight, 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/garden')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        {tree.variety} <span className="text-sm font-sans font-normal text-earth-500 bg-earth-100 dark:bg-stone-800 px-2 py-1 rounded-full uppercase tracking-wider">{tree.species}</span>
                    </h1>
                    <p className="text-earth-500 text-sm">Planted {new Date(tree.plantedDate).getFullYear()} • {tree.rootstock} rootstock</p>
                </div>
                <Button variant="ghost" className="text-red-500" onClick={handleDelete}><Trash2 size={18}/></Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-4 bg-earth-50 dark:bg-stone-800 border-earth-200 dark:border-stone-700">
                        <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-4">Tree Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-earth-500">Status</span>
                                <span className="font-bold capitalize">{tree.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-earth-500">Age</span>
                                <span className="font-bold">{new Date().getFullYear() - new Date(tree.plantedDate).getFullYear()} years</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-earth-500">Lifetime Yield</span>
                                <span className="font-bold">{totalYield.toFixed(1)} lbs</span>
                            </div>
                        </div>
                    </Card>
                    
                    <Button className="w-full" onClick={() => setShowLogModal(true)} icon={<Activity size={16}/>}>Log Event</Button>
                    <Button variant="secondary" className="w-full" onClick={() => setShowHarvestModal(true)} icon={<ShoppingBasket size={16}/>}>Log Harvest</Button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2">
                    <div className="flex gap-4 border-b border-earth-200 dark:border-stone-800 mb-4">
                        <button 
                            onClick={() => setActiveTab('timeline')}
                            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'timeline' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
                        >
                            <History size={16}/> Timeline
                        </button>
                        <button 
                            onClick={() => setActiveTab('harvest')}
                            className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'harvest' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-stone-500 hover:text-earth-800'}`}
                        >
                            <ShoppingBasket size={16}/> Harvests
                        </button>
                    </div>

                    {activeTab === 'timeline' && (
                        <div className="space-y-4 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-earth-200 dark:before:bg-stone-800">
                            {logs.length === 0 && <p className="pl-8 text-earth-400 italic">No logs recorded.</p>}
                            {logs.map(log => (
                                <div key={log.id} className="relative pl-10">
                                    <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-leaf-100 border-2 border-leaf-500 z-10"></div>
                                    <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-earth-200 dark:border-stone-800 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-leaf-700 dark:text-leaf-400">{log.type.replace('_', ' ')}</span>
                                            <span className="text-xs text-earth-400">{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-earth-800 dark:text-stone-200">{log.notes}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'harvest' && (
                        <div className="space-y-3">
                            {yields.length === 0 && <p className="text-earth-400 italic text-center py-8">No harvests recorded.</p>}
                            {yields.map(y => (
                                <div key={y.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-earth-900 dark:text-earth-100">{new Date(y.harvestDate).toLocaleDateString()}</p>
                                        <p className="text-xs text-earth-500">{y.notes || 'No notes'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-lg text-leaf-700 dark:text-leaf-400">{y.weight} {y.unit}</span>
                                        <span className="text-[10px] uppercase font-bold bg-earth-100 dark:bg-stone-800 px-2 py-0.5 rounded text-earth-600">{y.quality}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showLogModal && (
                <TreeEventModal treeId={tree.id} onSave={handleSaveLog} onClose={() => setShowLogModal(false)} />
            )}

            {showHarvestModal && (
                <HarvestEntryModal treeId={tree.id} onSave={handleSaveHarvest} onClose={() => setShowHarvestModal(false)} />
            )}
        </div>
    );
};