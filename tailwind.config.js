/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Background colors
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',
                // Accent colors
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',
                'accent-tertiary': 'var(--accent-tertiary)',
                // Text colors
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                // State colors
                'success': 'var(--success)',
                'danger': 'var(--danger)',
                'warning': 'var(--warning)',
                // Chart colors
                'chart-green': 'var(--chart-green)',
                'chart-red': 'var(--chart-red)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'monospace'],
            },
            fontSize: {
                'h1': 'clamp(2rem, 5vw, 3.5rem)',
                'h2': 'clamp(1.5rem, 4vw, 2.5rem)',
                'h3': 'clamp(1.25rem, 3vw, 1.75rem)',
                'body': 'clamp(0.875rem, 2vw, 1rem)',
                'small': 'clamp(0.75rem, 1.5vw, 0.875rem)',
            },
            borderRadius: {
                'button': '0.75rem',
                'card': '1rem',
                'modal': '1.25rem',
                'input': '0.625rem',
            },
            spacing: {
                'xs': '0.25rem',
                'sm': '0.5rem',
                'md': '1rem',
                'lg': '1.5rem',
                'xl': '2rem',
                '2xl': '3rem',
            },
            // Smoother transition timing
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
                'in-out-smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
            },
            // Longer, smoother durations
            transitionDuration: {
                '250': '250ms',
                '350': '350ms',
                '400': '400ms',
                '450': '450ms',
                '600': '600ms',
                '700': '700ms',
                '800': '800ms',
            },
            animation: {
                'gradient': 'gradient 12s ease infinite',
                'float': 'float 8s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                'slide-down': 'slideDown 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.19, 1, 0.22, 1)',
                'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'shimmer': 'shimmer 2s ease infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(0, 212, 170, 0.6)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(30px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-30px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.3)' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 212, 170, 0.3)',
                'glow-sm': '0 0 10px rgba(0, 212, 170, 0.2)',
                'glow-lg': '0 0 40px rgba(0, 212, 170, 0.4)',
                'glow-xl': '0 0 60px rgba(0, 212, 170, 0.5)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
                'card-hover': '0 12px 40px rgba(0, 0, 0, 0.35)',
                'soft': '0 2px 15px rgba(0, 0, 0, 0.1)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)',
            },
        },
    },
    plugins: [],
}
