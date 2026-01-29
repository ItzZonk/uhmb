import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bot,
    Send,
    Sparkles,
    BarChart3,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Trash2,
    Crown,
    Loader2
} from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { useAIStore, generateAIResponse, ChatMessage } from '@/stores/aiStore'
import { useTradingStore } from '@/stores/tradingStore'
import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'

export const AIAssistant = () => {
    const { t } = useTranslation()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [inputValue, setInputValue] = useState('')

    const {
        messages,
        addMessage,
        isLoading,
        setLoading,
        dailyQueriesUsed,
        dailyQueryLimit,
        incrementQueryCount,
        clearMessages
    } = useAIStore()

    const { selectedSymbol, tickerData } = useTradingStore()
    const currentTicker = tickerData[selectedSymbol]

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        // Check query limit
        if (!incrementQueryCount()) {
            addMessage({
                role: 'assistant',
                content: '⚠️ You\'ve reached your daily query limit. Upgrade to a higher tier for more AI queries!',
            })
            return
        }

        const userMessage = inputValue.trim()
        setInputValue('')

        // Add user message
        addMessage({ role: 'user', content: userMessage })

        // Generate AI response
        setLoading(true)
        try {
            const currentPrice = currentTicker?.price || 0
            const response = await generateAIResponse(userMessage, selectedSymbol, currentPrice)

            addMessage({
                role: 'assistant',
                content: response.content,
                metadata: response.metadata,
            })
        } catch (error) {
            addMessage({
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleQuickAction = (action: string) => {
        const symbol = selectedSymbol.replace('USDT', '')
        switch (action) {
            case 'analyze':
                setInputValue(`Analyze ${symbol}`)
                break
            case 'predict':
                setInputValue(`Predict ${symbol} price`)
                break
            case 'risk':
                setInputValue(`Assess risk for ${symbol}`)
                break
        }
        inputRef.current?.focus()
    }

    const queriesRemaining = dailyQueryLimit - dailyQueriesUsed

    return (
        <Card padding="none" className="h-[calc(100vh-140px)] flex flex-col sticky top-24">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-secondary to-purple-500 rounded-xl flex items-center justify-center shadow-glow-sm">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{t('ai.title')}</h3>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            Online • {selectedSymbol.replace('USDT', '/USDT')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={clearMessages}
                    className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-button transition-colors"
                    title="Clear chat"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={clsx(
                                'flex',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={clsx(
                                    'max-w-[90%] rounded-2xl px-4 py-3',
                                    message.role === 'user'
                                        ? 'bg-accent-primary text-bg-primary rounded-br-sm'
                                        : 'bg-bg-tertiary text-text-primary rounded-bl-sm'
                                )}
                            >
                                {/* Message Content */}
                                <div className={clsx(
                                    'text-sm prose prose-sm max-w-none',
                                    message.role === 'user' ? 'prose-invert' : ''
                                )}>
                                    {message.role === 'assistant' ? (
                                        <div className="whitespace-pre-wrap">
                                            {message.content.split('\n').map((line, i) => (
                                                <div key={i}>
                                                    {line.startsWith('**') && line.endsWith('**') ? (
                                                        <strong>{line.slice(2, -2)}</strong>
                                                    ) : line.startsWith('• ') ? (
                                                        <div className="ml-2">{line}</div>
                                                    ) : (
                                                        line
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        message.content
                                    )}
                                </div>

                                {/* Prediction Badge */}
                                {message.metadata?.prediction && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            {message.metadata.prediction.direction === 'bullish' ? (
                                                <Badge variant="success" className="gap-1">
                                                    <TrendingUp size={12} /> Bullish
                                                </Badge>
                                            ) : message.metadata.prediction.direction === 'bearish' ? (
                                                <Badge variant="danger" className="gap-1">
                                                    <TrendingDown size={12} /> Bearish
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning" className="gap-1">
                                                    Neutral
                                                </Badge>
                                            )}
                                            <span className="text-xs text-text-muted">
                                                {message.metadata.prediction.confidence.toFixed(0)}% confidence
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className={clsx(
                                    'text-[10px] mt-2',
                                    message.role === 'user' ? 'text-bg-secondary/70' : 'text-text-muted'
                                )}>
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-bg-tertiary rounded-2xl rounded-bl-sm px-4 py-3">
                            <div className="flex items-center gap-2 text-text-muted">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-sm">Analyzing...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-3 py-2 border-t border-white/5">
                <div className="flex gap-2">
                    {[
                        { id: 'analyze', label: t('ai.actions.analyze'), icon: BarChart3 },
                        { id: 'predict', label: t('ai.actions.predict'), icon: Sparkles },
                        { id: 'risk', label: 'Risk', icon: AlertTriangle },
                    ].map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleQuickAction(action.id)}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-bg-tertiary hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary rounded-button text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            <action.icon size={14} />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={t('ai.placeholder')}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-bg-tertiary rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 disabled:opacity-50"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="px-4"
                    >
                        <Send size={18} />
                    </Button>
                </div>

                {/* Query Limit */}
                <div className="mt-3 flex items-center justify-between text-xs">
                    <div className={clsx(
                        'flex items-center gap-1.5',
                        queriesRemaining <= 2 ? 'text-warning' : 'text-text-muted'
                    )}>
                        <span>{t('ai.dailyQueries')}: {dailyQueriesUsed}/{dailyQueryLimit}</span>
                    </div>
                    {queriesRemaining <= 2 && (
                        <a
                            href="/pricing"
                            className="flex items-center gap-1 text-accent-primary hover:underline"
                        >
                            <Crown size={12} />
                            {t('ai.upgrade')}
                        </a>
                    )}
                </div>
            </div>
        </Card>
    )
}
