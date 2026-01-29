import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'ultimate'
export type BillingCycle = 'monthly' | 'yearly'

export interface PricingPlan {
    id: SubscriptionTier
    name: string
    monthlyPrice: number
    yearlyPrice: number
    features: string[]
    limits: {
        aiQueries: number
        virtualBalance: number
        dailyBonus: number
        advancedCharts: boolean
        aiPredictions: boolean
        prioritySupport: boolean
    }
}

export const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            '$500 virtual balance',
            'Real-time market data',
            '10 AI queries per day',
            'Basic chart indicators',
            'Community support',
        ],
        limits: {
            aiQueries: 10,
            virtualBalance: 500,
            dailyBonus: 0,
            advancedCharts: false,
            aiPredictions: false,
            prioritySupport: false,
        },
    },
    {
        id: 'starter',
        name: 'Starter',
        monthlyPrice: 9.99,
        yearlyPrice: 99,
        features: [
            '$5,000 virtual balance',
            'Real-time market data',
            '50 AI queries per day',
            'Advanced chart indicators',
            '$50 daily bonus',
            'Email support',
        ],
        limits: {
            aiQueries: 50,
            virtualBalance: 5000,
            dailyBonus: 50,
            advancedCharts: true,
            aiPredictions: false,
            prioritySupport: false,
        },
    },
    {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 19.99,
        yearlyPrice: 199,
        features: [
            '$25,000 virtual balance',
            'Real-time market data',
            'Unlimited AI queries',
            'Advanced chart indicators',
            'AI price predictions',
            '$100 daily bonus',
            'Priority support',
        ],
        limits: {
            aiQueries: -1, // Unlimited
            virtualBalance: 25000,
            dailyBonus: 100,
            advancedCharts: true,
            aiPredictions: true,
            prioritySupport: true,
        },
    },
    {
        id: 'ultimate',
        name: 'Ultimate',
        monthlyPrice: 49.99,
        yearlyPrice: 499,
        features: [
            '$100,000 virtual balance',
            'Real-time market data',
            'Unlimited AI queries',
            'All chart indicators',
            'AI price predictions',
            '$500 daily bonus',
            'Priority support',
            'Exclusive strategies',
            'API access',
        ],
        limits: {
            aiQueries: -1,
            virtualBalance: 100000,
            dailyBonus: 500,
            advancedCharts: true,
            aiPredictions: true,
            prioritySupport: true,
        },
    },
]

interface Subscription {
    tier: SubscriptionTier
    billingCycle: BillingCycle
    startDate: Date | null
    endDate: Date | null
    isActive: boolean
    cancelAtPeriodEnd: boolean
}

interface SubscriptionState {
    subscription: Subscription
    isProcessing: boolean

    // Checkout state
    checkoutOpen: boolean
    selectedPlan: SubscriptionTier | null
    selectedCycle: BillingCycle

    // Actions
    openCheckout: (plan: SubscriptionTier) => void
    closeCheckout: () => void
    setBillingCycle: (cycle: BillingCycle) => void
    subscribe: (plan: SubscriptionTier, cycle: BillingCycle) => Promise<{ success: boolean; error?: string }>
    cancelSubscription: () => Promise<{ success: boolean }>

    // Feature gating
    canUseFeature: (feature: 'advancedCharts' | 'aiPredictions' | 'prioritySupport') => boolean
    getAIQueryLimit: () => number
    getDailyBonus: () => number
    getVirtualBalance: () => number
}

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            subscription: {
                tier: 'free',
                billingCycle: 'monthly',
                startDate: null,
                endDate: null,
                isActive: true,
                cancelAtPeriodEnd: false,
            },
            isProcessing: false,
            checkoutOpen: false,
            selectedPlan: null,
            selectedCycle: 'monthly',

            openCheckout: (plan) => set({
                checkoutOpen: true,
                selectedPlan: plan
            }),

            closeCheckout: () => set({
                checkoutOpen: false,
                selectedPlan: null
            }),

            setBillingCycle: (cycle) => set({ selectedCycle: cycle }),

            subscribe: async (plan, cycle) => {
                set({ isProcessing: true })

                // Simulate Stripe checkout process
                await new Promise(r => setTimeout(r, 2000))

                // In production, this would:
                // 1. Create Stripe checkout session
                // 2. Redirect to Stripe hosted checkout
                // 3. Handle webhook for successful payment
                // 4. Update subscription in database

                const startDate = new Date()
                const endDate = new Date()
                endDate.setMonth(endDate.getMonth() + (cycle === 'yearly' ? 12 : 1))

                set({
                    subscription: {
                        tier: plan,
                        billingCycle: cycle,
                        startDate,
                        endDate,
                        isActive: true,
                        cancelAtPeriodEnd: false,
                    },
                    isProcessing: false,
                    checkoutOpen: false,
                    selectedPlan: null,
                })

                return { success: true }
            },

            cancelSubscription: async () => {
                set({ isProcessing: true })

                await new Promise(r => setTimeout(r, 1000))

                set((state) => ({
                    subscription: {
                        ...state.subscription,
                        cancelAtPeriodEnd: true,
                    },
                    isProcessing: false,
                }))

                return { success: true }
            },

            canUseFeature: (feature) => {
                const { subscription } = get()
                const plan = PRICING_PLANS.find(p => p.id === subscription.tier)
                return plan?.limits[feature] ?? false
            },

            getAIQueryLimit: () => {
                const { subscription } = get()
                const plan = PRICING_PLANS.find(p => p.id === subscription.tier)
                return plan?.limits.aiQueries ?? 10
            },

            getDailyBonus: () => {
                const { subscription } = get()
                const plan = PRICING_PLANS.find(p => p.id === subscription.tier)
                return plan?.limits.dailyBonus ?? 0
            },

            getVirtualBalance: () => {
                const { subscription } = get()
                const plan = PRICING_PLANS.find(p => p.id === subscription.tier)
                return plan?.limits.virtualBalance ?? 500
            },
        }),
        {
            name: 'quantix-subscription',
            partialize: (state) => ({
                subscription: state.subscription,
                selectedCycle: state.selectedCycle,
            }),
        }
    )
)
