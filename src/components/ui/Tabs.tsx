import { useState, createContext, useContext, ReactNode } from 'react'
import { clsx } from 'clsx'

// Tabs Context
interface TabsContextValue {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

const useTabs = () => {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error('Tab components must be used within a Tabs component')
    }
    return context
}

// Tabs Root
interface TabsProps {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
    children: ReactNode
    className?: string
}

export const Tabs = ({ defaultValue, value, onValueChange, children, className }: TabsProps) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const activeTab = value ?? internalValue

    const setActiveTab = (newValue: string) => {
        if (!value) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

// TabsList
interface TabsListProps {
    children: ReactNode
    className?: string
}

export const TabsList = ({ children, className }: TabsListProps) => {
    return (
        <div
            className={clsx(
                'inline-flex items-center p-1 bg-bg-tertiary rounded-button gap-1',
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    )
}

// TabsTrigger
interface TabsTriggerProps {
    value: string
    children: ReactNode
    className?: string
    disabled?: boolean
}

export const TabsTrigger = ({ value, children, className, disabled }: TabsTriggerProps) => {
    const { activeTab, setActiveTab } = useTabs()
    const isActive = activeTab === value

    return (
        <button
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => setActiveTab(value)}
            className={clsx(
                'px-4 py-2 text-sm font-medium rounded-button transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                isActive
                    ? 'bg-bg-secondary text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {children}
        </button>
    )
}

// TabsContent
interface TabsContentProps {
    value: string
    children: ReactNode
    className?: string
}

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
    const { activeTab } = useTabs()

    if (activeTab !== value) return null

    return (
        <div role="tabpanel" className={clsx('mt-4 animate-fade-in', className)}>
            {children}
        </div>
    )
}
