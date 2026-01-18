"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    gradientText?: string;
    description: string;
}

export function PageHeader({ title, subtitle, gradientText, description }: PageHeaderProps) {
    return (
        <div className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-150 h-150 bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="text-primary text-sm font-bold uppercase tracking-widest mb-4 block">
                        {subtitle}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold font-(family-name:--font-space-grotesk) text-white mb-6">
                        {title} {gradientText && <span className="gradient-text">{gradientText}</span>}
                    </h1>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
                        {description}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
