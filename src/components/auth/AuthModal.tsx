import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    X,
    Sparkles,
    Loader2,
    ArrowRight,
    Github,
    Chrome
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

interface AuthModalProps {
    mode: 'login' | 'signup'
}

export const AuthModal = ({ mode }: AuthModalProps) => {
    const { t } = useTranslation()
    const {
        showLoginModal,
        showSignupModal,
        closeModals,
        openLoginModal,
        openSignupModal,
        login,
        signup,
        isLoading
    } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isOpen = mode === 'login' ? showLoginModal : showSignupModal
    const isLogin = mode === 'login'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const result = isLogin
            ? await login(email, password)
            : await signup(email, password)

        if (!result.success) {
            setError(result.error || 'An error occurred')
        } else {
            setEmail('')
            setPassword('')
        }
    }

    const switchMode = () => {
        setError(null)
        if (isLogin) {
            openSignupModal()
        } else {
            openLoginModal()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={closeModals}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-bg-secondary rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-6 pb-0">
                        <button
                            onClick={closeModals}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center shadow-glow-sm">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {isLogin ? t('nav.login') : t('nav.signup')}
                                </h2>
                                <p className="text-sm text-text-muted">
                                    {isLogin
                                        ? 'Welcome back to Quantix'
                                        : 'Create your free account'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            leftIcon={<Mail size={18} />}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
                                leftIcon={<Lock size={18} />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-sm text-accent-primary hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {isLogin ? 'Logging in...' : 'Creating account...'}
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Log In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-bg-secondary text-text-muted">or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-bg-tertiary hover:bg-bg-tertiary/80 rounded-button transition-colors text-sm"
                            >
                                <Chrome size={18} />
                                Google
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-bg-tertiary hover:bg-bg-tertiary/80 rounded-button transition-colors text-sm"
                            >
                                <Github size={18} />
                                GitHub
                            </button>
                        </div>

                        {/* Switch Mode */}
                        <p className="text-center text-sm text-text-muted pt-2">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="text-accent-primary hover:underline font-medium"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export const LoginModal = () => <AuthModal mode="login" />
export const SignupModal = () => <AuthModal mode="signup" />
