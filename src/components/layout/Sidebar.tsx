import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
    TrendingUp,
    X,
    BarChart3,
    Gamepad2,
    Crown,
    Settings,
    MessageCircle,
    Sun,
    Moon,
    Globe,
    Home
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { t, i18n } = useTranslation()
    const location = useLocation()
    const { theme, setTheme } = useThemeStore()

    const menuItems = [
        { icon: Home, label: t('nav.home'), path: '/' },
        { icon: BarChart3, label: t('nav.trading'), path: '/app', badge: 'LIVE' },
        { icon: Gamepad2, label: t('nav.simulation'), path: '/simulation' },
        { icon: Crown, label: t('nav.pricing'), path: '/pricing' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: MessageCircle, label: t('nav.support'), path: '/support' },
    ]

    const themes = [
        { id: 'dark', name: 'Dark' },
        { id: 'light', name: 'Light' },
        { id: 'ocean', name: 'Ocean' },
        { id: 'sunset', name: 'Sunset' },
        { id: 'forest', name: 'Forest' },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-full w-72 bg-bg-secondary border-r border-white/5 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <Link to="/" onClick={onClose} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">
                                    <span className="text-text-primary">Quan</span>
                                    <span className="text-accent-primary">tix</span>
                                </span>
                            </Link>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1 py-4 px-3 overflow-y-auto">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={clsx(
                                            'flex items-center gap-3 px-4 py-3 rounded-button mb-1 transition-all',
                                            isActive
                                                ? 'bg-accent-primary/10 text-accent-primary'
                                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                        )}
                                    >
                                        <item.icon size={20} />
                                        <span className="flex-1 font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-success/20 text-success rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Bottom Settings */}
                        <div className="p-4 border-t border-white/5 space-y-4">
                            {/* Language */}
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-2 px-2">
                                    Language
                                </p>
                                <div className="grid grid-cols-3 gap-1">
                                    {languages.slice(0, 6).map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => i18n.changeLanguage(lang.code)}
                                            className={clsx(
                                                'p-2 text-lg rounded-button transition-colors',
                                                i18n.language === lang.code
                                                    ? 'bg-accent-primary/10'
                                                    : 'hover:bg-bg-tertiary'
                                            )}
                                            title={lang.name}
                                        >
                                            {lang.flag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme */}
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-2 px-2">
                                    Theme
                                </p>
                                <div className="grid grid-cols-5 gap-1">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={clsx(
                                                'p-2 rounded-button transition-colors flex items-center justify-center',
                                                theme === t.id
                                                    ? 'bg-accent-primary/10 text-accent-primary'
                                                    : 'hover:bg-bg-tertiary text-text-muted'
                                            )}
                                            title={t.name}
                                        >
                                            {t.id === 'dark' ? <Moon size={16} /> :
                                                t.id === 'light' ? <Sun size={16} /> :
                                                    <div className={clsx(
                                                        'w-4 h-4 rounded-full',
                                                        t.id === 'ocean' && 'bg-cyan-500',
                                                        t.id === 'sunset' && 'bg-pink-500',
                                                        t.id === 'forest' && 'bg-green-500'
                                                    )} />
                                            }
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}
