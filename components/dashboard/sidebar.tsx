"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wand2,
    History,
    Settings,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Generate", href: "/generate", icon: Wand2 },
    { name: "History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
];

const bottomNavItems = [
    { name: "Billing", href: "/settings/billing", icon: CreditCard },
];

interface DashboardSidebarProps {
    className?: string; // Allow passing standard className for visibility control
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const [isSignOutOpen, setIsSignOutOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setIsSignOutOpen(false);
        router.push("/");
    };

    return (
        <aside className={cn("hidden lg:flex flex-col w-72 bg-dark/50 border-r border-border backdrop-blur-xl h-screen fixed left-0 top-0 z-40 transition-all duration-300", className)}>
            {/* Logo */}
            <div className="h-20 flex items-center px-8 border-b border-border/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-500">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <span className="text-2xl font-bold text-white font-display tracking-tight">
                        Lexip
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-8 p-6 overflow-y-auto">
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-2">
                        Platform
                    </p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-text-secondary hover:text-white hover:bg-surface-elevated"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-glow" />
                                )}
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-tertiary group-hover:text-white")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-2">
                        Account
                    </p>
                    {bottomNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                pathname === item.href
                                    ? "bg-primary/10 text-white"
                                    : "text-text-secondary hover:text-white hover:bg-surface-elevated"
                            )}
                        >
                            <item.icon className="w-5 h-5 text-text-tertiary group-hover:text-white" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                    <button
                        onClick={() => setIsSignOutOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-text-secondary hover:text-red-400 hover:bg-red-500/10 group"
                    >
                        <LogOut className="w-5 h-5 text-text-tertiary group-hover:text-red-400" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Config/Ad Card (Optional Placeholder) */}
            <div className="p-6 pt-0">
                <div className="p-4 rounded-2xl bg-linear-to-br from-primary/20 to-accent/10 border border-primary/20 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all" />
                    <h4 className="font-bold text-white relative z-10 mb-1">Upgrade Plan</h4>
                    <p className="text-xs text-text-secondary relative z-10 mb-3">Unlock unlimited generations.</p>
                    <Link href="/pricing" className="text-xs font-semibold text-primary hover:text-accent transition-colors relative z-10 block">
                        View Pricing →
                    </Link>
                </div>
            </div>

            <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
                <DialogContent className="bg-surface border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Sign Out</DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            Are you sure you want to sign out of your account?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSignOutOpen(false)}
                            className="text-text-secondary hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSignOut}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Sign Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}

