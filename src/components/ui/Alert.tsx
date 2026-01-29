import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'info' | 'success' | 'warning' | 'danger'
    title?: string
    dismissible?: boolean
    onDismiss?: () => void
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'info', title, dismissible, onDismiss, children, ...props }, ref) => {
        const icons = {
            info: <Info size={20} />,
            success: <CheckCircle size={20} />,
            warning: <AlertTriangle size={20} />,
            danger: <AlertCircle size={20} />,
        }

        const variants = {
            info: 'bg-accent-secondary/10 border-accent-secondary/30 text-accent-secondary',
            success: 'bg-success/10 border-success/30 text-success',
            warning: 'bg-warning/10 border-warning/30 text-warning',
            danger: 'bg-danger/10 border-danger/30 text-danger',
        }

        return (
            <div
                ref={ref}
                role="alert"
                className={clsx(
                    'relative flex gap-3 p-4 rounded-card border',
                    variants[variant],
                    className
                )}
                {...props}
            >
                <div className="flex-shrink-0">{icons[variant]}</div>
                <div className="flex-1 min-w-0">
                    {title && <h5 className="font-medium mb-1">{title}</h5>}
                    <div className="text-sm opacity-90">{children}</div>
                </div>
                {dismissible && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        )
    }
)

Alert.displayName = 'Alert'
