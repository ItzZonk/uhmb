import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    CreditCard,
    Shield,
    Check,
    Loader2,
    Zap,
    Crown
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import {
    useSubscriptionStore,
    PRICING_PLANS,
    SubscriptionTier,
    BillingCycle
} from '@/stores/subscriptionStore'
import { clsx } from 'clsx'

export const CheckoutModal = () => {
    const {
        checkoutOpen,
        closeCheckout,
        selectedPlan,
        selectedCycle,
        setBillingCycle,
        subscribe,
        isProcessing
    } = useSubscriptionStore()

    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState<string | null>(null)

    const plan = PRICING_PLANS.find(p => p.id === selectedPlan)

    if (!checkoutOpen || !plan) return null

    const price = selectedCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
    const savings = selectedCycle === 'yearly'
        ? Math.round((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100)
        : 0

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        return parts.length ? parts.join(' ') : value
    }

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4)
        }
        return v
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Basic validation
        if (cardNumber.replace(/\s/g, '').length < 16) {
            setError('Please enter a valid card number')
            return
        }
        if (expiry.length < 5) {
            setError('Please enter a valid expiry date')
            return
        }
        if (cvc.length < 3) {
            setError('Please enter a valid CVC')
            return
        }
        if (name.length < 2) {
            setError('Please enter the name on your card')
            return
        }

        const result = await subscribe(selectedPlan as SubscriptionTier, selectedCycle)

        if (!result.success) {
            setError(result.error || 'Payment failed. Please try again.')
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={closeCheckout}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-bg-secondary rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-6 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border-b border-white/10">
                        <button
                            onClick={closeCheckout}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center shadow-glow">
                                <Crown size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{plan.name} Plan</h2>
                                <p className="text-sm text-text-muted">
                                    Upgrade your trading experience
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Billing Cycle Toggle */}
                        <div className="flex items-center justify-center gap-2 p-1 bg-bg-tertiary rounded-button">
                            {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                                <button
                                    key={cycle}
                                    type="button"
                                    onClick={() => setBillingCycle(cycle)}
                                    className={clsx(
                                        'flex-1 py-2 px-4 rounded-button text-sm font-medium transition-all',
                                        selectedCycle === cycle
                                            ? 'bg-accent-primary text-white'
                                            : 'text-text-muted hover:text-text-primary'
                                    )}
                                >
                                    {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                                    {cycle === 'yearly' && savings > 0 && (
                                        <Badge variant="success" size="sm" className="ml-2">
                                            -{savings}%
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Price Display */}
                        <div className="text-center py-4 bg-bg-tertiary rounded-card">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold">${price}</span>
                                <span className="text-text-muted">/{selectedCycle === 'yearly' ? 'year' : 'month'}</span>
                            </div>
                            {selectedCycle === 'yearly' && (
                                <p className="text-sm text-success mt-1">
                                    Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)} per year
                                </p>
                            )}
                        </div>

                        {/* Card Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Card Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="w-full px-4 py-3 pl-12 bg-bg-tertiary rounded-input focus:outline-none focus:ring-2 focus:ring-accent-primary/50 font-mono"
                                    />
                                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Expiry</label>
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="w-full px-4 py-3 bg-bg-tertiary rounded-input focus:outline-none focus:ring-2 focus:ring-accent-primary/50 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">CVC</label>
                                    <input
                                        type="text"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="123"
                                        maxLength={4}
                                        className="w-full px-4 py-3 bg-bg-tertiary rounded-input focus:outline-none focus:ring-2 focus:ring-accent-primary/50 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Name on Card</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-bg-tertiary rounded-input focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Features Preview */}
                        <div className="py-4 border-t border-white/10">
                            <p className="text-sm text-text-muted mb-3">What you'll get:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {plan.features.slice(0, 6).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <Check size={14} className="text-success flex-shrink-0" />
                                        <span className="truncate">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full gap-2 py-3"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    Subscribe for ${price}/{selectedCycle === 'yearly' ? 'year' : 'month'}
                                </>
                            )}
                        </Button>

                        {/* Security Note */}
                        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                            <Shield size={14} />
                            <span>Secured by Stripe. 256-bit SSL encryption.</span>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
