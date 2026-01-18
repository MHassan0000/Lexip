"use client";

import React from "react";
import { motion } from "framer-motion";
import { FadeIn, SlideIn } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Wand2, Layers, ArrowRight, Image } from "lucide-react";

export function AppExplanation() {
    return (
        <section className="relative py-24 md:py-32 bg-[#0a0a0f] overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Column: Text */}
                    <div className="space-y-8">
                        <FadeIn>
                            <h2 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-space-grotesk)] text-white leading-tight">
                                Discover Your <br />
                                <span className="text-[#7633ff]">Thumbnail Potential</span>
                            </h2>
                        </FadeIn>

                        <SlideIn delay={0.1}>
                            <p className="text-lg text-[#a1a1aa] leading-relaxed max-w-md">
                                Tell our AI what your video is about. In seconds, you'll get multiple high-CTR thumbnail options designed to stand out in any feed.
                            </p>
                        </SlideIn>

                        <SlideIn delay={0.2} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a24] border border-[#2a2a38] flex items-center justify-center">
                                    <Wand2 className="w-6 h-6 text-[#7633ff]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">AI-Powered Design</h4>
                                    <p className="text-sm text-[#71717a]">Generate stunning visuals from a simple prompt</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a24] border border-[#2a2a38] flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-[#00b8e6]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Multiple Variations</h4>
                                    <p className="text-sm text-[#71717a]">Get 4 unique styles to choose from</p>
                                </div>
                            </div>
                        </SlideIn>
                    </div>

                    {/* Right Column: Visual Card */}
                    <SlideIn delay={0.3} className="relative">
                        <div className="relative rounded-3xl bg-[#0f0f1a] border border-[#2a2a38] p-8 md:p-10 shadow-2xl glass-strong max-w-md mx-auto">

                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white">Generate Your Thumbnail</h3>
                                <div className="w-2 h-2 rounded-full bg-[#7633ff] animate-pulse" />
                            </div>

                            <div className="space-y-4">
                                {[
                                    "Describe your video topic",
                                    "Choose your style",
                                    "Add text overlay",
                                    "Export in 4K"
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a24]/50 border border-[#2a2a38]/50 hover:border-[#7633ff]/30 transition-colors"
                                    >
                                        <div className="w-5 h-5 rounded-full border border-[#71717a] flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#7633ff] opacity-0 hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-[#d4d4d8] text-sm">{item}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-[#2a2a38] flex items-center justify-between">
                                <div className="text-xs text-[#71717a]">
                                    Step 1 of 4
                                </div>
                                <Button size="sm" className="bg-[#7633ff] hover:bg-[#6329d6] text-white rounded-full px-6">
                                    Next <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                            </div>

                            {/* Decorative Cubes/Glow */}
                            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#7633ff]/20 rounded-3xl blur-2xl -z-10 animate-pulse" />
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#00b8e6]/10 rounded-full blur-3xl -z-10" />
                        </div>

                        {/* Floating 3D Element Placeholder */}
                        <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-[#0a0a0f] border border-[#2a2a38] p-3 rounded-xl shadow-xl hidden lg:block animate-bounce duration-[4000ms]">
                            <Image className="w-8 h-8 text-[#7633ff]" />
                        </div>
                    </SlideIn>

                </div>
            </div>
        </section>
    );
}
