
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { Expense } from '../../types';
import { Button } from '../../components/ui/Button';
import { ExpenseCard } from '../../components/finances/ExpenseCard';
import { ExpenseEditorModal } from '../../components/finances/ExpenseEditorModal';
import { CostAnalysisWidget } from '../../components/finances/CostAnalysisWidget';
import { Plus, TrendingUp, PieChart } from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await dbService.getAll<Expense>('expenses');
      data.sort((a, b) => b.date - a.date); // Newest first
      setExpenses(data);
    } catch (e) {
      console.error("Failed to load expenses", e);
    }
  };

  const handleSave = async (data: Partial<Expense>) => {
    const expense: Expense = {
       id: data.id || crypto.randomUUID(),
       amount: data.amount!,
       date: data.date!,
       category: data.category!,
       description: data.description!,
       allocationType: data.allocationType,
       allocationId: data.allocationId,
       isRecurring: data.isRecurring || false,
       recurrenceInterval: data.recurrenceInterval,
       createdAt: data.createdAt || Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };
    await dbService.put('expenses', expense);
    await loadExpenses();
    setShowEditor(false);
    setEditingExpense(null);
  };

  const handleDelete = async (id: string) => {
     if (confirm("Delete this expense log?")) {
        await dbService.delete('expenses', id);
        await loadExpenses();
        setShowEditor(false);
     }
  };

  const openEditor = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setShowEditor(true);
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">Finances</h1>
          <p className="text-earth-600 dark:text-night-300">Track costs and calculate yields.</p>
        </div>
        <Button onClick={() => openEditor()} icon={<Plus size={18} />}>Log Expense</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* Main Content (List) */}
         <div className="md:col-span-2 space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-700 shadow-sm">
                  <p className="text-xs text-earth-500 dark:text-night-400 uppercase font-bold tracking-wider mb-1">Total Spent</p>
                  <p className="text-2xl font-serif font-bold text-clay-600 dark:text-clay-400">-${totalSpent.toFixed(2)}</p>
               </div>
               <div className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-700 shadow-sm flex items-center justify-center text-earth-400 dark:text-night-500">
                   <div className="text-center">
                      <TrendingUp className="mx-auto mb-1 opacity-50" />
                      <span className="text-xs">Trends Coming Soon</span>
                   </div>
               </div>
            </div>

            {/* List */}
            <div>
               <h2 className="font-bold text-earth-800 dark:text-earth-200 text-lg mb-3">Recent Transactions</h2>
               {expenses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-earth-200 dark:border-night-700 rounded-xl bg-earth-50 dark:bg-night-800">
                     <p className="text-earth-500 dark:text-night-400 mb-4">No expenses logged yet.</p>
                     <Button variant="secondary" onClick={() => openEditor()}>Add First Expense</Button>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {expenses.map(exp => (
                        <ExpenseCard key={exp.id} expense={exp} onClick={() => openEditor(exp)} />
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Sidebar (Analysis) */}
         <div className="space-y-6">
            <CostAnalysisWidget />
            
            <div className="bg-leaf-50 dark:bg-leaf-900/10 border border-leaf-200 dark:border-leaf-900/30 rounded-xl p-4">
               <h3 className="font-bold text-leaf-800 dark:text-leaf-300 mb-2 flex items-center gap-2">
                  <PieChart size={16} /> Budget Tip
               </h3>
               <p className="text-sm text-leaf-700 dark:text-leaf-400">
                  Recurring feed costs are your highest expense category this month. Consider bulk buying to save 15%.
               </p>
            </div>
         </div>
      </div>

      {showEditor && (
        <ExpenseEditorModal 
          expense={editingExpense}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
