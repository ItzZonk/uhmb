import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for keyboard navigation and focus management
 */
export const useKeyboardNav = (onEscape?: () => void, onEnter?: () => void) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onEscape) {
                onEscape()
            }
            if (e.key === 'Enter' && onEnter) {
                onEnter()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onEscape, onEnter])
}

/**
 * Focus trap hook for modals and dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault()
                lastElement?.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault()
                firstElement?.focus()
            }
        }

        // Focus first element
        firstElement?.focus()

        document.addEventListener('keydown', handleTabKey)
        return () => document.removeEventListener('keydown', handleTabKey)
    }, [isActive])

    return containerRef
}

/**
 * Announce messages to screen readers
 */
export const useAnnounce = () => {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', priority)
        announcement.setAttribute('aria-atomic', 'true')
        announcement.setAttribute('class', 'sr-only')
        announcement.textContent = message

        document.body.appendChild(announcement)

        setTimeout(() => {
            document.body.removeChild(announcement)
        }, 1000)
    }, [])

    return announce
}

/**
 * Hook to manage reduced motion preference
 */
export const useReducedMotion = () => {
    const mediaQuery = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null

    return mediaQuery?.matches ?? false
}

/**
 * Skip link component for keyboard navigation
 */
export const SkipLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
    >
        {children}
    </a>
)

/**
 * Visually hidden component for screen readers
 */
export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
    <span className="sr-only">{children}</span>
)

/**
 * Hook for managing focus on route changes
 */
export const useRouteFocus = () => {
    const previousPath = useRef<string>('')

    useEffect(() => {
        const currentPath = window.location.pathname

        if (previousPath.current !== currentPath) {
            // Focus the main content on route change
            const main = document.querySelector('main')
            if (main) {
                main.focus()
            }
            previousPath.current = currentPath
        }
    })
}

// ARIA live region for dynamic content announcements
export const AriaLive = ({
    message,
    priority = 'polite'
}: {
    message: string
    priority?: 'polite' | 'assertive'
}) => (
    <div
        role="status"
        aria-live={priority}
        aria-atomic="true"
        className="sr-only"
    >
        {message}
    </div>
)
