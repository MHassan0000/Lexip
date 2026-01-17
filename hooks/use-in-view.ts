"use client";

import { useState, useEffect, useRef } from "react";

interface UseInViewOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook to detect if element is in viewport
 * Useful for triggering animations on scroll
 */
export function useInView<T extends HTMLElement>(
    options: UseInViewOptions = {}
) {
    const { threshold = 0.1, rootMargin = "0px", triggerOnce = false } = options;

    const ref = useRef<T>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const inView = entry.isIntersecting;

                if (inView) {
                    setIsInView(true);
                    if (triggerOnce) {
                        observer.disconnect();
                    }
                } else if (!triggerOnce) {
                    setIsInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isInView };
}
