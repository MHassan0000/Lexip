"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    CreditCard,
    BarChart3,
    Settings,
    Mail,
    Calendar,
    Crown,
    Zap,
    TrendingUp,
    ExternalLink,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomerPortalSession } from "@/actions/stripe";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile, Subscription, UsageLimit } from "@/types/database";
import Link from "next/link";

interface SettingsViewProps {
    user: SupabaseUser;
    profile: Profile | null;
    subscription: Subscription | null;
    totalGenerations: number;
    usage: UsageLimit | null;
}

type Tab = "profile" | "billing" | "usage";

export function SettingsView({
    user,
    profile,
    subscription,
    totalGenerations,
    usage,
}: SettingsViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [isPortalLoading, setIsPortalLoading] = useState(false);

    const tabs = [
        { id: "profile" as Tab, label: "Profile", icon: User },
        { id: "billing" as Tab, label: "Billing", icon: CreditCard },
        { id: "usage" as Tab, label: "Usage Stats", icon: BarChart3 },
    ];

    const handleManageBilling = async () => {
        setIsPortalLoading(true);
        const result = await createCustomerPortalSession();
        setIsPortalLoading(false);

        if (result.success && result.data?.url) {
            window.location.href = result.data.url;
        } else {
            alert(result.error || "Failed to open billing portal");
        }
    };

    const plan = subscription?.plan || "free";
    const planLimits = {
        free: { daily: 5, monthly: 50, resolution: "720p" },
        pro: { daily: 100, monthly: 2000, resolution: "1080p" },
        enterprise: { daily: 1000, monthly: -1, resolution: "4K" },
    };
    const limits = planLimits[plan as keyof typeof planLimits];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-(family-name:--font-space-grotesk)">
                    Settings
                </h1>
                <p className="text-text-secondary mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface rounded-xl border border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeTab === tab.id
                                ? "bg-primary text-white"
                                : "text-text-secondary hover:text-white"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === "profile" && (
                    <ProfileTab user={user} profile={profile} />
                )}
                {activeTab === "billing" && (
                    <BillingTab
                        subscription={subscription}
                        plan={plan}
                        onManageBilling={handleManageBilling}
                        isPortalLoading={isPortalLoading}
                    />
                )}
                {activeTab === "usage" && (
                    <UsageTab
                        totalGenerations={totalGenerations}
                        usage={usage}
                        limits={limits}
                        plan={plan}
                    />
                )}
            </motion.div>
        </div>
    );
}

// =============================================
// PROFILE TAB
// =============================================

function ProfileTab({ user, profile }: { user: SupabaseUser; profile: Profile | null }) {
    return (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-border">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Information
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-text-secondary block mb-2">Email</label>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-border">
                            <Mail className="w-5 h-5 text-text-tertiary" />
                            <span className="text-white">{user.email}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary block mb-2">Account Created</label>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-border">
                            <Calendar className="w-5 h-5 text-text-tertiary" />
                            <span className="text-white">
                                {new Date(user.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary block mb-2">User ID</label>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-border">
                            <Settings className="w-5 h-5 text-text-tertiary" />
                            <span className="text-text-tertiary text-sm font-mono truncate">{user.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================
// BILLING TAB
// =============================================

function BillingTab({
    subscription,
    plan,
    onManageBilling,
    isPortalLoading,
}: {
    subscription: Subscription | null;
    plan: string;
    onManageBilling: () => void;
    isPortalLoading: boolean;
}) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Current Plan
                </h2>

                <div className="flex items-center justify-between p-4 rounded-xl bg-dark border border-border mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan === "enterprise" ? "bg-accent/20" : plan === "pro" ? "bg-primary/20" : "bg-text-tertiary/20"
                            }`}>
                            <Crown className={`w-6 h-6 ${plan === "enterprise" ? "text-accent" : plan === "pro" ? "text-primary" : "text-text-tertiary"
                                }`} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg capitalize">{plan} Plan</p>
                            <p className="text-text-tertiary text-sm">
                                {subscription?.status === "active" ? "Active subscription" : "Free tier"}
                            </p>
                        </div>
                    </div>
                    {plan === "free" ? (
                        <Link href="/pricing">
                            <Button className="bg-primary hover:bg-primary/90 text-white">
                                Upgrade
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={onManageBilling}
                            disabled={isPortalLoading}
                        >
                            {isPortalLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <ExternalLink className="w-4 h-4 mr-2" />
                            )}
                            Manage Billing
                        </Button>
                    )}
                </div>

                {subscription?.current_period_end && plan !== "free" && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <p className="text-sm text-text-secondary">
                            Your subscription renews on{" "}
                            <span className="text-white font-medium">
                                {formatDate(subscription.current_period_end)}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Plan Comparison */}
            {plan === "free" && (
                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <h3 className="text-lg font-bold text-white mb-4">Why Upgrade?</h3>
                    <ul className="space-y-3">
                        {[
                            "100+ generations per day",
                            "HD 1080p resolution",
                            "Priority processing",
                            "All premium styles",
                            "Custom branding",
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-text-secondary">
                                <Zap className="w-4 h-4 text-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Link href="/pricing" className="block mt-6">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                            View Pricing Plans
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

// =============================================
// USAGE TAB
// =============================================

function UsageTab({
    totalGenerations,
    usage,
    limits,
    plan,
}: {
    totalGenerations: number;
    usage: UsageLimit | null;
    limits: { daily: number; monthly: number; resolution: string };
    plan: string;
}) {
    const usedToday = usage?.generations_count || 0;
    const dailyLimit = usage?.max_generations || limits.daily;
    const usagePercent = Math.min(100, (usedToday / dailyLimit) * 100);

    return (
        <div className="space-y-6">
            {/* Today's Usage */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Today's Usage
                </h2>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary">Generations used</span>
                        <span className="text-white font-bold">
                            {usedToday} / {dailyLimit}
                        </span>
                    </div>
                    <div className="h-4 bg-dark rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usagePercent}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${usagePercent >= 90
                                    ? "bg-red-500"
                                    : usagePercent >= 70
                                        ? "bg-yellow-500"
                                        : "bg-linear-to-r from-primary to-accent"
                                }`}
                        />
                    </div>
                </div>

                {usagePercent >= 80 && plan === "free" && (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between">
                        <span className="text-sm text-yellow-400">
                            Running low on daily generations
                        </span>
                        <Link href="/pricing">
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                                Upgrade
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="text-text-secondary text-sm">Total Generations</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalGenerations}</p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="text-text-secondary text-sm">Daily Limit</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{dailyLimit}</p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <Crown className="w-5 h-5 text-accent" />
                        <span className="text-text-secondary text-sm">Max Resolution</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{limits.resolution}</p>
                </div>
            </div>

            {/* Plan Limits */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
                <h3 className="text-lg font-bold text-white mb-4 capitalize">
                    {plan} Plan Limits
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-dark">
                        <p className="text-text-tertiary text-sm mb-1">Daily Limit</p>
                        <p className="text-white font-bold">{limits.daily} generations</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark">
                        <p className="text-text-tertiary text-sm mb-1">Monthly Limit</p>
                        <p className="text-white font-bold">
                            {limits.monthly === -1 ? "Unlimited" : `${limits.monthly} generations`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
