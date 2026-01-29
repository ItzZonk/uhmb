import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    User,
    Camera,
    ChevronRight,
    Check,
    Loader2
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

const AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trader8',
]

export const OnboardingModal = () => {
    const { showOnboardingModal, completeOnboarding, closeModals, user } = useAuthStore()

    const [step, setStep] = useState(1)
    const [username, setUsername] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const totalSteps = 3

    const handleNext = async () => {
        setError(null)

        if (step === 1) {
            // Validate username
            if (username.length < 3) {
                setError('Username must be at least 3 characters')
                return
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                setError('Username can only contain letters, numbers, and underscores')
                return
            }
            setStep(2)
        } else if (step === 2) {
            // Validate display name
            if (displayName.length < 2) {
                setError('Display name must be at least 2 characters')
                return
            }
            setStep(3)
        } else if (step === 3) {
            // Complete onboarding
            setIsSubmitting(true)
            await new Promise(r => setTimeout(r, 500)) // Simulate API
            completeOnboarding(username, displayName, selectedAvatar || undefined)
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        setError(null)
        if (step > 1) {
            setStep(step - 1)
        }
    }

    if (!showOnboardingModal) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-md bg-bg-secondary rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="h-1 bg-bg-tertiary">
                        <motion.div
                            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Header */}
                    <div className="p-6 pb-0 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-glow">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Welcome to Quantix!</h2>
                        <p className="text-text-muted">Let's set up your profile</p>
                    </div>

                    {/* Steps */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm">
                                            <User size={14} />
                                            Step 1 of 3 - Choose Username
                                        </div>
                                    </div>

                                    <Input
                                        label="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                        placeholder="yourname"
                                        hint="This will be your unique identifier"
                                        leftIcon={<span className="text-text-muted">@</span>}
                                    />
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm">
                                            <User size={14} />
                                            Step 2 of 3 - Display Name
                                        </div>
                                    </div>

                                    <Input
                                        label="Display Name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Your Name"
                                        hint="This is how other traders will see you"
                                    />
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm">
                                            <Camera size={14} />
                                            Step 3 of 3 - Choose Avatar
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        {AVATARS.map((avatar, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setSelectedAvatar(avatar)}
                                                className={`
                          relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all
                          ${selectedAvatar === avatar
                                                        ? 'border-accent-primary ring-2 ring-accent-primary/30'
                                                        : 'border-transparent hover:border-white/20'}
                        `}
                                            >
                                                <img
                                                    src={avatar}
                                                    alt={`Avatar ${i + 1}`}
                                                    className="w-full h-full bg-bg-tertiary"
                                                />
                                                {selectedAvatar === avatar && (
                                                    <div className="absolute inset-0 bg-accent-primary/20 flex items-center justify-center">
                                                        <Check size={24} className="text-accent-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-center text-xs text-text-muted mt-2">
                                        Optional - you can change this later
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 mt-6">
                            {step > 1 && (
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                onClick={handleNext}
                                className="flex-1 gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Finishing...
                                    </>
                                ) : step === totalSteps ? (
                                    <>
                                        <Check size={18} />
                                        Get Started
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
