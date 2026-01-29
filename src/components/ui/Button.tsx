import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            disabled,
            icon,
            iconPosition = 'left',
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium 
      rounded-button cursor-pointer transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
      disabled:opacity-50 disabled:cursor-not-allowed
    `

        const variants = {
            primary: 'bg-accent-primary text-bg-primary hover:brightness-110 hover:shadow-glow',
            secondary: 'bg-accent-secondary text-white hover:brightness-110',
            outline: 'bg-transparent border-2 border-text-muted text-text-primary hover:border-accent-primary hover:text-accent-primary',
            ghost: 'bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
            danger: 'bg-danger text-white hover:brightness-110',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
        }

        return (
            <button
                ref={ref}
                className={clsx(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {icon && iconPosition === 'left' && !loading && icon}
                {children}
                {icon && iconPosition === 'right' && icon}
            </button>
        )
    }
)

Button.displayName = 'Button'
