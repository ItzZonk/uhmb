import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'

// Holding represents a cryptocurrency position
export interface Holding {
    symbol: string
    name: string
    shortName: string
    amount: number
    avgBuyPrice: number
    color: string
}

// Transaction represents a buy/sell action
export interface Transaction {
    id: string
    type: 'buy' | 'sell' | 'deposit' | 'bonus'
    symbol: string
    name: string
    amount: number
    price: number
    total: number
    fee: number
    timestamp: Date
}

// Portfolio metrics
export interface PortfolioMetrics {
    totalValue: number
    totalCost: number
    profitLoss: number
    profitLossPercent: number
    dayChange: number
    dayChangePercent: number
}

interface WalletState {
    // Virtual USD balance
    balance: number
    initialDeposit: number

    // Holdings (crypto positions)
    holdings: Record<string, Holding>

    // Transaction history
    transactions: Transaction[]

    // User tier affects daily bonus
    userTier: 'free' | 'starter' | 'pro' | 'ultimate'
    lastBonusClaim: string | null

    // Actions
    deposit: (amount: number) => void
    buy: (symbol: string, name: string, shortName: string, amount: number, price: number, color: string) => { success: boolean; error?: string }
    sell: (symbol: string, amount: number, price: number) => { success: boolean; error?: string }
    claimDailyBonus: () => { success: boolean; amount: number; error?: string }
    resetWallet: () => void

    // Getters
    getHolding: (symbol: string) => Holding | undefined
    getPortfolioValue: (prices: Record<string, number>) => number
    getPortfolioMetrics: (prices: Record<string, number>) => PortfolioMetrics
    getHoldingsWithValue: (prices: Record<string, number>) => (Holding & { currentValue: number; pnl: number; pnlPercent: number })[]
}

const TRADING_FEE_PERCENT = 0.1 // 0.1% trading fee

const DAILY_BONUS = {
    free: 0,
    starter: 50,
    pro: 100,
    ultimate: 2000,
}

const INITIAL_BALANCE = 500

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
            userTier: 'free',
            lastBonusClaim: null,

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
                const fee = amount * (TRADING_FEE_PERCENT / 100)
                const totalCost = amount + fee

                if (totalCost > state.balance) {
                    return { success: false, error: 'Insufficient balance' }
                }

                const cryptoAmount = amount / price
                const existingHolding = state.holdings[symbol]

                // Calculate new average price
                let newAvgPrice = price
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
                            symbol,
                            name,
                            amount: cryptoAmount,
                            price,
                            total: amount,
                            fee,
                            timestamp: new Date(),
                        },
                        ...state.transactions,
                    ],
                }))

                return { success: true }
            },

            sell: (symbol, amount, price) => {
                const state = get()
                const holding = state.holdings[symbol]

                if (!holding || holding.amount < amount) {
                    return { success: false, error: 'Insufficient holdings' }
                }

                const totalValue = amount * price
                const fee = totalValue * (TRADING_FEE_PERCENT / 100)
                const netValue = totalValue - fee

                const newAmount = holding.amount - amount

                set((state) => {
                    const newHoldings = { ...state.holdings }

                    if (newAmount <= 0.00000001) {
                        // Remove holding if sold all
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
                                symbol,
                                name: holding.name,
                                amount,
                                price,
                                total: totalValue,
                                fee,
                                timestamp: new Date(),
                            },
                            ...state.transactions,
                        ],
                    }
                })

                return { success: true }
            },

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
                    lastBonusClaim: null,
                })
            },

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

                // Day change would need historical data, using 0 for now
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
        }),
        {
            name: 'quantix-wallet',
            partialize: (state) => ({
                balance: state.balance,
                initialDeposit: state.initialDeposit,
                holdings: state.holdings,
                transactions: state.transactions.slice(0, 100), // Keep last 100 transactions
                userTier: state.userTier,
                lastBonusClaim: state.lastBonusClaim,
            }),
        }
    )
)
