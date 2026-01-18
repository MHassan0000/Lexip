"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Wand2,
    TrendingUp,
    Zap,
    Clock,
    ArrowRight,
    Plus,
    Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import type { ThumbnailGeneration, Subscription, UsageLimit } from "@/types/database";

interface DashboardHomeProps {
    user: User;
    subscription: Subscription | null;
    recentGenerations: ThumbnailGeneration[];
    totalGenerations: number;
    usage: UsageLimit | null;
}

export function DashboardHome({
    user,
    subscription,
    recentGenerations,
    totalGenerations,
    usage,
}: DashboardHomeProps) {
    const plan = subscription?.plan || "free";
    const usedToday = usage?.generations_count || 0;
    const limitToday = usage?.max_generations || 5;
    const remainingToday = Math.max(0, limitToday - usedToday);

    const stats = [
        {
            label: "Total Generations",
            value: totalGenerations,
            icon: Wand2,
            color: "text-primary",
            bgColor: "bg-primary/20",
        },
        {
            label: "Remaining Today",
            value: remainingToday,
            icon: Zap,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/20",
        },
        {
            label: "Current Plan",
            value: plan.charAt(0).toUpperCase() + plan.slice(1),
            icon: Crown,
            color: "text-accent",
            bgColor: "bg-accent/20",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white font-(family-name:--font-space-grotesk)">
                        Welcome back, {user.email?.split("@")[0]}!
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Here's what's happening with your thumbnail generations
                    </p>
                </div>
                <Link href="/generate">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Generation
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-2xl bg-surface border border-border"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-text-tertiary text-sm">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Usage Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Today's Usage</h2>
                    <span className="text-sm text-text-secondary">
                        {usedToday} / {limitToday} generations
                    </span>
                </div>
                <div className="h-3 bg-dark rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (usedToday / limitToday) * 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="h-full bg-linear-to-r from-primary to-accent rounded-full"
                    />
                </div>
                {plan === "free" && remainingToday < 3 && (
                    <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <span className="text-sm text-white">
                                Running low on generations? Upgrade for more!
                            </span>
                        </div>
                        <Link href="/pricing">
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                                Upgrade
                            </Button>
                        </Link>
                    </div>
                )}
            </motion.div>

            {/* Recent Generations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Recent Generations</h2>
                    <Link href="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentGenerations.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {recentGenerations.map((gen, index) => (
                            <motion.div
                                key={gen.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.05 }}
                                className="group relative aspect-video rounded-xl overflow-hidden bg-dark border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            >
                                {gen.image_urls && gen.image_urls[0] ? (
                                    <Image
                                        src={gen.image_urls[0]}
                                        alt={gen.prompt}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Wand2 className="w-8 h-8 text-text-tertiary" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-xs text-white truncate">{gen.prompt}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-2xl bg-surface border border-border text-center">
                        <Wand2 className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No generations yet</h3>
                        <p className="text-text-secondary mb-4">
                            Create your first thumbnail to get started
                        </p>
                        <Link href="/generate">
                            <Button className="bg-primary hover:bg-primary/90 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Generate Thumbnail
                            </Button>
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
