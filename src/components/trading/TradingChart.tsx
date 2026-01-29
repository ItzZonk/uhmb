import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CrosshairMode } from 'lightweight-charts'
import { binanceWS, fetchHistoricalKlines, KlineData } from '@/services/binanceWebSocket'
import { useTradingStore, CRYPTO_ASSETS, TIME_INTERVALS, TimeInterval } from '@/stores/tradingStore'
import { Card, Badge, Spinner } from '@/components/ui'
import {
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Maximize2,
    Star,
    StarOff,
    ChevronDown,
    BarChart3,
    Activity,
    Zap
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipData {
    time: string
    open: number
    high: number
    low: number
    close: number
    volume?: number
    change?: number
    changePercent?: number
}

export const TradingChart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

    const {
        selectedSymbol,
        selectedInterval,
        setSelectedSymbol,
        setSelectedInterval,
        tickerData,
        updateTickerData,
        realtimePrices,
        updateRealtimePrice,
        favorites,
        toggleFavorite,
        isConnected,
        setConnectionStatus
    } = useTradingStore()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tooltip, setTooltip] = useState<TooltipData | null>(null)
    const [cryptoDropdownOpen, setCryptoDropdownOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const currentAsset = CRYPTO_ASSETS.find(a => a.symbol === selectedSymbol)
    const currentTicker = tickerData[selectedSymbol]

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#B4B9D6',
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
            },
            grid: {
                vertLines: { color: 'rgba(107, 113, 153, 0.08)' },
                horzLines: { color: 'rgba(107, 113, 153, 0.08)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: '#6B7199',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#1E2443',
                },
                horzLine: {
                    color: '#6B7199',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#1E2443',
                },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(107, 113, 153, 0.1)',
                rightOffset: 5,
                barSpacing: 8,
            },
            rightPriceScale: {
                borderColor: 'rgba(107, 113, 153, 0.1)',
                scaleMargins: { top: 0.1, bottom: 0.2 },
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { mouseWheel: true, pinch: true },
        })

        chartRef.current = chart

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26A69A',
            downColor: '#EF5350',
            borderUpColor: '#26A69A',
            borderDownColor: '#EF5350',
            wickUpColor: '#26A69A',
            wickDownColor: '#EF5350',
        })
        candleSeriesRef.current = candlestickSeries

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: '#3B82F6',
            priceFormat: { type: 'volume' },
            priceScaleId: '',
        })
        volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
        })
        volumeSeriesRef.current = volumeSeries

        // Subscribe to crosshair move for tooltip
        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.seriesData.size) {
                setTooltip(null)
                return
            }

            const candleData = param.seriesData.get(candlestickSeries) as CandlestickData
            if (candleData) {
                const date = new Date((param.time as number) * 1000)
                const change = candleData.close - candleData.open
                const changePercent = (change / candleData.open) * 100

                setTooltip({
                    time: date.toLocaleString(),
                    open: candleData.open as number,
                    high: candleData.high as number,
                    low: candleData.low as number,
                    close: candleData.close as number,
                    change,
                    changePercent,
                })
            }
        })

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                })
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [])

    // Load data when symbol or interval changes
    useEffect(() => {
        let unsubscribe: (() => void) | null = null

        const loadData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Fetch historical data
                const historicalData = await fetchHistoricalKlines(
                    selectedSymbol,
                    selectedInterval,
                    500
                )

                if (candleSeriesRef.current) {
                    const candleData: CandlestickData[] = historicalData.map((k) => ({
                        time: k.time as Time,
                        open: k.open,
                        high: k.high,
                        low: k.low,
                        close: k.close,
                    }))
                    candleSeriesRef.current.setData(candleData)
                }

                if (volumeSeriesRef.current) {
                    const volumeData = historicalData.map((k) => ({
                        time: k.time as Time,
                        value: k.volume,
                        color: k.close >= k.open ? 'rgba(38, 166, 154, 0.4)' : 'rgba(239, 83, 80, 0.4)',
                    }))
                    volumeSeriesRef.current.setData(volumeData)
                }

                chartRef.current?.timeScale().fitContent()

                // Subscribe to kline updates for chart
                const klineUnsub = binanceWS.subscribeKline(selectedSymbol, selectedInterval, (data: KlineData) => {
                    setConnectionStatus(true)

                    if (candleSeriesRef.current) {
                        candleSeriesRef.current.update({
                            time: data.time as Time,
                            open: data.open,
                            high: data.high,
                            low: data.low,
                            close: data.close,
                        })
                    }

                    if (volumeSeriesRef.current) {
                        volumeSeriesRef.current.update({
                            time: data.time as Time,
                            value: data.volume,
                            color: data.close >= data.open ? 'rgba(38, 166, 154, 0.4)' : 'rgba(239, 83, 80, 0.4)',
                        })
                    }

                    // Update ticker data
                    updateTickerData(selectedSymbol, {
                        symbol: selectedSymbol,
                        price: data.close,
                        priceChange: 0,
                        priceChangePercent: 0,
                        high24h: data.high,
                        low24h: data.low,
                        volume24h: data.volume,
                        quoteVolume24h: data.quoteVolume,
                        lastUpdateTime: Date.now(),
                    })
                })

                // Subscribe to aggTrade for high-frequency price updates (5-10+ per second)
                const tradeUnsub = binanceWS.subscribeAggTrade(selectedSymbol, (trade) => {
                    updateRealtimePrice(selectedSymbol, trade)
                })

                unsubscribe = () => {
                    klineUnsub()
                    tradeUnsub()
                }

                setIsLoading(false)
            } catch (err) {
                console.error('Error loading chart data:', err)
                setError('Failed to load chart data. Please try again.')
                setIsLoading(false)
            }
        }

        loadData()

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [selectedSymbol, selectedInterval, setConnectionStatus, updateTickerData, updateRealtimePrice])

    const handleFullscreen = () => {
        if (!chartContainerRef.current?.parentElement) return

        if (!document.fullscreenElement) {
            chartContainerRef.current.parentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const isFavorite = favorites.includes(selectedSymbol)

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <Card padding="md" className="flex flex-wrap items-center justify-between gap-4">
                {/* Crypto Selector */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setCryptoDropdownOpen(!cryptoDropdownOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-bg-tertiary rounded-button hover:bg-bg-tertiary/80 transition-colors"
                        >
                            <span className="text-xl" style={{ color: currentAsset?.color }}>
                                {currentAsset?.icon}
                            </span>
                            <div className="text-left">
                                <p className="font-medium">{currentAsset?.name}</p>
                                <p className="text-xs text-text-muted">{currentAsset?.shortName}/USDT</p>
                            </div>
                            <ChevronDown size={16} className={clsx('transition-transform', cryptoDropdownOpen && 'rotate-180')} />
                        </button>

                        {cryptoDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setCryptoDropdownOpen(false)} />
                                <div className="absolute left-0 top-full mt-2 py-2 bg-bg-secondary rounded-card border border-white/10 shadow-lg z-20 min-w-[220px] max-h-80 overflow-y-auto">
                                    {CRYPTO_ASSETS.map((asset) => (
                                        <button
                                            key={asset.symbol}
                                            onClick={() => {
                                                setSelectedSymbol(asset.symbol)
                                                setCryptoDropdownOpen(false)
                                            }}
                                            className={clsx(
                                                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                                selectedSymbol === asset.symbol
                                                    ? 'bg-accent-primary/10 text-accent-primary'
                                                    : 'hover:bg-bg-tertiary'
                                            )}
                                        >
                                            <span className="text-lg" style={{ color: asset.color }}>{asset.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-medium">{asset.name}</p>
                                                <p className="text-xs text-text-muted">{asset.shortName}</p>
                                            </div>
                                            {favorites.includes(asset.symbol) && (
                                                <Star size={14} className="text-warning fill-warning" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => toggleFavorite(selectedSymbol)}
                        className="p-2 hover:bg-bg-tertiary rounded-button transition-colors"
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? (
                            <Star size={20} className="text-warning fill-warning" />
                        ) : (
                            <StarOff size={20} className="text-text-muted" />
                        )}
                    </button>

                    <div className="hidden sm:block h-8 w-px bg-bg-tertiary" />

                    {/* Price Display - High Frequency Updates */}
                    {(() => {
                        const realtimePrice = realtimePrices[selectedSymbol]
                        const displayPrice = realtimePrice?.price || currentTicker?.price || 0
                        const direction = realtimePrice?.direction || 'neutral'

                        return displayPrice > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-warning animate-pulse" />
                                    <motion.span
                                        key={displayPrice}
                                        initial={{ scale: 1.05, opacity: 0.7 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.15 }}
                                        className={clsx(
                                            'text-2xl font-bold font-mono transition-colors duration-150',
                                            direction === 'up' && 'text-success',
                                            direction === 'down' && 'text-danger',
                                            direction === 'neutral' && 'text-text-primary'
                                        )}
                                    >
                                        ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </motion.span>
                                </div>
                                {currentTicker && (
                                    <Badge variant={currentTicker.priceChangePercent >= 0 ? 'success' : 'danger'}>
                                        {currentTicker.priceChangePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {currentTicker.priceChangePercent >= 0 ? '+' : ''}
                                        {currentTicker.priceChangePercent.toFixed(2)}%
                                    </Badge>
                                )}
                            </div>
                        )
                    })()}
                </div>

                {/* Timeframe & Actions */}
                <div className="flex items-center gap-2">
                    {/* Timeframes */}
                    <div className="flex items-center gap-1 p-1 bg-bg-tertiary rounded-button">
                        {TIME_INTERVALS.slice(0, 6).map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => setSelectedInterval(tf.value)}
                                className={clsx(
                                    'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                                    selectedInterval === tf.value
                                        ? 'bg-accent-primary text-bg-primary'
                                        : 'text-text-muted hover:text-text-primary'
                                )}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    {/* Connection Status */}
                    <div className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs',
                        isConnected ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    )}>
                        <Activity size={12} className={isConnected ? 'animate-pulse' : ''} />
                        {isConnected ? 'LIVE' : 'Connecting...'}
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={handleFullscreen}
                        className="p-2 hover:bg-bg-tertiary rounded-button transition-colors"
                        title="Toggle fullscreen"
                    >
                        <Maximize2 size={18} className="text-text-muted" />
                    </button>
                </div>
            </Card>

            {/* Chart Container */}
            <Card padding="none" className="relative overflow-hidden">
                {/* Tooltip */}
                {tooltip && (
                    <div className="absolute top-4 left-4 z-10 p-3 bg-bg-secondary/95 backdrop-blur-sm rounded-card border border-white/10 text-sm">
                        <p className="text-text-muted mb-2">{tooltip.time}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                            <span className="text-text-muted">O:</span>
                            <span>${tooltip.open.toLocaleString()}</span>
                            <span className="text-text-muted">H:</span>
                            <span className="text-success">${tooltip.high.toLocaleString()}</span>
                            <span className="text-text-muted">L:</span>
                            <span className="text-danger">${tooltip.low.toLocaleString()}</span>
                            <span className="text-text-muted">C:</span>
                            <span>${tooltip.close.toLocaleString()}</span>
                            {tooltip.changePercent !== undefined && (
                                <>
                                    <span className="text-text-muted">Chg:</span>
                                    <span className={tooltip.changePercent >= 0 ? 'text-success' : 'text-danger'}>
                                        {tooltip.changePercent >= 0 ? '+' : ''}{tooltip.changePercent.toFixed(2)}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                    <span className="text-[140px] font-bold tracking-wider">
                        {currentAsset?.shortName}
                    </span>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-20">
                        <div className="flex flex-col items-center gap-3">
                            <Spinner size="lg" />
                            <p className="text-sm text-text-muted">Loading chart data...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-20">
                        <div className="text-center">
                            <p className="text-danger mb-2">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-accent-primary hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                <div
                    ref={chartContainerRef}
                    className="w-full h-[450px] md:h-[550px]"
                />
            </Card>

            {/* Stats Row */}
            {currentTicker && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: '24h High', value: `$${currentTicker.high24h.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
                        { label: '24h Low', value: `$${currentTicker.low24h.toLocaleString()}`, icon: TrendingDown, color: 'text-danger' },
                        { label: '24h Volume', value: `${(currentTicker.volume24h / 1e6).toFixed(2)}M`, icon: BarChart3, color: 'text-accent-secondary' },
                        { label: 'Quote Vol', value: `$${(currentTicker.quoteVolume24h / 1e9).toFixed(2)}B`, icon: Activity, color: 'text-accent-primary' },
                    ].map((stat, i) => (
                        <Card key={i} padding="sm" className="flex items-center gap-3">
                            <div className={stat.color}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">{stat.label}</p>
                                <p className="font-semibold font-mono">{stat.value}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
