
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, RecurrenceType, HerdGroup, GardenBed } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EXPENSE_CATEGORIES } from '../../constants';
import { X, DollarSign, Calendar, Tag } from 'lucide-react';
import { dbService } from '../../services/db';

interface ExpenseEditorModalProps {
  expense?: Expense | null;
  onSave: (data: Partial<Expense>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ExpenseEditorModal: React.FC<ExpenseEditorModalProps> = ({ 
  expense, 
  onSave, 
  onClose, 
  onDelete
}) => {
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'feed');
  const [date, setDate] = useState(expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(expense?.isRecurring || false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceType>(expense?.recurrenceInterval || 'monthly');
  
  // Allocations
  const [allocationType, setAllocationType] = useState<'general' | 'herd' | 'bed'>(expense?.allocationType || 'general');
  const [allocationId, setAllocationId] = useState(expense?.allocationId || '');
  
  // Loaded options
  const [herds, setHerds] = useState<HerdGroup[]>([]);
  const [beds, setBeds] = useState<GardenBed[]>([]);

  useEffect(() => {
    const loadAllocations = async () => {
       setHerds(await dbService.getAll<HerdGroup>('herds'));
       setBeds(await dbService.getAll<GardenBed>('garden_beds'));
    };
    loadAllocations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: expense?.id,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date).getTime(),
      isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : 'none',
      allocationType,
      allocationId: allocationType === 'general' ? undefined : allocationId,
      createdAt: expense?.createdAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-night-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-earth-200 dark:border-night-700">
        
        <div className="flex justify-between items-center mb-6 border-b border-earth-100 dark:border-night-700 pb-4">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">
            {expense ? 'Edit Expense' : 'Log Expense'}
          </h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount Input */}
          <Input 
            label="Amount"
            autoFocus
            type="number"
            step="0.01"
            icon={<DollarSign size={16} />}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="text-2xl font-bold"
          />

          {/* Description */}
          <Input 
            label="Description"
            type="text"
            placeholder="e.g. Chicken Feed (50lb)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
             {/* Category */}
             <Select
                label="Category"
                icon={<Tag size={14} />}
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
             >
                {EXPENSE_CATEGORIES.map(c => (
                   <option key={c.id} value={c.id}>{c.label}</option>
                ))}
             </Select>

             {/* Date */}
             <Input 
                label="Date"
                type="date"
                icon={<Calendar size={14} />}
                value={date}
                onChange={(e) => setDate(e.target.value)}
             />
          </div>

          {/* Allocation */}
          <div className="p-4 bg-earth-50 dark:bg-night-800 rounded-xl border border-earth-100 dark:border-night-700">
             <h3 className="text-xs font-bold text-earth-500 dark:text-night-400 uppercase mb-2">Cost Allocation</h3>
             <div className="space-y-3">
                <div className="flex gap-2">
                   {['general', 'herd', 'bed'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setAllocationType(type as any); setAllocationId(''); }}
                        className={`flex-1 py-1 text-xs font-bold rounded border transition-colors ${allocationType === type ? 'bg-white dark:bg-night-700 border-leaf-500 text-leaf-800 dark:text-leaf-400 shadow-sm' : 'border-transparent text-earth-500 dark:text-night-400 hover:bg-white dark:hover:bg-night-700'}`}
                      >
                         {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                   ))}
                </div>

                {allocationType === 'herd' && (
                   <Select 
                      value={allocationId}
                      onChange={(e) => setAllocationId(e.target.value)}
                      required
                   >
                      <option value="">Select Herd...</option>
                      {herds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                   </Select>
                )}

                {allocationType === 'bed' && (
                   <Select
                      value={allocationId}
                      onChange={(e) => setAllocationId(e.target.value)}
                      required
                   >
                      <option value="">Select Garden Bed...</option>
                      {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </Select>
                )}
             </div>
          </div>

          {/* Recurrence */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="recur"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-leaf-600 rounded focus:ring-leaf-500 bg-white dark:bg-night-800 border-earth-300 dark:border-night-600"
            />
            <label htmlFor="recur" className="text-sm text-earth-700 dark:text-earth-300">Recurring Expense</label>
            
            {isRecurring && (
              <select 
                className="ml-auto text-sm border border-earth-300 dark:border-night-600 rounded-lg px-2 py-1 bg-white dark:bg-night-800 text-earth-900 dark:text-earth-100"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceType)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          <div className="pt-4 flex gap-3">
             {expense && onDelete && (
                <Button type="button" variant="outline" onClick={() => onDelete(expense.id)} className="text-red-600 border-red-200 dark:border-red-900/50">
                   Delete
                </Button>
             )}
             <div className="flex-1 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="px-8">Save</Button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
};
