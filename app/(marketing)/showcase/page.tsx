"use client";

import React from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/marketing/navbar";
import { motion } from "framer-motion";
import Link from "next/link";

const examples = [
    {
        title: "Gaming - Minecraft",
        category: "Gaming",
        color: "black"
    },
    {
        title: "Tech Review - iPhone 16",
        category: "Tech",
        color: "black"
    },
    {
        title: "Vlog - Travel Japan",
        category: "Vlog",
        color: "black"
    },
    {
        title: "Finance - Bitcoin Crash",
        category: "Finance",
        color: "black"
    },
    {
        title: "Fitness - Abs Workout",
        category: "Fitness",
        color: "black"
    },
    {
        title: "Cooking - Best Burger",
        category: "Food",
        color: "black"
    }
];

export default function ShowcasePage() {
    return (
        <div className="min-h-screen bg-darker">
            <Navbar />

            <main>
                <PageHeader
                    title="Made with"
                    gradientText="Lexip"
                    subtitle="Showcase"
                    description="Explore what's possible with our AI. All these thumbnails were generated in seconds."
                />

                <section className="container mx-auto px-4 md:px-6 pb-24">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {examples.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative aspect-video rounded-2xl overflow-hidden bg-surface border border-border"
                            >
                                {/* Placeholder Gradient Image */}
                                <div className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />

                                {/* Overlay Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                                        {item.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                        {item.title}
                                    </h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <p className="text-text-secondary mb-8">Ready to create your own?</p>
                        <Link href="/generate">
                            <button className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                                Start Generating
                            </button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
