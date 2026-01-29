import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'outline'
    size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
        const baseStyles = `
      inline-flex items-center font-medium rounded-full
      whitespace-nowrap
    `

        const variants = {
            default: 'bg-bg-tertiary text-text-secondary',
            success: 'bg-success/15 text-success',
            danger: 'bg-danger/15 text-danger',
            warning: 'bg-warning/15 text-warning',
            info: 'bg-accent-secondary/15 text-accent-secondary',
            outline: 'bg-transparent border border-text-muted text-text-secondary',
        }

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-xs',
        }

        return (
            <span
                ref={ref}
                className={clsx(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </span>
        )
    }
)

Badge.displayName = 'Badge'
