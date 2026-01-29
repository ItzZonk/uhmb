import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TickerData, TradeData } from '@/services/binanceWebSocket'

export interface CryptoAsset {
    symbol: string
    name: string
    shortName: string
    icon: string
    color: string
}

// Available cryptocurrencies
export const CRYPTO_ASSETS: CryptoAsset[] = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', shortName: 'BTC', icon: '₿', color: '#F7931A' },
    { symbol: 'ETHUSDT', name: 'Ethereum', shortName: 'ETH', icon: 'Ξ', color: '#627EEA' },
    { symbol: 'BNBUSDT', name: 'BNB', shortName: 'BNB', icon: '◆', color: '#F0B90B' },
    { symbol: 'SOLUSDT', name: 'Solana', shortName: 'SOL', icon: '◎', color: '#00FFA3' },
    { symbol: 'XRPUSDT', name: 'XRP', shortName: 'XRP', icon: '✕', color: '#23292F' },
    { symbol: 'ADAUSDT', name: 'Cardano', shortName: 'ADA', icon: '₳', color: '#0033AD' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', shortName: 'DOGE', icon: 'Ð', color: '#C2A633' },
    { symbol: 'MATICUSDT', name: 'Polygon', shortName: 'MATIC', icon: '⬡', color: '#8247E5' },
    { symbol: 'DOTUSDT', name: 'Polkadot', shortName: 'DOT', icon: '●', color: '#E6007A' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', shortName: 'AVAX', icon: 'Ⓐ', color: '#E84142' },
]

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'

export const TIME_INTERVALS: { value: TimeInterval; label: string }[] = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
]

// Real-time price data (updated 5-10+ times per second)
interface RealtimePrice {
    price: number
    previousPrice: number
    lastUpdate: number
    direction: 'up' | 'down' | 'neutral'
}

interface TradingState {
    // Selected crypto and interval
    selectedSymbol: string
    selectedInterval: TimeInterval

    // Price data
    tickerData: Record<string, TickerData>

    // Real-time prices (high-frequency updates)
    realtimePrices: Record<string, RealtimePrice>

    // WebSocket connection status
    isConnected: boolean

    // Favorite symbols
    favorites: string[]

    // Actions
    setSelectedSymbol: (symbol: string) => void
    setSelectedInterval: (interval: TimeInterval) => void
    updateTickerData: (symbol: string, data: TickerData) => void
    updateRealtimePrice: (symbol: string, trade: TradeData) => void
    setConnectionStatus: (status: boolean) => void
    toggleFavorite: (symbol: string) => void

    // Getters
    getCurrentAsset: () => CryptoAsset | undefined
    getCurrentTicker: () => TickerData | undefined
    getCurrentRealtimePrice: () => RealtimePrice | undefined
    getPrice: (symbol: string) => number | undefined
}

export const useTradingStore = create<TradingState>()(
    persist(
        (set, get) => ({
            selectedSymbol: 'BTCUSDT',
            selectedInterval: '1h',
            tickerData: {},
            realtimePrices: {},
            isConnected: false,
            favorites: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],

            setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

            setSelectedInterval: (interval) => set({ selectedInterval: interval }),

            updateTickerData: (symbol, data) =>
                set((state) => ({
                    tickerData: { ...state.tickerData, [symbol]: data }
                })),

            // High-frequency price update (5-10+ times per second)
            updateRealtimePrice: (symbol, trade) =>
                set((state) => {
                    const current = state.realtimePrices[symbol]
                    const previousPrice = current?.price || trade.price

                    return {
                        realtimePrices: {
                            ...state.realtimePrices,
                            [symbol]: {
                                price: trade.price,
                                previousPrice,
                                lastUpdate: trade.time,
                                direction: trade.price > previousPrice
                                    ? 'up'
                                    : trade.price < previousPrice
                                        ? 'down'
                                        : 'neutral'
                            }
                        }
                    }
                }),

            setConnectionStatus: (status) => set({ isConnected: status }),

            toggleFavorite: (symbol) =>
                set((state) => ({
                    favorites: state.favorites.includes(symbol)
                        ? state.favorites.filter((s) => s !== symbol)
                        : [...state.favorites, symbol]
                })),

            getCurrentAsset: () => {
                const state = get()
                return CRYPTO_ASSETS.find((a) => a.symbol === state.selectedSymbol)
            },

            getCurrentTicker: () => {
                const state = get()
                return state.tickerData[state.selectedSymbol]
            },

            getCurrentRealtimePrice: () => {
                const state = get()
                return state.realtimePrices[state.selectedSymbol]
            },

            // Get best available price (realtime > ticker)
            getPrice: (symbol) => {
                const state = get()
                return state.realtimePrices[symbol]?.price
                    || state.tickerData[symbol]?.price
            },
        }),
        {
            name: 'quantix-trading',
            partialize: (state) => ({
                selectedSymbol: state.selectedSymbol,
                selectedInterval: state.selectedInterval,
                favorites: state.favorites,
            }),
        }
    )
)
