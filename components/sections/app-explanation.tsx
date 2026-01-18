"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SlideIn } from "../ui/animated-container";
import { Button } from "../ui/button"
import { Wand2, Layers, ArrowRight, Image as ImageIcon, Type, Download, Sparkles, Palette } from "lucide-react";

const steps = [
    {
        title: "Describe your video topic",
        description: "Simply type what your video is about. Our AI understands context and nuances.",
        icon: Sparkles,
        preview: {
            title: "Prompt Input",
            content: "Minecraft survival challenge but I can't touch grass...",
            color: "bg-primary/20"
        }
    },
    {
        title: "Choose your style",
        description: "Select from our curated library of high-performing thumbnail styles.",
        icon: Palette,
        preview: {
            title: "Style Selection",
            content: "Selected: High Energy Gaming",
            color: "bg-accent/20"
        }
    },
    {
        title: "Add text overlay",
        description: "Customize the text to grab attention and drive clicks.",
        icon: Type,
        preview: {
            title: "Text Overlay",
            content: "IMPOSSIBLE CHALLENGE!",
            color: "bg-[#ec4899]/20"
        }
    },
    {
        title: "Export in 4K",
        description: "Get your thumbnail in pure 4K resolution, ready for upload.",
        icon: Download,
        preview: {
            title: "Ready to Upload",
            content: "Downloading thumbnail_4k.png...",
            color: "bg-[#10b981]/20"
        }
    }
];



export function AppExplanation() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="how-it-works" className="relative py-24 md:py-32 bg-darker overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Column: Text & Steps */}
                    <div className="space-y-8">
                        <FadeIn>
                            <h2 className="text-4xl md:text-6xl font-bold font-(family-name:--font-space-grotesk) text-white leading-tight">
                                Discover Your <br />
                                <span className="text-primary">Thumbnail Potential</span>
                            </h2>
                        </FadeIn>

                        <SlideIn delay={0.1}>
                            <p className="text-lg text-text-secondary leading-relaxed max-w-md">
                                Tell our AI what your video is about. In seconds, you'll get multiple high-CTR thumbnail options designed to stand out in any feed.
                            </p>
                        </SlideIn>

                        <div className="space-y-4 mt-8">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    onClick={() => setActiveStep(i)}
                                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${activeStep === i
                                        ? "bg-surface border-primary/50 shadow-lg shadow-primary/5"
                                        : "bg-transparent border-transparent hover:bg-surface/50 hover:border-border"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${activeStep === i
                                            ? "bg-primary text-white border-primary"
                                            : "bg-surface border-border text-text-tertiary group-hover:border-primary/50"
                                            }`}>
                                            {activeStep === i ? (
                                                <step.icon className="w-4 h-4" />
                                            ) : (
                                                <span className="text-xs font-bold">{i + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold transition-colors ${activeStep === i ? "text-white" : "text-text-secondary"}`}>
                                                {step.title}
                                            </h3>
                                            <AnimatePresence>
                                                {activeStep === i && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-sm text-text-tertiary mt-1"
                                                    >
                                                        {step.description}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Progress Bar for Active Step */}
                                    {activeStep === i && (
                                        <motion.div
                                            layoutId="active-step-indicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Interactive Visual Card */}
                    <SlideIn delay={0.3} className="relative h-[500px] flex items-center justify-center">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent rounded-[2.5rem] blur-3xl -z-10" />

                        <div className="relative w-full max-w-md rounded-3xl bg-dark border border-border overflow-hidden shadow-2xl glass-strong">
                            {/* Window Header */}
                            <div className="px-6 py-4 border-b border-border bg-surface/50 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
                                <div className="text-xs font-mono text-text-tertiary">lexip-gen-v2.0</div>
                            </div>

                            {/* Dynamic Content */}
                            <div className="p-8 h-[350px] flex flex-col items-center justify-center relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full flex flex-col items-center justify-center gap-6"
                                    >
                                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${steps[activeStep].preview.color} mb-4`}>
                                            {React.createElement(steps[activeStep].icon, { className: "w-12 h-12 text-white" })}
                                        </div>

                                        <div className="text-center space-y-2 w-full">
                                            <h4 className="text-xl font-bold text-white">
                                                {steps[activeStep].preview.title}
                                            </h4>
                                            <div className="py-3 px-6 rounded-lg bg-surface border border-border font-mono text-sm text-primary w-full max-w-[90%] mx-auto">
                                                {steps[activeStep].preview.content}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Buttons */}
                                <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-between items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={activeStep === 0}
                                        onClick={() => setActiveStep(prev => prev - 1)}
                                        className="text-text-tertiary hover:text-white"
                                    >
                                        Back
                                    </Button>
                                    <div className="flex gap-1">
                                        {steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeStep ? "bg-primary" : "bg-border"}`}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            if (activeStep < steps.length - 1) {
                                                setActiveStep(prev => prev + 1);
                                            } else {
                                                // Loop back or go to generate
                                                setActiveStep(0);
                                            }
                                        }}
                                        className="rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                        {activeStep === steps.length - 1 ? "Start Over" : "Next"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Floating Element */}
                        <div className="absolute -right-8 top-20 bg-darker border border-border p-4 rounded-2xl shadow-xl hidden xl:block animate-bounce duration-3000 delay-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-tertiary">System Status</div>
                                    <div className="text-sm font-bold text-green-400">Online</div>
                                </div>
                            </div>
                        </div>
                    </SlideIn>

                </div>
            </div>
        </section>
    );
}

