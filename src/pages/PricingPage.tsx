import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
    Check,
    Sparkles,
    Crown,
    Zap,
    Star,
    Bot,
    DollarSign,
    Shield,
    HeadphonesIcon
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { useSubscriptionStore, PRICING_PLANS, SubscriptionTier } from '@/stores/subscriptionStore'
import { useAuthStore } from '@/stores/authStore'
import { clsx } from 'clsx'

const tierIcons: Record<SubscriptionTier, typeof Zap> = {
    free: Zap,
    starter: Star,
    pro: Crown,
    ultimate: Sparkles,
}

const tierColors: Record<SubscriptionTier, { text: string; bg: string }> = {
    free: { text: 'text-text-secondary', bg: 'bg-bg-tertiary' },
    starter: { text: 'text-accent-secondary', bg: 'bg-accent-secondary/10' },
    pro: { text: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    ultimate: { text: 'text-warning', bg: 'bg-warning/10' },
}

export default function PricingPage() {
    const { t } = useTranslation()
    const {
        subscription,
        selectedCycle,
        setBillingCycle,
        openCheckout
    } = useSubscriptionStore()
    const { isAuthenticated, openSignupModal } = useAuthStore()

    const yearlyDiscount = 17 // ~17% discount

    const handleSelectPlan = (planId: SubscriptionTier) => {
        if (!isAuthenticated && planId !== 'free') {
            openSignupModal()
            return
        }

        if (planId === 'free') {
            // Already on free, do nothing
            return
        }

        openCheckout(planId)
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        {t('pricing.title')}
                    </h1>
                    <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8">
                        {t('pricing.subtitle')}
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 p-1.5 bg-bg-secondary rounded-full border border-white/10">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={clsx(
                                'px-6 py-2 rounded-full text-sm font-medium transition-all',
                                selectedCycle === 'monthly'
                                    ? 'bg-accent-primary text-bg-primary'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                        >
                            {t('pricing.monthly')}
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={clsx(
                                'px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                                selectedCycle === 'yearly'
                                    ? 'bg-accent-primary text-bg-primary'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                        >
                            {t('pricing.yearly')}
                            <Badge variant="success" size="sm">
                                {t('pricing.save', { percent: yearlyDiscount })}
                            </Badge>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRICING_PLANS.map((plan, index) => {
                        const price = selectedCycle === 'yearly'
                            ? plan.yearlyPrice
                            : plan.monthlyPrice
                        const Icon = tierIcons[plan.id]
                        const colors = tierColors[plan.id]
                        const isPopular = plan.id === 'pro'
                        const isCurrentPlan = subscription.tier === plan.id

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={clsx(
                                        'h-full flex flex-col relative',
                                        isPopular && 'border-2 border-accent-primary shadow-glow',
                                        isCurrentPlan && 'ring-2 ring-success/50'
                                    )}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge variant="success" className="shadow-lg">
                                                {t('pricing.popular')}
                                            </Badge>
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 right-4">
                                            <Badge variant="primary" className="shadow-lg">
                                                Current
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                                            <Icon size={24} className={colors.text} />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                                        <p className="text-sm text-text-muted">
                                            {plan.id === 'free' ? 'Perfect for getting started' :
                                                plan.id === 'starter' ? 'For serious learners' :
                                                    plan.id === 'pro' ? 'Most popular choice' :
                                                        'For power users'}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold">
                                                ${selectedCycle === 'yearly' ? price.toFixed(0) : price.toFixed(2)}
                                            </span>
                                            {price > 0 && (
                                                <span className="text-text-muted">
                                                    /{selectedCycle === 'yearly' ? 'year' : 'mo'}
                                                </span>
                                            )}
                                        </div>
                                        {selectedCycle === 'yearly' && plan.monthlyPrice > 0 && (
                                            <p className="text-sm text-success mt-1">
                                                Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)}/year
                                            </p>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <div className="mt-0.5 text-success">
                                                    <Check size={16} />
                                                </div>
                                                <span className="text-text-secondary">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Button
                                        className="w-full"
                                        variant={isCurrentPlan ? 'ghost' : isPopular ? 'primary' : 'outline'}
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={isCurrentPlan}
                                    >
                                        {isCurrentPlan
                                            ? 'Current Plan'
                                            : plan.id === 'free'
                                                ? t('pricing.getStarted')
                                                : t('pricing.upgrade')}
                                    </Button>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20"
                >
                    <h2 className="text-2xl font-bold text-center mb-10">
                        Everything You Need to Trade Smarter
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Bot, title: 'AI-Powered Analysis', desc: 'Get intelligent market insights and predictions in real-time' },
                            { icon: DollarSign, title: 'Virtual Trading', desc: 'Practice with virtual money. No risk, all the learning.' },
                            { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade security to protect your data and privacy' },
                            { icon: HeadphonesIcon, title: 'Expert Support', desc: 'Get help when you need it from our trading experts' },
                        ].map((feature, i) => (
                            <Card key={i} hover className="text-center">
                                <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <feature.icon size={24} className="text-accent-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-text-muted">{feature.desc}</p>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <div className="mt-16 text-center">
                    <p className="text-text-muted text-sm">
                        🔒 Secure payments via Stripe • Cancel anytime • No hidden fees
                    </p>
                </div>
            </div>
        </div>
    )
}
