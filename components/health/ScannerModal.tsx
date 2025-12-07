
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Camera, X, Upload, Sprout, PawPrint, Zap } from 'lucide-react';
import { HealthSubjectType } from '../../types';

interface ScannerModalProps {
  onScan: (file: Blob, type: HealthSubjectType) => void;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [subjectType, setSubjectType] = useState<HealthSubjectType>('plant');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setBlob(file);
    }
  };

  const handleConfirm = () => {
    if (blob) {
      onScan(blob, subjectType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-earth-100 dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-earth-800 dark:bg-stone-950 text-white flex justify-between items-center">
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
             <Zap size={18} className="text-yellow-400" /> AI Diagnostic Scanner
          </h2>
          <button onClick={onClose} className="text-earth-300 hover:text-white"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
           {!imageSrc ? (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <button 
                      onClick={() => setSubjectType('plant')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${subjectType === 'plant' ? 'bg-leaf-100 dark:bg-leaf-900/30 border-leaf-600 text-leaf-800 dark:text-leaf-200' : 'bg-white dark:bg-stone-800 border-earth-200 dark:border-stone-700 text-earth-500 dark:text-stone-400'}`}
                   >
                      <Sprout size={32} />
                      <span className="font-bold">Plant</span>
                   </button>
                   <button 
                      onClick={() => setSubjectType('animal')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${subjectType === 'animal' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-600 text-amber-800 dark:text-amber-200' : 'bg-white dark:bg-stone-800 border-earth-200 dark:border-stone-700 text-earth-500 dark:text-stone-400'}`}
                   >
                      <PawPrint size={32} />
                      <span className="font-bold">Animal</span>
                   </button>
                </div>

                <div className="border-2 border-dashed border-earth-300 dark:border-stone-600 rounded-2xl bg-earth-50 dark:bg-stone-800 p-8 text-center relative group">
                   <input type="file" accept="image/*" capture="environment" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                   <div className="w-16 h-16 bg-white dark:bg-stone-700 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-earth-600 dark:text-stone-300 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                   </div>
                   <h3 className="font-bold text-earth-800 dark:text-earth-100">Take Photo</h3>
                   <p className="text-sm text-earth-500 dark:text-stone-400">or tap to upload</p>
                </div>
                
                <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-earth-200 dark:border-stone-700">
                  <h4 className="font-bold text-xs text-earth-400 dark:text-stone-500 uppercase tracking-wider mb-2">Tips for best results</h4>
                  <ul className="text-sm text-earth-600 dark:text-stone-300 space-y-1 list-disc list-inside">
                     <li>Get close to the issue (leaf spot, wound).</li>
                     <li>Ensure good lighting (avoid heavy shadows).</li>
                     <li>Focus clearly on the affected area.</li>
                  </ul>
                </div>
             </div>
           ) : (
             <div className="space-y-4 h-full flex flex-col">
                <div className="relative rounded-xl overflow-hidden bg-black flex-1 min-h-[300px]">
                   <img src={imageSrc} alt="Preview" className="w-full h-full object-contain" />
                   <button 
                      onClick={() => { setImageSrc(null); setBlob(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                   >
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex items-center justify-between text-sm px-2">
                   <span className="text-earth-500 dark:text-stone-400">Subject:</span>
                   <span className="font-bold text-earth-800 dark:text-earth-200 capitalize flex items-center gap-1">
                      {subjectType === 'plant' ? <Sprout size={16} /> : <PawPrint size={16} />} {subjectType}
                   </span>
                </div>

                <Button onClick={handleConfirm} className="w-full py-4 text-lg" icon={<Zap size={20} />}>
                   Analyze Photo
                </Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
