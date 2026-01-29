import { type ClassValue, clsx } from 'clsx'

/**
 * Utility for merging class names conditionally
 * Uses clsx for conditional class joining
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, locale = 'en-US', currency = 'USD'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

/**
 * Format a large number with abbreviations (1K, 1M, 1B)
 */
export function formatCompact(value: number): string {
    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    })
    return formatter.format(value)
}

/**
 * Format a crypto amount with appropriate decimal places
 */
export function formatCrypto(value: number, symbol: string): string {
    const decimals = symbol === 'BTC' ? 8 : symbol === 'ETH' ? 6 : 4
    return value.toFixed(decimals)
}

/**
 * Format percentage with +/- sign
 */
export function formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Generate a random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
