
import React from 'react';
import { NotificationTask } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ReproductionTaskCardProps {
  task: NotificationTask;
  onComplete: (id: string) => void;
}

export const ReproductionTaskCard: React.FC<ReproductionTaskCardProps> = ({ task, onComplete }) => {
  const isOverdue = task.scheduledAt < Date.now();
  const dateStr = new Date(task.scheduledAt).toLocaleDateString();

  const typeLabel = {
      pregnancy_check: 'Pregnancy Check',
      vet_visit: 'Vet Visit',
      due_date: 'Due Date',
      weaning: 'Weaning',
      vaccination: 'Vaccination'
  }[task.type];

  return (
    <Card className={`border-l-4 ${task.priority === 'high' ? 'border-l-red-500' : 'border-l-blue-500'} bg-white dark:bg-stone-900`}>
       <div className="p-4 flex items-start justify-between">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-earth-500 dark:text-stone-400">{typeLabel}</span>
                {isOverdue && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Overdue</span>}
             </div>
             <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-1">{task.title}</h3>
             <p className="text-sm text-earth-600 dark:text-stone-300">{task.notes}</p>
             <div className="flex items-center gap-2 mt-3 text-xs text-earth-500">
                <Calendar size={12} />
                <span>Due: {dateStr}</span>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
             <Button size="sm" onClick={() => onComplete(task.id)} icon={<CheckCircle2 size={14} />}>Done</Button>
             <Button size="sm" variant="ghost" icon={<Clock size={14} />}>Snooze</Button>
          </div>
       </div>
    </Card>
  );
};
