
import React from 'react';
import { AdCampaign, AdCreative } from '../../types';
import { Card } from '../ui/Card';
import { ExternalLink, Star } from 'lucide-react';

interface AdVisualProps {
  campaign: AdCampaign;
  creative: AdCreative;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

// 1. Banner Ad (Wide, Top/Bottom)
export const BannerAd: React.FC<AdVisualProps> = ({ campaign, creative, onClick, className = '' }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative w-full h-32 md:h-40 bg-earth-100 dark:bg-stone-800 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-earth-200 dark:border-stone-700 ${className}`}
    >
      {creative.fileUrl ? (
        <img src={creative.fileUrl} alt={creative.altText} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-leaf-700 to-leaf-900 text-white">
           <div className="text-center p-4">
              <h3 className="text-2xl font-serif font-bold mb-1">{campaign.title}</h3>
              <p className="text-leaf-100">{creative.altText}</p>
           </div>
        </div>
      )}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider backdrop-blur-sm">
         Sponsored
      </div>
      <div className="absolute bottom-2 right-2 bg-white text-earth-900 text-xs px-3 py-1.5 rounded-lg font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
         Learn More <ExternalLink size={12}/>
      </div>
    </div>
  );
};

// 2. Sponsor Block (Square/Box, Sidebar)
export const SponsorBlock: React.FC<AdVisualProps> = ({ campaign, creative, onClick, className = '' }) => {
  return (
    <Card 
      interactive 
      onClick={onClick}
      className={`p-0 overflow-hidden relative group bg-white dark:bg-stone-900 ${className}`}
    >
      <div className="aspect-[4/3] bg-earth-200 relative">
         {creative.fileUrl ? (
            <img src={creative.fileUrl} alt={creative.altText} className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-earth-100 text-earth-400">
               <span className="font-bold text-sm">{creative.altText || 'Ad Image'}</span>
            </div>
         )}
         <div className="absolute top-0 right-0 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-[9px] font-bold px-2 py-1 rounded-bl-lg">
            PARTNER
         </div>
      </div>
      <div className="p-3">
         <h4 className="font-bold text-earth-900 dark:text-earth-100 text-sm leading-tight mb-1">{campaign.title}</h4>
         <p className="text-xs text-earth-600 dark:text-stone-400 line-clamp-2">{creative.altText}</p>
         <div className="mt-2 text-leaf-700 dark:text-leaf-400 text-xs font-bold flex items-center gap-1 group-hover:underline">
            Visit Site <ExternalLink size={10}/>
         </div>
      </div>
    </Card>
  );
};

// 3. Product Tile (Inline, Small)
export const ProductTile: React.FC<AdVisualProps> = ({ campaign, creative, onClick, className = '' }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800 rounded-xl cursor-pointer hover:border-leaf-300 dark:hover:border-leaf-700 transition-colors shadow-sm ${className}`}
    >
       <div className="w-12 h-12 rounded-lg bg-earth-100 flex-shrink-0 overflow-hidden">
          {creative.fileUrl && <img src={creative.fileUrl} alt="" className="w-full h-full object-cover" />}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <h4 className="font-bold text-earth-900 dark:text-earth-100 text-sm truncate pr-2">{campaign.title}</h4>
             <span className="text-[9px] text-earth-400 font-bold border border-earth-200 dark:border-stone-700 px-1 rounded">AD</span>
          </div>
          <p className="text-xs text-earth-500 dark:text-stone-400 truncate">{creative.altText}</p>
       </div>
       <ExternalLink size={14} className="text-earth-400" />
    </div>
  );
};

// 4. Seasonal Panel (Large, Feature)
export const SeasonalPanel: React.FC<AdVisualProps> = ({ campaign, creative, onClick, className = '' }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative w-full h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer group shadow-md border-2 border-amber-200 dark:border-amber-900/30 ${className}`}
    >
       {/* Background */}
       {creative.fileUrl ? (
          <img src={creative.fileUrl} alt={creative.altText} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
       ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-700 to-orange-900" />
       )}
       
       {/* Content Overlay */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
             <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Seasonal Spotlight
             </span>
             <Star size={12} className="text-amber-400 fill-amber-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 shadow-sm">{campaign.title}</h2>
          <p className="text-white/90 text-sm md:text-base max-w-lg mb-4">{creative.altText}</p>
          <button className="bg-white text-earth-900 font-bold px-4 py-2 rounded-lg text-sm w-fit hover:bg-earth-100 transition-colors">
             Check it out
          </button>
       </div>
    </div>
  );
};
