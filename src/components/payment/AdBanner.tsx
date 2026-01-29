import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown } from 'lucide-react'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { clsx } from 'clsx'

interface AdBannerProps {
    position?: 'top' | 'bottom' | 'sidebar'
    className?: string
}

const AD_MESSAGES = [
    {
        title: 'Upgrade to Pro',
        desc: 'Get unlimited AI queries and $100 daily bonus',
        cta: 'Upgrade Now',
        gradient: 'from-accent-primary to-accent-secondary'
    },
    {
        title: 'Try Starter Plan',
        desc: 'Ad-free experience + 50 AI queries/day',
        cta: 'Start Free Trial',
        gradient: 'from-accent-secondary to-accent-primary'
    },
    {
        title: 'Go Ultimate',
        desc: 'Unlimited everything + $500 daily bonus',
        cta: 'See Plans',
        gradient: 'from-warning to-danger'
    },
]

/**
 * Ad banner component that only shows for free tier users
 * Displays promotional content encouraging upgrades
 */
export const AdBanner = ({ position = 'bottom', className }: AdBannerProps) => {
    const { subscription, openCheckout } = useSubscriptionStore()
    const [dismissed, setDismissed] = useState(false)
    const [currentAd, setCurrentAd] = useState(0)

    // Only show for free tier users
    if (subscription.tier !== 'free' || dismissed) {
        return null
    }

    // Rotate ads
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAd(prev => (prev + 1) % AD_MESSAGES.length)
        }, 10000) // Change every 10 seconds
        return () => clearInterval(interval)
    }, [])

    const ad = AD_MESSAGES[currentAd]

    if (position === 'sidebar') {
        return (
            <div className={clsx(
                'p-4 rounded-card bg-gradient-to-br border border-white/10',
                `bg-gradient-to-br ${ad.gradient}`,
                className
            )}>
                <div className="flex items-start justify-between mb-2">
                    <Crown size={24} className="text-white" />
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <h4 className="font-semibold text-white mb-1">{ad.title}</h4>
                <p className="text-xs text-white/80 mb-3">{ad.desc}</p>
                <button
                    onClick={() => openCheckout('pro')}
                    className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-button text-white text-sm font-medium transition-colors"
                >
                    {ad.cta}
                </button>
            </div>
        )
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
                className={clsx(
                    'fixed left-0 right-0 z-40 px-4',
                    position === 'top' ? 'top-16' : 'bottom-4',
                    className
                )}
            >
                <div className={clsx(
                    'max-w-3xl mx-auto p-3 rounded-card flex items-center justify-between gap-4',
                    `bg-gradient-to-r ${ad.gradient}`,
                    'shadow-lg border border-white/10'
                )}>
                    <div className="flex items-center gap-3">
                        <Crown size={24} className="text-white flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white text-sm">{ad.title}</p>
                            <p className="text-xs text-white/80">{ad.desc}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openCheckout('pro')}
                            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-button text-white text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            {ad.cta}
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="p-1.5 text-white/60 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * Inline ad component for use within content areas
 */
export const InlineAd = ({ className }: { className?: string }) => {
    const { subscription, openCheckout } = useSubscriptionStore()

    if (subscription.tier !== 'free') {
        return null
    }

    return (
        <div className={clsx(
            'p-4 bg-gradient-to-r from-bg-tertiary to-bg-secondary rounded-card border border-white/10',
            className
        )}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                        <Crown size={20} className="text-accent-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">Remove ads & get more features</p>
                        <p className="text-xs text-text-muted">Upgrade to Starter for just $9.99/month</p>
                    </div>
                </div>
                <button
                    onClick={() => openCheckout('starter')}
                    className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-button text-sm font-medium transition-colors"
                >
                    Upgrade
                </button>
            </div>
        </div>
    )
}
