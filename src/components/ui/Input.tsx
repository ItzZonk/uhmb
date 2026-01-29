import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, hint, icon, iconPosition = 'left', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)
        const isPassword = type === 'password'

        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={inputType}
                        className={clsx(
                            'w-full px-4 py-3 bg-bg-tertiary border rounded-input text-text-primary text-sm',
                            'transition-all duration-200',
                            'placeholder:text-text-muted',
                            'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary',
                            error ? 'border-danger' : 'border-transparent',
                            icon && iconPosition === 'left' && 'pl-10',
                            (icon && iconPosition === 'right') || isPassword ? 'pr-10' : '',
                            className
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                    {icon && iconPosition === 'right' && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {icon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
                {hint && !error && <p className="mt-1.5 text-sm text-text-muted">{hint}</p>}
            </div>
        )
    }
)

Input.displayName = 'Input'

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={clsx(
                        'w-full px-4 py-3 bg-bg-tertiary border rounded-input text-text-primary text-sm',
                        'transition-all duration-200 resize-none min-h-[100px]',
                        'placeholder:text-text-muted',
                        'focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary',
                        error ? 'border-danger' : 'border-transparent',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
                {hint && !error && <p className="mt-1.5 text-sm text-text-muted">{hint}</p>}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'
