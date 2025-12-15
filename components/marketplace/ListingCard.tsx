
import React from 'react';
import { MarketplaceItem } from '../../types';
import { Card } from '../ui/Card';
import { MapPin, DollarSign, Repeat, Gift, Heart, Share2 } from 'lucide-react';

interface ListingCardProps {
  item: MarketplaceItem;
  onClick: () => void;
  isOwner: boolean;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ item, onClick, isOwner, isSaved, onToggleSave, onShare }) => {
  const TypeIcon = {
    sale: DollarSign,
    trade: Repeat,
    free: Gift,
  }[item.type];

  const typeColor = {
    sale: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    trade: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    free: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  }[item.type];

  return (
    <Card 
      interactive 
      onClick={onClick}
      className={`p-0 overflow-hidden group flex flex-col h-full bg-white dark:bg-night-900 ${isOwner ? 'ring-2 ring-leaf-200 dark:ring-leaf-800' : ''}`}
    >
      {/* Visual - Dominant Area */}
      <div className="aspect-[4/3] w-full bg-earth-200 dark:bg-night-800 relative overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img 
            src={item.images[0]} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-earth-300 dark:text-night-600 text-5xl">
             📦
          </div>
        )}
        
        {/* Badges */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md ${typeColor}`}>
           <TypeIcon size={12} />
           {item.type}
        </div>

        {/* Actions Overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
            <button 
                onClick={onShare}
                className="p-2 rounded-full bg-white/90 dark:bg-black/60 text-earth-600 dark:text-night-300 shadow-sm hover:bg-white dark:hover:bg-black transition-colors"
                title="Share"
            >
                <Share2 size={16} />
            </button>
            <button 
                onClick={onToggleSave}
                className={`p-2 rounded-full shadow-sm transition-colors ${isSaved ? 'bg-red-50 text-red-500' : 'bg-white/90 dark:bg-black/60 text-earth-400 dark:text-night-400 hover:text-red-400'}`}
                title="Save Listing"
            >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
        </div>

        {/* Price/Trade Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
           {item.type === 'sale' ? `$${item.price?.toFixed(2)}` : item.type === 'trade' ? 'Trade' : 'Free'}
        </div>
      </div>

      {/* Info - Minimal Text Area */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 truncate leading-tight">
            {item.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-earth-600 dark:text-night-400 mt-auto">
           <span className="flex items-center gap-1 truncate max-w-[50%]">
              <MapPin size={12} className="shrink-0" /> {item.location}
           </span>
           <span className="w-1 h-1 rounded-full bg-earth-300 dark:bg-night-600 shrink-0"></span>
           <span className="capitalize">{item.category}</span>
        </div>

        <div className="text-[10px] text-earth-400 dark:text-night-500 pt-3 mt-1 border-t border-earth-100 dark:border-night-800 flex justify-between">
            <span>Posted {new Date(item.createdAt).toLocaleDateString()}</span>
            {isOwner && <span className="font-bold text-leaf-600 dark:text-leaf-400">Your Listing</span>}
        </div>
      </div>
    </Card>
  );
};
