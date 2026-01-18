"use client";

import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, Play } from "lucide-react";
import { FadeIn, SlideIn } from "../ui/animated-container";

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-darker">
            {/* Background Mesh/Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-200 h-200 bg-primary/10 rounded-full blur-[120px] mix-blend-screen opacity-30" />
                <div className="absolute bottom-0 left-0 w-150 h-150 bg-accent-500/10 rounded-full blur-[100px] mix-blend-screen opacity-20" />
                {/* Abstract Mesh Line placeholder */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 mt-20">
                <div className="max-w-4xl mx-auto text-center space-y-8">

                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border mb-6">
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">
                                AI-Powered Thumbnail Generator
                            </span>
                        </div>
                    </FadeIn>

                    <SlideIn delay={0.1}>
                        <h1 className="text-5xl md:text-7xl font-bold font-(family-name:--font-space-grotesk) leading-[1.1] tracking-tight text-white uppercase">
                            Stunning Thumbnails, <br />
                            <span className="gradient-text">Instant Clicks</span>
                        </h1>
                    </SlideIn>

                    <SlideIn delay={0.2}>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            Generate high-converting YouTube thumbnails in seconds. Our AI understands what gets clicks—so you don't have to guess.
                        </p>
                    </SlideIn>

                    <SlideIn delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button size="xl" className="rounded-full bg-primary hover:bg-primary/90 text-white px-8">
                            Generate for Free
                        </Button>
                        <Button size="xl" variant="secondary" className="rounded-full bg-surface border-border text-white hover:bg-border">
                            <Play className="w-4 h-4 mr-2 fill-white" />
                            Watch Demo
                        </Button>
                    </SlideIn>
                </div>

                {/* Stats Section */}
                <SlideIn delay={0.5} className="mt-20 md:mt-32 border-t border-border pt-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <div className="text-center md:text-left">
                            <h3 className="text-4xl font-bold text-white mb-2 font-(family-name:--font-space-grotesk)">2500+</h3>
                            <p className="text-sm text-text-tertiary uppercase tracking-wide">Thumbnails <br />Generated Daily</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-4xl font-bold text-white mb-2 font-(family-name:--font-space-grotesk)">15x</h3>
                            <p className="text-sm text-text-tertiary uppercase tracking-wide">Faster Than <br />Manual Design</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-4xl font-bold text-white mb-2 font-(family-name:--font-space-grotesk)">98%</h3>
                            <p className="text-sm text-text-tertiary uppercase tracking-wide">Creator <br />Satisfaction Rate</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-4xl font-bold text-white mb-2 font-(family-name:--font-space-grotesk)">6M+</h3>
                            <p className="text-sm text-text-tertiary uppercase tracking-wide">More Views <br />Delivered</p>
                        </div>
                    </div>
                </SlideIn>
            </div>
        </section>
    );
}
