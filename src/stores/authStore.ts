import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
    id: string
    email: string
    username: string
    displayName: string
    avatar: string | null
    isOnboarded: boolean
    createdAt: Date
    subscription: 'free' | 'starter' | 'pro' | 'ultimate'
    preferences: {
        language: string
        theme: string
        notifications: boolean
        emailUpdates: boolean
    }
}

interface AuthState {
    isAuthenticated: boolean
    isLoading: boolean
    user: UserProfile | null

    // Modal states
    showLoginModal: boolean
    showSignupModal: boolean
    showOnboardingModal: boolean

    // Actions
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    updateProfile: (updates: Partial<UserProfile>) => void
    completeOnboarding: (username: string, displayName: string, avatar?: string) => void

    // Modal controls
    openLoginModal: () => void
    openSignupModal: () => void
    openOnboardingModal: () => void
    closeModals: () => void
}

const generateUserId = () => 'user_' + Math.random().toString(36).substr(2, 9)

const defaultPreferences = {
    language: 'en',
    theme: 'dark',
    notifications: true,
    emailUpdates: false,
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            isLoading: false,
            user: null,

            showLoginModal: false,
            showSignupModal: false,
            showOnboardingModal: false,

            login: async (email, password) => {
                set({ isLoading: true })

                // Simulate API delay
                await new Promise(r => setTimeout(r, 1000))

                // Mock validation
                if (!email.includes('@') || password.length < 6) {
                    set({ isLoading: false })
                    return { success: false, error: 'Invalid email or password' }
                }

                // Check if user exists in localStorage (demo purposes)
                const storedUsers = JSON.parse(localStorage.getItem('quantix-users') || '{}')
                const existingUser = storedUsers[email]

                if (existingUser && existingUser.password === password) {
                    set({
                        isAuthenticated: true,
                        isLoading: false,
                        user: existingUser.profile,
                        showLoginModal: false,
                    })
                    return { success: true }
                } else if (existingUser) {
                    set({ isLoading: false })
                    return { success: false, error: 'Incorrect password' }
                } else {
                    set({ isLoading: false })
                    return { success: false, error: 'Account not found. Please sign up.' }
                }
            },

            signup: async (email, password) => {
                set({ isLoading: true })

                await new Promise(r => setTimeout(r, 1000))

                if (!email.includes('@') || password.length < 6) {
                    set({ isLoading: false })
                    return { success: false, error: 'Invalid email or password (min 6 characters)' }
                }

                // Check if email already exists
                const storedUsers = JSON.parse(localStorage.getItem('quantix-users') || '{}')
                if (storedUsers[email]) {
                    set({ isLoading: false })
                    return { success: false, error: 'Email already registered' }
                }

                // Create new user
                const newUser: UserProfile = {
                    id: generateUserId(),
                    email,
                    username: '',
                    displayName: '',
                    avatar: null,
                    isOnboarded: false,
                    createdAt: new Date(),
                    subscription: 'free',
                    preferences: defaultPreferences,
                }

                // Store user
                storedUsers[email] = { password, profile: newUser }
                localStorage.setItem('quantix-users', JSON.stringify(storedUsers))

                set({
                    isAuthenticated: true,
                    isLoading: false,
                    user: newUser,
                    showSignupModal: false,
                    showOnboardingModal: true, // Show onboarding after signup
                })

                return { success: true }
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    user: null,
                })
            },

            updateProfile: (updates) => {
                const state = get()
                if (!state.user) return

                const updatedUser = { ...state.user, ...updates }

                // Update localStorage
                const storedUsers = JSON.parse(localStorage.getItem('quantix-users') || '{}')
                if (storedUsers[state.user.email]) {
                    storedUsers[state.user.email].profile = updatedUser
                    localStorage.setItem('quantix-users', JSON.stringify(storedUsers))
                }

                set({ user: updatedUser })
            },

            completeOnboarding: (username, displayName, avatar) => {
                const state = get()
                if (!state.user) return

                const updatedUser: UserProfile = {
                    ...state.user,
                    username,
                    displayName,
                    avatar: avatar || null,
                    isOnboarded: true,
                }

                // Update localStorage
                const storedUsers = JSON.parse(localStorage.getItem('quantix-users') || '{}')
                if (storedUsers[state.user.email]) {
                    storedUsers[state.user.email].profile = updatedUser
                    localStorage.setItem('quantix-users', JSON.stringify(storedUsers))
                }

                set({
                    user: updatedUser,
                    showOnboardingModal: false,
                })
            },

            openLoginModal: () => set({ showLoginModal: true, showSignupModal: false }),
            openSignupModal: () => set({ showSignupModal: true, showLoginModal: false }),
            openOnboardingModal: () => set({ showOnboardingModal: true }),
            closeModals: () => set({ showLoginModal: false, showSignupModal: false, showOnboardingModal: false }),
        }),
        {
            name: 'quantix-auth',
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
            }),
        }
    )
)
