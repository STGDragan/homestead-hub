
import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { Recommendation } from '../../types';
import { AIInsightCard } from './AIInsightCard';
import { Button } from '../ui/Button';
import { RefreshCw, Bot } from 'lucide-react';
import { FeatureGate } from '../subscription/FeatureGate';

export const AgentDashboardWidget: React.FC = () => {
  const [insights, setInsights] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    // In real app, might just get active. For demo, we regenerate to ensure content.
    await aiService.generateAllInsights('main_user');
    const recs = await aiService.getActiveRecommendations('main_user');
    setInsights(recs.slice(0, 3)); // Top 3 only
    setLoading(false);
  };

  const handleApply = async (id: string) => {
      await aiService.recordFeedback('main_user', id, 'applied');
      loadInsights();
  };

  const handleDismiss = async (id: string) => {
      await aiService.recordFeedback('main_user', id, 'dismissed');
      loadInsights();
  };

  return (
    <FeatureGate feature="ai_agents" showBanner={true}>
        {insights.length > 0 && (
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="font-serif font-bold text-xl text-earth-900 dark:text-earth-100 flex items-center gap-2">
                        <Bot className="text-leaf-600" /> Farm Intelligence
                    </h2>
                    <button 
                        onClick={loadInsights}
                        className={`p-2 text-earth-400 hover:text-leaf-600 transition-colors ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {insights.map(rec => (
                        <AIInsightCard 
                            key={rec.id} 
                            recommendation={rec} 
                            onApply={handleApply} 
                            onDismiss={handleDismiss} 
                        />
                    ))}
                </div>
            </div>
        )}
    </FeatureGate>
  );
};
