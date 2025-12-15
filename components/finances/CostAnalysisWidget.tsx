import React, { useState, useEffect } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { dbService } from '../../services/db';
import { Expense, ProductionLog, HerdGroup } from '../../types';
import { Calculator, ChevronDown } from 'lucide-react';

export const CostAnalysisWidget: React.FC = () => {
  const [herds, setHerds] = useState<HerdGroup[]>([]);
  const [selectedHerdId, setSelectedHerdId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'30' | '90' | '365'>('30');
  
  const [analysis, setAnalysis] = useState<{
    totalCost: number;
    totalProduction: number;
    costPerUnit: number;
    unit: string;
  } | null>(null);

  useEffect(() => {
    const loadHerds = async () => {
      const allHerds = await dbService.getAll<HerdGroup>('herds');
      setHerds(allHerds);
      if (allHerds.length > 0) setSelectedHerdId(allHerds[0].id);
    };
    loadHerds();
  }, []);

  useEffect(() => {
    if (selectedHerdId) calculateMetrics();
  }, [selectedHerdId, timeframe]);

  const calculateMetrics = async () => {
    const expenses = await dbService.getAllByIndex<Expense>('expenses', 'allocationId', selectedHerdId);
    const production = await dbService.getAllByIndex<ProductionLog>('production_logs', 'herdGroupId', selectedHerdId);
    
    const cutoffDate = Date.now() - (parseInt(timeframe) * 24 * 60 * 60 * 1000);

    const filteredExpenses = expenses.filter(e => e.date >= cutoffDate);
    const filteredProd = production.filter(p => p.date >= cutoffDate);

    const totalCost = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalProduction = filteredProd.reduce((acc, curr) => acc + curr.quantity, 0);
    
    // Determine unit (simple logic: take first unit found or default)
    const unit = filteredProd.length > 0 ? filteredProd[0].unit : 'unit';

    setAnalysis({
        totalCost,
        totalProduction,
        costPerUnit: totalProduction > 0 ? totalCost / totalProduction : 0,
        unit
    });
  };

  if (herds.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-earth-800 to-earth-900 text-white border-none shadow-lg">
       <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-white/10 rounded-lg">
                <Calculator size={18} />
             </div>
             <CardTitle>Cost Analysis</CardTitle>
          </div>
          
          <select 
             className="bg-black/20 border-none text-xs rounded px-2 py-1 cursor-pointer focus:ring-0"
             value={timeframe}
             onChange={(e) => setTimeframe(e.target.value as any)}
          >
             <option value="30">Last 30 Days</option>
             <option value="90">Last 90 Days</option>
             <option value="365">Last Year</option>
          </select>
       </div>

       <div className="mb-4">
          <label className="text-xs text-earth-300 uppercase font-bold tracking-wider mb-1 block">Target Herd</label>
          <div className="relative">
             <select 
               className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-sm appearance-none cursor-pointer hover:bg-white/20 transition-colors"
               value={selectedHerdId}
               onChange={(e) => setSelectedHerdId(e.target.value)}
             >
                {herds.map(h => <option key={h.id} value={h.id} className="text-earth-900">{h.name}</option>)}
             </select>
             <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>
       </div>

       {analysis && (
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
             <div>
                <p className="text-xs text-earth-300">Total Spent</p>
                <p className="text-xl font-bold">${analysis.totalCost.toFixed(2)}</p>
             </div>
             <div>
                <p className="text-xs text-earth-300">Total Yield</p>
                <p className="text-xl font-bold">{analysis.totalProduction} <span className="text-sm font-normal opacity-70">{analysis.unit}s</span></p>
             </div>
             <div className="col-span-2 bg-white/10 rounded-xl p-3 flex items-center justify-between">
                <span className="font-bold text-sm">Cost Per {analysis.unit.charAt(0).toUpperCase() + analysis.unit.slice(1)}</span>
                <span className="text-2xl font-serif font-bold text-leaf-300">${analysis.costPerUnit.toFixed(2)}</span>
             </div>
          </div>
       )}
    </Card>
  );
};