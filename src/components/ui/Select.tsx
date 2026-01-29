import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { ChevronDown, Check, Search } from 'lucide-react'

export interface SelectOption {
    value: string
    label: string
    icon?: ReactNode
    disabled?: boolean
}

interface SelectProps {
    options: SelectOption[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    searchable?: boolean
    disabled?: boolean
    className?: string
    label?: string
    error?: string
}

export const Select = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    searchable = false,
    disabled = false,
    className,
    label,
    error,
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    // Filter options based on search
    const filteredOptions = searchable
        ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
        : options

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSearch('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when opening
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen, searchable])

    const handleSelect = (option: SelectOption) => {
        if (option.disabled) return
        onChange(option.value)
        setIsOpen(false)
        setSearch('')
    }

    return (
        <div className={clsx('relative w-full', className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 bg-bg-tertiary rounded-input text-left',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary/50',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-bg-tertiary/80',
                    error ? 'ring-2 ring-danger' : '',
                    isOpen && 'ring-2 ring-accent-primary/50'
                )}
            >
                <span className={clsx('flex items-center gap-2', !selectedOption && 'text-text-muted')}>
                    {selectedOption?.icon}
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={clsx(
                        'text-text-muted transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 py-2 bg-bg-secondary rounded-card border border-white/10 shadow-lg max-h-60 overflow-auto"
                    >
                        {/* Search */}
                        {searchable && (
                            <div className="px-3 pb-2 mb-2 border-b border-white/5">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-3 py-2 bg-bg-tertiary rounded-input text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    disabled={option.disabled}
                                    className={clsx(
                                        'w-full flex items-center justify-between px-4 py-2.5 text-left text-sm',
                                        'transition-colors duration-150',
                                        option.disabled
                                            ? 'text-text-muted cursor-not-allowed'
                                            : 'hover:bg-bg-tertiary',
                                        option.value === value && 'bg-accent-primary/10 text-accent-primary'
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        {option.icon}
                                        {option.label}
                                    </span>
                                    {option.value === value && <Check size={16} />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-text-muted text-center">No options found</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        </div>
    )
}
