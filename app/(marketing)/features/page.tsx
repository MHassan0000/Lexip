"use client";

import React from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/marketing/navbar";
import { motion } from "framer-motion";
import { Zap, Palette, Download, Layers, Shield, Smartphone, LucideIcon, Sparkles, Layout, Monitor } from "lucide-react";

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
}

const features: Feature[] = [
    {
        icon: Zap,
        title: "Instant Generation",
        description: "Create professional-grade thumbnails in under 5 seconds. Our AI processes your prompt instantly.",
        color: "text-yellow-400"
    },
    {
        icon: Palette,
        title: "Diverse Style Library",
        description: "From gaming to vlogging, choose from over 50+ curated styles that match your brand.",
        color: "text-purple-400"
    },
    {
        icon: Download,
        title: "4K Export Ready",
        description: "Download in crystal clear 4K resolution. Perfect for retina displays and high-DPI screens.",
        color: "text-blue-400"
    },
    {
        icon: Layers,
        title: "Smart Compositing",
        description: "Our AI automatically arranges text, subjects, and backgrounds for optimal readability and CTR.",
        color: "text-green-400"
    },
    {
        icon: Sparkles,
        title: "Face Enhancement",
        description: "Automatically enhance facial expressions to make them more emotive and click-worthy.",
        color: "text-pink-400"
    },
    {
        icon: Layout,
        title: "Auto-Layout",
        description: "Intelligent text positioning ensures your title is never covered by the timestamp.",
        color: "text-orange-400"
    },
    {
        icon: Monitor,
        title: "Platform Optimized",
        description: "Designs specifically tuned for YouTube's recommendations algorithm and mobile feed.",
        color: "text-cyan-400"
    },
    {
        icon: Shield,
        title: "Commercial Rights",
        description: "You own 100% of the rights to every thumbnail you generate. Use them anywhere.",
        color: "text-red-400"
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-darker">
            <Navbar />

            <main>
                <PageHeader
                    title="Powerful Features for"
                    gradientText="Modern Creators"
                    subtitle="Features"
                    description="Everything you need to create viral thumbnails, packed into one powerful AI platform."
                />

                <section className="container mx-auto px-4 md:px-6 pb-24">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-8 rounded-3xl bg-surface border border-border hover:border-primary/50 transition-all hover:bg-surface/80"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-dark border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
