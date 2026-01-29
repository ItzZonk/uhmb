/**
 * Quick Stats Dashboard
 * Implements "5-second rule" - user should understand P&L, price, orders at a glance
 */

import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Activity,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTradingStore } from '@/stores/tradingStore'

interface QuickStatsProps {
    compact?: boolean
}

export function QuickStats({ compact = false }: QuickStatsProps) {
    const { balance, holdings, getPortfolioMetrics, pendingOrders } = useWalletStore()
    const { tickerData, realtimePrices, selectedCrypto } = useTradingStore()

    // Build prices map from ticker data and realtime prices
    const prices: Record<string, number> = {}
    Object.entries(tickerData).forEach(([symbol, data]) => {
        prices[symbol] = data.price
    })
    Object.entries(realtimePrices).forEach(([symbol, data]) => {
        prices[symbol] = data.price
    })

    const metrics = getPortfolioMetrics(prices)
    const currentPrice = prices[selectedCrypto] || 0
    const realtimeData = realtimePrices[selectedCrypto]
    const priceDirection = realtimeData?.direction || 'neutral'

    const activeOrdersCount = pendingOrders.filter(o => o.status === 'pending').length
    const holdingsCount = Object.keys(holdings).length

    if (compact) {
        return (
            <div className="flex items-center gap-4 px-4 py-2 bg-card/50 rounded-lg border border-border/50">
                {/* Portfolio Value */}
                <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono font-semibold">
                        ${metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs ${metrics.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {metrics.profitLoss >= 0 ? '+' : ''}{metrics.profitLossPercent.toFixed(2)}%
                    </span>
                </div>

                <div className="w-px h-4 bg-border" />

                {/* Current Price */}
                <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-warning animate-pulse" />
                    <motion.span
                        className={`font-mono font-bold ${priceDirection === 'up' ? 'text-success' :
                                priceDirection === 'down' ? 'text-destructive' : ''
                            }`}
                        key={currentPrice}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </motion.span>
                </div>

                {/* Active Orders */}
                {activeOrdersCount > 0 && (
                    <>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1 text-warning">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">{activeOrdersCount} orders</span>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Portfolio Value Card */}
            <motion.div
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio</span>
                    <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div className="font-mono text-xl font-bold">
                    ${metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className={`flex items-center gap-1 text-sm ${metrics.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {metrics.profitLoss >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                    ) : (
                        <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span className="font-medium">
                        {metrics.profitLoss >= 0 ? '+' : ''}${Math.abs(metrics.profitLoss).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                        ({metrics.profitLoss >= 0 ? '+' : ''}{metrics.profitLossPercent.toFixed(1)}%)
                    </span>
                </div>
            </motion.div>

            {/* Current Price Card */}
            <motion.div
                className={`rounded-xl p-4 border ${priceDirection === 'up'
                        ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/20'
                        : priceDirection === 'down'
                            ? 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20'
                            : 'bg-card border-border'
                    }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {selectedCrypto.replace('USDT', '')} Price
                    </span>
                    <Zap className="w-4 h-4 text-warning animate-pulse" />
                </div>
                <motion.div
                    className={`font-mono text-xl font-bold ${priceDirection === 'up' ? 'text-success' :
                            priceDirection === 'down' ? 'text-destructive' : ''
                        }`}
                    key={currentPrice}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    ${currentPrice.toLocaleString(undefined, {
                        minimumFractionDigits: currentPrice < 1 ? 4 : 2,
                        maximumFractionDigits: currentPrice < 1 ? 6 : 2
                    })}
                </motion.div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    <span>Real-time</span>
                </div>
            </motion.div>

            {/* Cash Balance Card */}
            <motion.div
                className="bg-card rounded-xl p-4 border border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Cash</span>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="font-mono text-xl font-bold">
                    ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                    {holdingsCount} asset{holdingsCount !== 1 ? 's' : ''} held
                </div>
            </motion.div>

            {/* Active Orders Card */}
            <motion.div
                className={`rounded-xl p-4 border ${activeOrdersCount > 0
                        ? 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20'
                        : 'bg-card border-border'
                    }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Orders</span>
                    <Clock className={`w-4 h-4 ${activeOrdersCount > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                </div>
                <div className="font-mono text-xl font-bold">
                    {activeOrdersCount}
                </div>
                <div className="text-xs text-muted-foreground">
                    {activeOrdersCount > 0 ? 'Active orders' : 'No pending orders'}
                </div>
            </motion.div>
        </div>
    )
}

// Compact inline version for headers
export function QuickStatsInline() {
    return <QuickStats compact />
}
