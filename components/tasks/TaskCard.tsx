import React from 'react';
import { Task, Season } from '../../types';
import { Card } from '../ui/Card';
import { Check, Repeat, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onClick: (task: Task) => void;
}

const SEASON_COLORS: Record<Season, string> = {
    spring: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    summer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    fall: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    winter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    all: 'bg-gray-100 text-gray-800 dark:bg-night-800 dark:text-night-300',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onClick }) => {
  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task);
  };

  return (
    <Card 
      onClick={() => onClick(task)}
      interactive 
      className={`
        p-4 relative transition-all duration-300
        ${task.completed ? 'bg-earth-50 dark:bg-night-800 opacity-70' : 'bg-white dark:bg-night-900'}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleCheck}
          className={`
            mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0
            ${task.completed 
              ? 'bg-leaf-600 border-leaf-600 text-white' 
              : 'border-earth-300 dark:border-night-600 hover:border-leaf-500 text-transparent'}
          `}
        >
          <Check size={16} strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <h3 className={`font-bold text-earth-900 dark:text-earth-100 truncate pr-2 ${task.completed ? 'line-through text-earth-500 dark:text-night-500' : ''}`}>
               {task.title}
             </h3>
             {task.isRecurring && (
                <Repeat size={14} className="text-earth-400 dark:text-night-500 shrink-0 mt-1" />
             )}
          </div>
          
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
             <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${SEASON_COLORS[task.season]}`}>
                {task.season}
             </span>
             
             <span className="text-xs text-earth-500 dark:text-night-400 capitalize px-1.5 py-0.5 bg-earth-100 dark:bg-night-800 rounded">
                {task.category}
             </span>

             {task.dueDate && (
                <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-earth-500 dark:text-night-400'}`}>
                   {isOverdue && <AlertCircle size={12} />}
                   {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
             )}
          </div>
        </div>
      </div>
    </Card>
  );
};