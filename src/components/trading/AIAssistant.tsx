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
    Loader2,
    Zap,
    Flame,
    Lock
} from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { useAIStore, generateAIResponse, QUICK_PROMPTS, ChatMessage } from '@/stores/aiStore'
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
        incrementQueryCount,
        clearMessages,
        getRemainingQueries,
        getQueryLimit,
        isLimitReached,
        userTier,
        consecutiveDays,
        bonusQueriesEarned,
    } = useAIStore()

    const { selectedCrypto, tickerData, realtimePrices } = useTradingStore()
    const currentPrice = realtimePrices[selectedCrypto]?.price || tickerData[selectedCrypto]?.price || 0

    const remaining = getRemainingQueries()
    const limit = getQueryLimit()
    const isUnlimited = limit === -1

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (customMessage?: string) => {
        const messageToSend = customMessage || inputValue.trim()
        if (!messageToSend || isLoading) return

        // Check query limit
        const result = incrementQueryCount()
        if (!result.success) {
            addMessage({
                role: 'assistant',
                content: `⚠️ **Daily limit reached!**\n\nYou've used all ${limit} AI queries for today.\n\n🔓 **Upgrade to get more:**\n- Starter: 25/day\n- Pro: 100/day\n- Ultimate: Unlimited\n\n[View Plans](/pricing)`,
            })
            return
        }

        setInputValue('')

        // Add user message
        addMessage({ role: 'user', content: messageToSend })

        // Generate AI response
        setLoading(true)
        try {
            const response = await generateAIResponse(messageToSend, selectedCrypto, currentPrice)

            addMessage({
                role: 'assistant',
                content: response.content,
                metadata: response.metadata,
            })
        } catch (error) {
            addMessage({
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleQuickPrompt = (prompt: string) => {
        const symbol = selectedCrypto.replace('USDT', '')
        handleSendMessage(prompt.replace('this crypto', symbol))
    }

    return (
        <Card padding="none" className="h-[calc(100vh-140px)] flex flex-col sticky top-24">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            Quantix AI
                            {userTier !== 'free' && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                    <Crown size={10} className="mr-0.5" />
                                    {userTier.toUpperCase()}
                                </Badge>
                            )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            <span>Online</span>
                            <span>•</span>
                            <span className="font-mono">{selectedCrypto.replace('USDT', '/USDT')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Streak indicator */}
                    {consecutiveDays > 1 && (
                        <div className="flex items-center gap-1 text-orange-400 text-xs">
                            <Flame size={14} />
                            <span>{consecutiveDays}d</span>
                        </div>
                    )}
                    <button
                        onClick={clearMessages}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Clear chat"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
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
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted text-foreground rounded-bl-sm'
                                )}
                            >
                                {/* Message Content with Markdown */}
                                <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-table:my-2 prose-table:text-xs">
                                    {message.role === 'assistant' ? (
                                        <ReactMarkdown
                                            components={{
                                                h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                                                table: ({ children }) => (
                                                    <table className="w-full text-xs border-collapse my-2">{children}</table>
                                                ),
                                                th: ({ children }) => (
                                                    <th className="text-left px-2 py-1 bg-background/50 font-medium border-b border-border">{children}</th>
                                                ),
                                                td: ({ children }) => (
                                                    <td className="px-2 py-1 border-b border-border/50">{children}</td>
                                                ),
                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-2 border-warning pl-2 text-xs text-muted-foreground italic my-2">{children}</blockquote>
                                                ),
                                                a: ({ children, href }) => (
                                                    <a href={href} className="text-primary hover:underline">{children}</a>
                                                ),
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    ) : (
                                        message.content
                                    )}
                                </div>

                                {/* Prediction Badge */}
                                {message.metadata?.prediction && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            {message.metadata.prediction.direction === 'bullish' ? (
                                                <Badge variant="success" className="gap-1">
                                                    <TrendingUp size={12} /> Bullish
                                                </Badge>
                                            ) : message.metadata.prediction.direction === 'bearish' ? (
                                                <Badge variant="destructive" className="gap-1">
                                                    <TrendingDown size={12} /> Bearish
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning" className="gap-1">
                                                    Neutral
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {message.metadata.prediction.confidence.toFixed(0)}% confidence
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className={clsx(
                                    'text-[10px] mt-2',
                                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm text-muted-foreground">Analyzing...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 border-t border-border/50">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {QUICK_PROMPTS.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuickPrompt(item.prompt)}
                            disabled={isLoading || isLimitReached()}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border/50">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isLimitReached() ? 'Daily limit reached...' : 'Ask about trading...'}
                        disabled={isLoading || isLimitReached()}
                        className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isLoading || isLimitReached()}
                        className="px-4"
                    >
                        {isLimitReached() ? <Lock size={18} /> : <Send size={18} />}
                    </Button>
                </div>

                {/* Query Usage Bar */}
                <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <div className={clsx(
                            'flex items-center gap-1.5',
                            remaining <= 1 && !isUnlimited ? 'text-destructive' : remaining <= 3 && !isUnlimited ? 'text-warning' : 'text-muted-foreground'
                        )}>
                            <Zap size={12} />
                            <span>
                                {isUnlimited
                                    ? 'Unlimited queries'
                                    : `${remaining} queries remaining`}
                            </span>
                            {bonusQueriesEarned > 0 && (
                                <span className="text-success">(+{bonusQueriesEarned} bonus)</span>
                            )}
                        </div>
                        {!isUnlimited && remaining <= 3 && (
                            <a
                                href="/pricing"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                <Crown size={12} />
                                Upgrade
                            </a>
                        )}
                    </div>

                    {/* Progress bar */}
                    {!isUnlimited && (
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className={clsx(
                                    'h-full rounded-full',
                                    remaining <= 1 ? 'bg-destructive' : remaining <= 3 ? 'bg-warning' : 'bg-primary'
                                )}
                                initial={{ width: '100%' }}
                                animate={{ width: `${(remaining / (limit + bonusQueriesEarned)) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
