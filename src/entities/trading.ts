/**
 * Core trading entities
 * Part of Feature-Sliced Design architecture
 */

// ============================================
// ASSET ENTITY
// ============================================

export interface Asset {
    symbol: string        // e.g., "BTCUSDT"
    name: string          // e.g., "Bitcoin"
    shortName: string     // e.g., "BTC"
    baseAsset: string     // e.g., "BTC"
    quoteAsset: string    // e.g., "USDT"
    color: string         // Branding color
    icon?: string         // Emoji or icon URL
    decimals: number      // Price precision
    minQty: number        // Minimum order quantity
    stepSize: number      // Quantity step
}

// ============================================
// BALANCE ENTITY
// ============================================

export interface Balance {
    asset: string         // "USDT" or crypto symbol
    free: number          // Available for trading
    locked: number        // In open orders
    total: number         // free + locked
}

export interface WalletBalance {
    balances: Record<string, Balance>
    totalValueUSD: number
}

// ============================================
// ORDER ENTITY
// ============================================

export type OrderType = 'market' | 'limit' | 'stop-loss' | 'stop-limit' | 'take-profit' | 'trailing-stop'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'open' | 'partially_filled' | 'filled' | 'cancelled' | 'expired' | 'rejected'
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' // Good Till Cancel, Immediate or Cancel, Fill or Kill

export interface Order {
    id: string
    clientOrderId?: string
    symbol: string
    type: OrderType
    side: OrderSide
    status: OrderStatus
    timeInForce: TimeInForce

    // Quantities
    quantity: number           // Crypto amount
    executedQty: number        // Filled amount
    remainingQty: number       // quantity - executedQty

    // Prices
    price?: number             // Limit price
    stopPrice?: number         // Trigger price for stop orders
    avgFillPrice?: number      // Average execution price

    // USD equivalent
    quoteQty: number           // Total USD value
    executedQuoteQty: number   // Filled USD value

    // Fees
    fee: number
    feeAsset: string

    // Timestamps
    createdAt: Date
    updatedAt: Date
    expiresAt?: Date
    filledAt?: Date
}

// ============================================
// TRADE ENTITY
// ============================================

export interface Trade {
    id: string
    orderId: string
    symbol: string
    side: OrderSide

    // Execution
    price: number
    quantity: number
    quoteQty: number

    // Fees
    fee: number
    feeAsset: string

    // Metadata
    isMaker: boolean           // Maker or Taker
    timestamp: Date

    // Realized P&L for this trade
    realizedPnl?: number
}

// ============================================
// POSITION ENTITY
// ============================================

export interface Position {
    symbol: string
    side: 'long' | 'short'

    // Quantities
    quantity: number
    avgEntryPrice: number

    // P&L
    unrealizedPnl: number
    unrealizedPnlPercent: number
    realizedPnl: number

    // Risk
    liquidationPrice?: number
    margin?: number
    leverage?: number

    // Timestamps
    openedAt: Date
    updatedAt: Date
}

// ============================================
// PORTFOLIO ENTITY
// ============================================

export interface PortfolioAsset {
    symbol: string
    name: string
    quantity: number
    avgBuyPrice: number
    currentPrice: number
    value: number
    cost: number
    pnl: number
    pnlPercent: number
    allocation: number  // Percentage of portfolio
    color: string
}

export interface Portfolio {
    assets: PortfolioAsset[]
    totalValue: number
    totalCost: number
    totalPnl: number
    totalPnlPercent: number
    cashBalance: number
    lastUpdated: Date
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateOrderQuantity(quantity: number, asset: Asset): { valid: boolean; error?: string } {
    if (quantity < asset.minQty) {
        return { valid: false, error: `Minimum quantity is ${asset.minQty} ${asset.baseAsset}` }
    }

    const steps = Math.round(quantity / asset.stepSize)
    const normalizedQty = steps * asset.stepSize

    if (Math.abs(quantity - normalizedQty) > 0.00000001) {
        return { valid: false, error: `Quantity must be a multiple of ${asset.stepSize}` }
    }

    return { valid: true }
}

export function calculateOrderValue(quantity: number, price: number, side: OrderSide, feeRate: number = 0.001): {
    grossValue: number
    fee: number
    netValue: number
} {
    const grossValue = quantity * price
    const fee = grossValue * feeRate

    if (side === 'buy') {
        return {
            grossValue,
            fee,
            netValue: grossValue + fee  // Pay more for buy
        }
    } else {
        return {
            grossValue,
            fee,
            netValue: grossValue - fee  // Receive less for sell
        }
    }
}

export function calculatePnL(entryPrice: number, currentPrice: number, quantity: number, side: 'long' | 'short'): {
    pnl: number
    pnlPercent: number
} {
    let pnl: number

    if (side === 'long') {
        pnl = (currentPrice - entryPrice) * quantity
    } else {
        pnl = (entryPrice - currentPrice) * quantity
    }

    const cost = entryPrice * quantity
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0

    return { pnl, pnlPercent }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

export function createMarketOrder(params: {
    symbol: string
    side: OrderSide
    quantity: number
    quoteQty: number
}): Partial<Order> {
    return {
        symbol: params.symbol,
        type: 'market',
        side: params.side,
        status: 'pending',
        timeInForce: 'IOC',
        quantity: params.quantity,
        executedQty: 0,
        remainingQty: params.quantity,
        quoteQty: params.quoteQty,
        executedQuoteQty: 0,
        fee: 0,
        feeAsset: 'USDT',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}

export function createLimitOrder(params: {
    symbol: string
    side: OrderSide
    quantity: number
    price: number
    timeInForce?: TimeInForce
}): Partial<Order> {
    return {
        symbol: params.symbol,
        type: 'limit',
        side: params.side,
        status: 'open',
        timeInForce: params.timeInForce || 'GTC',
        quantity: params.quantity,
        executedQty: 0,
        remainingQty: params.quantity,
        price: params.price,
        quoteQty: params.quantity * params.price,
        executedQuoteQty: 0,
        fee: 0,
        feeAsset: 'USDT',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}

export function createStopLossOrder(params: {
    symbol: string
    quantity: number
    stopPrice: number
}): Partial<Order> {
    return {
        symbol: params.symbol,
        type: 'stop-loss',
        side: 'sell',
        status: 'open',
        timeInForce: 'GTC',
        quantity: params.quantity,
        executedQty: 0,
        remainingQty: params.quantity,
        stopPrice: params.stopPrice,
        quoteQty: params.quantity * params.stopPrice,
        executedQuoteQty: 0,
        fee: 0,
        feeAsset: 'USDT',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}
