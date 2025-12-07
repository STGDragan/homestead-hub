

import React, { useEffect, useState } from 'react';
import { orchardService } from '../../services/orchardService';
import { OrchardTree, TreeStatus, RootstockType } from '../../types';
import { OrchardMap } from '../../components/orchard/OrchardMap';
import { TreeCard } from '../../components/orchard/TreeCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Plus, TreeDeciduous, Map as MapIcon, List, Search, X, Upload, Image as ImageIcon } from 'lucide-react';
import { TREE_SPECIES, ROOTSTOCKS } from '../../constants';
import { useNavigate } from 'react-router-dom';

const AddTreeModal: React.FC<{ 
    onSave: (t: Partial<OrchardTree>) => void; 
    onClose: () => void;
    initialCoords?: { x: number, y: number };
}> = ({ onSave, onClose, initialCoords }) => {
    const [species, setSpecies] = useState('apple');
    const [variety, setVariety] = useState('');
    const [rootstock, setRootstock] = useState<RootstockType>('semi-dwarf');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [imagePreview, setImagePreview] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            species,
            variety,
            rootstock,
            plantedDate: new Date(date).getTime(),
            status: 'planted',
            location: initialCoords || { x: 50, y: 50 },
            imageUrl: imagePreview
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Plant New Tree</h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-earth-200 dark:border-stone-700 relative group cursor-pointer flex items-center justify-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Tree Preview" className="w-full h-full object-cover" />
                            ) : (
                                <TreeDeciduous size={32} className="text-earth-400" />
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <Upload size={20} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <span className="text-xs text-earth-500 mt-2">Add Photo</span>
                    </div>

                    <Select label="Species" value={species} onChange={e => setSpecies(e.target.value)}>
                        {TREE_SPECIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </Select>
                    <Input label="Variety" value={variety} onChange={e => setVariety(e.target.value)} placeholder="e.g. Honeycrisp" required />
                    <Select label="Rootstock" value={rootstock} onChange={e => setRootstock(e.target.value as any)}>
                        {ROOTSTOCKS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </Select>
                    <Input label="Planted Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <Button type="submit" className="w-full mt-4">Plant Tree</Button>
                </form>
            </div>
        </div>
    );
};

export const OrchardDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
    const navigate = useNavigate();
    const [trees, setTrees] = useState<OrchardTree[]>([]);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ totalTrees: 0, yieldYTD: 0 });
    const [showAddModal, setShowAddModal] = useState(false);
    const [mapAddMode, setMapAddMode] = useState(false);
    const [pendingCoords, setPendingCoords] = useState<{x:number, y:number} | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const t = await orchardService.getTrees();
        const s = await orchardService.getOrchardStats();
        setTrees(t);
        setStats(s);
    };

    const handleAddTree = async (data: Partial<OrchardTree>) => {
        const tree: OrchardTree = {
            id: crypto.randomUUID(),
            species: data.species!,
            variety: data.variety!,
            rootstock: data.rootstock || 'standard',
            plantedDate: data.plantedDate!,
            ageYears: 0,
            location: data.location || { x: 50, y: 50 },
            status: 'planted',
            imageUrl: data.imageUrl,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await orchardService.addTree(tree);
        loadData();
        setShowAddModal(false);
        setMapAddMode(false);
        setPendingCoords(undefined);
    };

    const handleMapPlace = (x: number, y: number) => {
        setPendingCoords({ x, y });
        setShowAddModal(true);
    };

    const filteredTrees = trees.filter(t => 
        t.variety.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.species.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${embedded ? '' : 'pt-4'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                            <TreeDeciduous className="text-leaf-700 dark:text-leaf-400" /> Orchard Manager
                        </h1>
                        <p className="text-earth-600 dark:text-stone-400">Map your trees and track harvests.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
               <h2 className="font-bold text-lg text-earth-800 dark:text-earth-200">Trees & Layout</h2>
               <div className="flex gap-2">
                    <Button variant={viewMode === 'map' ? 'primary' : 'outline'} onClick={() => setViewMode('map')} icon={<MapIcon size={18}/>}>Map</Button>
                    <Button variant={viewMode === 'list' ? 'primary' : 'outline'} onClick={() => setViewMode('list')} icon={<List size={18}/>}>List</Button>
                    {viewMode === 'list' ? (
                        <Button onClick={() => setShowAddModal(true)} icon={<Plus size={18}/>}>Add Tree</Button>
                    ) : (
                        <Button 
                            onClick={() => setMapAddMode(!mapAddMode)} 
                            variant={mapAddMode ? 'secondary' : 'primary'}
                            className={mapAddMode ? 'ring-2 ring-leaf-500' : ''}
                            icon={<Plus size={18}/>}
                        >
                            {mapAddMode ? 'Cancel Place' : 'Add Tree'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-leaf-50 dark:bg-leaf-900/10 border-leaf-200 dark:border-leaf-800">
                    <p className="text-xs font-bold text-leaf-800 dark:text-leaf-300 uppercase">Total Trees</p>
                    <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">{stats.totalTrees}</p>
                </Card>
                <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Yield (YTD)</p>
                    <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">{stats.yieldYTD} <span className="text-sm font-sans font-normal opacity-70">lbs</span></p>
                </Card>
            </div>

            {viewMode === 'map' ? (
                <div className="space-y-4">
                    {mapAddMode && <p className="text-center text-sm font-bold text-leaf-600 animate-pulse">Click on the map to place your new tree.</p>}
                    <OrchardMap 
                        trees={trees} 
                        onTreeClick={(t) => navigate(`/orchard/tree/${t.id}`)}
                        onPlaceTree={mapAddMode ? handleMapPlace : undefined}
                        mode={mapAddMode ? 'add' : 'view'}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        <Input 
                            placeholder="Search varieties..." 
                            icon={<Search size={18}/>}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTrees.map(tree => (
                            <TreeCard key={tree.id} tree={tree} onClick={() => navigate(`/orchard/tree/${tree.id}`)} />
                        ))}
                    </div>
                </div>
            )}

            {showAddModal && (
                <AddTreeModal 
                    onSave={handleAddTree} 
                    onClose={() => { setShowAddModal(false); setMapAddMode(false); }} 
                    initialCoords={pendingCoords}
                />
            )}
        </div>
    );
};