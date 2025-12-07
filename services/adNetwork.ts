
import { dbService } from './db';
import { AdCampaign, AdEvent, AdPlacementConfig, AdCreative, SponsorBanner } from '../types';

// Mock active campaigns since we don't have a backend to seed this
const MOCK_CAMPAIGNS: AdCampaign[] = [
    {
        id: 'camp_1',
        sponsorId: 'sponsor_1',
        title: 'Spring Seed Sale',
        type: 'banner',
        placements: ['dashboard_top_banner'],
        startDate: Date.now() - 86400000,
        endDate: Date.now() + 864000000,
        priority: 5,
        status: 'active',
        priceCents: 50000,
        billingModel: 'flat',
        creatives: [
            { id: 'cr_1', fileUrl: '', clickUrl: '#', altText: '50% Off Heirloom Seeds', format: 'banner', approved: true }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    },
    {
        id: 'camp_2',
        sponsorId: 'sponsor_2',
        title: 'Local Tractor Service',
        type: 'sponsor_block',
        placements: ['dashboard_feature_block'],
        startDate: Date.now() - 86400000,
        endDate: Date.now() + 864000000,
        priority: 3,
        status: 'active',
        priceCents: 30000,
        billingModel: 'flat',
        creatives: [
            { id: 'cr_2', fileUrl: '', clickUrl: '#', altText: 'Reliable Mechanics', format: 'card', approved: true }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    },
    {
        id: 'camp_3',
        sponsorId: 'sponsor_3',
        title: 'Fall Harvest Festival',
        type: 'seasonal_panel',
        placements: ['seasonal_panel'],
        startDate: Date.now() - 86400000,
        endDate: Date.now() + 864000000,
        priority: 10,
        status: 'active',
        priceCents: 100000,
        billingModel: 'flat',
        creatives: [
            { id: 'cr_3', fileUrl: '', clickUrl: '#', altText: 'Join us this October!', format: 'banner', approved: true }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    }
];

export const adNetwork = {
    
    /**
     * Get an ad for a specific placement.
     * Uses a weighted random selection based on priority.
     */
    async getAdForPlacement(placementId: string): Promise<{ campaign: AdCampaign, creative: AdCreative } | null> {
        // 1. Fetch Active Campaigns from IndexedDB (cache)
        let campaigns = await dbService.getAll<AdCampaign>('campaigns');
        
        // If DB empty, fallback to mock for demo
        if (campaigns.length === 0) {
            campaigns = MOCK_CAMPAIGNS;
        }

        // 2. Filter: Active, Date Range, Placement Match
        const now = Date.now();
        const eligible = campaigns.filter(c => 
            c.status === 'active' && 
            c.startDate <= now && 
            c.endDate >= now &&
            c.placements.includes(placementId) &&
            c.creatives.some(cr => cr.approved)
        );

        if (eligible.length === 0) return null;

        // 3. Weighted Random Selection
        // Higher priority = higher chance.
        const totalWeight = eligible.reduce((sum, c) => sum + (c.priority || 1), 0);
        let random = Math.random() * totalWeight;
        
        for (const camp of eligible) {
            random -= (camp.priority || 1);
            if (random <= 0) {
                const creative = camp.creatives.find(cr => cr.approved); // Pick first approved for now
                if (creative) return { campaign: camp, creative };
            }
        }

        return null;
    },

    /**
     * Log an impression.
     * Stores in IndexedDB immediately.
     */
    async logImpression(campaignId: string, creativeId: string, placementId: string) {
        const event: AdEvent = {
            id: crypto.randomUUID(),
            type: 'impression',
            campaignId,
            creativeId,
            placementId,
            timestamp: Date.now(),
            offlineFlag: !navigator.onLine,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('ad_events', event);
        this.triggerSync();
    },

    /**
     * Log a click.
     * Handles offline behavior (queueing).
     */
    async logClick(campaignId: string, creativeId: string, placementId: string, targetUrl: string) {
        const event: AdEvent = {
            id: crypto.randomUUID(),
            type: 'click',
            campaignId,
            creativeId,
            placementId,
            timestamp: Date.now(),
            offlineFlag: !navigator.onLine,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('ad_events', event);
        this.triggerSync();

        // Offline Handling for User
        if (!navigator.onLine) {
            alert("You are offline. This link has been saved and will open when you reconnect.");
            // Store targetUrl in a 'pending_clicks' store if we wanted to auto-open
        } else {
            window.open(targetUrl, '_blank');
        }
    },

    /**
     * Simulate background sync to server
     */
    async triggerSync() {
        if (!navigator.onLine) return;

        // Simulate network delay
        setTimeout(async () => {
            const pendingEvents = await dbService.getAllByIndex<AdEvent>('ad_events', 'syncStatus', 'pending');
            if (pendingEvents.length > 0) {
                console.log(`[AdNetwork] Syncing ${pendingEvents.length} events to server...`);
                // In real app: POST /api/ads/events/batch
                
                // Mark synced
                for (const event of pendingEvents) {
                    event.syncStatus = 'synced';
                    await dbService.put('ad_events', event);
                }
            }
        }, 5000);
    },

    /**
     * Adapter to convert AdCampaign to SponsorBanner for legacy component compatibility
     */
    toSponsorBanner(camp: AdCampaign, creative: AdCreative): SponsorBanner {
        return {
            id: camp.id,
            partnerName: 'Sponsor', // In real app, fetch sponsor name
            title: camp.title,
            description: creative.altText,
            link: creative.clickUrl,
            categoryTarget: 'general'
        };
    }
};
