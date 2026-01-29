/**
 * Framer Motion animation presets for consistent, smooth animations
 * Use these across all components for unified feel
 */

import { Variants, Transition } from 'framer-motion'

// Spring configurations - more natural feel
export const springSmooth: Transition = {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 1,
}

export const springBounce: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    mass: 0.8,
}

export const springGentle: Transition = {
    type: 'spring',
    stiffness: 60,
    damping: 15,
    mass: 1,
}

export const springSnappy: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.5,
}

// Tween configurations - precise control
export const tweenSmooth: Transition = {
    type: 'tween',
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
}

export const tweenSlow: Transition = {
    type: 'tween',
    duration: 0.7,
    ease: [0.19, 1, 0.22, 1],
}

export const tweenFast: Transition = {
    type: 'tween',
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
}

// Common animation variants
export const fadeInUp: Variants = {
    initial: {
        opacity: 0,
        y: 30,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: springSmooth,
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: tweenFast,
    },
}

export const fadeInDown: Variants = {
    initial: {
        opacity: 0,
        y: -30,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: springSmooth,
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: tweenFast,
    },
}

export const fadeInLeft: Variants = {
    initial: {
        opacity: 0,
        x: -30,
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: springSmooth,
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: tweenFast,
    },
}

export const fadeInRight: Variants = {
    initial: {
        opacity: 0,
        x: 30,
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: springSmooth,
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: tweenFast,
    },
}

export const scaleIn: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: springBounce,
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: tweenFast,
    },
}

export const modalVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.95,
        y: 20,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
            mass: 0.8,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        y: 10,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1],
        },
    },
}

export const overlayVariants: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
}

export const sidebarVariants: Variants = {
    initial: {
        x: '-100%',
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: springSmooth,
    },
    exit: {
        x: '-100%',
        opacity: 0,
        transition: tweenSmooth,
    },
}

export const dropdownVariants: Variants = {
    initial: {
        opacity: 0,
        y: -10,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springSnappy,
    },
    exit: {
        opacity: 0,
        y: -5,
        scale: 0.98,
        transition: tweenFast,
    },
}

export const cardHover = {
    scale: 1.02,
    y: -8,
    transition: springGentle,
}

export const buttonTap = {
    scale: 0.98,
    transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
    },
}

export const buttonHover = {
    y: -2,
    transition: springSnappy,
}

// Stagger children animations
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
}

export const staggerContainerFast: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
}

// Page transition variants
export const pageTransition: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.19, 1, 0.22, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 1, 1],
        },
    },
}

// Tooltip variants
export const tooltipVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
        y: 5,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: springSnappy,
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.1,
        },
    },
}

// List item variants (for use with stagger)
export const listItemVariants: Variants = {
    initial: {
        opacity: 0,
        x: -20,
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: springSmooth,
    },
    exit: {
        opacity: 0,
        x: -10,
        transition: tweenFast,
    },
}

// Notification/toast variants
export const notificationVariants: Variants = {
    initial: {
        opacity: 0,
        y: -50,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springBounce,
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: tweenFast,
    },
}
