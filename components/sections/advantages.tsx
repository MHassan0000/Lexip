"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Users, Shield, Layers, Smartphone } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/ui/animated-container";

const advantages = [
    {
        title: "10x Rapid Creation",
        description: "Generate click-worthy thumbnails in seconds. No more spending hours in Photoshop.",
        icon: Zap,
        color: "#7633ff",
    },
    {
        title: "CTR Optimized",
        description: "Our AI is trained on viral thumbnails to ensure your designs are built for maximum clicks.",
        icon: TrendingUp,
        color: "#00b8e6",
    },
    {
        title: "Creator Community",
        description: "Join 10,000+ YouTubers sharing tips, templates, and their success stories.",
        icon: Users,
        color: "#10b981",
    },
    {
        title: "Secure Cloud Storage",
        description: "All your thumbnail projects are auto-saved and protected with enterprise-grade security.",
        icon: Shield,
        color: "#f59e0b",
    },
    {
        title: "YouTube Integration",
        description: "Connect your channel and upload thumbnails directly to your videos in one click.",
        icon: Layers,
        color: "#ec4899",
    },
    {
        title: "Mobile Optimized",
        description: "Previews optimized for how viewers actually see thumbnails on phones and tablets.",
        icon: Smartphone,
        color: "#8b5cf6",
    },
];

export function Advantages() {
    return (
        <section className="relative py-24 md:py-32 bg-[#0a0a0f] overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#7633ff]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-[#00b8e6]/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-6">
                            Advantages of <span className="gradient-text">Smooth</span> and Effortless <span className="text-[#00b8e6]">Thumbnail Creation</span>
                        </h2>
                    </FadeIn>
                    <SlideIn delay={0.1}>
                        <p className="text-lg text-[#a1a1aa]">
                            Unlock the full potential of your channel with features designed for speed, quality, and growth.
                        </p>
                    </SlideIn>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advantages.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group relative p-8 rounded-2xl bg-[#141420]/50 border border-[#2a2a38] hover:bg-[#1a1a29] transition-all duration-300 hover:-translate-y-1 hover:border-[#7633ff]/30 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#7633ff]/0 to-[#7633ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                                    style={{ backgroundColor: `${item.color}20` }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-space-grotesk)]">
                                    {item.title}
                                </h3>
                                <p className="text-[#a1a1aa] leading-relaxed relative z-10">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
