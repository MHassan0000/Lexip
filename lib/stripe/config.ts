// Stripe pricing configuration
// Update these IDs with your actual Stripe Price IDs from your Stripe Dashboard

export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    stripePriceId: {
        monthly: string;
        yearly: string;
    };
    features: string[];
    limits: {
        dailyGenerations: number;
        monthlyGenerations: number;
        maxResolution: string;
    };
    popular?: boolean;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
    free: {
        id: "free",
        name: "Free",
        description: "Perfect for trying out Lexip",
        price: {
            monthly: 0,
            yearly: 0,
        },
        stripePriceId: {
            monthly: "", // Free plan has no Stripe price
            yearly: "",
        },
        features: [
            "5 generations per day",
            "Basic styles",
            "720p resolution",
            "Community support",
        ],
        limits: {
            dailyGenerations: 5,
            monthlyGenerations: 50,
            maxResolution: "1280x720",
        },
    },
    pro: {
        id: "pro",
        name: "Pro",
        description: "For serious content creators",
        price: {
            monthly: 19,
            yearly: 190, // ~17% discount
        },
        stripePriceId: {
            // Replace with your actual Stripe Price IDs
            monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
            yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
        },
        features: [
            "100 generations per day",
            "All premium styles",
            "1080p HD resolution",
            "Priority processing",
            "Custom branding",
            "Email support",
        ],
        limits: {
            dailyGenerations: 100,
            monthlyGenerations: 2000,
            maxResolution: "1920x1080",
        },
        popular: true,
    },
    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        description: "For teams and agencies",
        price: {
            monthly: 99,
            yearly: 990, // ~17% discount
        },
        stripePriceId: {
            // Replace with your actual Stripe Price IDs
            monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
            yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_enterprise_yearly",
        },
        features: [
            "Unlimited generations",
            "All premium styles",
            "4K resolution",
            "Priority processing",
            "Custom branding",
            "API access",
            "Dedicated support",
            "Team collaboration",
        ],
        limits: {
            dailyGenerations: 1000,
            monthlyGenerations: -1, // Unlimited
            maxResolution: "3840x2160",
        },
    },
};

export function getPlanByPriceId(priceId: string): PricingPlan | null {
    for (const plan of Object.values(PRICING_PLANS)) {
        if (
            plan.stripePriceId.monthly === priceId ||
            plan.stripePriceId.yearly === priceId
        ) {
            return plan;
        }
    }
    return null;
}

export function getPlanById(planId: string): PricingPlan | null {
    return PRICING_PLANS[planId] || null;
}
