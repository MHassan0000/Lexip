"use server";

import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { PRICING_PLANS } from "@/lib/stripe/config";

interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================
// CREATE CHECKOUT SESSION
// =============================================

interface CreateCheckoutInput {
    planId: "pro" | "enterprise";
    billingPeriod: "monthly" | "yearly";
    successUrl?: string;
    cancelUrl?: string;
}

export async function createCheckoutSession(
    input: CreateCheckoutInput
): Promise<ActionResponse<{ url: string }>> {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get plan
        const plan = PRICING_PLANS[input.planId];
        if (!plan) {
            return { success: false, error: "Invalid plan" };
        }

        const priceId = plan.stripePriceId[input.billingPeriod];
        if (!priceId || priceId.startsWith("price_")) {
            return { success: false, error: "Stripe price not configured. Please set up Stripe price IDs." };
        }

        // Get or create Stripe customer
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .single();

        let customerId = subscription?.stripe_customer_id;

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            });
            customerId = customer.id;

            // Save customer ID
            await supabase
                .from("subscriptions")
                .update({ stripe_customer_id: customerId })
                .eq("user_id", user.id);
        }

        // Create checkout session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: input.successUrl || `${appUrl}/dashboard?upgrade=success`,
            cancel_url: input.cancelUrl || `${appUrl}/pricing?upgrade=cancelled`,
            metadata: {
                supabase_user_id: user.id,
                plan_id: input.planId,
            },
            subscription_data: {
                metadata: {
                    supabase_user_id: user.id,
                    plan_id: input.planId,
                },
            },
        });

        if (!session.url) {
            return { success: false, error: "Failed to create checkout session" };
        }

        return { success: true, data: { url: session.url } };
    } catch (error) {
        console.error("Create checkout error:", error);
        return { success: false, error: "Failed to create checkout session" };
    }
}

// =============================================
// CREATE CUSTOMER PORTAL SESSION
// =============================================

export async function createCustomerPortalSession(
    returnUrl?: string
): Promise<ActionResponse<{ url: string }>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get Stripe customer ID
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .single();

        if (!subscription?.stripe_customer_id) {
            return { success: false, error: "No billing account found" };
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: returnUrl || `${appUrl}/dashboard`,
        });

        return { success: true, data: { url: session.url } };
    } catch (error) {
        console.error("Create portal error:", error);
        return { success: false, error: "Failed to create portal session" };
    }
}

// =============================================
// GET STRIPE CUSTOMER
// =============================================

export async function getStripeCustomer(): Promise<ActionResponse<{ customerId: string | null }>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .single();

        return { success: true, data: { customerId: subscription?.stripe_customer_id || null } };
    } catch (error) {
        console.error("Get customer error:", error);
        return { success: false, error: "Failed to get customer" };
    }
}
