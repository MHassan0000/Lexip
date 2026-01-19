"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Wand2,
    Zap,
    Crown,
    TrendingUp,
    MoreHorizontal,
    ArrowUpRight,
    Calendar,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import type { ThumbnailGeneration, Subscription, UsageLimit } from "@/types/database";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardHomeProps {
    user: User;
    subscription: Subscription | null;
    recentGenerations: ThumbnailGeneration[];
    totalGenerations: number;
    usage: UsageLimit | null;
    chartData: { name: string; value: number; fullDate?: string }[];
}

export function DashboardHome({
    user,
    subscription,
    recentGenerations,
    totalGenerations,
    usage,
    chartData,
}: DashboardHomeProps) {
    const plan = subscription?.plan || "free";
    const usedToday = usage?.generations_count || 0;
    const limitToday = usage?.max_generations || 5;
    const remainingToday = Math.max(0, limitToday - usedToday);

    const stats: {
        label: string;
        value: string | number;
        change?: string;
        trend?: string;
        subtext?: string;
        action?: string;
        icon: any;
        color: string;
        bg: string;
        border: string;
    }[] = [
            {
                label: "Total Generations",
                value: totalGenerations,
                // change: "+12.5%", // TODO: Calculate real trend
                // trend: "up",
                icon: Wand2,
                color: "text-primary",
                bg: "bg-primary/10",
                border: "border-primary/20"
            },
            {
                label: "Credits Remaining",
                value: remainingToday,
                subtext: "Reset at midnight",
                icon: Zap,
                color: "text-[#F59E0B]",
                bg: "bg-[#F59E0B]/10",
                border: "border-[#F59E0B]/20"
            },
            {
                label: "Active Plan",
                value: plan.charAt(0).toUpperCase() + plan.slice(1),
                action: "Manage",
                icon: Crown,
                color: "text-accent",
                bg: "bg-accent/10",
                border: "border-accent/20"
            },
        ];

    return (
        <div className="space-y-6">
            {/* Top Row: Welcome & Main Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Overview of your creative activity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border-bright text-text-secondary hover:text-white hover:bg-surface-elevated">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                    <Link href="/generate">
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-glow">
                            <Wand2 className="w-4 h-4 mr-2" />
                            Create New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-2xl bg-surface border ${stat.border} relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}
                    >
                        {/* Glow effect */}
                        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${stat.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="mt-6 relative z-10">
                            <h3 className="text-3xl font-bold text-white font-display">{stat.value}</h3>
                            <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                                {stat.label}
                                {stat.change && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        {stat.change}
                                    </span>
                                )}
                            </p>
                            {stat.subtext && <p className="text-xs text-text-tertiary mt-2">{stat.subtext}</p>}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid: Chart & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Activity Info</h3>
                            <p className="text-sm text-text-secondary">Generations over time</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select className="bg-dark border border-border text-xs text-text-secondary rounded-lg px-3 py-1.5 outline-none focus:border-primary">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full h-[300px] min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3344" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748B"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748B"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E2532', borderColor: '#3B475B', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366F1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column / Recent */}
                <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Files</h3>
                        <Link href="/history" className="text-xs text-primary hover:text-primary-400">View All</Link>
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {recentGenerations.length > 0 ? (
                            recentGenerations.map((gen) => (
                                <div key={gen.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-border-bright">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-dark shrink-0">
                                        {gen.image_urls && gen.image_urls[0] ? (
                                            <Image
                                                src={gen.image_urls[0]}
                                                alt="Thumbnail"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                                                <Wand2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate max-w-[150px]">
                                            {gen.prompt}
                                        </p>
                                        <p className="text-xs text-text-tertiary">
                                            {new Date(gen.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-white transition-colors" />
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-sm text-text-secondary">No files created yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-4">
                        <Link href="/generate">
                            <Button className="w-full bg-darker border border-border text-white hover:bg-surface-elevated">
                                <Wand2 className="w-4 h-4 mr-2 text-primary" />
                                Generate New
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

