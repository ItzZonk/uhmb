import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
    User,
    Settings as SettingsIcon,
    Globe,
    Palette,
    Bell,
    Shield,
    CreditCard,
    LogOut,
    Camera,
    Check,
    Crown,
    Mail,
    Save,
    Loader2
} from 'lucide-react'
import { Card, Button, Badge, Input, Alert, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useWalletStore } from '@/stores/walletStore'
import { clsx } from 'clsx'

const THEMES = [
    { id: 'dark', label: 'Dark', emoji: '🌙' },
    { id: 'light', label: 'Light', emoji: '☀️' },
    { id: 'ocean', label: 'Ocean', emoji: '🌊' },
    { id: 'sunset', label: 'Sunset', emoji: '🌅' },
    { id: 'forest', label: 'Forest', emoji: '🌲' },
]

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
]

export default function SettingsPage() {
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useThemeStore()
    const { user, isAuthenticated, updateProfile, logout, openLoginModal } = useAuthStore()
    const { userTier, balance } = useWalletStore()

    const [displayName, setDisplayName] = useState(user?.displayName || '')
    const [email, setEmail] = useState(user?.email || '')
    const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true)
    const [emailUpdates, setEmailUpdates] = useState(user?.preferences?.emailUpdates ?? false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSaveProfile = async () => {
        if (!user) return

        setIsSaving(true)
        await new Promise(r => setTimeout(r, 800))

        updateProfile({
            displayName,
            preferences: {
                ...user.preferences,
                notifications,
                emailUpdates,
            }
        })

        setIsSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code)
        if (user) {
            updateProfile({
                preferences: { ...user.preferences, language: code }
            })
        }
    }

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme as any)
        if (user) {
            updateProfile({
                preferences: { ...user.preferences, theme: newTheme }
            })
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-20 pb-8 px-4">
                <div className="container mx-auto max-w-2xl">
                    <Card className="text-center py-12">
                        <User size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                        <h2 className="text-xl font-semibold mb-2">Sign in to access settings</h2>
                        <p className="text-text-muted mb-6">Create an account to save your preferences and track your progress.</p>
                        <Button onClick={openLoginModal}>
                            Log In / Sign Up
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 pb-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <SettingsIcon size={28} className="text-accent-primary" />
                    {t('nav.settings')}
                </h1>

                <Tabs defaultValue="profile">
                    <TabsList className="mb-6">
                        <TabsTrigger value="profile" className="gap-2">
                            <User size={16} /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2">
                            <Palette size={16} /> Appearance
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell size={16} /> Notifications
                        </TabsTrigger>
                        <TabsTrigger value="subscription" className="gap-2">
                            <Crown size={16} /> Subscription
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Avatar Section */}
                            <Card className="md:col-span-1 text-center">
                                <div className="relative mx-auto w-24 h-24 mb-4">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="w-full h-full rounded-full bg-bg-tertiary"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-3xl font-bold text-white">
                                            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <button className="absolute bottom-0 right-0 p-2 bg-bg-primary border border-white/10 rounded-full hover:bg-bg-tertiary transition-colors">
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <h3 className="font-semibold">{user?.displayName || 'User'}</h3>
                                <p className="text-sm text-text-muted">@{user?.username || 'anonymous'}</p>
                                <Badge
                                    variant={userTier === 'free' ? 'default' : 'primary'}
                                    className="mt-3"
                                >
                                    {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
                                </Badge>
                            </Card>

                            {/* Profile Form */}
                            <Card className="md:col-span-2">
                                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>

                                <div className="space-y-4">
                                    <Input
                                        label="Display Name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Your Name"
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        value={email}
                                        disabled
                                        leftIcon={<Mail size={16} />}
                                        hint="Email cannot be changed"
                                    />

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="ghost" onClick={() => setDisplayName(user?.displayName || '')}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                                            {isSaving ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : saved ? (
                                                <Check size={16} />
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            {saved ? 'Saved!' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Danger Zone */}
                        <Card className="mt-6 border-danger/30">
                            <h3 className="text-lg font-semibold text-danger mb-4 flex items-center gap-2">
                                <Shield size={20} />
                                Danger Zone
                            </h3>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium">Log out of your account</p>
                                    <p className="text-sm text-text-muted">You can log back in anytime</p>
                                </div>
                                <Button variant="danger" onClick={logout} className="gap-2">
                                    <LogOut size={16} />
                                    Log Out
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance">
                        <div className="space-y-6">
                            {/* Theme Selection */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Palette size={20} className="text-accent-secondary" />
                                    {t('settings.theme')}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id)}
                                            className={clsx(
                                                'p-4 rounded-card border-2 transition-all text-center',
                                                theme === t.id
                                                    ? 'border-accent-primary bg-accent-primary/10'
                                                    : 'border-transparent bg-bg-tertiary hover:border-white/20'
                                            )}
                                        >
                                            <span className="text-2xl mb-2 block">{t.emoji}</span>
                                            <span className="text-sm font-medium">{t.label}</span>
                                            {theme === t.id && (
                                                <Check size={16} className="mx-auto mt-2 text-accent-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Language Selection */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Globe size={20} className="text-accent-primary" />
                                    {t('settings.language')}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={clsx(
                                                'flex items-center gap-3 p-3 rounded-card border-2 transition-all',
                                                i18n.language === lang.code
                                                    ? 'border-accent-primary bg-accent-primary/10'
                                                    : 'border-transparent bg-bg-tertiary hover:border-white/20'
                                            )}
                                        >
                                            <span className="text-xl">{lang.flag}</span>
                                            <span className="font-medium">{lang.label}</span>
                                            {i18n.language === lang.code && (
                                                <Check size={16} className="ml-auto text-accent-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>

                            <div className="space-y-4">
                                {[
                                    { id: 'notifications', label: 'Push Notifications', desc: 'Receive alerts about price movements and trades', value: notifications, onChange: setNotifications },
                                    { id: 'emailUpdates', label: 'Email Updates', desc: 'Weekly market summaries and tips', value: emailUpdates, onChange: setEmailUpdates },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-card">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-text-muted">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => item.onChange(!item.value)}
                                            className={clsx(
                                                'relative w-12 h-6 rounded-full transition-colors',
                                                item.value ? 'bg-accent-primary' : 'bg-bg-secondary'
                                            )}
                                        >
                                            <motion.div
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full"
                                                animate={{ left: item.value ? 28 : 4 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Preferences
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Subscription Tab */}
                    <TabsContent value="subscription">
                        <div className="space-y-6">
                            <Card>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Current Plan</h3>
                                        <p className="text-text-muted">Manage your subscription</p>
                                    </div>
                                    <Badge variant={userTier === 'free' ? 'default' : 'primary'} size="lg">
                                        {userTier === 'free' && 'Free Plan'}
                                        {userTier === 'starter' && 'Starter'}
                                        {userTier === 'pro' && 'Pro'}
                                        {userTier === 'ultimate' && 'Ultimate'}
                                    </Badge>
                                </div>

                                <div className="p-4 bg-bg-tertiary rounded-card mb-4">
                                    <div className="grid sm:grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold">${balance.toFixed(0)}</p>
                                            <p className="text-sm text-text-muted">Virtual Balance</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{userTier === 'free' ? '10' : userTier === 'starter' ? '50' : '∞'}</p>
                                            <p className="text-sm text-text-muted">AI Queries/Day</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{userTier === 'free' ? '$0' : userTier === 'starter' ? '$50' : '$100+'}</p>
                                            <p className="text-sm text-text-muted">Daily Bonus</p>
                                        </div>
                                    </div>
                                </div>

                                {userTier === 'free' && (
                                    <Alert variant="info" className="mb-4">
                                        <Crown size={20} />
                                        <div>
                                            <strong>Upgrade for more features!</strong>
                                            <p className="text-sm">Get more AI queries, daily bonuses, and premium features.</p>
                                        </div>
                                    </Alert>
                                )}

                                <a href="/pricing">
                                    <Button className="w-full gap-2">
                                        <Crown size={18} />
                                        {userTier === 'free' ? 'View Upgrade Options' : 'Manage Subscription'}
                                    </Button>
                                </a>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
