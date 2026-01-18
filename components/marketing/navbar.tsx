"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const navItems = [
    { name: "Features", href: "/#features" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "Showcase", href: "/#showcase" },
    { name: "Pricing", href: "/pricing" },
];

export function Navbar() {
    const scrollPosition = useScrollPosition();
    const isScrolled = scrollPosition.y > 20;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "bg-darker/80 backdrop-blur-md border-b border-border py-4"
                        : "bg-transparent py-6"
                )}
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-12 h-12 rounded-lg flex items-center gap-2 justify-center overflow-hidden group-hover:glow-primary transition-all duration-300">
                                <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
                            </div>
                            <span className="text-3xl font-bold font-(family-name:--font-space-grotesk) tracking-tight">
                                Lexip
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {isLoading ? (
                                <div className="w-24 h-9 bg-surface animate-pulse rounded-lg" />
                            ) : user ? (
                                <Link href="/dashboard">
                                    <Button variant="primary" size="sm" className="glow-primary hover:glow-primary-strong">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button variant="primary" size="sm" className="glow-primary hover:glow-primary-strong">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-text-secondary hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-40 bg-darker pt-24 px-4 md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="text-2xl font-medium text-white hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 flex flex-col gap-4"
                            >
                                {user ? (
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" size="lg" className="w-full justify-center shadow-lg shadow-primary/20">
                                            <LayoutDashboard className="w-5 h-5 mr-2" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="secondary" size="lg" className="w-full justify-center">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="primary" size="lg" className="w-full justify-center shadow-lg shadow-primary/20">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
