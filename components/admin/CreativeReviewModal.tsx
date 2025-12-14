
import React, { useState } from 'react';
import { AdCampaign } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, CheckCircle, AlertTriangle, ExternalLink, Calendar } from 'lucide-react';

interface CreativeReviewModalProps {
  campaign: AdCampaign;
  onReview: (campaign: AdCampaign, approved: boolean, feedback?: string) => void;
  onClose: () => void;
}

export const CreativeReviewModal: React.FC<CreativeReviewModalProps> = ({ campaign, onReview, onClose }) => {
  const [step, setStep] = useState<'view' | 'reject'>('view');
  const [feedback, setFeedback] = useState('');
  
  // Allow admin to modify dates before approval
  const [startDate, setStartDate] = useState(new Date(campaign.startDate).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(campaign.endDate).toISOString().split('T')[0]);

  const creative = campaign.creatives[0];

  if (!creative) return null;

  const handleApprove = () => {
      const updatedCampaign = {
          ...campaign,
          startDate: new Date(startDate).getTime(),
          endDate: new Date(endDate).getTime()
      };
      onReview(updatedCampaign, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Review Campaign</h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        {step === 'view' ? (
            <div className="space-y-6">
                <div className="bg-earth-100 dark:bg-black rounded-lg overflow-hidden border border-earth-200 dark:border-stone-800">
                    {creative.fileUrl ? (
                        <img src={creative.fileUrl} alt="Ad Creative" className="w-full h-auto object-contain max-h-64" />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-earth-400">No Image URL</div>
                    )}
                </div>

                <div className="space-y-2 text-sm text-earth-700 dark:text-stone-300">
                    <p><strong>Campaign:</strong> {campaign.title}</p>
                    <p><strong>Alt Text:</strong> {creative.altText}</p>
                    <p className="flex items-center gap-2">
                        <strong>Target URL:</strong> 
                        <a href={creative.clickUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            {creative.clickUrl} <ExternalLink size={12}/>
                        </a>
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs uppercase mb-2 flex items-center gap-2">
                        <Calendar size={12} /> Schedule Verification
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Start Date" 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                        />
                        <Input 
                            label="End Date" 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="flex gap-4 border-t border-earth-200 dark:border-stone-800 pt-4">
                    <Button variant="ghost" className="flex-1 text-red-600 hover:bg-red-50" onClick={() => setStep('reject')}>
                        Reject
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 border-green-600" onClick={handleApprove}>
                        Approve & Schedule
                    </Button>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 rounded-lg border border-red-100 dark:border-red-900/30 text-sm">
                    <p className="font-bold flex items-center gap-2 mb-1"><AlertTriangle size={16}/> Rejection Notice</p>
                    <p>Please provide feedback for the sponsor so they can fix the issue.</p>
                </div>

                <TextArea 
                    label="Reason for Rejection"
                    placeholder="e.g. Image resolution too low, misleading text..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    className="h-32"
                />

                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setStep('view')}>Back</Button>
                    <Button className="bg-red-600 hover:bg-red-700 border-red-600" onClick={() => onReview(campaign, false, feedback)}>
                        Submit Rejection
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
