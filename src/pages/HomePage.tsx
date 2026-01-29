import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import {
    Bot,
    LineChart,
    Shield,
    ArrowRight,
    Play,
    Sparkles,
    TrendingUp,
    Zap,
    Users,
    ChevronDown
} from 'lucide-react'
import { Button, Card } from '@/components/ui'

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
}

export default function HomePage() {
    const { t } = useTranslation()
    const featuresRef = useRef<HTMLDivElement>(null)
    const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' })

    const features = [
        {
            icon: Bot,
            title: t('features.ai.title'),
            description: t('features.ai.description'),
            color: 'from-purple-500 to-pink-500',
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-400'
        },
        {
            icon: LineChart,
            title: t('features.realtime.title'),
            description: t('features.realtime.description'),
            color: 'from-cyan-500 to-blue-500',
            iconBg: 'bg-cyan-500/20',
            iconColor: 'text-cyan-400'
        },
        {
            icon: Shield,
            title: t('features.safe.title'),
            description: t('features.safe.description'),
            color: 'from-emerald-500 to-teal-500',
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400'
        }
    ]

    const stats = [
        { value: '50K+', label: 'Active Traders' },
        { value: '99.9%', label: 'Uptime' },
        { value: '$10M+', label: 'Virtual Traded' },
        { value: '4.9/5', label: 'User Rating' }
    ]

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Gradient Orbs */}
                    <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-accent-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent-secondary/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                <div className="relative container mx-auto px-4 py-20 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-full text-sm text-accent-primary">
                                <Sparkles size={16} />
                                Powered by Advanced AI
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                        >
                            <span className="text-text-primary">{t('hero.title').split(' ').slice(0, -2).join(' ')} </span>
                            <span className="gradient-text">
                                {t('hero.title').split(' ').slice(-2).join(' ')}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto"
                        >
                            {t('hero.subtitle')}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/app">
                                <Button size="lg" className="group px-8">
                                    {t('hero.cta')}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="group">
                                <Play size={18} className="group-hover:scale-110 transition-transform" />
                                {t('hero.watchDemo')}
                            </Button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                        >
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-accent-primary mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-text-muted">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <button
                            onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary transition-colors"
                        >
                            <span className="text-sm">Scroll to explore</span>
                            <ChevronDown size={20} className="animate-bounce" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-secondary/50 to-transparent" />

                <div className="relative container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        animate={featuresInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
                            {t('features.title')}
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-lg text-text-secondary max-w-2xl mx-auto">
                            {t('features.subtitle')}
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate={featuresInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card hover className="h-full text-center group">
                                    <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon size={28} className={feature.iconColor} />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 text-text-primary">
                                        {feature.title}
                                    </h3>
                                    <p className="text-text-secondary leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                            Start trading smarter in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '01', title: 'Create Account', desc: 'Sign up in seconds with just your email or Google account', icon: Users },
                            { step: '02', title: 'Get Virtual Funds', desc: 'Receive $500 in virtual money to start practicing immediately', icon: Zap },
                            { step: '03', title: 'Trade with AI', desc: 'Use our AI assistant to analyze markets and make smart trades', icon: TrendingUp },
                        ].map((item, i) => (
                            <div key={i} className="relative text-center">
                                {/* Connector Line */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent-primary/50 to-transparent" />
                                )}

                                <div className="relative">
                                    <div className="w-24 h-24 bg-bg-secondary border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                                        <item.icon size={32} className="text-accent-primary" />
                                        <span className="absolute -top-3 -right-3 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-sm font-bold text-bg-primary">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                    <p className="text-text-secondary">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent-primary/5" />

                <div className="relative container mx-auto px-4">
                    <Card className="max-w-4xl mx-auto text-center py-16 px-8 bg-gradient-to-br from-bg-secondary to-bg-tertiary border-accent-primary/20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                {t('cta.title')}
                            </h2>
                            <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
                                {t('cta.subtitle')}
                            </p>
                            <Link to="/app">
                                <Button size="lg" className="px-10 animate-pulse hover:animate-none">
                                    {t('cta.button')}
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
                                <span className="flex items-center gap-2">
                                    <Shield size={16} className="text-success" />
                                    {t('cta.noCard')}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-accent-primary" />
                                    {t('cta.virtualMoney')}
                                </span>
                            </div>
                        </motion.div>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold">
                                <span className="text-text-primary">Quan</span>
                                <span className="text-accent-primary">tix</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-text-muted">
                            <a href="#" className="hover:text-text-primary transition-colors">
                                {t('footer.privacy')}
                            </a>
                            <a href="#" className="hover:text-text-primary transition-colors">
                                {t('footer.terms')}
                            </a>
                            <a href="#" className="hover:text-text-primary transition-colors">
                                {t('footer.contact')}
                            </a>
                        </div>

                        <p className="text-sm text-text-muted">
                            {t('footer.copyright')}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
