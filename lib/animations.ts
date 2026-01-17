/**
 * Framer Motion Animation Presets
 * Reusable animation variants for consistent motion design across the app
 */

import { Variants } from "framer-motion";

// ============================================
// Page Transitions
// ============================================

export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

export const pageSlideTransition = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
};

// ============================================
// Fade Animations
// ============================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
};

// ============================================
// Slide Animations
// ============================================

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
};

// ============================================
// Scale Animations
// ============================================

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export const scaleInSpring: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
        },
    },
};

// ============================================
// Hover Micro-interactions
// ============================================

export const hoverScale = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeInOut" },
    },
};

export const hoverLift = {
    rest: { y: 0 },
    hover: {
        y: -8,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export const hoverGlow = {
    rest: { boxShadow: "0 0 0px rgba(118, 51, 255, 0)" },
    hover: {
        boxShadow: "0 0 30px rgba(118, 51, 255, 0.6)",
        transition: { duration: 0.3, ease: "easeInOut" },
    },
};

export const hoverRotate = {
    rest: { rotate: 0 },
    hover: {
        rotate: 5,
        transition: { duration: 0.2, ease: "easeInOut" },
    },
};

// ============================================
// Stagger Container
// ============================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0,
        },
    },
};

// ============================================
// Card Animations
// ============================================

export const cardHover: Variants = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    },
    hover: {
        scale: 1.02,
        y: -8,
        boxShadow: "0 20px 40px rgba(118, 51, 255, 0.3)",
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export const cardReveal: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1]
        },
    },
};

// ============================================
// Button Press Animation
// ============================================

export const buttonTap = {
    tap: { scale: 0.95 },
};

export const buttonPress = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 },
};

// ============================================
// Floating Animation
// ============================================

export const floatingAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

export const pulseAnimation = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// ============================================
// Text Reveal Animations
// ============================================

export const textReveal: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
        },
    }),
};

export const letterAnimation: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};
