
import React, { useState } from 'react';
import { TreeYield } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, ShoppingBasket } from 'lucide-react';
import { MEASUREMENT_UNITS } from '../../constants';

interface HarvestEntryModalProps {
    treeId: string;
    onSave: (y: TreeYield) => void;
    onClose: () => void;
}

export const HarvestEntryModal: React.FC<HarvestEntryModalProps> = ({ treeId, onSave, onClose }) => {
    const [weight, setWeight] = useState('');
    const [unit, setUnit] = useState('lb');
    const [quality, setQuality] = useState<'excellent'|'good'|'fair'|'poor'>('good');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const y: TreeYield = {
            id: crypto.randomUUID(),
            treeId,
            harvestDate: new Date(date).getTime(),
            weight: parseFloat(weight),
            unit,
            quality,
            notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        onSave(y);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <ShoppingBasket className="text-amber-600" /> Log Harvest
                    </h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <Input label="Weight/Qty" type="number" value={weight} onChange={e => setWeight(e.target.value)} required className="flex-1" />
                        <Select label="Unit" value={unit} onChange={e => setUnit(e.target.value)} className="w-24">
                            {MEASUREMENT_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        <Select label="Quality" value={quality} onChange={e => setQuality(e.target.value as any)}>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </Select>
                    </div>

                    <TextArea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Sweet, minimal bruising" />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Harvest</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
