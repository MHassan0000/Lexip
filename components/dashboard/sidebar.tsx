"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Wand2,
    History,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    X,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Generate",
        href: "/generate",
        icon: Wand2,
    },
    {
        name: "History",
        href: "/history",
        icon: History,
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

const bottomNavItems = [
    {
        name: "Billing",
        href: "/settings/billing",
        icon: CreditCard,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold text-white font-(family-name:--font-space-grotesk)">
                        Lexip
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-secondary hover:text-white hover:bg-surface"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform duration-200",
                                !isActive && "group-hover:scale-110"
                            )} />
                            <span className="font-medium">{item.name}</span>
                            {isActive && (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-border space-y-1">
                {bottomNavItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                            pathname === item.href
                                ? "bg-surface text-white"
                                : "text-text-secondary hover:text-white hover:bg-surface"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}

                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-secondary hover:text-red-400 hover:bg-red-500/10 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.email?.split("@")[0] || "User"}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                            {user?.email || ""}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-dark border-r border-border fixed top-0 left-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark border-b border-border z-40 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Lexip</span>
                </Link>
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 text-text-secondary hover:text-white"
                >
                    {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/60 z-40"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="lg:hidden fixed top-0 left-0 w-72 h-screen bg-dark border-r border-border z-50"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
