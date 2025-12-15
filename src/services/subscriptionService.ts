import { dbService } from './db';
import { Subscription, SubscriptionPlan, TrialCode, SubscriptionLog, UserProfile, FeatureAccessCache } from '../types';

export const DEFAULT_PLANS: SubscriptionPlan[] = [
    {
        id: 'plan_free',
        name: 'Homesteader Free',
        slug: 'free',
        description: 'Basic tools for hobbyists.',
        priceCents: 0,
        currency: 'usd',
        billingInterval: 'month',
        durationDays: 30,
        features: ['basic_garden', 'task_lists', 'marketplace_buy'],
        isTrialAllowed: false,
        trialDays: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    },
    {
        id: 'plan_pro',
        name: 'Homesteader Pro',
        slug: 'pro',
        description: 'AI insights and advanced tracking.',
        priceCents: 499,
        currency: 'usd',
        billingInterval: 'month',
        durationDays: 30,
        features: ['basic_garden', 'task_lists', 'marketplace_buy', 'ai_agents', 'advanced_reports', 'marketplace_sell', 'unlimited_herds'],
        isTrialAllowed: true,
        trialDays: 14,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    },
    {
        id: 'plan_farm',
        name: 'Farm Business',
        slug: 'farm',
        description: 'Full suite for commercial operations.',
        priceCents: 1999,
        currency: 'usd',
        billingInterval: 'month',
        durationDays: 30,
        features: ['basic_garden', 'task_lists', 'marketplace_buy', 'ai_agents', 'advanced_reports', 'marketplace_sell', 'unlimited_herds', 'financial_forecasting', 'regulatory_export', 'team_access'],
        isTrialAllowed: true,
        trialDays: 30,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    }
];

export const subscriptionService = {

    /**
     * Initialize default plans if DB is empty
     */
    async initializePlans() {
        try {
            const plans = await dbService.getAll<SubscriptionPlan>('subscription_plans');
            if (plans.length === 0) {
                console.log('Seeding default subscription plans...');
                for (const plan of DEFAULT_PLANS) {
                    await dbService.put('subscription_plans', plan);
                }
            }
        } catch (e) {
            console.error("Failed to initialize plans", e);
        }
    },

    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const plans = await dbService.getAll<SubscriptionPlan>('subscription_plans');
            return plans.filter(p => p.isActive);
        } catch(e) {
            console.error("Error fetching plans", e);
            return [];
        }
    },

    async getAdminPlans(): Promise<SubscriptionPlan[]> {
        return await dbService.getAll<SubscriptionPlan>('subscription_plans');
    },

    async getAllCodes(): Promise<TrialCode[]> {
        return await dbService.getAll<TrialCode>('trial_codes');
    },

    async savePlan(plan: SubscriptionPlan): Promise<void> {
        await dbService.put('subscription_plans', plan);
    },

    async deletePlan(id: string): Promise<void> {
        await dbService.delete('subscription_plans', id);
    },

    async deleteCode(id: string): Promise<void> {
        await dbService.delete('trial_codes', id);
    },

    /**
     * Get the active subscription for a user.
     * Returns null if no active sub found.
     */
    async getActiveSubscription(userId: string): Promise<Subscription | null> {
        const subs = await dbService.getAllByIndex<Subscription>('subscriptions', 'userId', userId);
        // Find one that is active or trialing and not expired
        const active = subs.find(s => 
            (s.status === 'active' || s.status === 'trialing') && s.endDate > Date.now()
        );
        return active || null;
    },

    /**
     * Check if a user has access to a specific feature.
     * Uses caching for performance.
     */
    async canAccess(userId: string, featureKey: string): Promise<boolean> {
        // 1. Check Cache
        const cacheKey = `access_${userId}`;
        const cached = await dbService.get<FeatureAccessCache>('feature_access_cache', cacheKey);
        
        if (cached && (Date.now() - cached.lastChecked < 60000)) { // 1 min cache
            if (cached.features.includes(featureKey)) return true;
            // Admin override check is implicit if admin role is synced, but here we stick to features
        }

        // 2. Resolve Plan
        let features: string[] = [];
        let planSlug = 'free';

        // Admin Override
        const userProfile = await dbService.get<UserProfile>('user_profile', userId);
        if (userProfile?.role === 'admin') {
            return true; 
        }

        const activeSub = await this.getActiveSubscription(userId);
        if (activeSub) {
            const plan = await dbService.get<SubscriptionPlan>('subscription_plans', activeSub.planId);
            if (plan) {
                features = plan.features || [];
                planSlug = plan.slug;
            }
        } else {
            // Fallback to Free Plan
            const freePlan = (await this.getPlans()).find(p => p.slug === 'free');
            if (freePlan) features = freePlan.features || [];
        }

        // 3. Update Cache
        const newCache: FeatureAccessCache = {
            id: cacheKey,
            userId: cacheKey, // Using ID as Key for store compatibility
            features,
            planSlug,
            lastChecked: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'synced'
        };
        // Note: feature_access_cache store structure assumes id is keyPath
        await dbService.put('feature_access_cache', newCache);

        return features.includes(featureKey);
    },

    /**
     * Subscribe a user to a plan.
     * Handles upgrading/downgrading logic.
     */
    async subscribe(userId: string, planId: string): Promise<void> {
        const plan = await dbService.get<SubscriptionPlan>('subscription_plans', planId);
        if (!plan) throw new Error("Plan not found");

        const currentSub = await this.getActiveSubscription(userId);
        
        // Cancel old sub if exists
        if (currentSub) {
            currentSub.status = 'canceled';
            currentSub.updatedAt = Date.now();
            await dbService.put('subscriptions', currentSub);
            
            await this.logActivity(userId, 'upgrade', planId, `Switched from ${currentSub.planId}`);
        } else {
            await this.logActivity(userId, 'activate', planId, 'New Subscription');
        }

        const newSub: Subscription = {
            id: crypto.randomUUID(),
            userId,
            planId,
            status: 'active',
            startDate: Date.now(),
            endDate: Date.now() + (plan.durationDays * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };

        await dbService.put('subscriptions', newSub);
        
        // Update User Profile pointer
        const profile = await dbService.get<UserProfile>('user_profile', userId);
        if (profile) {
            profile.subscriptionId = newSub.id;
            await dbService.put('user_profile', profile);
        }

        // Invalidate Cache
        await dbService.delete('feature_access_cache', `access_${userId}`);
    },

    async redeemTrial(userId: string, codeStr: string): Promise<boolean> {
        const code = await dbService.getByIndex<TrialCode>('trial_codes', 'code', codeStr);
        
        if (!code) throw new Error("Invalid code");
        if (code.expirationDate < Date.now()) throw new Error("Code expired");
        if (code.usageCount >= code.usageLimit) throw new Error("Code usage limit reached");

        // Apply Plan
        const plan = await dbService.get<SubscriptionPlan>('subscription_plans', code.planId);
        if (!plan) throw new Error("Plan associated with code not found");

        // Logic: Create a subscription with status 'trialing'
        const newSub: Subscription = {
            id: crypto.randomUUID(),
            userId,
            planId: plan.id,
            status: 'trialing',
            startDate: Date.now(),
            endDate: Date.now() + (code.durationDays * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: true, // Trials auto-cancel by default in this logic
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };

        await dbService.put('subscriptions', newSub);

        // Update User Profile
        const profile = await dbService.get<UserProfile>('user_profile', userId);
        if (profile) {
            profile.subscriptionId = newSub.id;
            await dbService.put('user_profile', profile);
        }

        // Update Code Usage
        code.usageCount++;
        await dbService.put('trial_codes', code);

        await this.logActivity(userId, 'trial_redeem', plan.id, `Redeemed code ${codeStr}`);
        
        // Invalidate Cache
        await dbService.delete('feature_access_cache', `access_${userId}`);

        return true;
    },

    async createPromoCode(
        planId: string, 
        codeStr: string | null, 
        campaign: string, 
        durationDays: number, 
        usageLimit: number
    ): Promise<string> {
        // If codeStr is provided, use it, else generate one
        const finalCode = codeStr || ('PROMO-' + Math.random().toString(36).substr(2, 6).toUpperCase());
        
        // Check duplicate
        const existing = await dbService.getByIndex<TrialCode>('trial_codes', 'code', finalCode);
        if (existing) throw new Error(`Code ${finalCode} already exists.`);

        const code: TrialCode = {
            id: crypto.randomUUID(),
            code: finalCode,
            campaign,
            planId,
            durationDays,
            usageLimit,
            usageCount: 0,
            expirationDate: Date.now() + (365 * 24 * 60 * 60 * 1000), // Default 1 year exp
            createdBy: 'admin',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };

        await dbService.put('trial_codes', code);
        return finalCode;
    },

    // Legacy support alias
    async generateTrialCode(planId: string, durationDays: number, usageLimit: number): Promise<string> {
        return this.createPromoCode(planId, null, 'Generated', durationDays, usageLimit);
    },

    async logActivity(userId: string, action: SubscriptionLog['action'], planId: string, notes?: string) {
        const log: SubscriptionLog = {
            id: crypto.randomUUID(),
            userId,
            action,
            planId,
            notes,
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('subscription_logs', log);
    }
};