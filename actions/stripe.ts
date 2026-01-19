"use server";

import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { PRICING_PLANS } from "@/lib/stripe/config";
import { checkRateLimit, rateLimitExceededError } from "@/lib/security/rate-limit";
import { validateInput } from "@/lib/security/validation";
import { z } from "zod";

interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    retryAfter?: number;
}

const checkoutInputSchema = z.object({
    planId: z.enum(["pro", "enterprise"]),
    billingPeriod: z.enum(["monthly", "yearly"]),
    successUrl: z.string().url().max(500).optional(),
    cancelUrl: z.string().url().max(500).optional(),
}).strict();

const urlSchema = z.string().url().max(500);

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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const rateLimitResult = checkRateLimit("default", user.id);
        if (!rateLimitResult.success) {
            return rateLimitExceededError(rateLimitResult);
        }

        const validation = validateInput(checkoutInputSchema, input);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const validatedInput = validation.data!;

        const plan = PRICING_PLANS[validatedInput.planId];
        if (!plan) {
            return { success: false, error: "Invalid plan" };
        }

        const priceId = plan.stripePriceId[validatedInput.billingPeriod];
        const isPlaceholder = !priceId || priceId.includes("_pro_") || priceId.includes("_enterprise_");
        if (isPlaceholder) {
            return { success: false, error: "Stripe price not configured." };
        }

        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .single();

        let customerId = subscription?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;

            await supabase
                .from("subscriptions")
                .update({ stripe_customer_id: customerId })
                .eq("user_id", user.id);
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: validatedInput.successUrl || `${appUrl}/dashboard?upgrade=success`,
            cancel_url: validatedInput.cancelUrl || `${appUrl}/pricing?upgrade=cancelled`,
            metadata: {
                supabase_user_id: user.id,
                plan_id: validatedInput.planId,
            },
            subscription_data: {
                metadata: {
                    supabase_user_id: user.id,
                    plan_id: validatedInput.planId,
                },
            },
        });

        if (!session.url) {
            return { success: false, error: "Failed to create checkout session" };
        }

        return { success: true, data: { url: session.url } };
    } catch {
        return { success: false, error: "Failed to create checkout session" };
    }
}

export async function createCustomerPortalSession(
    returnUrl?: string
): Promise<ActionResponse<{ url: string }>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const rateLimitResult = checkRateLimit("default", user.id);
        if (!rateLimitResult.success) {
            return rateLimitExceededError(rateLimitResult);
        }

        if (returnUrl) {
            const urlValidation = validateInput(urlSchema, returnUrl);
            if (!urlValidation.success) {
                return { success: false, error: "Invalid return URL" };
            }
        }

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
    } catch {
        return { success: false, error: "Failed to create portal session" };
    }
}

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
    } catch {
        return { success: false, error: "Failed to get customer" };
    }
}
