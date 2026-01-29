import { useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    children: ReactNode
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnOverlayClick?: boolean
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
    size = 'md',
    closeOnOverlayClick = true,
}: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null)

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            ref={modalRef}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={clsx(
                                'relative w-full bg-bg-secondary rounded-modal shadow-lg border border-white/5',
                                sizes[size],
                                className
                            )}
                            tabIndex={-1}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={title ? 'modal-title' : undefined}
                            aria-describedby={description ? 'modal-description' : undefined}
                        >
                            {/* Header */}
                            {(title || true) && (
                                <div className="flex items-center justify-between p-6 pb-0">
                                    <div>
                                        {title && (
                                            <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                                                {title}
                                            </h2>
                                        )}
                                        {description && (
                                            <p id="modal-description" className="mt-1 text-sm text-text-muted">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 -mr-2 text-text-muted hover:text-text-primary rounded-button hover:bg-bg-tertiary transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6">{children}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
