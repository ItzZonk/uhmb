import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component to catch JavaScript errors in child tree
 * Displays a friendly fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo })

        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo)

        // Call optional error handler
        this.props.onError?.(error, errorInfo)

        // In production, you would send this to an error tracking service
        // e.g., Sentry, LogRocket, etc.
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 bg-danger/10 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={32} className="text-danger" />
                        </div>

                        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                        <p className="text-text-muted mb-6">
                            An unexpected error occurred. Don't worry, your data is safe.
                        </p>

                        {/* Error details in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-bg-tertiary rounded-card text-left">
                                <p className="text-sm font-mono text-danger mb-2">
                                    {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-text-muted overflow-auto max-h-32">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                                <Home size={16} />
                                Go Home
                            </Button>
                            <Button onClick={this.handleRetry} className="gap-2">
                                <RefreshCw size={16} />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        )
    }
}

/**
 * Specialized error boundary for page-level errors
 */
export const PageErrorBoundary = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary
        fallback={
            <div className="min-h-screen flex items-center justify-center bg-bg-primary p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-danger/10 rounded-2xl flex items-center justify-center">
                        <AlertTriangle size={40} className="text-danger" />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Page Error</h1>
                    <p className="text-text-muted mb-6">
                        This page encountered an error. Please try refreshing or go back to the homepage.
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => window.location.href = '/'} className="gap-2">
                            <Home size={16} />
                            Home
                        </Button>
                        <Button onClick={() => window.location.reload()} className="gap-2">
                            <RefreshCw size={16} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>
        }
    >
        {children}
    </ErrorBoundary>
)
