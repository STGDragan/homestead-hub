
import React, { useState } from 'react';
import { Recommendation } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, X, Check, Brain, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface AIInsightCardProps {
  recommendation: Recommendation;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ recommendation, onApply, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = () => {
      switch(recommendation.priority) {
          case 'critical': return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10';
          case 'high': return 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/10';
          case 'medium': return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
          default: return 'border-l-4 border-l-gray-300 bg-gray-50 dark:bg-stone-800';
      }
  };

  const getConfidenceColor = (score: number) => {
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-leaf-600';
      if (score >= 50) return 'text-amber-600';
      return 'text-red-500';
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${getPriorityColor()} p-0`}>
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded-lg">
                        <Sparkles size={16} className="text-leaf-600 dark:text-leaf-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-earth-900 dark:text-earth-100 text-sm">{recommendation.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-earth-500 tracking-wider">
                            <span>{recommendation.module} Agent</span>
                            <span>•</span>
                            <span className={getConfidenceColor(recommendation.confidenceScore)}>{recommendation.confidenceScore}% Confidence</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => onDismiss(recommendation.id)}
                        className="p-1 text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <p className="text-sm text-earth-700 dark:text-stone-300 mb-3 leading-relaxed">
                {recommendation.description}
            </p>

            <div className="flex justify-between items-center mt-2">
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs font-bold text-earth-500 hover:text-earth-700 transition-colors"
                >
                    <Brain size={12} /> Why? {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                </button>

                <Button size="sm" onClick={() => onApply(recommendation.id)} className="h-8 text-xs bg-white text-leaf-700 border border-leaf-200 hover:bg-leaf-50">
                    <Check size={12} /> Apply
                </Button>
            </div>
        </div>

        {/* Expandable Reasoning */}
        {expanded && (
            <div className="px-4 pb-4 pt-2 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5 text-xs">
                <p className="font-bold text-earth-600 dark:text-stone-400 mb-1">AI Reasoning:</p>
                <p className="text-earth-600 dark:text-stone-400 italic">{recommendation.reasoning}</p>
                {recommendation.confidenceScore < 60 && (
                    <div className="mt-2 flex items-center gap-1 text-amber-600 font-medium">
                        <AlertTriangle size={10} /> Low confidence due to limited historical data.
                    </div>
                )}
            </div>
        )}
    </Card>
  );
};
