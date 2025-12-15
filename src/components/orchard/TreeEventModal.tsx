
import React, { useState } from 'react';
import { TreeLog, TreeEventType } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Calendar } from 'lucide-react';

interface TreeEventModalProps {
    treeId: string;
    onSave: (log: TreeLog) => void;
    onClose: () => void;
}

export const TreeEventModal: React.FC<TreeEventModalProps> = ({ treeId, onSave, onClose }) => {
    const [type, setType] = useState<TreeEventType>('note');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const log: TreeLog = {
            id: crypto.randomUUID(),
            treeId,
            type,
            date: new Date(date).getTime(),
            notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        onSave(log);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Log Event</h2>
                    <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select label="Event Type" value={type} onChange={e => setType(e.target.value as TreeEventType)}>
                        <option value="note">Observation / Note</option>
                        <option value="pruning">Pruning</option>
                        <option value="fertilizing">Fertilizing</option>
                        <option value="pest_control">Pest Control</option>
                        <option value="flowering">Flowering</option>
                        <option value="fruiting">Fruiting</option>
                    </Select>

                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />

                    <TextArea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Details..." required />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Log</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
