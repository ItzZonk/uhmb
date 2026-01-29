import { clsx } from 'clsx'

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    }

    return (
        <div
            className={clsx(
                'animate-spin rounded-full border-2 border-text-muted border-t-accent-primary',
                sizes[size],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    )
}

// Loading overlay
interface LoadingOverlayProps {
    isLoading: boolean
    children: React.ReactNode
    text?: string
}

export const LoadingOverlay = ({ isLoading, children, text }: LoadingOverlayProps) => {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-sm rounded-card">
                    <Spinner size="lg" />
                    {text && <p className="mt-4 text-sm text-text-secondary">{text}</p>}
                </div>
            )}
        </div>
    )
}

// Skeleton loader
interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export const Skeleton = ({ className, variant = 'text', width, height }: SkeletonProps) => {
    const variants = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-card',
    }

    return (
        <div
            className={clsx('skeleton', variants[variant], className)}
            style={{ width, height }}
        />
    )
}
