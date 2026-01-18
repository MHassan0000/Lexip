"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card"
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    delay?: number;
    className?: string;
    gradient?: string;
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    delay = 0,
    className,
    gradient = "from-primary to-accent",
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
        >
            <div className="group relative h-full">
                {/* Glow Effect / Backdrop */}
                <div className={cn(
                    "absolute -inset-0.5 rounded-2xl bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10",
                    gradient
                )} />

                <Card className={cn(
                    "relative h-full overflow-hidden border-border bg-darker p-8 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#3a3a4a] group-hover:shadow-2xl",
                    className
                )}>
                    {/* Inner Gradient Bloom */}
                    <div className={cn(
                        "absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl",
                        gradient
                    )} />

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Icon Container */}
                        <div className="mb-6 inline-flex p-3 rounded-xl bg-surface border border-border group-hover:border-primary/30 transition-colors w-fit">
                            <Icon className="w-6 h-6 text-white" />
                        </div>

                        <h3 className="text-xl font-bold font-(family-name:--font-space-grotesk) text-white mb-3 group-hover:text-primary transition-colors">
                            {title}
                        </h3>

                        <p className="text-text-secondary leading-relaxed grow">
                            {description}
                        </p>

                        {/* Decoration Lines */}
                        <div className="mt-6 flex gap-2 opacity-30">
                            <div className="h-1 w-8 rounded-full bg-white" />
                            <div className="h-1 w-2 rounded-full bg-white" />
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
}
