

import React, { useEffect, useState } from 'react';
import { beekeepingService } from '../../services/beekeepingService';
import { Hive, HiveType, BeeBreed } from '../../types';
import { ApiaryMap } from '../../components/beekeeping/ApiaryMap';
import { HiveCard } from '../../components/beekeeping/HiveCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Plus, Hexagon, Map as MapIcon, List, Search, X, Droplets, Wind } from 'lucide-react';
import { HIVE_TYPES, BEE_BREEDS } from '../../constants';
import { useNavigate } from 'react-router-dom';

const AddHiveModal: React.FC<{ 
    onSave: (h: Partial<Hive>) => void; 
    onClose: () => void;
    initialCoords?: { x: number, y: number };
}> = ({ onSave, onClose, initialCoords }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<HiveType>('langstroth');
    const [breed, setBreed] = useState<BeeBreed>('italian');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            type,
            queenBreed: breed,
            installedDate: new Date(date).getTime(),
            status: 'active',
            location: initialCoords || { x: 50, y: 50 }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Add New Hive</h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Hive Name/ID" value={name} onChange={e => setName(e.target.value)} required autoFocus />
                    <Select label="Hive Type" value={type} onChange={e => setType(e.target.value as any)}>
                        {HIVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </Select>
                    <Select label="Queen Breed" value={breed} onChange={e => setBreed(e.target.value as any)}>
                        {BEE_BREEDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                    </Select>
                    <Input label="Install Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <Button type="submit" className="w-full mt-4">Create Hive</Button>
                </form>
            </div>
        </div>
    );
};

export const ApiaryDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
    const navigate = useNavigate();
    const [hives, setHives] = useState<Hive[]>([]);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [stats, setStats] = useState({ totalHives: 0, honeyYTD: 0 });
    const [showAddModal, setShowAddModal] = useState(false);
    const [mapAddMode, setMapAddMode] = useState(false);
    const [pendingCoords, setPendingCoords] = useState<{x:number, y:number} | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const h = await beekeepingService.getHives();
        const s = await beekeepingService.getApiaryStats();
        setHives(h);
        setStats(s);
    };

    const handleAddHive = async (data: Partial<Hive>) => {
        const hive: Hive = {
            id: crypto.randomUUID(),
            name: data.name!,
            type: data.type!,
            queenBreed: data.queenBreed!,
            installedDate: data.installedDate!,
            location: data.location || { x: 50, y: 50 },
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await beekeepingService.addHive(hive);
        loadData();
        setShowAddModal(false);
        setMapAddMode(false);
    };

    const handleMapPlace = (x: number, y: number) => {
        setPendingCoords({ x, y });
        setShowAddModal(true);
    };

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${embedded ? '' : 'pt-4'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                            <Hexagon className="text-amber-500" /> Apiary
                        </h1>
                        <p className="text-earth-600 dark:text-stone-400">Manage hives, inspections, and honey.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-earth-800 dark:text-earth-200">Colony Map</h2>
                <div className="flex gap-2">
                    <Button variant={viewMode === 'map' ? 'primary' : 'outline'} onClick={() => setViewMode('map')} icon={<MapIcon size={18}/>}>Map</Button>
                    <Button variant={viewMode === 'list' ? 'primary' : 'outline'} onClick={() => setViewMode('list')} icon={<List size={18}/>}>List</Button>
                    {viewMode === 'list' ? (
                        <Button onClick={() => setShowAddModal(true)} icon={<Plus size={18}/>}>Add Hive</Button>
                    ) : (
                        <Button 
                            onClick={() => setMapAddMode(!mapAddMode)} 
                            variant={mapAddMode ? 'secondary' : 'primary'}
                            className={mapAddMode ? 'ring-2 ring-amber-500' : ''}
                            icon={<Plus size={18}/>}
                        >
                            {mapAddMode ? 'Cancel Place' : 'Add Hive'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Active Hives</p>
                    <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">{stats.totalHives}</p>
                </Card>
                <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-bold text-yellow-800 dark:text-yellow-300 uppercase">Honey (YTD)</p>
                    <p className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">{stats.honeyYTD} <span className="text-sm font-sans font-normal opacity-70">lbs</span></p>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Wind size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Flight Conditions</span>
                    </div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Good Foraging</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-300">Temp > 55°F, Low Wind</p>
                </Card>
            </div>

            {viewMode === 'map' ? (
                <div className="space-y-4">
                    {mapAddMode && <p className="text-center text-sm font-bold text-amber-600 animate-pulse">Click on the map to place your new hive.</p>}
                    <ApiaryMap 
                        hives={hives} 
                        onHiveClick={(h) => navigate(`/apiary/hive/${h.id}`)}
                        onPlaceHive={mapAddMode ? handleMapPlace : undefined}
                        mode={mapAddMode ? 'add' : 'view'}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hives.map(hive => (
                        <HiveCard key={hive.id} hive={hive} onClick={() => navigate(`/apiary/hive/${hive.id}`)} />
                    ))}
                </div>
            )}

            {showAddModal && (
                <AddHiveModal 
                    onSave={handleAddHive} 
                    onClose={() => { setShowAddModal(false); setMapAddMode(false); }} 
                    initialCoords={pendingCoords}
                />
            )}
        </div>
    );
};