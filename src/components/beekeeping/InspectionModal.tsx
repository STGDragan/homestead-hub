
import React, { useState } from 'react';
import { HiveInspection } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Search } from 'lucide-react';

interface InspectionModalProps {
    hiveId: string;
    onSave: (log: HiveInspection) => void;
    onClose: () => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ hiveId, onSave, onClose }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [queenSeen, setQueenSeen] = useState(false);
    const [eggsSeen, setEggsSeen] = useState(false);
    const [broodPattern, setBroodPattern] = useState<'solid'|'spotty'|'none'>('solid');
    const [population, setPopulation] = useState<'low'|'medium'|'high'|'crowded'>('medium');
    const [temperament, setTemperament] = useState<'calm'|'nervous'|'aggressive'>('calm');
    const [stores, setStores] = useState<'low'|'medium'|'high'>('medium');
    const [miteCount, setMiteCount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const log: HiveInspection = {
            id: crypto.randomUUID(),
            hiveId,
            date: new Date(date).getTime(),
            queenSeen,
            eggsSeen,
            broodPattern,
            population,
            temperament,
            stores,
            miteCount: miteCount ? parseInt(miteCount) : undefined,
            notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        onSave(log);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Search className="text-amber-600" /> Hive Inspection
                    </h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-earth-50 dark:bg-stone-800 rounded-lg">
                            <span className="text-sm font-bold">Queen Seen?</span>
                            <input type="checkbox" checked={queenSeen} onChange={e => setQueenSeen(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-earth-50 dark:bg-stone-800 rounded-lg">
                            <span className="text-sm font-bold">Eggs Seen?</span>
                            <input type="checkbox" checked={eggsSeen} onChange={e => setEggsSeen(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Brood Pattern" value={broodPattern} onChange={e => setBroodPattern(e.target.value as any)}>
                            <option value="solid">Solid</option>
                            <option value="spotty">Spotty</option>
                            <option value="none">None</option>
                        </Select>
                        <Select label="Population" value={population} onChange={e => setPopulation(e.target.value as any)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="crowded">Crowded</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Temperament" value={temperament} onChange={e => setTemperament(e.target.value as any)}>
                            <option value="calm">Calm</option>
                            <option value="nervous">Nervous</option>
                            <option value="aggressive">Aggressive</option>
                        </Select>
                        <Select label="Honey Stores" value={stores} onChange={e => setStores(e.target.value as any)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </Select>
                    </div>

                    <Input label="Mite Count (Optional)" type="number" value={miteCount} onChange={e => setMiteCount(e.target.value)} placeholder="e.g. 3" />

                    <TextArea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observations..." />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Log Inspection</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
