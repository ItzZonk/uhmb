import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'ocean' | 'sunset' | 'forest'

interface ThemeState {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'dark',

            setTheme: (theme) => {
                set({ theme })
                applyTheme(theme)
            },

            toggleTheme: () => {
                const current = get().theme
                const newTheme = current === 'dark' ? 'light' : 'dark'
                set({ theme: newTheme })
                applyTheme(newTheme)
            },
        }),
        {
            name: 'quantix-theme',
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state?.theme) {
                    applyTheme(state.theme)
                }
            },
        }
    )
)

function applyTheme(theme: Theme) {
    const root = document.documentElement

    // Remove all theme classes
    root.classList.remove('dark', 'light', 'ocean', 'sunset', 'forest')

    // Add new theme class (only for non-default themes)
    if (theme !== 'dark') {
        root.classList.add(theme)
    }
}
