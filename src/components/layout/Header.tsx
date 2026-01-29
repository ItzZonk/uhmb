import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import {
    TrendingUp,
    Menu,
    Moon,
    Sun,
    Globe,
    User,
    ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useThemeStore } from '@/stores/themeStore'

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

interface HeaderProps {
    onMenuClick: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
    const { t, i18n } = useTranslation()
    const location = useLocation()
    const { theme, toggleTheme } = useThemeStore()
    const [langMenuOpen, setLangMenuOpen] = useState(false)

    const isHomePage = location.pathname === '/'
    const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

    const navLinks = [
        { path: '/app', label: t('nav.trading') },
        { path: '/simulation', label: t('nav.simulation') },
        { path: '/pricing', label: t('nav.pricing') },
    ]

    return (
        <header
            className={clsx(
                'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
                isHomePage ? 'bg-transparent' : 'bg-bg-secondary/80 backdrop-blur-lg border-b border-white/5'
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo & Menu Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="p-2 -ml-2 md:hidden text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>

                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold hidden sm:block">
                                <span className="text-text-primary">Quan</span>
                                <span className="text-accent-primary">tix</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    'px-4 py-2 rounded-button text-sm font-medium transition-colors',
                                    location.pathname === link.path
                                        ? 'text-accent-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side: Language, Theme, Auth */}
                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <span className="text-lg">{currentLang.flag}</span>
                                <span className="hidden sm:block">{currentLang.code.toUpperCase()}</span>
                                <ChevronDown size={14} className={clsx('transition-transform', langMenuOpen && 'rotate-180')} />
                            </button>

                            {langMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 top-full mt-2 py-2 bg-bg-secondary rounded-card border border-white/10 shadow-lg z-20 min-w-[160px]"
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    i18n.changeLanguage(lang.code)
                                                    setLangMenuOpen(false)
                                                }}
                                                className={clsx(
                                                    'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                                                    i18n.language === lang.code
                                                        ? 'text-accent-primary bg-accent-primary/10'
                                                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                                )}
                                            >
                                                <span className="text-lg">{lang.flag}</span>
                                                {lang.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Auth Buttons */}
                        <div className="hidden sm:flex items-center gap-2 ml-2">
                            <Button variant="ghost" size="sm">
                                {t('nav.login')}
                            </Button>
                            <Button variant="primary" size="sm">
                                {t('nav.signup')}
                            </Button>
                        </div>

                        {/* Mobile User Icon */}
                        <button className="sm:hidden p-2 text-text-secondary hover:text-text-primary transition-colors">
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
