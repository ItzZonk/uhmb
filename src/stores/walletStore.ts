import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Holding {
    symbol: string
    name: string
    shortName: string
    amount: number
    avgBuyPrice: number
    color: string
}

// Order types for realistic trading simulation
export type OrderType = 'market' | 'limit' | 'stop-loss' | 'take-profit'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'expired'

export interface PendingOrder {
    id: string
    type: OrderType
    side: OrderSide
    symbol: string
    name: string
    shortName: string
    amount: number          // USD amount for buy, crypto amount for sell
    targetPrice: number     // Price at which order triggers
    createdAt: Date
    expiresAt?: Date
    status: OrderStatus
    color: string
}

// Extended transaction with order info
export interface Transaction {
    id: string
    type: 'buy' | 'sell' | 'deposit' | 'bonus'
    orderType?: OrderType
    symbol: string
    name: string
    amount: number
    price: number
    total: number
    fee: number
    slippage?: number       // Simulated slippage amount
    timestamp: Date
    note?: string           // Trading journal entry
}

export interface PortfolioMetrics {
    totalValue: number
    totalCost: number
    profitLoss: number
    profitLossPercent: number
    dayChange: number
    dayChangePercent: number
}

// Trading journal entry
export interface JournalEntry {
    id: string
    transactionId: string
    note: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
}

interface WalletState {
    // Virtual USD balance
    balance: number
    initialDeposit: number

    // Holdings (crypto positions)
    holdings: Record<string, Holding>

    // Transaction history
    transactions: Transaction[]

    // Pending orders (limit, stop-loss, take-profit)
    pendingOrders: PendingOrder[]

    // Trading journal
    journalEntries: JournalEntry[]

    // User tier affects daily bonus
    userTier: 'free' | 'starter' | 'pro' | 'ultimate'
    lastBonusClaim: string | null

    // Trading settings
    slippageEnabled: boolean
    slippagePercent: number // 0.05% - 0.5% typically

    // Actions
    deposit: (amount: number) => void
    buy: (symbol: string, name: string, shortName: string, amount: number, price: number, color: string) => { success: boolean; error?: string; executedPrice?: number }
    sell: (symbol: string, amount: number, price: number) => { success: boolean; error?: string; executedPrice?: number }

    // Advanced orders
    placeLimitOrder: (side: OrderSide, symbol: string, name: string, shortName: string, amount: number, targetPrice: number, color: string) => { success: boolean; orderId?: string; error?: string }
    placeStopLoss: (symbol: string, amount: number, stopPrice: number) => { success: boolean; orderId?: string; error?: string }
    placeTakeProfit: (symbol: string, amount: number, targetPrice: number) => { success: boolean; orderId?: string; error?: string }
    cancelOrder: (orderId: string) => { success: boolean; error?: string }
    checkAndExecuteOrders: (currentPrices: Record<string, number>) => void

    // Trading journal
    addJournalNote: (transactionId: string, note: string, tags?: string[]) => void
    updateJournalNote: (entryId: string, note: string, tags?: string[]) => void
    getJournalForTransaction: (transactionId: string) => JournalEntry | undefined

    claimDailyBonus: () => { success: boolean; amount: number; error?: string }
    resetWallet: () => void
    setSlippage: (enabled: boolean, percent?: number) => void

    // Getters
    getHolding: (symbol: string) => Holding | undefined
    getPortfolioValue: (prices: Record<string, number>) => number
    getPortfolioMetrics: (prices: Record<string, number>) => PortfolioMetrics
    getHoldingsWithValue: (prices: Record<string, number>) => (Holding & { currentValue: number; pnl: number; pnlPercent: number })[]
    getPendingOrdersForSymbol: (symbol: string) => PendingOrder[]
}

// ============================================
// CONSTANTS
// ============================================

const TRADING_FEE_PERCENT = 0.1 // 0.1% trading fee (realistic Binance fee)

const DAILY_BONUS = {
    free: 0,
    starter: 50,
    pro: 100,
    ultimate: 2000,
}

const INITIAL_BALANCE = 500

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate slippage for market orders
 * Simulates realistic price deviation during execution
 */
function calculateSlippage(price: number, slippagePercent: number, isBuy: boolean): number {
    // Random slippage within the percentage range
    const randomFactor = Math.random() * slippagePercent
    const slippageAmount = price * (randomFactor / 100)

    // Slippage is unfavorable: higher price for buys, lower for sells
    return isBuy ? slippageAmount : -slippageAmount
}

/**
 * Apply slippage to get executed price
 */
function getExecutedPrice(price: number, slippagePercent: number, isBuy: boolean): number {
    const slippage = calculateSlippage(price, slippagePercent, isBuy)
    return price + slippage
}

// ============================================
// STORE
// ============================================

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            balance: INITIAL_BALANCE,
            initialDeposit: INITIAL_BALANCE,
            holdings: {},
            transactions: [
                {
                    id: generateId(),
                    type: 'deposit',
                    symbol: 'USD',
                    name: 'Initial Deposit',
                    amount: INITIAL_BALANCE,
                    price: 1,
                    total: INITIAL_BALANCE,
                    fee: 0,
                    timestamp: new Date(),
                }
            ],
            pendingOrders: [],
            journalEntries: [],
            userTier: 'free',
            lastBonusClaim: null,
            slippageEnabled: true,
            slippagePercent: 0.1, // Default 0.1% slippage

            deposit: (amount) => {
                set((state) => ({
                    balance: state.balance + amount,
                    initialDeposit: state.initialDeposit + amount,
                    transactions: [
                        {
                            id: generateId(),
                            type: 'deposit',
                            symbol: 'USD',
                            name: 'Deposit',
                            amount,
                            price: 1,
                            total: amount,
                            fee: 0,
                            timestamp: new Date(),
                        },
                        ...state.transactions,
                    ],
                }))
            },

            buy: (symbol, name, shortName, amount, price, color) => {
                const state = get()

                // Apply slippage for realistic execution
                const executedPrice = state.slippageEnabled
                    ? getExecutedPrice(price, state.slippagePercent, true)
                    : price
                const slippage = executedPrice - price

                const fee = amount * (TRADING_FEE_PERCENT / 100)
                const totalCost = amount + fee

                if (totalCost > state.balance) {
                    return { success: false, error: 'Insufficient balance' }
                }

                const cryptoAmount = amount / executedPrice
                const existingHolding = state.holdings[symbol]

                // Calculate new average price
                let newAvgPrice = executedPrice
                let newAmount = cryptoAmount

                if (existingHolding) {
                    const totalValue = (existingHolding.amount * existingHolding.avgBuyPrice) + amount
                    newAmount = existingHolding.amount + cryptoAmount
                    newAvgPrice = totalValue / newAmount
                }

                set((state) => ({
                    balance: state.balance - totalCost,
                    holdings: {
                        ...state.holdings,
                        [symbol]: {
                            symbol,
                            name,
                            shortName,
                            amount: newAmount,
                            avgBuyPrice: newAvgPrice,
                            color,
                        },
                    },
                    transactions: [
                        {
                            id: generateId(),
                            type: 'buy',
                            orderType: 'market',
                            symbol,
                            name,
                            amount: cryptoAmount,
                            price: executedPrice,
                            total: amount,
                            fee,
                            slippage: slippage > 0 ? slippage : undefined,
                            timestamp: new Date(),
                        },
                        ...state.transactions,
                    ],
                }))

                return { success: true, executedPrice }
            },

            sell: (symbol, amount, price) => {
                const state = get()
                const holding = state.holdings[symbol]

                if (!holding || holding.amount < amount) {
                    return { success: false, error: 'Insufficient holdings' }
                }

                // Apply slippage for realistic execution
                const executedPrice = state.slippageEnabled
                    ? getExecutedPrice(price, state.slippagePercent, false)
                    : price
                const slippage = price - executedPrice

                const totalValue = amount * executedPrice
                const fee = totalValue * (TRADING_FEE_PERCENT / 100)
                const netValue = totalValue - fee

                const newAmount = holding.amount - amount

                set((state) => {
                    const newHoldings = { ...state.holdings }

                    if (newAmount <= 0.00000001) {
                        delete newHoldings[symbol]
                    } else {
                        newHoldings[symbol] = {
                            ...holding,
                            amount: newAmount,
                        }
                    }

                    return {
                        balance: state.balance + netValue,
                        holdings: newHoldings,
                        transactions: [
                            {
                                id: generateId(),
                                type: 'sell',
                                orderType: 'market',
                                symbol,
                                name: holding.name,
                                amount,
                                price: executedPrice,
                                total: totalValue,
                                fee,
                                slippage: slippage > 0 ? slippage : undefined,
                                timestamp: new Date(),
                            },
                            ...state.transactions,
                        ],
                    }
                })

                return { success: true, executedPrice }
            },

            // ============================================
            // LIMIT ORDERS
            // ============================================

            placeLimitOrder: (side, symbol, name, shortName, amount, targetPrice, color) => {
                const state = get()

                if (side === 'buy') {
                    // Check if user has enough balance for potential execution
                    const fee = amount * (TRADING_FEE_PERCENT / 100)
                    if (amount + fee > state.balance) {
                        return { success: false, error: 'Insufficient balance for limit order' }
                    }
                } else {
                    // Check if user has enough holdings
                    const holding = state.holdings[symbol]
                    const cryptoAmount = amount / targetPrice
                    if (!holding || holding.amount < cryptoAmount) {
                        return { success: false, error: 'Insufficient holdings for limit order' }
                    }
                }

                const orderId = generateId()
                const order: PendingOrder = {
                    id: orderId,
                    type: 'limit',
                    side,
                    symbol,
                    name,
                    shortName,
                    amount,
                    targetPrice,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    status: 'pending',
                    color,
                }

                set((state) => ({
                    pendingOrders: [...state.pendingOrders, order],
                }))

                return { success: true, orderId }
            },

            placeStopLoss: (symbol, amount, stopPrice) => {
                const state = get()
                const holding = state.holdings[symbol]

                if (!holding || holding.amount < amount) {
                    return { success: false, error: 'Insufficient holdings for stop-loss' }
                }

                const orderId = generateId()
                const order: PendingOrder = {
                    id: orderId,
                    type: 'stop-loss',
                    side: 'sell',
                    symbol,
                    name: holding.name,
                    shortName: holding.shortName,
                    amount,
                    targetPrice: stopPrice,
                    createdAt: new Date(),
                    status: 'pending',
                    color: holding.color,
                }

                set((state) => ({
                    pendingOrders: [...state.pendingOrders, order],
                }))

                return { success: true, orderId }
            },

            placeTakeProfit: (symbol, amount, targetPrice) => {
                const state = get()
                const holding = state.holdings[symbol]

                if (!holding || holding.amount < amount) {
                    return { success: false, error: 'Insufficient holdings for take-profit' }
                }

                const orderId = generateId()
                const order: PendingOrder = {
                    id: orderId,
                    type: 'take-profit',
                    side: 'sell',
                    symbol,
                    name: holding.name,
                    shortName: holding.shortName,
                    amount,
                    targetPrice,
                    createdAt: new Date(),
                    status: 'pending',
                    color: holding.color,
                }

                set((state) => ({
                    pendingOrders: [...state.pendingOrders, order],
                }))

                return { success: true, orderId }
            },

            cancelOrder: (orderId) => {
                const state = get()
                const order = state.pendingOrders.find(o => o.id === orderId)

                if (!order) {
                    return { success: false, error: 'Order not found' }
                }

                if (order.status !== 'pending') {
                    return { success: false, error: 'Order cannot be cancelled' }
                }

                set((state) => ({
                    pendingOrders: state.pendingOrders.map(o =>
                        o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
                    ),
                }))

                return { success: true }
            },

            checkAndExecuteOrders: (currentPrices) => {
                const state = get()
                const now = new Date()

                state.pendingOrders.forEach((order) => {
                    if (order.status !== 'pending') return

                    // Check expiration
                    if (order.expiresAt && new Date(order.expiresAt) < now) {
                        set((s) => ({
                            pendingOrders: s.pendingOrders.map(o =>
                                o.id === order.id ? { ...o, status: 'expired' as OrderStatus } : o
                            ),
                        }))
                        return
                    }

                    const currentPrice = currentPrices[order.symbol]
                    if (!currentPrice) return

                    let shouldExecute = false

                    switch (order.type) {
                        case 'limit':
                            if (order.side === 'buy' && currentPrice <= order.targetPrice) {
                                shouldExecute = true
                            } else if (order.side === 'sell' && currentPrice >= order.targetPrice) {
                                shouldExecute = true
                            }
                            break

                        case 'stop-loss':
                            if (currentPrice <= order.targetPrice) {
                                shouldExecute = true
                            }
                            break

                        case 'take-profit':
                            if (currentPrice >= order.targetPrice) {
                                shouldExecute = true
                            }
                            break
                    }

                    if (shouldExecute) {
                        // Execute the order
                        if (order.side === 'buy') {
                            const result = get().buy(
                                order.symbol,
                                order.name,
                                order.shortName,
                                order.amount,
                                order.targetPrice,
                                order.color
                            )

                            if (result.success) {
                                set((s) => ({
                                    pendingOrders: s.pendingOrders.map(o =>
                                        o.id === order.id ? { ...o, status: 'filled' as OrderStatus } : o
                                    ),
                                }))
                            }
                        } else {
                            const cryptoAmount = order.amount / order.targetPrice
                            const result = get().sell(order.symbol, cryptoAmount, order.targetPrice)

                            if (result.success) {
                                set((s) => ({
                                    pendingOrders: s.pendingOrders.map(o =>
                                        o.id === order.id ? { ...o, status: 'filled' as OrderStatus } : o
                                    ),
                                }))
                            }
                        }
                    }
                })
            },

            // ============================================
            // TRADING JOURNAL
            // ============================================

            addJournalNote: (transactionId, note, tags = []) => {
                const entry: JournalEntry = {
                    id: generateId(),
                    transactionId,
                    note,
                    tags,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                set((state) => ({
                    journalEntries: [...state.journalEntries, entry],
                }))
            },

            updateJournalNote: (entryId, note, tags) => {
                set((state) => ({
                    journalEntries: state.journalEntries.map(entry =>
                        entry.id === entryId
                            ? { ...entry, note, tags: tags || entry.tags, updatedAt: new Date() }
                            : entry
                    ),
                }))
            },

            getJournalForTransaction: (transactionId) => {
                return get().journalEntries.find(e => e.transactionId === transactionId)
            },

            // ============================================
            // OTHER ACTIONS
            // ============================================

            claimDailyBonus: () => {
                const state = get()
                const today = new Date().toDateString()

                if (state.lastBonusClaim === today) {
                    return { success: false, amount: 0, error: 'Already claimed today' }
                }

                const bonusAmount = DAILY_BONUS[state.userTier]

                if (bonusAmount === 0) {
                    return { success: false, amount: 0, error: 'Upgrade to get daily bonus' }
                }

                set((state) => ({
                    balance: state.balance + bonusAmount,
                    lastBonusClaim: today,
                    transactions: [
                        {
                            id: generateId(),
                            type: 'bonus',
                            symbol: 'USD',
                            name: 'Daily Bonus',
                            amount: bonusAmount,
                            price: 1,
                            total: bonusAmount,
                            fee: 0,
                            timestamp: new Date(),
                        },
                        ...state.transactions,
                    ],
                }))

                return { success: true, amount: bonusAmount }
            },

            resetWallet: () => {
                set({
                    balance: INITIAL_BALANCE,
                    initialDeposit: INITIAL_BALANCE,
                    holdings: {},
                    transactions: [
                        {
                            id: generateId(),
                            type: 'deposit',
                            symbol: 'USD',
                            name: 'Wallet Reset',
                            amount: INITIAL_BALANCE,
                            price: 1,
                            total: INITIAL_BALANCE,
                            fee: 0,
                            timestamp: new Date(),
                        }
                    ],
                    pendingOrders: [],
                    journalEntries: [],
                    lastBonusClaim: null,
                })
            },

            setSlippage: (enabled, percent) => {
                set({
                    slippageEnabled: enabled,
                    slippagePercent: percent ?? get().slippagePercent,
                })
            },

            // ============================================
            // GETTERS
            // ============================================

            getHolding: (symbol) => get().holdings[symbol],

            getPortfolioValue: (prices) => {
                const state = get()
                let holdingsValue = 0

                Object.values(state.holdings).forEach((holding) => {
                    const price = prices[holding.symbol] || 0
                    holdingsValue += holding.amount * price
                })

                return state.balance + holdingsValue
            },

            getPortfolioMetrics: (prices) => {
                const state = get()
                let holdingsValue = 0
                let totalCost = 0

                Object.values(state.holdings).forEach((holding) => {
                    const price = prices[holding.symbol] || 0
                    holdingsValue += holding.amount * price
                    totalCost += holding.amount * holding.avgBuyPrice
                })

                const totalValue = state.balance + holdingsValue
                const profitLoss = totalValue - state.initialDeposit
                const profitLossPercent = state.initialDeposit > 0
                    ? (profitLoss / state.initialDeposit) * 100
                    : 0

                return {
                    totalValue,
                    totalCost,
                    profitLoss,
                    profitLossPercent,
                    dayChange: 0,
                    dayChangePercent: 0,
                }
            },

            getHoldingsWithValue: (prices) => {
                const state = get()

                return Object.values(state.holdings).map((holding) => {
                    const currentPrice = prices[holding.symbol] || 0
                    const currentValue = holding.amount * currentPrice
                    const costBasis = holding.amount * holding.avgBuyPrice
                    const pnl = currentValue - costBasis
                    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0

                    return {
                        ...holding,
                        currentValue,
                        pnl,
                        pnlPercent,
                    }
                }).sort((a, b) => b.currentValue - a.currentValue)
            },

            getPendingOrdersForSymbol: (symbol) => {
                return get().pendingOrders.filter(o => o.symbol === symbol && o.status === 'pending')
            },
        }),
        {
            name: 'quantix-wallet',
            partialize: (state) => ({
                balance: state.balance,
                initialDeposit: state.initialDeposit,
                holdings: state.holdings,
                transactions: state.transactions.slice(0, 100),
                pendingOrders: state.pendingOrders.filter(o => o.status === 'pending'),
                journalEntries: state.journalEntries.slice(0, 200),
                userTier: state.userTier,
                lastBonusClaim: state.lastBonusClaim,
                slippageEnabled: state.slippageEnabled,
                slippagePercent: state.slippagePercent,
            }),
        }
    )
)
