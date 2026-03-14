import { Variants } from "framer-motion";

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1] // Sharp exponential out
        } 
    }
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { 
        opacity: 1, 
        transition: { 
            staggerChildren: 0.08,
            delayChildren: 0.1
        } 
    }
};

export const slowFade: Variants = {
    hidden: { opacity: 0 },
    show: { 
        opacity: 1, 
        transition: { duration: 1, ease: "easeOut" } 
    }
};
