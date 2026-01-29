import { useTranslation } from 'react-i18next'
import { TradingChart, AIAssistant } from '@/components/trading'

export default function TradingPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen pt-20 pb-8 px-4">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-3">
                        <TradingChart />
                    </div>

                    {/* Right Sidebar - AI Assistant */}
                    <div className="lg:col-span-1">
                        <AIAssistant />
                    </div>
                </div>
            </div>
        </div>
    )
}
