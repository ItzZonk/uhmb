/**
 * Mobile Gesture Controller
 * Touch gesture support for trading charts and UI elements
 */

import { useEffect, useRef, useCallback } from 'react'

interface GestureHandlers {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    onDoubleTap?: () => void
    onPinchIn?: () => void
    onPinchOut?: () => void
    onLongPress?: () => void
}

interface TouchState {
    startX: number
    startY: number
    startTime: number
    lastTapTime: number
    initialDistance: number
}

const SWIPE_THRESHOLD = 50
const DOUBLE_TAP_DELAY = 300
const LONG_PRESS_DELAY = 500

export function useGestures(handlers: GestureHandlers) {
    const touchState = useRef<TouchState>({
        startX: 0,
        startY: 0,
        startTime: 0,
        lastTapTime: 0,
        initialDistance: 0,
    })
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const elementRef = useRef<HTMLElement | null>(null)

    const getDistance = useCallback((touches: TouchList) => {
        if (touches.length < 2) return 0
        const dx = touches[0].clientX - touches[1].clientX
        const dy = touches[0].clientY - touches[1].clientY
        return Math.sqrt(dx * dx + dy * dy)
    }, [])

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const touch = e.touches[0]
        touchState.current.startX = touch.clientX
        touchState.current.startY = touch.clientY
        touchState.current.startTime = Date.now()

        // Pinch detection
        if (e.touches.length === 2) {
            touchState.current.initialDistance = getDistance(e.touches)
        }

        // Long press detection
        if (handlers.onLongPress) {
            longPressTimer.current = setTimeout(() => {
                handlers.onLongPress?.()
            }, LONG_PRESS_DELAY)
        }
    }, [handlers, getDistance])

    const handleTouchMove = useCallback((e: TouchEvent) => {
        // Cancel long press if moved
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }

        // Pinch gesture
        if (e.touches.length === 2) {
            const currentDistance = getDistance(e.touches)
            const initialDistance = touchState.current.initialDistance

            if (initialDistance > 0) {
                const ratio = currentDistance / initialDistance
                if (ratio > 1.3) {
                    handlers.onPinchOut?.()
                    touchState.current.initialDistance = currentDistance
                } else if (ratio < 0.7) {
                    handlers.onPinchIn?.()
                    touchState.current.initialDistance = currentDistance
                }
            }
        }
    }, [handlers, getDistance])

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }

        if (e.changedTouches.length === 0) return

        const touch = e.changedTouches[0]
        const deltaX = touch.clientX - touchState.current.startX
        const deltaY = touch.clientY - touchState.current.startY
        const deltaTime = Date.now() - touchState.current.startTime

        // Quick tap detection (for double tap)
        if (deltaTime < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            const now = Date.now()
            if (now - touchState.current.lastTapTime < DOUBLE_TAP_DELAY) {
                handlers.onDoubleTap?.()
                touchState.current.lastTapTime = 0
            } else {
                touchState.current.lastTapTime = now
            }
            return
        }

        // Swipe detection
        if (deltaTime < 300) {
            const absX = Math.abs(deltaX)
            const absY = Math.abs(deltaY)

            if (absX > SWIPE_THRESHOLD && absX > absY) {
                if (deltaX > 0) {
                    handlers.onSwipeRight?.()
                } else {
                    handlers.onSwipeLeft?.()
                }
            } else if (absY > SWIPE_THRESHOLD && absY > absX) {
                if (deltaY > 0) {
                    handlers.onSwipeDown?.()
                } else {
                    handlers.onSwipeUp?.()
                }
            }
        }
    }, [handlers])

    const bindGestures = useCallback((element: HTMLElement | null) => {
        if (!element) return

        elementRef.current = element

        element.addEventListener('touchstart', handleTouchStart, { passive: true })
        element.addEventListener('touchmove', handleTouchMove, { passive: true })
        element.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            element.removeEventListener('touchstart', handleTouchStart)
            element.removeEventListener('touchmove', handleTouchMove)
            element.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current)
            }
        }
    }, [])

    return { bindGestures }
}

// HOC for gesture-enabled components
interface GestureWrapperProps extends GestureHandlers {
    children: React.ReactNode
    className?: string
}

export function GestureWrapper({ children, className, ...handlers }: GestureWrapperProps) {
    const { bindGestures } = useGestures(handlers)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const cleanup = bindGestures(ref.current)
        return cleanup
    }, [bindGestures])

    return (
        <div ref= { ref } className = { className } >
            { children }
            </div>
    )
}

// Preset gesture handlers for trading
export function useTradingGestures(options: {
    onNextSymbol?: () => void
    onPrevSymbol?: () => void
    onResetZoom?: () => void
    onToggleFullscreen?: () => void
}) {
    return useGestures({
        onSwipeLeft: options.onNextSymbol,
        onSwipeRight: options.onPrevSymbol,
        onDoubleTap: options.onResetZoom,
        onLongPress: options.onToggleFullscreen,
    })
}
