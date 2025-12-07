
import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { MarketplaceItem, MarketCategory, TradeOffer, UserProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ListingCard } from '../../components/marketplace/ListingCard';
import { ListingEditorModal } from '../../components/marketplace/ListingEditorModal';
import { TradeOfferModal } from '../../components/marketplace/TradeOfferModal';
import { AdPlacement } from '../../components/monetization/AdPlacement';
import { Store, Plus, Search, Inbox, Heart } from 'lucide-react';
import { MARKET_CATEGORIES } from '../../constants';

export const MarketplaceDashboard: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [activeTab, setActiveTab] = useState<'community' | 'mine' | 'saved' | 'offers'>('community');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'all'>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  
  // Trade Logic
  const [tradeTarget, setTradeTarget] = useState<MarketplaceItem | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    // 1. Load User Profile for Saved Items
    const profile = await dbService.get<UserProfile>('user_profile', 'main_user');
    if (profile) {
        setUserProfile(profile);
        setSavedIds(new Set(profile.savedListingIds || []));
    }

    // 2. Load Local Listings
    const localListings = await dbService.getAll<MarketplaceItem>('marketplace');
    const localOffers = await dbService.getAll<TradeOffer>('offers');
    
    // 3. Mock Community Data (Demo)
    const mockCommunityListings: MarketplaceItem[] = [
        { id: 'm1', title: 'Heritage Turkey Poults', description: '3 weeks old, Bourbon Reds.', type: 'sale', price: 15, category: 'livestock', location: 'Near Barnsville', images: [], status: 'active', ownerId: 'u2', createdAt: Date.now() - 86400000, updatedAt: Date.now(), syncStatus: 'synced' },
        { id: 'm2', title: 'Compost Sifter', description: 'Handmade hardware cloth sifter.', type: 'trade', tradeRequirements: 'Canning jars', category: 'equipment', location: 'Valley Rd', images: [], status: 'active', ownerId: 'u3', createdAt: Date.now() - 172800000, updatedAt: Date.now(), syncStatus: 'synced' },
        { id: 'm3', title: 'Extra Zucchini', description: 'Way too many. Please take them.', type: 'free', category: 'produce', location: 'Main St', images: [], status: 'active', ownerId: 'u4', createdAt: Date.now(), updatedAt: Date.now(), syncStatus: 'synced' },
    ];

    // Merge keeping local updates priority if IDs conflict (not likely with UUIDs but safe practice)
    const combined = [...localListings];
    mockCommunityListings.forEach(mock => {
        if (!combined.find(c => c.id === mock.id)) combined.push(mock);
    });

    setItems(combined);
    setOffers(localOffers);
  };

  const handleSaveItem = async (data: Partial<MarketplaceItem>) => {
    const newItem: MarketplaceItem = {
        id: data.id || crypto.randomUUID(),
        title: data.title!,
        description: data.description || '',
        type: data.type!,
        category: data.category!,
        price: data.price,
        tradeRequirements: data.tradeRequirements,
        location: data.location || 'Local',
        images: data.images || [],
        status: 'active',
        ownerId: 'me',
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };
    await dbService.put('marketplace', newItem);
    
    // Switch to "My Listings" so user sees their new item immediately
    if (newItem.ownerId === 'me' && activeTab !== 'mine') {
        setActiveTab('mine');
    } else {
        loadData();
    }

    setIsEditorOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Delete this listing?")) {
        await dbService.delete('marketplace', id);
        loadData();
        setIsEditorOpen(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!userProfile) return;

      const newSet = new Set(savedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }

      setSavedIds(newSet);
      
      const updatedProfile = { ...userProfile, savedListingIds: Array.from(newSet), updatedAt: Date.now(), syncStatus: 'pending' as const };
      await dbService.put('user_profile', updatedProfile);
      setUserProfile(updatedProfile);
  };

  const handleShare = (e: React.MouseEvent, item: MarketplaceItem) => {
      e.stopPropagation();
      const shareData = {
          title: item.title,
          text: `Check out ${item.title} on Homestead Hub!`,
          url: window.location.href // In real app, deep link
      };
      
      if (navigator.share) {
          navigator.share(shareData).catch(console.error);
      } else {
          navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          alert("Link copied to clipboard!");
      }
  };

  // Filter Logic
  const filteredItems = items.filter(item => {
      const isMyItem = item.ownerId === 'me';
      let tabMatch = true;
      
      if (activeTab === 'mine') tabMatch = isMyItem;
      else if (activeTab === 'saved') tabMatch = savedIds.has(item.id);
      else if (activeTab === 'community') tabMatch = !isMyItem;

      const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch = categoryFilter === 'all' || item.category === categoryFilter;
      return tabMatch && searchMatch && catMatch;
  });

  // Render Offers Tab
  const renderOffers = () => (
     <div className="space-y-4">
        {offers.length === 0 ? (
           <div className="text-center py-12 bg-white dark:bg-night-900 rounded-xl border-2 border-dashed border-earth-200 dark:border-night-800 text-earth-500 dark:text-night-400">
              <Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p>No active trade offers.</p>
           </div>
        ) : (
           <div className="grid gap-3">
              {offers.map(offer => {
                 const listing = items.find(i => i.id === offer.listingId);
                 return (
                    <div key={offer.id} className="bg-white dark:bg-night-900 p-4 rounded-xl border border-earth-200 dark:border-night-800 flex justify-between items-center">
                       <div>
                          <p className="text-xs font-bold text-earth-500 dark:text-night-400 uppercase mb-1">
                             {offer.buyerId === 'me' ? 'Outgoing Offer' : 'Incoming Offer'}
                          </p>
                          <h3 className="font-bold text-earth-900 dark:text-earth-100">
                             For: {listing?.title || 'Unknown Item'}
                          </h3>
                          <p className="text-sm text-earth-600 dark:text-night-300 mt-1">
                             Status: <span className="capitalize font-bold text-leaf-700 dark:text-leaf-400">{offer.status}</span>
                          </p>
                       </div>
                       <Button size="sm" variant="secondary">View Chat</Button>
                    </div>
                 );
              })}
           </div>
        )}
     </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <Store className="text-leaf-700 dark:text-leaf-400" /> Marketplace
          </h1>
          <p className="text-earth-600 dark:text-night-400">Barter, buy, and trade with neighbors.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button className="flex-1 md:flex-none" onClick={() => { setEditingItem(null); setIsEditorOpen(true); }} icon={<Plus size={18} />}>Post Item</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-earth-200 dark:border-night-800 overflow-x-auto">
         <button 
           onClick={() => setActiveTab('community')}
           className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'community' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            Community
         </button>
         <button 
           onClick={() => setActiveTab('mine')}
           className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mine' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            My Listings
         </button>
         <button 
           onClick={() => setActiveTab('saved')}
           className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'saved' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            <Heart size={14} className={activeTab === 'saved' ? 'fill-current' : ''} /> Favorites
         </button>
         <button 
           onClick={() => setActiveTab('offers')}
           className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'offers' ? 'border-leaf-600 text-leaf-800 dark:text-leaf-400' : 'border-transparent text-earth-500 dark:text-night-500 hover:text-earth-800 dark:hover:text-night-300'}`}
         >
            Offers ({offers.length})
         </button>
      </div>

      {activeTab === 'offers' ? renderOffers() : (
         <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
               <div className="flex-1">
                  <Input 
                     icon={<Search size={18} />}
                     placeholder="Search items..."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <button 
                     onClick={() => setCategoryFilter('all')}
                     className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${categoryFilter === 'all' ? 'bg-earth-800 text-white border-earth-800 dark:bg-leaf-600 dark:border-leaf-600' : 'bg-white dark:bg-night-900 text-earth-600 dark:text-night-300 border-earth-200 dark:border-night-700'}`}
                  >
                     All
                  </button>
                  {MARKET_CATEGORIES.map(c => (
                     <button 
                        key={c.id}
                        onClick={() => setCategoryFilter(c.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${categoryFilter === c.id ? 'bg-earth-800 text-white border-earth-800 dark:bg-leaf-600 dark:border-leaf-600' : 'bg-white dark:bg-night-900 text-earth-600 dark:text-night-300 border-earth-200 dark:border-night-700'}`}
                     >
                        {c.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Grid */}
            <div className="space-y-6">
               {/* Use new AdPlacement here */}
               {activeTab === 'community' && (
                  <AdPlacement placementId="feed_inline" />
               )}

               {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-night-900 rounded-2xl border-2 border-dashed border-earth-200 dark:border-night-800">
                     <div className="w-16 h-16 bg-earth-100 dark:bg-night-800 rounded-full flex items-center justify-center mx-auto mb-4 text-earth-500">
                        <Store size={32} />
                     </div>
                     <h3 className="font-serif font-bold text-earth-800 dark:text-earth-100 mb-2">No listings found</h3>
                     <p className="text-earth-500 dark:text-night-400 mb-6">Try adjusting filters or post the first listing!</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredItems.map(item => (
                        <ListingCard 
                           key={item.id} 
                           item={item} 
                           isOwner={item.ownerId === 'me'}
                           isSaved={savedIds.has(item.id)}
                           onToggleSave={(e) => handleToggleSave(e, item.id)}
                           onShare={(e) => handleShare(e, item)}
                           onClick={() => {
                               if(item.ownerId === 'me') {
                                   setEditingItem(item);
                                   setIsEditorOpen(true);
                               } else {
                                   setTradeTarget(item);
                               }
                           }}
                        />
                     ))}
                  </div>
               )}
            </div>
         </>
      )}

      {isEditorOpen && (
         <ListingEditorModal 
            item={editingItem}
            onSave={handleSaveItem}
            onClose={() => setIsEditorOpen(false)}
            onDelete={handleDeleteItem}
         />
      )}

      {tradeTarget && (
         <TradeOfferModal 
            targetItem={tradeTarget}
            onClose={() => setTradeTarget(null)}
            onSubmit={() => {
               setTradeTarget(null);
               loadData();
               setActiveTab('offers');
            }}
         />
      )}
    </div>
  );
};
