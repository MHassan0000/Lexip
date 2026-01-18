"use client";

import React from "react";
import { motion } from "framer-motion";
import { FadeIn, SlideIn } from "../ui/animated-container";
import { MessageSquarePlus, Paintbrush, Download } from "lucide-react";

const steps = [
    {
        id: 1,
        title: "Describe Your Vision",
        description: "Simply type what you want, or paste your video title. Our AI understands context, emotions, and current design trends.",
        icon: MessageSquarePlus,
        color: "#7633ff",
    },
    {
        id: 2,
        title: "AI Generates Options",
        description: "Within seconds, get 4 distinct high-resolution variations. Gaming, clean, shock-value — we cover all high-CTR styles.",
        icon: Paintbrush,
        color: "#00b8e6",
    },
    {
        id: 3,
        title: "Edit & Export",
        description: "Fine-tune text, swap backgrounds, or adjust colors in our editor. Then export in 4K, ready for YouTube upload.",
        icon: Download,
        color: "#10b981",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-24 md:py-32 bg-darker overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold font-(family-name:--font-space-grotesk) mb-6">
                            From Idea to <span className="gradient-text">Viral</span> in 3 Steps
                        </h2>
                    </FadeIn>
                    <SlideIn delay={0.1}>
                        <p className="text-lg text-text-secondary">
                            No Photoshop skills required. We've streamlined the professional design workflow into a simple conversation.
                        </p>
                    </SlideIn>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-15 left-[16%] right-[16%] h-0.5 bg-border">
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent w-1/2 mx-auto opacity-50 blur-[1px]" />
                    </div>

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                {/* Step Number Badge */}
                                <div
                                    className="w-12 h-12 rounded-full border border-border bg-darker flex items-center justify-center text-lg font-bold font-mono text-text-secondary mb-8 relative z-10 group-hover:border-(--step-color) transition-colors duration-300 shadow-xl"
                                    style={{ "--step-color": step.color } as React.CSSProperties}
                                >
                                    {step.id}
                                </div>

                                <div
                                    className="mb-8 p-6 rounded-2xl bg-surface border border-border group-hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden"
                                >
                                    <div
                                        className="absolute inset-0 bg-(--step-color) opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                                        style={{ "--step-color": step.color } as React.CSSProperties}
                                    />
                                    <div className="w-16 h-16 rounded-xl bg-darker flex items-center justify-center mx-auto relative z-10">
                                        <Icon
                                            className="w-8 h-8 transition-colors duration-300"
                                            style={{ color: step.color }}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 font-(family-name:--font-space-grotesk)">
                                    {step.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed max-w-xs">
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
