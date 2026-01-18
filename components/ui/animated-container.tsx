"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    viewportMargin?: string;
}

export const AnimatedContainer = ({
    children,
    delay = 0,
    duration = 0.5,
    className,
    viewportMargin = "-50px",
    initial,
    whileInView,
    viewport,
    transition,
    ...props
}: AnimatedContainerProps) => {
    return (
        <motion.div
            initial={initial || { opacity: 0, y: 20 }}
            whileInView={whileInView || { opacity: 1, y: 0 }}
            viewport={viewport || { once: true, margin: viewportMargin }}
            transition={transition || { duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const FadeIn = ({ children, delay = 0, duration = 0.5, className, ...props }: AnimatedContainerProps) => (
    <AnimatedContainer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        delay={delay}
        duration={duration}
        className={className}
        {...props}
    >
        {children}
    </AnimatedContainer>
);

export const SlideIn = ({ children, direction = "up", delay = 0, duration = 0.5, className, ...props }: AnimatedContainerProps & { direction?: "up" | "down" | "left" | "right" }) => {
    const directions = {
        up: { y: 20, x: 0 },
        down: { y: -20, x: 0 },
        left: { x: 20, y: 0 },
        right: { x: -20, y: 0 },
    };

    return (
        <AnimatedContainer
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            delay={delay}
            duration={duration}
            className={className}
            {...props}
        >
            {children}
        </AnimatedContainer>
    );
};

export const ScaleIn = ({ children, delay = 0, duration = 0.5, className, ...props }: AnimatedContainerProps) => (
    <AnimatedContainer
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        delay={delay}
        duration={duration}
        className={className}
        {...props}
    >
        {children}
    </AnimatedContainer>
);
