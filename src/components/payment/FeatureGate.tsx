import { ReactNode } from 'react'
import { useSubscriptionStore, SubscriptionTier, PRICING_PLANS } from '@/stores/subscriptionStore'
import { useAuthStore } from '@/stores/authStore'
import { Card, Button, Badge } from '@/components/ui'
import { Crown, Lock } from 'lucide-react'
import { clsx } from 'clsx'

interface FeatureGateProps {
    /** Minimum tier required to access this feature */
    requiredTier: SubscriptionTier
    /** Content to show if user has access */
    children: ReactNode
    /** Optional: custom fallback UI */
    fallback?: ReactNode
    /** If true, shows a preview/teaser instead of blocking */
    showPreview?: boolean
}

const TIER_ORDER: SubscriptionTier[] = ['free', 'starter', 'pro', 'ultimate']

/**
 * FeatureGate component for tier-based feature gating
 * Wraps content that should only be accessible to certain subscription tiers
 */
export const FeatureGate = ({
    requiredTier,
    children,
    fallback,
    showPreview = false
}: FeatureGateProps) => {
    const { subscription } = useSubscriptionStore()
    const { isAuthenticated, openLoginModal } = useAuthStore()
    const { openCheckout } = useSubscriptionStore()

    const currentTierIndex = TIER_ORDER.indexOf(subscription.tier)
    const requiredTierIndex = TIER_ORDER.indexOf(requiredTier)
    const hasAccess = currentTierIndex >= requiredTierIndex

    const requiredPlan = PRICING_PLANS.find(p => p.id === requiredTier)

    if (hasAccess) {
        return <>{children}</>
    }

    if (fallback) {
        return <>{fallback}</>
    }

    // Default locked state
    return (
        <Card className={clsx(
            'relative overflow-hidden',
            showPreview && 'min-h-[200px]'
        )}>
            {/* Blurred preview */}
            {showPreview && (
                <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
                    {children}
                </div>
            )}

            {/* Lock overlay */}
            <div className={clsx(
                'flex flex-col items-center justify-center text-center p-6',
                showPreview && 'absolute inset-0 bg-bg-primary/80 backdrop-blur-sm'
            )}>
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-2xl flex items-center justify-center">
                    <Lock size={32} className="text-accent-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                    {requiredPlan?.name} Feature
                </h3>

                <p className="text-sm text-text-muted mb-4 max-w-xs">
                    Upgrade to {requiredPlan?.name} to unlock this feature and enhance your trading experience.
                </p>

                <div className="flex gap-3">
                    {!isAuthenticated ? (
                        <Button onClick={openLoginModal} variant="outline">
                            Log In
                        </Button>
                    ) : null}
                    <Button onClick={() => openCheckout(requiredTier)} className="gap-2">
                        <Crown size={16} />
                        Upgrade to {requiredPlan?.name}
                    </Button>
                </div>

                {requiredPlan && requiredPlan.monthlyPrice > 0 && (
                    <p className="text-xs text-text-muted mt-3">
                        Starting at ${requiredPlan.monthlyPrice}/month
                    </p>
                )}
            </div>
        </Card>
    )
}

interface PremiumBadgeProps {
    tier: SubscriptionTier
    className?: string
}

/**
 * Badge to indicate premium/locked content
 */
export const PremiumBadge = ({ tier, className }: PremiumBadgeProps) => {
    const plan = PRICING_PLANS.find(p => p.id === tier)

    return (
        <Badge
            variant="primary"
            className={clsx('gap-1', className)}
        >
            <Crown size={12} />
            {plan?.name}
        </Badge>
    )
}

interface UseFeatureAccessResult {
    hasAccess: boolean
    currentTier: SubscriptionTier
    requiredTier: SubscriptionTier
    upgrade: () => void
}

/**
 * Hook to check feature access and get upgrade function
 */
export const useFeatureAccess = (requiredTier: SubscriptionTier): UseFeatureAccessResult => {
    const { subscription } = useSubscriptionStore()
    const { openCheckout } = useSubscriptionStore()

    const currentTierIndex = TIER_ORDER.indexOf(subscription.tier)
    const requiredTierIndex = TIER_ORDER.indexOf(requiredTier)
    const hasAccess = currentTierIndex >= requiredTierIndex

    return {
        hasAccess,
        currentTier: subscription.tier,
        requiredTier,
        upgrade: () => openCheckout(requiredTier),
    }
}
