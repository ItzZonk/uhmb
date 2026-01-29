import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isTyping?: boolean
    metadata?: {
        prediction?: {
            direction: 'bullish' | 'bearish' | 'neutral'
            confidence: number
            targetPrice?: number
            stopLoss?: number
        }
        analysis?: {
            rsi: number
            trend: string
            support: number
            resistance: number
        }
    }
}

// Tier-based query limits
const TIER_QUERY_LIMITS = {
    free: 3,        // Freemium: 3 queries/day
    starter: 25,    // Starter: 25 queries/day
    pro: 100,       // Pro: 100 queries/day
    ultimate: -1,   // Ultimate: Unlimited (-1 = no limit)
}

type UserTier = keyof typeof TIER_QUERY_LIMITS

interface AIState {
    messages: ChatMessage[]
    isLoading: boolean
    dailyQueriesUsed: number
    lastResetDate: string
    userTier: UserTier

    // Streak system for engagement
    consecutiveDays: number
    lastActiveDate: string | null
    bonusQueriesEarned: number

    // Actions
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
    setLoading: (loading: boolean) => void
    clearMessages: () => void
    resetDailyQueries: () => void
    incrementQueryCount: () => { success: boolean; remaining: number; error?: string }
    setUserTier: (tier: UserTier) => void

    // Getters
    getQueryLimit: () => number
    getRemainingQueries: () => number
    isLimitReached: () => boolean
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

export const useAIStore = create<AIState>()(
    persist(
        (set, get) => ({
            messages: [
                {
                    id: generateId(),
                    role: 'assistant',
                    content: "👋 Hello! I'm **Quantix AI**, your trading assistant.\n\nI can help you with:\n• 📊 **Analyze** - Technical analysis\n• 🔮 **Predict** - Price forecasts\n• ⚠️ **Risk** - Trade risk assessment\n\nWhat would you like to know?",
                    timestamp: new Date(),
                }
            ],
            isLoading: false,
            dailyQueriesUsed: 0,
            lastResetDate: new Date().toDateString(),
            userTier: 'free',
            consecutiveDays: 0,
            lastActiveDate: null,
            bonusQueriesEarned: 0,

            addMessage: (message) => {
                const newMessage: ChatMessage = {
                    ...message,
                    id: generateId(),
                    timestamp: new Date(),
                }
                set((state) => ({
                    messages: [...state.messages, newMessage]
                }))
            },

            setLoading: (loading) => set({ isLoading: loading }),

            clearMessages: () => set({
                messages: [{
                    id: generateId(),
                    role: 'assistant',
                    content: "💬 Chat cleared. How can I help you with your trading analysis?",
                    timestamp: new Date(),
                }]
            }),

            resetDailyQueries: () => {
                const state = get()
                const today = new Date().toDateString()
                const yesterday = new Date(Date.now() - 86400000).toDateString()

                let newStreak = 0
                let bonusQueries = 0

                // Update streak
                if (state.lastActiveDate === yesterday) {
                    newStreak = state.consecutiveDays + 1
                    // Bonus queries for streaks (1 extra query per 3 days)
                    if (newStreak % 3 === 0) {
                        bonusQueries = 1
                    }
                } else if (state.lastActiveDate !== today) {
                    newStreak = 1
                } else {
                    newStreak = state.consecutiveDays
                }

                set({
                    dailyQueriesUsed: 0,
                    lastResetDate: today,
                    consecutiveDays: newStreak,
                    lastActiveDate: today,
                    bonusQueriesEarned: state.bonusQueriesEarned + bonusQueries,
                })
            },

            incrementQueryCount: () => {
                const state = get()
                const today = new Date().toDateString()

                // Check if we need to reset (new day)
                if (state.lastResetDate !== today) {
                    get().resetDailyQueries()
                }

                const limit = get().getQueryLimit()
                const used = get().dailyQueriesUsed

                // Unlimited tier
                if (limit === -1) {
                    set({
                        dailyQueriesUsed: used + 1,
                        lastActiveDate: today
                    })
                    return { success: true, remaining: -1 }
                }

                // Check limit (including bonus queries)
                const totalLimit = limit + get().bonusQueriesEarned
                if (used >= totalLimit) {
                    return {
                        success: false,
                        remaining: 0,
                        error: `Daily limit reached (${limit} queries). Upgrade for more!`
                    }
                }

                set({
                    dailyQueriesUsed: used + 1,
                    lastActiveDate: today
                })
                return { success: true, remaining: totalLimit - used - 1 }
            },

            setUserTier: (tier) => set({ userTier: tier }),

            getQueryLimit: () => {
                const tier = get().userTier
                return TIER_QUERY_LIMITS[tier]
            },

            getRemainingQueries: () => {
                const state = get()
                const limit = state.getQueryLimit()

                if (limit === -1) return -1 // Unlimited

                const totalLimit = limit + state.bonusQueriesEarned
                return Math.max(0, totalLimit - state.dailyQueriesUsed)
            },

            isLimitReached: () => {
                const remaining = get().getRemainingQueries()
                return remaining === 0
            },
        }),
        {
            name: 'quantix-ai-chat',
            partialize: (state) => ({
                dailyQueriesUsed: state.dailyQueriesUsed,
                lastResetDate: state.lastResetDate,
                userTier: state.userTier,
                consecutiveDays: state.consecutiveDays,
                lastActiveDate: state.lastActiveDate,
                bonusQueriesEarned: state.bonusQueriesEarned,
            }),
        }
    )
)

// ============================================
// AI RESPONSE GENERATOR
// ============================================

export async function generateAIResponse(
    userMessage: string,
    symbol: string,
    currentPrice: number
): Promise<{ content: string; metadata?: ChatMessage['metadata'] }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))

    const lowerMessage = userMessage.toLowerCase()
    const baseSymbol = symbol.replace('USDT', '')

    // Analysis request
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis') || lowerMessage.includes('анализ')) {
        const rsi = 45 + Math.random() * 30
        const trend = rsi > 60 ? 'Bullish' : rsi < 40 ? 'Bearish' : 'Neutral'
        const support = currentPrice * (0.92 + Math.random() * 0.03)
        const resistance = currentPrice * (1.05 + Math.random() * 0.05)
        const macdSignal = rsi > 50 ? 'Bullish crossover' : 'Bearish divergence'
        const volumeTrend = Math.random() > 0.5 ? 'Above' : 'Below'

        return {
            content: `## 📊 ${baseSymbol} Technical Analysis

**Current Price:** $${currentPrice.toLocaleString()}

### Indicators
| Indicator | Value | Signal |
|-----------|-------|--------|
| RSI (14) | ${rsi.toFixed(1)} | ${rsi > 70 ? '🔴 Overbought' : rsi < 30 ? '🟢 Oversold' : '🟡 Neutral'} |
| MACD | ${macdSignal} | ${rsi > 50 ? '🟢' : '🔴'} |
| Volume | ${volumeTrend} avg | ${volumeTrend === 'Above' ? '🟢' : '🟡'} |

### Key Levels
- **Support:** $${support.toFixed(2)}
- **Resistance:** $${resistance.toFixed(2)}

### Summary
${trend === 'Bullish' ? '🟢 Bullish momentum building' : trend === 'Bearish' ? '🔴 Bearish pressure detected' : '🟡 Consolidation phase'}

> ⚠️ *Simulated analysis for educational purposes*`,
            metadata: {
                analysis: { rsi, trend, support, resistance }
            }
        }
    }

    // Prediction request
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('price') || lowerMessage.includes('прогноз')) {
        const direction = Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral'
        const confidence = 55 + Math.random() * 35
        const changePercent = direction === 'bullish' ? (1 + Math.random() * 10) : direction === 'bearish' ? -(1 + Math.random() * 8) : (Math.random() - 0.5) * 2
        const targetPrice = currentPrice * (1 + changePercent / 100)
        const stopLoss = currentPrice * (direction === 'bullish' ? 0.95 : 1.05)

        const emoji = direction === 'bullish' ? '🟢' : direction === 'bearish' ? '🔴' : '🟡'

        return {
            content: `## ${emoji} ${baseSymbol} Price Prediction

| Metric | Value |
|--------|-------|
| **Outlook** | ${direction.toUpperCase()} |
| **Confidence** | ${confidence.toFixed(0)}% |
| **Target (24h)** | $${targetPrice.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%) |
| **Stop Loss** | $${stopLoss.toFixed(2)} |

### AI Reasoning
Based on momentum, volume patterns, and price action, the model expects ${direction} movement.

${direction === 'bullish' ? '✅ Consider entry with proper risk management' : direction === 'bearish' ? '⛔ Consider waiting or hedging' : '⏳ Wait for clearer signals'}

> ⚠️ *AI prediction for simulation only. Not financial advice.*`,
            metadata: {
                prediction: { direction, confidence, targetPrice, stopLoss }
            }
        }
    }

    // Risk assessment
    if (lowerMessage.includes('risk') || lowerMessage.includes('safe') || lowerMessage.includes('риск')) {
        const riskScore = Math.random()
        const riskLevel = riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Medium' : 'Low'
        const riskEmoji = riskScore > 0.7 ? '🔴' : riskScore > 0.4 ? '🟡' : '🟢'
        const positionSize = riskScore > 0.7 ? '1-2%' : riskScore > 0.4 ? '2-5%' : '5-10%'

        return {
            content: `## ${riskEmoji} ${baseSymbol} Risk Assessment

### Risk Level: **${riskLevel}**

| Factor | Status |
|--------|--------|
| Volatility | ${riskScore > 0.5 ? '🔴 High' : '🟢 Moderate'} |
| Liquidity | ${riskScore > 0.3 ? '🟢 Good' : '🟢 Excellent'} |
| Sentiment | ${Math.random() > 0.5 ? '🟡 Mixed' : '🟢 Positive'} |

### Recommendations
- **Position Size:** ${positionSize} of portfolio
- **Stop Loss:** ${riskScore > 0.5 ? 'Tight (2-3%)' : 'Standard (5%)'}
${riskScore > 0.6 ? '- ⚠️ Consider waiting for better entry' : '- ✅ Reasonable conditions for entry'}

> 📚 *Never invest more than you can afford to lose*`
        }
    }

    // Strategy request
    if (lowerMessage.includes('strategy') || lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('стратегия')) {
        const trend = Math.random() > 0.5 ? 'uptrend' : 'downtrend'
        const entry = currentPrice * (trend === 'uptrend' ? 0.98 : 1.02)

        return {
            content: `## 📈 ${baseSymbol} Trading Strategy

### Market Context
Currently in a **${trend}** with ${Math.random() > 0.5 ? 'strong' : 'moderate'} momentum.

### Suggested Strategy
| Action | Price |
|--------|-------|
| Entry | $${entry.toFixed(2)} |
| Target 1 | $${(currentPrice * (trend === 'uptrend' ? 1.05 : 0.95)).toFixed(2)} |
| Target 2 | $${(currentPrice * (trend === 'uptrend' ? 1.10 : 0.90)).toFixed(2)} |
| Stop Loss | $${(currentPrice * (trend === 'uptrend' ? 0.95 : 1.05)).toFixed(2)} |

### Risk/Reward
- **R:R Ratio:** 1:${(2 + Math.random() * 2).toFixed(1)}
- **Win Rate:** ~${(50 + Math.random() * 20).toFixed(0)}%

> 🎓 *Practice this strategy in simulation before real trading*`
        }
    }

    // Default response
    return {
        content: `I can help you analyze **${baseSymbol}**! Try asking:

- 📊 "Analyze ${baseSymbol}" - Technical analysis
- 🔮 "Predict ${baseSymbol} price" - AI forecast
- ⚠️ "Risk assessment" - Trade safety check
- 📈 "Trading strategy" - Entry/exit points

Current ${baseSymbol} price: **$${currentPrice.toLocaleString()}**`
    }
}

// ============================================
// QUICK PROMPTS
// ============================================

export const QUICK_PROMPTS = [
    { label: '📊 Analyze', prompt: 'Analyze this crypto' },
    { label: '🔮 Predict', prompt: 'Price prediction for next 24h' },
    { label: '⚠️ Risk', prompt: 'Risk assessment for buying' },
    { label: '📈 Strategy', prompt: 'Trading strategy suggestion' },
]
