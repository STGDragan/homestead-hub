
import { dbService } from './db';
import { Subscription, SubscriptionPlan, UserProfile } from '../types';

export const PLANS: SubscriptionPlan[] = [
    {
        id: 'plan_free',
        name: 'Homesteader Free',
        slug: 'free',
        description: 'Basic tools for hobbyists.',
        priceCents: 0,
        currency: 'usd',
        billingInterval: 'month',
        durationDays: 30,
        features: ['Basic Garden Planner', 'Task Lists', 'Community Marketplace'],
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
        features: ['AI Plant Diagnostics', 'Unlimited Livestock', 'Advanced Reporting', 'No Ads'],
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
        features: ['Multi-User Access', 'Financial Forecasting', 'Regulatory Exports', 'Priority Support'],
        isTrialAllowed: true,
        trialDays: 30,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    }
];

export const billingService = {
    
    /**
     * Check if feature is allowed for current user
     */
    async canAccessFeature(featureKey: string): Promise<boolean> {
        const user = await dbService.get<UserProfile>('user_profile', 'main_user');
        
        // Admin override
        if (user?.role === 'admin') return true;

        if (!user || !user.subscriptionId) {
            // Free tier logic checks
            if (featureKey === 'ai_diagnostics') return false;
            return true;
        }

        const sub = await dbService.get<Subscription>('subscriptions', user.subscriptionId);
        if (!sub || sub.status !== 'active') return false;

        // Plan capability check
        const plan = PLANS.find(p => p.id === sub.planId);
        if (!plan) return false;

        // Logic mapping features to plan slugs
        if (featureKey === 'ai_diagnostics' && plan.slug === 'free') return false;
        
        return true;
    },

    /**
     * Start a checkout session (Mock)
     */
    async startSubscription(planId: string): Promise<void> {
        // 1. Simulate API call to Stripe
        console.log(`Starting checkout for ${planId}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Mock Success (Local Update)
        const user = await dbService.get<UserProfile>('user_profile', 'main_user');
        if (user) {
            const subId = `sub_${Date.now()}`;
            const newSub: Subscription = {
                id: subId,
                userId: user.id,
                planId: planId,
                status: 'active',
                startDate: Date.now(),
                endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
                cancelAtPeriodEnd: false,
                providerSubscriptionId: `sub_stripe_${Date.now()}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };

            await dbService.put('subscriptions', newSub);
            
            user.subscriptionId = subId;
            user.role = 'user'; // Ensure role is standard
            await dbService.put('user_profile', user);
            
            alert("Subscription Activated! (Mock)");
            window.location.reload();
        }
    },

    async getActiveSubscription(): Promise<{ sub: Subscription | null, plan: SubscriptionPlan | null }> {
        const user = await dbService.get<UserProfile>('user_profile', 'main_user');
        if (!user?.subscriptionId) return { sub: null, plan: PLANS[0] };

        const sub = await dbService.get<Subscription>('subscriptions', user.subscriptionId);
        const plan = PLANS.find(p => p.id === sub?.planId) || PLANS[0];
        
        return { sub: sub || null, plan };
    }
};
