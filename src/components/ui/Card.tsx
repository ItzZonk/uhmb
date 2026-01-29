import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline'
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
        const baseStyles = 'rounded-card'

        const variants = {
            default: 'bg-bg-secondary border border-white/5 shadow-card',
            glass: 'glass',
            outline: 'bg-transparent border-2 border-bg-tertiary',
        }

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-6',
            lg: 'p-8',
        }

        const hoverStyles = hover
            ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer'
            : ''

        return (
            <div
                ref={ref}
                className={clsx(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

// Card Header
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={clsx('flex flex-col space-y-1.5 pb-4', className)} {...props} />
    )
)
CardHeader.displayName = 'CardHeader'

// Card Title
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={clsx('text-xl font-semibold text-text-primary', className)} {...props} />
    )
)
CardTitle.displayName = 'CardTitle'

// Card Description
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={clsx('text-sm text-text-muted', className)} {...props} />
    )
)
CardDescription.displayName = 'CardDescription'

// Card Content
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={clsx('', className)} {...props} />
)
CardContent.displayName = 'CardContent'

// Card Footer
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={clsx('flex items-center pt-4', className)} {...props} />
    )
)
CardFooter.displayName = 'CardFooter'
