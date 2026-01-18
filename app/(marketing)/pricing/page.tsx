"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Star, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS, PricingPlan } from "@/lib/stripe/config";
import { createCheckoutSession } from "@/actions/stripe";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { FadeIn, SlideIn } from "@/components/ui/animated-container";

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const handleSubscribe = async (planId: string) => {
        if (planId === "free") return;

        if (!user) {
            router.push(`/login?redirectTo=/pricing`);
            return;
        }

        setLoadingPlan(planId);

        const result = await createCheckoutSession({
            planId: planId as "pro" | "enterprise",
            billingPeriod,
        });

        if (result.success && result.data?.url) {
            window.location.href = result.data.url;
        } else {
            alert(result.error || "Failed to start checkout");
            setLoadingPlan(null);
        }
    };

    const plans = Object.values(PRICING_PLANS);

    return (
        <div className="min-h-screen bg-darker pt-24 pb-20">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-125 h-125 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-100 h-100 bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <FadeIn>
                        <span className="text-primary text-sm font-bold uppercase tracking-widest mb-4 block">
                            Pricing
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold font-(family-name:--font-space-grotesk) text-white mb-6">
                            Simple, Transparent <span className="gradient-text">Pricing</span>
                        </h1>
                    </FadeIn>
                    <SlideIn delay={0.1}>
                        <p className="text-lg text-text-secondary">
                            Start free, upgrade when you're ready. No hidden fees.
                        </p>
                    </SlideIn>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex items-center gap-4 p-1 bg-surface rounded-full border border-border">
                        <button
                            onClick={() => setBillingPeriod("monthly")}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === "monthly"
                                ? "bg-primary text-white"
                                : "text-text-secondary hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod("yearly")}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingPeriod === "yearly"
                                ? "bg-primary text-white"
                                : "text-text-secondary hover:text-white"
                                }`}
                        >
                            Yearly
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            billingPeriod={billingPeriod}
                            isLoading={loadingPlan === plan.id}
                            onSubscribe={() => handleSubscribe(plan.id)}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                {/* FAQ or Trust Signals */}
                <div className="mt-20 text-center">
                    <p className="text-text-tertiary text-sm">
                        All plans include a 7-day money-back guarantee. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}

// =============================================
// PRICING CARD COMPONENT
// =============================================

interface PricingCardProps {
    plan: PricingPlan;
    billingPeriod: "monthly" | "yearly";
    isLoading: boolean;
    onSubscribe: () => void;
    delay: number;
}

function PricingCard({ plan, billingPeriod, isLoading, onSubscribe, delay }: PricingCardProps) {
    const price = plan.price[billingPeriod];
    const isPopular = plan.popular;
    const isFree = plan.id === "free";

    const icons: Record<string, React.ReactNode> = {
        free: <Zap className="w-6 h-6" />,
        pro: <Star className="w-6 h-6" />,
        enterprise: <Building2 className="w-6 h-6" />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={`relative rounded-3xl p-8 ${isPopular
                ? "bg-linear-to-b from-primary/20 to-surface border-2 border-primary"
                : "bg-surface border border-border"
                }`}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-white text-sm font-bold">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isPopular ? "bg-primary text-white" : "bg-dark text-primary"
                    }`}>
                    {icons[plan.id]}
                </div>
                <h3 className="text-2xl font-bold text-white font-(family-name:--font-space-grotesk)">
                    {plan.name}
                </h3>
                <p className="text-text-tertiary text-sm mt-1">
                    {plan.description}
                </p>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                        ${price}
                    </span>
                    {!isFree && (
                        <span className="text-text-tertiary">
                            /{billingPeriod === "monthly" ? "mo" : "yr"}
                        </span>
                    )}
                </div>
                {billingPeriod === "yearly" && !isFree && (
                    <p className="text-green-400 text-sm mt-1">
                        Save ${plan.price.monthly * 12 - plan.price.yearly}/year
                    </p>
                )}
            </div>

            <Button
                onClick={onSubscribe}
                disabled={isLoading}
                className={`w-full mb-8 ${isPopular
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : isFree
                        ? "bg-surface border border-border hover:bg-dark text-white"
                        : "bg-dark border border-border hover:border-primary text-white"
                    }`}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isFree ? "Get Started Free" : "Subscribe"}
            </Button>

            <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className={`w-5 h-5 shrink-0 ${isPopular ? "text-primary" : "text-green-500"}`} />
                        <span className="text-text-secondary">{feature}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
