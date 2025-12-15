
import React, { useState } from 'react';
import { MarketplaceItem, ListingType, MarketCategory } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { MARKET_CATEGORIES } from '../../constants';
import { X, Upload, DollarSign, Repeat, Gift, Image as ImageIcon } from 'lucide-react';

interface ListingEditorModalProps {
  item?: MarketplaceItem | null;
  onSave: (item: Partial<MarketplaceItem>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ListingEditorModal: React.FC<ListingEditorModalProps> = ({ item, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [type, setType] = useState<ListingType>(item?.type || 'trade');
  const [category, setCategory] = useState<MarketCategory>(item?.category || 'produce');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [tradeReq, setTradeReq] = useState(item?.tradeRequirements || '');
  const [location, setLocation] = useState(item?.location || 'Local Pickup');
  const [imagePreview, setImagePreview] = useState(item?.images?.[0] || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: item?.id,
      title,
      description,
      type,
      category,
      price: price ? parseFloat(price) : undefined,
      tradeRequirements: tradeReq,
      location,
      images: imagePreview ? [imagePreview] : [],
      ownerId: 'me',
      status: 'active',
      createdAt: item?.createdAt
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-earth-200 dark:border-stone-800">
        
        <div className="flex justify-between items-center mb-6 border-b border-earth-100 dark:border-stone-800 pb-4">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">{item ? 'Edit Listing' : 'Post Item'}</h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Image Upload */}
          <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-full h-40 rounded-xl overflow-hidden bg-earth-100 dark:bg-stone-800 border-2 border-dashed border-earth-300 dark:border-stone-700 relative group cursor-pointer flex items-center justify-center">
                 {imagePreview ? (
                    <img src={imagePreview} alt="Listing Preview" className="w-full h-full object-cover" />
                 ) : (
                    <div className="flex flex-col items-center text-earth-400">
                       <ImageIcon size={32} />
                       <span className="text-xs mt-2">Add Photo</span>
                    </div>
                 )}
                 <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Upload size={24} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                 </label>
              </div>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
             {[
               { id: 'sale', label: 'Sell', icon: DollarSign },
               { id: 'trade', label: 'Trade', icon: Repeat },
               { id: 'free', label: 'Free', icon: Gift },
             ].map(t => {
                const Icon = t.icon;
                const isActive = type === t.id;
                return (
                   <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as ListingType)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all 
                        ${isActive 
                            ? 'bg-leaf-50 dark:bg-leaf-900/30 border-leaf-500 text-leaf-800 dark:text-leaf-300 ring-1 ring-leaf-500' 
                            : 'border-earth-200 dark:border-stone-700 text-earth-500 dark:text-stone-400 hover:bg-earth-50 dark:hover:bg-stone-800'
                        }`}
                   >
                      <Icon size={20} className="mb-1" />
                      <span className="text-xs font-bold">{t.label}</span>
                   </button>
                )
             })}
          </div>

          <Input 
            label="Title"
            autoFocus
            placeholder="e.g. Dozen Fertile Eggs"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
             <Select
                label="Category"
                value={category}
                onChange={e => setCategory(e.target.value as MarketCategory)}
             >
                {MARKET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
             </Select>
             
             {type === 'sale' && (
                <Input 
                   label="Price ($)"
                   type="number"
                   step="0.01"
                   value={price}
                   onChange={e => setPrice(e.target.value)}
                   required
                />
             )}
          </div>

          {type === 'trade' && (
             <Input 
                label="Looking For"
                placeholder="e.g. Honey, Labor, Firewood"
                value={tradeReq}
                onChange={e => setTradeReq(e.target.value)}
                required
             />
          )}

          <TextArea 
             label="Description"
             className="h-24"
             placeholder="Details about the item..."
             value={description}
             onChange={e => setDescription(e.target.value)}
          />

          <div className="pt-2 flex gap-3">
             {item && onDelete && (
                <Button type="button" variant="outline" onClick={() => onDelete(item.id)} className="text-red-600 border-red-200 dark:border-red-900/50">
                   Delete
                </Button>
             )}
             <div className="flex-1 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="px-6">Post Listing</Button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};
