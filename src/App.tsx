import { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { LoginModal, SignupModal, OnboardingModal } from '@/components/auth'
import { CheckoutModal, AdBanner } from '@/components/payment'
import { PageErrorBoundary } from '@/components/ErrorBoundary'
import { useThemeStore } from '@/stores/themeStore'
import { Spinner } from '@/components/ui'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const TradingPage = lazy(() => import('@/pages/TradingPage'))
const SimulationPage = lazy(() => import('@/pages/SimulationPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

// Page loading fallback
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-text-muted">Loading...</p>
        </div>
    </div>
)

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { theme } = useThemeStore()

    // Apply theme class to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    // Skip to main content for accessibility
    const handleSkipToMain = () => {
        const main = document.querySelector('main')
        if (main) {
            main.focus()
            main.scrollIntoView()
        }
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                onClick={handleSkipToMain}
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-button"
            >
                Skip to main content
            </a>

            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Global Modals */}
            <LoginModal />
            <SignupModal />
            <OnboardingModal />
            <CheckoutModal />

            {/* Ad banner for free users */}
            <AdBanner position="bottom" />

            <main id="main-content" tabIndex={-1} className="outline-none">
                <PageErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/app" element={<TradingPage />} />
                            <Route path="/simulation" element={<SimulationPage />} />
                            <Route path="/pricing" element={<PricingPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </Suspense>
                </PageErrorBoundary>
            </main>
        </div>
    )
}

export default App
