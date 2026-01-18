"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Instagram, Youtube, Github } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-container";

export function Footer() {
    return (
        <footer className="bg-[#050508] border-t border-border relative overflow-hidden">
            {/* CTA Section */}
            <div className="relative py-20 border-b border-border/50">
                <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold font-(family-name:--font-space-grotesk) mb-4">
                            Ready to Begin Crafting Your <br className="hidden md:block" />
                            Ultimate <span className="gradient-text">Viral Thumbnails?</span>
                        </h2>
                        <p className="text-text-secondary max-w-xl mx-auto mb-8">
                            Join thousands of creators who are already boosting their views with AI-powered thumbnails.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">

                            <button className="px-8 py-4 rounded-full border border-border text-white font-bold hover:bg-surface transition-colors">
                                Join Creator Community
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Links Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-2xl font-bold font-(family-name:--font-space-grotesk)">
                            Lexip<span className="text-primary">.</span>
                        </Link>
                        <p className="mt-4 text-text-secondary">
                            From ideas to viral thumbnails using smart AI.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Products</h4>
                        <ul className="space-y-4 text-text-secondary">
                            <li><Link href="/" className="hover:text-white transition-colors">AI Thumbnails</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Title Generator</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">A/B Testing</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Analytics</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-text-secondary">
                            <li><Link href="/" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Community</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-text-secondary">
                            <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-text-secondary text-sm">
                        © 2024 Lexip AI. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-white hover:bg-border transition-all">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-white hover:bg-border transition-all">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-white hover:bg-border transition-all">
                            <Youtube className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="p-2 rounded-full bg-surface text-text-secondary hover:text-white hover:bg-border transition-all">
                            <Github className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
