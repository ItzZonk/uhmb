import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Sparkles,
    History,
    PieChart,
    RefreshCw,
    Gift,
    Crown,
    ChevronDown,
    ExternalLink
} from 'lucide-react'
import { Card, Button, Badge, Alert, Input, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useWalletStore, Transaction } from '@/stores/walletStore'
import { useTradingStore, CRYPTO_ASSETS } from '@/stores/tradingStore'
import { fetchMultipleTickers, TickerData } from '@/services/binanceWebSocket'
import { clsx } from 'clsx'

export default function SimulationPage() {
    const { t } = useTranslation()
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState('')
    const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT')
    const [cryptoDropdownOpen, setCryptoDropdownOpen] = useState(false)
    const [prices, setPrices] = useState<Record<string, number>>({})
    const [isLoadingPrices, setIsLoadingPrices] = useState(true)
    const [tradeError, setTradeError] = useState<string | null>(null)
    const [tradeSuccess, setTradeSuccess] = useState<string | null>(null)

    const {
        balance,
        holdings,
        transactions,
        buy,
        sell,
        claimDailyBonus,
        resetWallet,
        getPortfolioMetrics,
        getHoldingsWithValue,
        userTier,
        lastBonusClaim
    } = useWalletStore()

    // Fetch current prices
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const symbols = CRYPTO_ASSETS.map(a => a.symbol)
                const tickers = await fetchMultipleTickers(symbols)
                const priceMap: Record<string, number> = {}
                tickers.forEach((ticker: TickerData) => {
                    priceMap[ticker.symbol] = ticker.price
                })
                setPrices(priceMap)
                setIsLoadingPrices(false)
            } catch (error) {
                console.error('Error fetching prices:', error)
                setIsLoadingPrices(false)
            }
        }

        fetchPrices()
        const interval = setInterval(fetchPrices, 10000) // Update every 10s
        return () => clearInterval(interval)
    }, [])

    const currentAsset = CRYPTO_ASSETS.find(a => a.symbol === selectedCrypto)
    const currentPrice = prices[selectedCrypto] || 0
    const metrics = getPortfolioMetrics(prices)
    const holdingsWithValue = getHoldingsWithValue(prices)

    // Calculate pie chart data
    const pieData = useMemo(() => {
        const data: { label: string; value: number; color: string; percent: number }[] = []

        // Add USD balance
        if (balance > 0) {
            data.push({
                label: 'USD',
                value: balance,
                color: '#22C55E',
                percent: (balance / metrics.totalValue) * 100
            })
        }

        // Add holdings
        holdingsWithValue.forEach(h => {
            if (h.currentValue > 0) {
                data.push({
                    label: h.shortName,
                    value: h.currentValue,
                    color: h.color,
                    percent: (h.currentValue / metrics.totalValue) * 100
                })
            }
        })

        return data
    }, [balance, holdingsWithValue, metrics.totalValue])

    const handleTrade = () => {
        setTradeError(null)
        setTradeSuccess(null)

        const amountNum = parseFloat(amount)
        if (!amountNum || amountNum <= 0) {
            setTradeError('Enter a valid amount')
            return
        }

        if (tradeType === 'buy') {
            const asset = CRYPTO_ASSETS.find(a => a.symbol === selectedCrypto)
            if (!asset) return

            const result = buy(
                selectedCrypto,
                asset.name,
                asset.shortName,
                amountNum,
                currentPrice,
                asset.color
            )

            if (result.success) {
                const cryptoAmount = amountNum / currentPrice
                setTradeSuccess(`Bought ${cryptoAmount.toFixed(6)} ${asset.shortName}`)
                setAmount('')
            } else {
                setTradeError(result.error || 'Trade failed')
            }
        } else {
            const holding = holdings[selectedCrypto]
            if (!holding) {
                setTradeError('No holdings to sell')
                return
            }

            // Amount is in USD value to sell
            const cryptoToSell = amountNum / currentPrice

            if (cryptoToSell > holding.amount) {
                setTradeError(`Max: ${(holding.amount * currentPrice).toFixed(2)} USD`)
                return
            }

            const result = sell(selectedCrypto, cryptoToSell, currentPrice)

            if (result.success) {
                setTradeSuccess(`Sold ${cryptoToSell.toFixed(6)} ${holding.shortName}`)
                setAmount('')
            } else {
                setTradeError(result.error || 'Trade failed')
            }
        }
    }

    const handleClaimBonus = () => {
        const result = claimDailyBonus()
        if (result.success) {
            setTradeSuccess(`Claimed $${result.amount} daily bonus!`)
        } else {
            setTradeError(result.error || 'Cannot claim bonus')
        }
    }

    const canClaimBonus = lastBonusClaim !== new Date().toDateString() && userTier !== 'free'

    const formatTime = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen pt-20 pb-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Simulation Warning */}
                <Alert variant="warning" className="mb-6">
                    <AlertCircle size={20} />
                    <div>
                        <strong>Simulation Mode</strong>
                        <p className="text-sm opacity-90">{t('wallet.simulationWarning')}</p>
                    </div>
                </Alert>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Wallet & Holdings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Wallet Overview */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border-accent-primary/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-accent-primary/20 rounded-lg">
                                        <Wallet size={20} className="text-accent-primary" />
                                    </div>
                                    <span className="text-sm text-text-secondary">{t('wallet.balance')}</span>
                                </div>
                                <p className="text-2xl font-bold font-mono">${balance.toFixed(2)}</p>
                            </Card>

                            <Card>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-accent-secondary/20 rounded-lg">
                                        <PieChart size={20} className="text-accent-secondary" />
                                    </div>
                                    <span className="text-sm text-text-secondary">{t('wallet.portfolio')}</span>
                                </div>
                                <p className="text-2xl font-bold font-mono">
                                    ${isLoadingPrices ? '...' : metrics.totalValue.toFixed(2)}
                                </p>
                            </Card>

                            <Card className={metrics.profitLoss >= 0 ? 'border-success/20' : 'border-danger/20'}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${metrics.profitLoss >= 0 ? 'bg-success/20' : 'bg-danger/20'}`}>
                                        {metrics.profitLoss >= 0 ? (
                                            <TrendingUp size={20} className="text-success" />
                                        ) : (
                                            <TrendingDown size={20} className="text-danger" />
                                        )}
                                    </div>
                                    <span className="text-sm text-text-secondary">{t('wallet.profit')}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-2xl font-bold font-mono ${metrics.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {metrics.profitLoss >= 0 ? '+' : ''}{metrics.profitLoss.toFixed(2)}
                                    </p>
                                    <Badge variant={metrics.profitLoss >= 0 ? 'success' : 'danger'}>
                                        {metrics.profitLoss >= 0 ? '+' : ''}{metrics.profitLossPercent.toFixed(1)}%
                                    </Badge>
                                </div>
                            </Card>
                        </div>

                        {/* Portfolio Pie Chart */}
                        {pieData.length > 0 && (
                            <Card>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <PieChart size={20} className="text-accent-secondary" />
                                    Portfolio Allocation
                                </h3>

                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    {/* Simple Pie Chart SVG */}
                                    <div className="relative w-40 h-40">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            {pieData.reduce((acc, item, i) => {
                                                const startAngle = acc.angle
                                                const sliceAngle = (item.percent / 100) * 360
                                                const endAngle = startAngle + sliceAngle

                                                const startRad = (startAngle * Math.PI) / 180
                                                const endRad = (endAngle * Math.PI) / 180

                                                const x1 = 50 + 40 * Math.cos(startRad)
                                                const y1 = 50 + 40 * Math.sin(startRad)
                                                const x2 = 50 + 40 * Math.cos(endRad)
                                                const y2 = 50 + 40 * Math.sin(endRad)

                                                const largeArc = sliceAngle > 180 ? 1 : 0

                                                const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

                                                acc.elements.push(
                                                    <path
                                                        key={i}
                                                        d={path}
                                                        fill={item.color}
                                                        className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                                    />
                                                )
                                                acc.angle = endAngle
                                                return acc
                                            }, { elements: [] as JSX.Element[], angle: 0 }).elements}
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 bg-bg-primary rounded-full flex items-center justify-center">
                                                <span className="text-xs text-text-muted">{pieData.length} assets</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        {pieData.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 bg-bg-tertiary/50 rounded-lg">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                                    <p className="text-xs text-text-muted">
                                                        ${item.value.toFixed(2)} ({item.percent.toFixed(1)}%)
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Holdings */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">{t('wallet.holdings')}</h3>

                            {holdingsWithValue.length > 0 ? (
                                <div className="space-y-3">
                                    {holdingsWithValue.map((holding) => (
                                        <div
                                            key={holding.symbol}
                                            className="flex items-center justify-between p-4 bg-bg-tertiary rounded-card"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                                                    style={{ backgroundColor: holding.color }}
                                                >
                                                    {holding.shortName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{holding.name}</p>
                                                    <p className="text-sm text-text-muted">
                                                        {holding.amount.toFixed(6)} {holding.shortName}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-semibold font-mono">${holding.currentValue.toFixed(2)}</p>
                                                <p className={`text-sm font-mono ${holding.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {holding.pnl >= 0 ? '+' : ''}{holding.pnl.toFixed(2)} ({holding.pnlPercent.toFixed(1)}%)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-muted">
                                    <Wallet size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>{t('wallet.noHoldings')}</p>
                                    <p className="text-sm mt-1">Buy some crypto to get started!</p>
                                </div>
                            )}
                        </Card>

                        {/* Transaction History */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <History size={20} className="text-text-muted" />
                                    <h3 className="text-lg font-semibold">Transaction History</h3>
                                </div>
                                <button
                                    onClick={resetWallet}
                                    className="text-xs text-text-muted hover:text-danger transition-colors flex items-center gap-1"
                                >
                                    <RefreshCw size={12} />
                                    Reset Wallet
                                </button>
                            </div>

                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {transactions.slice(0, 20).map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-3 bg-bg-tertiary/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                'p-2 rounded-lg',
                                                tx.type === 'buy' ? 'bg-success/20' :
                                                    tx.type === 'sell' ? 'bg-danger/20' :
                                                        tx.type === 'bonus' ? 'bg-warning/20' : 'bg-accent-primary/20'
                                            )}>
                                                {tx.type === 'buy' ? <ArrowDownRight size={16} className="text-success" /> :
                                                    tx.type === 'sell' ? <ArrowUpRight size={16} className="text-danger" /> :
                                                        tx.type === 'bonus' ? <Gift size={16} className="text-warning" /> :
                                                            <Wallet size={16} className="text-accent-primary" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {tx.type === 'buy' ? 'Bought' :
                                                        tx.type === 'sell' ? 'Sold' :
                                                            tx.type === 'bonus' ? 'Daily Bonus' : 'Deposit'} {tx.symbol !== 'USD' ? tx.symbol.replace('USDT', '') : ''}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    {formatTime(tx.timestamp)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {tx.symbol !== 'USD' && (
                                                <p className="font-mono text-sm">{tx.amount.toFixed(6)}</p>
                                            )}
                                            <p className={clsx(
                                                'text-xs font-mono',
                                                tx.type === 'buy' ? 'text-danger' : 'text-success'
                                            )}>
                                                {tx.type === 'buy' ? '-' : '+'}${tx.total.toFixed(2)}
                                                {tx.fee > 0 && <span className="text-text-muted"> (fee: ${tx.fee.toFixed(2)})</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Trading Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Daily Bonus Card */}
                        <Card className={clsx(
                            'bg-gradient-to-br',
                            canClaimBonus ? 'from-warning/20 to-warning/5 border-warning/30' : 'from-bg-tertiary to-bg-secondary'
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Gift size={24} className={canClaimBonus ? 'text-warning' : 'text-text-muted'} />
                                    <div>
                                        <p className="font-medium">Daily Bonus</p>
                                        <p className="text-xs text-text-muted">
                                            {userTier === 'free' ? 'Upgrade to unlock' :
                                                canClaimBonus ? 'Available now!' : 'Claimed today'}
                                        </p>
                                    </div>
                                </div>
                                {userTier !== 'free' && (
                                    <Button
                                        size="sm"
                                        variant={canClaimBonus ? 'primary' : 'ghost'}
                                        disabled={!canClaimBonus}
                                        onClick={handleClaimBonus}
                                    >
                                        {canClaimBonus ? 'Claim' : 'Claimed'}
                                    </Button>
                                )}
                                {userTier === 'free' && (
                                    <a href="/pricing">
                                        <Button size="sm" variant="outline" className="gap-1">
                                            <Crown size={14} /> Upgrade
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </Card>

                        {/* Trading Panel */}
                        <Card className="sticky top-24">
                            <Tabs defaultValue="buy" onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
                                <TabsList className="w-full mb-6">
                                    <TabsTrigger value="buy" className="flex-1 gap-1">
                                        <ArrowDownRight size={14} /> {t('trading.buy')}
                                    </TabsTrigger>
                                    <TabsTrigger value="sell" className="flex-1 gap-1">
                                        <ArrowUpRight size={14} /> {t('trading.sell')}
                                    </TabsTrigger>
                                </TabsList>

                                {/* Trading Form - Same for buy/sell */}
                                <div className="space-y-4">
                                    {/* Crypto Selector */}
                                    <div className="relative">
                                        <label className="text-sm text-text-secondary mb-2 block">Cryptocurrency</label>
                                        <button
                                            onClick={() => setCryptoDropdownOpen(!cryptoDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-bg-tertiary rounded-input hover:bg-bg-tertiary/80 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span style={{ color: currentAsset?.color }}>{currentAsset?.icon}</span>
                                                <span>{currentAsset?.shortName}</span>
                                            </div>
                                            <ChevronDown size={16} className={clsx('transition-transform', cryptoDropdownOpen && 'rotate-180')} />
                                        </button>

                                        <AnimatePresence>
                                            {cryptoDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setCryptoDropdownOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute left-0 right-0 top-full mt-1 py-2 bg-bg-secondary rounded-card border border-white/10 shadow-lg z-20 max-h-48 overflow-y-auto"
                                                    >
                                                        {CRYPTO_ASSETS.map((asset) => (
                                                            <button
                                                                key={asset.symbol}
                                                                onClick={() => {
                                                                    setSelectedCrypto(asset.symbol)
                                                                    setCryptoDropdownOpen(false)
                                                                }}
                                                                className={clsx(
                                                                    'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                                                                    selectedCrypto === asset.symbol
                                                                        ? 'bg-accent-primary/10 text-accent-primary'
                                                                        : 'hover:bg-bg-tertiary'
                                                                )}
                                                            >
                                                                <span style={{ color: asset.color }}>{asset.icon}</span>
                                                                <span>{asset.shortName}</span>
                                                                <span className="ml-auto text-xs text-text-muted">
                                                                    ${prices[asset.symbol]?.toLocaleString() || '...'}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Amount Input */}
                                    <Input
                                        label={`${t('trading.amount')} (USD)`}
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        hint={tradeType === 'buy'
                                            ? `${t('trading.available')}: $${balance.toFixed(2)}`
                                            : `Max: $${((holdings[selectedCrypto]?.amount || 0) * currentPrice).toFixed(2)}`
                                        }
                                    />

                                    {/* Quick Amounts */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {[25, 50, 100, 'MAX'].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    if (val === 'MAX') {
                                                        if (tradeType === 'buy') {
                                                            setAmount(balance.toFixed(2))
                                                        } else {
                                                            const holding = holdings[selectedCrypto]
                                                            if (holding) {
                                                                setAmount((holding.amount * currentPrice).toFixed(2))
                                                            }
                                                        }
                                                    } else {
                                                        setAmount(val.toString())
                                                    }
                                                }}
                                                className="py-1.5 text-xs font-medium bg-bg-tertiary hover:bg-accent-primary/10 hover:text-accent-primary rounded-button transition-colors"
                                            >
                                                {val === 'MAX' ? val : `$${val}`}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Price Display */}
                                    <div className="p-4 bg-bg-tertiary rounded-card space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">{t('trading.price')}</span>
                                            <span className="font-mono">${currentPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">{tradeType === 'buy' ? t('trading.receive') : 'You sell'}</span>
                                            <span className="font-mono">
                                                {amount ? (parseFloat(amount) / currentPrice).toFixed(8) : '0.00000000'} {currentAsset?.shortName}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">{t('trading.fee')} (0.1%)</span>
                                            <span className="font-mono text-text-muted">
                                                ${amount ? (parseFloat(amount) * 0.001).toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Error/Success Messages */}
                                    <AnimatePresence>
                                        {tradeError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-3 bg-danger/10 border border-danger/30 rounded-card text-sm text-danger"
                                            >
                                                {tradeError}
                                            </motion.div>
                                        )}
                                        {tradeSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-3 bg-success/10 border border-success/30 rounded-card text-sm text-success"
                                            >
                                                {tradeSuccess}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <Button
                                        onClick={handleTrade}
                                        className="w-full"
                                        variant={tradeType === 'sell' ? 'danger' : 'primary'}
                                        disabled={!amount || parseFloat(amount) <= 0 || isLoadingPrices}
                                    >
                                        {tradeType === 'buy' ? t('trading.buy') : t('trading.sell')} {currentAsset?.shortName}
                                    </Button>
                                </div>
                            </Tabs>

                            {/* AI Tip */}
                            <div className="mt-6 p-4 bg-accent-secondary/10 border border-accent-secondary/20 rounded-card">
                                <div className="flex items-center gap-2 text-accent-secondary mb-2">
                                    <Sparkles size={16} />
                                    <span className="text-sm font-medium">AI Tip</span>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    {tradeType === 'buy'
                                        ? `Consider dollar-cost averaging: Buy $${Math.min(50, balance / 4).toFixed(0)} of ${currentAsset?.shortName} weekly.`
                                        : holdings[selectedCrypto] && holdings[selectedCrypto].avgBuyPrice < currentPrice
                                            ? `You're in profit! Consider taking partial profits.`
                                            : `Hold if you believe in long-term growth.`
                                    }
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
