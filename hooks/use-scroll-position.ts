"use client";

import { useState, useEffect } from "react";

interface ScrollPosition {
    x: number;
    y: number;
}

/**
 * Hook to track scroll position
 * @returns object with x and y scroll positions
 */
export function useScrollPosition(): ScrollPosition {
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition({
                x: window.scrollX,
                y: window.scrollY,
            });
        };

        // Set initial position
        handleScroll();

        // Add scroll listener
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Cleanup
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return scrollPosition;
}
