import type { Variants, Transition } from 'framer-motion';

export const easeOut = { ease: [0.16, 1, 0.3, 1], duration: 0.5 };

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: easeOut },
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: easeOut },
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: easeOut },
};

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

export const staggerFast: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05,
        },
    },
};

export const cardHover = {
    whileHover: {
        y: -2,
        boxShadow: '0 12px 24px -8px rgba(0,0,0,0.08)',
        transition: { duration: 0.2, ease: 'easeOut' },
    },
    whileTap: { scale: 0.99 },
};

export const countUp = (
    value: number,
    duration = 1.2
): Transition => ({
    duration,
    ease: [0.16, 1, 0.3, 1],
});
