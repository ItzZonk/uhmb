/**
 * Binance WebSocket Service
 * Provides real-time cryptocurrency price data via WebSocket
 * Supports multiple stream types including high-frequency trade updates
 */

export interface KlineData {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
    closeTime: number
    quoteVolume: number
    trades: number
    isFinal: boolean
}

export interface TickerData {
    symbol: string
    price: number
    priceChange: number
    priceChangePercent: number
    high24h: number
    low24h: number
    volume24h: number
    quoteVolume24h: number
    lastUpdateTime: number
}

// High-frequency trade data (5-10+ updates per second)
export interface TradeData {
    symbol: string
    price: number
    quantity: number
    time: number
    isBuyerMaker: boolean
    tradeId: number
}

type KlineCallback = (data: KlineData) => void
type TickerCallback = (data: TickerData) => void
type TradeCallback = (data: TradeData) => void

class BinanceWebSocket {
    private connections: Map<string, WebSocket> = new Map()
    private subscriptions: Map<string, Set<KlineCallback | TickerCallback | TradeCallback>> = new Map()
    private reconnectAttempts: Map<string, number> = new Map()
    private maxReconnectAttempts = 5
    private reconnectDelay = 3000
    private pingIntervals: Map<string, NodeJS.Timeout> = new Map()

    private readonly baseUrl = 'wss://stream.binance.com:9443/ws'

    /**
     * Subscribe to aggTrade stream for high-frequency price updates (5-10+ per second)
     * This is the fastest way to get real-time price changes
     */
    subscribeAggTrade(symbol: string, callback: TradeCallback): () => void {
        const streamName = `${symbol.toLowerCase()}@aggTrade`

        this.addSubscription(streamName, callback)

        if (!this.connections.has(streamName)) {
            this.connect(streamName)
        }

        return () => this.removeSubscription(streamName, callback)
    }

    /**
     * Subscribe to trade stream for individual trade updates (very high frequency)
     * Can be 10-50+ updates per second for popular pairs
     */
    subscribeTrade(symbol: string, callback: TradeCallback): () => void {
        const streamName = `${symbol.toLowerCase()}@trade`

        this.addSubscription(streamName, callback)

        if (!this.connections.has(streamName)) {
            this.connect(streamName)
        }

        return () => this.removeSubscription(streamName, callback)
    }

    /**
     * Connect to Binance WebSocket for kline (candlestick) data
     */
    subscribeKline(symbol: string, interval: string, callback: KlineCallback): () => void {
        const streamName = `${symbol.toLowerCase()}@kline_${interval}`

        // Close existing kline connection if switching
        for (const [name, ws] of this.connections) {
            if (name.includes('@kline_')) {
                ws.close()
                this.connections.delete(name)
                this.subscriptions.delete(name)
            }
        }

        this.addSubscription(streamName, callback)
        this.connect(streamName)

        return () => this.removeSubscription(streamName, callback)
    }

    /**
     * Subscribe to 24hr ticker for price updates
     */
    subscribeTicker(symbol: string, callback: TickerCallback): () => void {
        const streamName = `${symbol.toLowerCase()}@ticker`

        this.addSubscription(streamName, callback)

        if (!this.connections.has(streamName)) {
            this.connect(streamName)
        }

        return () => this.removeSubscription(streamName, callback)
    }

    /**
     * Subscribe to mini ticker (lightweight, frequent updates)
     */
    subscribeMiniTicker(symbol: string, callback: (data: { symbol: string; price: number; time: number }) => void): () => void {
        const streamName = `${symbol.toLowerCase()}@miniTicker`

        this.addSubscription(streamName, callback as any)

        if (!this.connections.has(streamName)) {
            this.connect(streamName)
        }

        return () => this.removeSubscription(streamName, callback as any)
    }

    private addSubscription(streamName: string, callback: any) {
        if (!this.subscriptions.has(streamName)) {
            this.subscriptions.set(streamName, new Set())
        }
        this.subscriptions.get(streamName)!.add(callback)
    }

    private removeSubscription(streamName: string, callback: any) {
        const callbacks = this.subscriptions.get(streamName)
        if (callbacks) {
            callbacks.delete(callback)
            if (callbacks.size === 0) {
                this.subscriptions.delete(streamName)
                this.disconnectStream(streamName)
            }
        }
    }

    private connect(streamName: string) {
        const url = `${this.baseUrl}/${streamName}`

        console.log(`[Binance WS] Connecting to ${streamName}...`)

        const ws = new WebSocket(url)
        this.connections.set(streamName, ws)

        ws.onopen = () => {
            console.log(`[Binance WS] Connected to ${streamName}`)
            this.reconnectAttempts.set(streamName, 0)

            // Start ping to keep connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ method: 'ping' }))
                }
            }, 30000)
            this.pingIntervals.set(streamName, pingInterval)
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                this.handleMessage(streamName, data)
            } catch (error) {
                console.error('[Binance WS] Parse error:', error)
            }
        }

        ws.onerror = (error) => {
            console.error('[Binance WS] Error:', error)
        }

        ws.onclose = () => {
            console.log(`[Binance WS] ${streamName} connection closed`)

            const pingInterval = this.pingIntervals.get(streamName)
            if (pingInterval) {
                clearInterval(pingInterval)
                this.pingIntervals.delete(streamName)
            }

            this.connections.delete(streamName)

            // Attempt reconnection
            const attempts = this.reconnectAttempts.get(streamName) || 0
            if (attempts < this.maxReconnectAttempts && this.subscriptions.has(streamName)) {
                this.reconnectAttempts.set(streamName, attempts + 1)
                console.log(`[Binance WS] Reconnecting ${streamName} in ${this.reconnectDelay}ms (attempt ${attempts + 1})...`)

                setTimeout(() => {
                    if (this.subscriptions.has(streamName)) {
                        this.connect(streamName)
                    }
                }, this.reconnectDelay)
            }
        }
    }

    private handleMessage(streamName: string, data: any) {
        const callbacks = this.subscriptions.get(streamName)
        if (!callbacks) return

        // Handle kline data
        if (data.e === 'kline' && data.k) {
            const kline = data.k
            const klineData: KlineData = {
                time: Math.floor(kline.t / 1000),
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
                volume: parseFloat(kline.v),
                closeTime: kline.T,
                quoteVolume: parseFloat(kline.q),
                trades: kline.n,
                isFinal: kline.x,
            }
            callbacks.forEach((cb) => (cb as KlineCallback)(klineData))
        }

        // Handle 24hr ticker data
        if (data.e === '24hrTicker') {
            const tickerData: TickerData = {
                symbol: data.s,
                price: parseFloat(data.c),
                priceChange: parseFloat(data.p),
                priceChangePercent: parseFloat(data.P),
                high24h: parseFloat(data.h),
                low24h: parseFloat(data.l),
                volume24h: parseFloat(data.v),
                quoteVolume24h: parseFloat(data.q),
                lastUpdateTime: data.E,
            }
            callbacks.forEach((cb) => (cb as TickerCallback)(tickerData))
        }

        // Handle mini ticker
        if (data.e === '24hrMiniTicker') {
            const miniData = {
                symbol: data.s,
                price: parseFloat(data.c),
                time: data.E,
            }
            callbacks.forEach((cb) => (cb as any)(miniData))
        }

        // Handle aggTrade data (high frequency - 5-10+ per second)
        if (data.e === 'aggTrade') {
            const tradeData: TradeData = {
                symbol: data.s,
                price: parseFloat(data.p),
                quantity: parseFloat(data.q),
                time: data.T,
                isBuyerMaker: data.m,
                tradeId: data.a,
            }
            callbacks.forEach((cb) => (cb as TradeCallback)(tradeData))
        }

        // Handle individual trade data (very high frequency)
        if (data.e === 'trade') {
            const tradeData: TradeData = {
                symbol: data.s,
                price: parseFloat(data.p),
                quantity: parseFloat(data.q),
                time: data.T,
                isBuyerMaker: data.m,
                tradeId: data.t,
            }
            callbacks.forEach((cb) => (cb as TradeCallback)(tradeData))
        }
    }

    private disconnectStream(streamName: string) {
        const ws = this.connections.get(streamName)
        if (ws) {
            ws.close()
            this.connections.delete(streamName)
        }

        const pingInterval = this.pingIntervals.get(streamName)
        if (pingInterval) {
            clearInterval(pingInterval)
            this.pingIntervals.delete(streamName)
        }
    }

    disconnect() {
        for (const [streamName] of this.connections) {
            this.disconnectStream(streamName)
        }
        this.subscriptions.clear()
    }

    isConnected(streamName?: string): boolean {
        if (streamName) {
            return this.connections.get(streamName)?.readyState === WebSocket.OPEN
        }
        return this.connections.size > 0
    }

    getActiveStreams(): string[] {
        return Array.from(this.connections.keys())
    }
}

// Singleton instance
export const binanceWS = new BinanceWebSocket()

/**
 * Fetch historical kline data from Binance REST API
 */
export async function fetchHistoricalKlines(
    symbol: string,
    interval: string,
    limit: number = 500
): Promise<KlineData[]> {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return data.map((kline: any[]) => ({
            time: Math.floor(kline[0] / 1000),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5]),
            closeTime: kline[6],
            quoteVolume: parseFloat(kline[7]),
            trades: kline[8],
            isFinal: true,
        }))
    } catch (error) {
        console.error('[Binance API] Error fetching historical data:', error)
        throw error
    }
}

/**
 * Fetch 24hr ticker price for a symbol
 */
export async function fetchTicker(symbol: string): Promise<TickerData> {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return {
            symbol: data.symbol,
            price: parseFloat(data.lastPrice),
            priceChange: parseFloat(data.priceChange),
            priceChangePercent: parseFloat(data.priceChangePercent),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            volume24h: parseFloat(data.volume),
            quoteVolume24h: parseFloat(data.quoteVolume),
            lastUpdateTime: data.closeTime,
        }
    } catch (error) {
        console.error('[Binance API] Error fetching ticker:', error)
        throw error
    }
}

/**
 * Fetch multiple tickers at once
 */
export async function fetchMultipleTickers(symbols: string[]): Promise<TickerData[]> {
    const symbolsParam = JSON.stringify(symbols.map(s => s.toUpperCase()))
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return data.map((item: any) => ({
            symbol: item.symbol,
            price: parseFloat(item.lastPrice),
            priceChange: parseFloat(item.priceChange),
            priceChangePercent: parseFloat(item.priceChangePercent),
            high24h: parseFloat(item.highPrice),
            low24h: parseFloat(item.lowPrice),
            volume24h: parseFloat(item.volume),
            quoteVolume24h: parseFloat(item.quoteVolume),
            lastUpdateTime: item.closeTime,
        }))
    } catch (error) {
        console.error('[Binance API] Error fetching multiple tickers:', error)
        throw error
    }
}
