
import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPIResult } from '../../services/reportingLogic';

interface KPICardProps {
  kpi: KPIResult;
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, icon }) => {
  return (
    <Card className="flex items-center justify-between p-4">
       <div>
          <p className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">{kpi.label}</p>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100">{kpi.value}</span>
             {kpi.unit && <span className="text-sm text-earth-600 dark:text-earth-400 font-medium">{kpi.unit}</span>}
          </div>
          {kpi.trend && (
             <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-500' : 'text-earth-400'}`}>
                {kpi.trend === 'up' && <TrendingUp size={12}/>}
                {kpi.trend === 'down' && <TrendingDown size={12}/>}
                {kpi.trend === 'neutral' && <Minus size={12}/>}
                <span className="capitalize">{kpi.trend} trend</span>
             </div>
          )}
       </div>
       {icon && (
          <div className="p-3 bg-earth-50 dark:bg-stone-800 rounded-xl text-earth-600 dark:text-stone-400">
             {icon}
          </div>
       )}
    </Card>
  );
};
