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

interface AIState {
    messages: ChatMessage[]
    isLoading: boolean
    dailyQueriesUsed: number
    dailyQueryLimit: number
    lastResetDate: string

    // Actions
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
    setLoading: (loading: boolean) => void
    clearMessages: () => void
    resetDailyQueries: () => void
    incrementQueryCount: () => boolean // Returns false if limit reached
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

export const useAIStore = create<AIState>()(
    persist(
        (set, get) => ({
            messages: [
                {
                    id: generateId(),
                    role: 'assistant',
                    content: "Hello! I'm Quantix AI, your trading assistant. I can analyze market trends, provide predictions, and help you make informed trading decisions. How can I help you today?",
                    timestamp: new Date(),
                }
            ],
            isLoading: false,
            dailyQueriesUsed: 0,
            dailyQueryLimit: 10, // Free tier
            lastResetDate: new Date().toDateString(),

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
                    content: "Chat cleared. How can I help you with your trading analysis?",
                    timestamp: new Date(),
                }]
            }),

            resetDailyQueries: () => set({
                dailyQueriesUsed: 0,
                lastResetDate: new Date().toDateString()
            }),

            incrementQueryCount: () => {
                const state = get()

                // Check if we need to reset (new day)
                const today = new Date().toDateString()
                if (state.lastResetDate !== today) {
                    set({ dailyQueriesUsed: 1, lastResetDate: today })
                    return true
                }

                // Check if limit reached
                if (state.dailyQueriesUsed >= state.dailyQueryLimit) {
                    return false
                }

                set({ dailyQueriesUsed: state.dailyQueriesUsed + 1 })
                return true
            },
        }),
        {
            name: 'quantix-ai-chat',
            partialize: (state) => ({
                dailyQueriesUsed: state.dailyQueriesUsed,
                lastResetDate: state.lastResetDate,
            }),
        }
    )
)

// AI Response Generator (Mock - would connect to real AI service)
export async function generateAIResponse(
    userMessage: string,
    symbol: string,
    currentPrice: number
): Promise<{ content: string; metadata?: ChatMessage['metadata'] }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    const lowerMessage = userMessage.toLowerCase()

    // Analyze request
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
        const rsi = 45 + Math.random() * 30
        const trend = rsi > 60 ? 'Bullish' : rsi < 40 ? 'Bearish' : 'Neutral'
        const support = currentPrice * (0.92 + Math.random() * 0.03)
        const resistance = currentPrice * (1.05 + Math.random() * 0.05)

        return {
            content: `📊 **${symbol.replace('USDT', '')} Technical Analysis**

**Current Price:** $${currentPrice.toLocaleString()}

**Indicators:**
• RSI (14): ${rsi.toFixed(1)} - ${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}
• Trend: ${trend}
• MACD: ${rsi > 50 ? 'Bullish crossover forming' : 'Bearish divergence'}

**Key Levels:**
• Support: $${support.toFixed(2)}
• Resistance: $${resistance.toFixed(2)}

**Volume Analysis:** ${Math.random() > 0.5 ? 'Above' : 'Below'} average, indicating ${Math.random() > 0.5 ? 'strong' : 'weak'} momentum.

💡 *This is simulated analysis for educational purposes only.*`,
            metadata: {
                analysis: {
                    rsi,
                    trend,
                    support,
                    resistance,
                }
            }
        }
    }

    // Predict request
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('price')) {
        const direction = Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral'
        const confidence = 55 + Math.random() * 35
        const priceChange = direction === 'bullish' ? 1 + Math.random() * 0.1 : direction === 'bearish' ? 1 - Math.random() * 0.08 : 1
        const targetPrice = currentPrice * priceChange
        const stopLoss = currentPrice * (direction === 'bullish' ? 0.95 : 1.05)

        const emoji = direction === 'bullish' ? '🟢' : direction === 'bearish' ? '🔴' : '🟡'

        return {
            content: `${emoji} **${symbol.replace('USDT', '')} Price Prediction**

**Outlook:** ${direction.charAt(0).toUpperCase() + direction.slice(1)}
**Confidence:** ${confidence.toFixed(0)}%

**Price Targets (24h):**
• Target: $${targetPrice.toFixed(2)} (${direction === 'bullish' ? '+' : ''}${((priceChange - 1) * 100).toFixed(1)}%)
• Stop Loss: $${stopLoss.toFixed(2)}

**Reasoning:**
Based on current momentum indicators, volume patterns, and recent price action, the model predicts a ${direction} movement in the short term.

⚠️ *This is AI-generated prediction for simulation purposes. Always do your own research.*`,
            metadata: {
                prediction: {
                    direction,
                    confidence,
                    targetPrice,
                    stopLoss,
                }
            }
        }
    }

    // Risk assessment
    if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
        const riskLevel = Math.random()
        const riskText = riskLevel > 0.7 ? 'High' : riskLevel > 0.4 ? 'Medium' : 'Low'
        const riskEmoji = riskLevel > 0.7 ? '🔴' : riskLevel > 0.4 ? '🟡' : '🟢'

        return {
            content: `${riskEmoji} **${symbol.replace('USDT', '')} Risk Assessment**

**Overall Risk Level:** ${riskText}

**Factors:**
• Market Volatility: ${riskLevel > 0.5 ? 'High' : 'Moderate'}
• Liquidity: ${riskLevel > 0.3 ? 'Good' : 'Excellent'}
• Recent News Sentiment: ${Math.random() > 0.5 ? 'Mixed' : 'Positive'}

**Recommendations:**
${riskLevel > 0.6 ?
                    '• Consider smaller position sizes\n• Set tight stop-losses\n• Wait for clearer entry signals' :
                    '• Normal position sizing appropriate\n• Standard stop-loss levels\n• Good entry conditions'}

📚 *Remember: Never invest more than you can afford to lose.*`
        }
    }

    // General response
    return {
        content: `I understand you're asking about "${userMessage}". 

As your AI trading assistant, I can help you with:
• **Analyze** - Get technical analysis for any crypto
• **Predict** - Get AI-powered price predictions
• **Risk** - Assess the risk level of a trade

Try asking something like "Analyze ${symbol.replace('USDT', '')}" or "What's your price prediction?"

*Note: This is a simulation for educational purposes.*`
    }
}
