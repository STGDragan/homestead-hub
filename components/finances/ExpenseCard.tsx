
import React from 'react';
import { Expense } from '../../types';
import { Card } from '../ui/Card';
import { Tag, Calendar, FileText } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  onClick: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onClick }) => {
  return (
    <Card 
      interactive 
      onClick={onClick}
      className="p-4 flex items-center justify-between"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
           <h3 className="font-bold text-earth-900 dark:text-earth-100">{expense.description}</h3>
           {expense.isRecurring && (
             <span className="text-[10px] bg-earth-100 dark:bg-night-800 text-earth-600 dark:text-night-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
               Recurring
             </span>
           )}
           {expense.receiptUrl && (
             <span className="text-earth-400" title="Receipt Attached">
                <FileText size={14} />
             </span>
           )}
        </div>
        <div className="flex items-center gap-3 text-xs text-earth-500 dark:text-night-400">
           <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(expense.date).toLocaleDateString()}
           </span>
           <span className="flex items-center gap-1 capitalize">
              <Tag size={12} />
              {expense.category}
           </span>
           {expense.allocationType && expense.allocationType !== 'general' && (
               <span className="bg-leaf-50 dark:bg-leaf-900/20 text-leaf-700 dark:text-leaf-300 px-1.5 py-0.5 rounded capitalize">
                   {expense.allocationType}
               </span>
           )}
        </div>
      </div>
      
      <div className="text-right">
         <span className="block font-serif font-bold text-lg text-clay-600 dark:text-clay-400">
            -${expense.amount.toFixed(2)}
         </span>
      </div>
    </Card>
  );
};
