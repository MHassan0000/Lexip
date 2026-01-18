"use client";

import React from "react";
import { motion } from "framer-motion";
import { FadeIn, SlideIn } from "@/components/ui/animated-container";
import { Zap, Palette, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
    {
        icon: Zap,
        title: "Faster",
        subtitle: "Instant AI Generation",
        description: "Create stunning thumbnails in seconds, not hours. Just describe, and our AI delivers.",
        gradient: "from-primary to-accent-500",
    },
    {
        icon: Palette,
        title: "UI/Verse",
        subtitle: "Diverse Style Library",
        description: "Access a wide range of styles from gaming to vlog, Mr. Beast to minimalist—all at your fingertips.",
        gradient: "from-accent to-[#00e0ff]",
    },
    {
        icon: Download,
        title: "Stories",
        subtitle: "4K Export Ready",
        description: "Export your thumbnails in stunning 4K resolution, optimized for YouTube's display algorithm.",
        gradient: "from-[#ec4899] to-[#8b5cf6]",
    },
];

export function Features() {
    return (
        <section id="features" className="relative py-24 bg-darker overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-150 h-150 bg-primary/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Section Header */}
                    <div className="lg:col-span-4 space-y-6">
                        <FadeIn>
                            <span className="text-primary text-sm font-bold uppercase tracking-widest">
                                Why Choose Lexip?
                            </span>
                        </FadeIn>

                        <SlideIn delay={0.1}>
                            <h2 className="text-4xl md:text-5xl font-bold font-(family-name:--font-space-grotesk) text-white">
                                Holistic Thumbnail <br />
                                <span className="text-text-secondary">Creation System</span>
                            </h2>
                        </SlideIn>

                        <SlideIn delay={0.2}>
                            <p className="text-text-tertiary leading-relaxed">
                                From initial concept to final export, our AI-powered suite covers every step of your thumbnail creation journey.
                            </p>
                            <Button className="mt-6 rounded-full bg-surface border border-border hover:bg-primary hover:border-primary transition-all">
                                View All Features
                            </Button>
                        </SlideIn>
                    </div>

                    {/* Cards Grid */}
                    <div className="lg:col-span-8 grid md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="group relative h-80 rounded-3xl bg-dark border border-[#1e1e2e] overflow-hidden hover:border-primary/50 transition-colors duration-300 flex flex-col justify-end p-6"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-linear-to-t ${feature.gradient} opacity-5 group-hover:opacity-20 transition-opacity duration-500`} />
                                <div className={`absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t ${feature.gradient} opacity-10 blur-xl group-hover:opacity-30 transition-opacity duration-500`} />

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-surface/80 backdrop-blur-md flex items-center justify-center mb-4 border border-text-primary/10">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-1 font-(family-name:--font-space-grotesk)">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-primary uppercase font-bold tracking-wider mb-2">
                                        {feature.subtitle}
                                    </p>

                                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                        <p className="text-sm text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            {feature.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
