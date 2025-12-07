import React, { useRef, useState } from 'react';
import { Camera, MapPin, Check, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { PhotoAnnotation } from '../../types';

interface GardenPhotoAnnotatorProps {
  onSave: (blobUrl: string, annotations: PhotoAnnotation[]) => void;
  onCancel: () => void;
}

export const GardenPhotoAnnotator: React.FC<GardenPhotoAnnotatorProps> = ({ onSave, onCancel }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>([]);
  const [activeMode, setActiveMode] = useState<'view' | 'place'>('view');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImageSrc(url);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (activeMode !== 'place' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnnotation: PhotoAnnotation = {
      id: crypto.randomUUID(),
      x,
      y,
      label: 'New Plant',
      type: 'plant'
    };

    setAnnotations([...annotations, newAnnotation]);
    setActiveMode('view'); // Reset after placing
  };

  const handleAIAnalyze = () => {
    setIsAnalyzing(true);
    // Mock AI delay
    setTimeout(() => {
        setIsAnalyzing(false);
        // Add some mock AI suggestions
        setAnnotations(prev => [
            ...prev,
            { id: 'ai-1', x: 20, y: 30, label: 'Weed Detected', type: 'weed' },
            { id: 'ai-2', x: 70, y: 60, label: 'Good Spot for Lettuce', type: 'gap' }
        ]);
    }, 2000);
  };

  if (!imageSrc) {
    return (
      <div className="bg-earth-100 rounded-2xl border-2 border-dashed border-earth-300 p-8 flex flex-col items-center justify-center text-center h-64">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Camera size={32} className="text-earth-600" />
        </div>
        <h3 className="font-serif font-bold text-earth-800 mb-2">Capture Garden State</h3>
        <p className="text-sm text-earth-500 mb-4 max-w-xs">Upload a photo to track growth, identify pests, or check spacing.</p>
        <label className="bg-leaf-700 text-white px-6 py-3 rounded-xl font-bold shadow-soft cursor-pointer hover:bg-leaf-800 transition-colors">
           Take Photo
           <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </label>
        <Button variant="ghost" onClick={onCancel} className="mt-4">Cancel</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-earth-200 overflow-hidden flex flex-col h-[600px]">
       {/* Toolbar */}
       <div className="p-4 border-b border-earth-100 flex justify-between items-center bg-earth-50">
          <div className="flex gap-2">
             <Button 
                size="sm" 
                variant={activeMode === 'place' ? 'primary' : 'secondary'}
                onClick={() => setActiveMode(activeMode === 'place' ? 'view' : 'place')}
                icon={<MapPin size={16} />}
             >
                {activeMode === 'place' ? 'Tap to Place' : 'Add Pin'}
             </Button>
             <Button 
                size="sm" 
                variant="secondary" 
                className={isAnalyzing ? 'animate-pulse' : ''}
                onClick={handleAIAnalyze}
                icon={<Sparkles size={16} />}
             >
                {isAnalyzing ? 'Analyzing...' : 'AI Check'}
             </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setImageSrc(null)}>Retake</Button>
       </div>

       {/* Canvas Area */}
       <div className="relative flex-1 bg-stone-900 overflow-hidden flex items-center justify-center">
          <div ref={containerRef} className="relative max-h-full max-w-full inline-block" onClick={handleImageClick}>
             <img 
                ref={imageRef} 
                src={imageSrc} 
                alt="Garden Capture" 
                className="max-h-full max-w-full object-contain block" 
             />
             
             {/* Annotations Layer */}
             {annotations.map(ann => (
                <div 
                   key={ann.id}
                   className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-sm flex items-center justify-center cursor-pointer transform hover:scale-125 transition-transform
                      ${ann.type === 'weed' ? 'bg-red-500' : ann.type === 'gap' ? 'bg-blue-500' : 'bg-leaf-500'}
                   `}
                   style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                   title={ann.label}
                >
                   <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                   <span className="absolute top-full mt-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                      {ann.label}
                   </span>
                </div>
             ))}

             {activeMode === 'place' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none">
                   Tap image to add pin
                </div>
             )}
          </div>
       </div>

       {/* Footer */}
       <div className="p-4 border-t border-earth-100 flex justify-between bg-white">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button icon={<Check size={18} />} onClick={() => onSave(imageSrc, annotations)}>Save to Log</Button>
       </div>
    </div>
  );
};