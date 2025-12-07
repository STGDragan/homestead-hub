
import React, { useState, useEffect } from 'react';
import { MarketplaceItem, TradeOffer } from '../../types';
import { dbService } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TradeOfferModalProps {
  targetItem: MarketplaceItem;
  onClose: () => void;
  onSubmit: () => void;
}

export const TradeOfferModal: React.FC<TradeOfferModalProps> = ({ targetItem, onClose, onSubmit }) => {
  const [myItems, setMyItems] = useState<MarketplaceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cashOffer, setCashOffer] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  useEffect(() => {
    const loadInventory = async () => {
       const all = await dbService.getAll<MarketplaceItem>('marketplace');
       setMyItems(all.filter(i => i.ownerId === 'me' && i.status === 'active'));
    };
    loadInventory();
  }, []);

  const toggleSelection = (id: string) => {
     if (selectedItems.includes(id)) {
        setSelectedItems(selectedItems.filter(i => i !== id));
     } else {
        setSelectedItems([...selectedItems, id]);
     }
  };

  const handleSendOffer = async () => {
     const offer: TradeOffer = {
        id: crypto.randomUUID(),
        listingId: targetItem.id,
        sellerId: targetItem.ownerId,
        buyerId: 'me',
        offeredItems: selectedItems,
        offeredMoney: cashOffer ? parseFloat(cashOffer) : undefined,
        message,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
     };

     await dbService.put('offers', offer);
     onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-earth-200 dark:border-stone-800">
         
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Make an Offer</h2>
            <button onClick={onClose} className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200"><X size={24} /></button>
         </div>

         <div className="bg-earth-50 dark:bg-stone-800 p-3 rounded-xl mb-6 border border-earth-200 dark:border-stone-700 flex gap-3">
            <div className="w-12 h-12 bg-white dark:bg-stone-700 rounded-lg flex items-center justify-center shrink-0 border border-earth-100 dark:border-stone-600">
               {targetItem.type === 'sale' ? '$' : '📦'}
            </div>
            <div>
               <p className="text-xs text-earth-500 dark:text-stone-400 uppercase font-bold">Trading For</p>
               <h3 className="font-bold text-earth-900 dark:text-earth-100">{targetItem.title}</h3>
            </div>
         </div>

         {step === 'select' ? (
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Offer Cash ($)</label>
                  <Input 
                     type="number" 
                     placeholder="0.00" 
                     value={cashOffer} 
                     onChange={e => setCashOffer(e.target.value)} 
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Offer Items (Barter)</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                     {myItems.length === 0 && <p className="text-sm text-earth-500 italic">No active listings to trade.</p>}
                     {myItems.map(item => (
                        <div 
                           key={item.id} 
                           onClick={() => toggleSelection(item.id)}
                           className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                              ${selectedItems.includes(item.id) 
                                 ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-900/20' 
                                 : 'border-earth-200 dark:border-stone-700 hover:border-earth-300 dark:hover:border-stone-600'}
                           `}
                        >
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${selectedItems.includes(item.id) ? 'bg-leaf-500 border-leaf-500 text-white' : 'border-earth-300 dark:border-stone-500'}
                           `}>
                              {selectedItems.includes(item.id) && <CheckCircle2 size={12} />}
                           </div>
                           <span className="text-sm font-bold text-earth-800 dark:text-earth-200">{item.title}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="pt-2">
                  <Button className="w-full" onClick={() => setStep('confirm')} disabled={!cashOffer && selectedItems.length === 0}>Review Offer</Button>
               </div>
            </div>
         ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4">
               <TextArea 
                  label="Message to Seller"
                  placeholder="I can meet at the feed store on Tuesday..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="h-24"
               />
               <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep('select')} className="flex-1">Back</Button>
                  <Button onClick={handleSendOffer} className="flex-1" icon={<RefreshCw size={18} />}>Send Offer</Button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};
