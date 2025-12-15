
import React, { useState } from 'react';
import { ReportType, PiiPreference } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { X, FileText, Download, Shield } from 'lucide-react';
import { reportingLogic } from '../../services/reportingLogic';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState<ReportType>('MEDICAL_PACK');
  const [pii, setPii] = useState<PiiPreference>('REDACT');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
        const csv = await reportingLogic.generateCSV(reportType, pii);
        // Trigger Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homestead_export_${reportType.toLowerCase()}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Log Audit
        await reportingLogic.logAudit('EXPORT', 'SYSTEM', reportType, `Exported with PII: ${pii}`);
        
        onClose();
    } catch (e) {
        console.error(e);
        alert("Failed to generate export");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Download className="text-leaf-600" /> Export Data
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <div className="space-y-4">
           <Select 
              label="Report Type"
              value={reportType}
              onChange={e => setReportType(e.target.value as ReportType)}
           >
              <option value="MEDICAL_PACK">Medical Records Pack</option>
              <option value="LINEAGE_TRACE">Lineage Traceability</option>
              <option value="BREEDING_KPI">Breeding KPIs</option>
              <option value="SALES_REPORT">Sales & Transfers</option>
           </Select>

           <div className="p-4 bg-earth-50 dark:bg-stone-800 rounded-xl border border-earth-100 dark:border-stone-700">
              <h3 className="text-xs font-bold text-earth-500 dark:text-stone-400 uppercase mb-2 flex items-center gap-1">
                 <Shield size={12} /> Privacy Settings
              </h3>
              <div className="space-y-2">
                 {[
                    { val: 'REDACT', label: 'Redact Personal Info (Recommended for Regulators)' },
                    { val: 'ANONYMIZE', label: 'Anonymize (Hash IDs)' },
                    { val: 'INCLUDE', label: 'Include All Data (Private Backup)' }
                 ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-2 text-sm text-earth-700 dark:text-stone-300 cursor-pointer">
                       <input 
                          type="radio" 
                          name="pii" 
                          value={opt.val} 
                          checked={pii === opt.val} 
                          onChange={() => setPii(opt.val as PiiPreference)}
                          className="text-leaf-600 focus:ring-leaf-500"
                       />
                       {opt.label}
                    </label>
                 ))}
              </div>
           </div>

           <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-300">
              This export will be logged in the audit trail for compliance purposes.
           </div>

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleExport} disabled={isGenerating}>
                 {isGenerating ? 'Generating...' : 'Download CSV'}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};
