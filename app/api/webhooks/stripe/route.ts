import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { getPlanByPriceId } from "@/lib/stripe/config";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;
        }
        return NextResponse.json({ received: true });
    } catch {
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.supabase_user_id;
    const planId = session.metadata?.plan_id;

    if (!userId) return;

    if (session.subscription && session.customer) {
        await supabaseAdmin
            .from("subscriptions")
            .update({
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                plan: planId || "pro",
                status: "active",
            })
            .eq("user_id", userId);

        await supabaseAdmin.rpc("get_or_create_daily_usage", { p_user_id: userId });
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    let userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
        const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscription.id)
            .single();

        if (!sub) return;
        userId = sub.user_id;
    }

    const priceId = subscription.items.data[0]?.price?.id;
    const plan = priceId ? getPlanByPriceId(priceId) : null;

    const statusMap: Record<string, string> = {
        active: "active",
        past_due: "past_due",
        canceled: "canceled",
        trialing: "trialing",
        incomplete: "past_due",
        incomplete_expired: "canceled",
        unpaid: "past_due",
    };

    const subData = subscription as unknown as { current_period_start?: number; current_period_end?: number };
    const periodStart = subData.current_period_start
        ? new Date(subData.current_period_start * 1000).toISOString()
        : null;
    const periodEnd = subData.current_period_end
        ? new Date(subData.current_period_end * 1000).toISOString()
        : null;

    await supabaseAdmin
        .from("subscriptions")
        .update({
            plan: plan?.id || "pro",
            status: statusMap[subscription.status] || "active",
            stripe_subscription_id: subscription.id,
            current_period_start: periodStart,
            current_period_end: periodEnd,
        })
        .eq("stripe_subscription_id", subscription.id);

    await supabaseAdmin.rpc("get_or_create_daily_usage", { p_user_id: userId });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

    await supabaseAdmin
        .from("subscriptions")
        .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null,
        })
        .eq("stripe_subscription_id", subscription.id);

    if (sub?.user_id) {
        await supabaseAdmin.rpc("get_or_create_daily_usage", { p_user_id: sub.user_id });
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const invoiceData = invoice as unknown as { subscription?: string };
    const subscriptionId = invoiceData.subscription;
    if (!subscriptionId) return;

    await supabaseAdmin
        .from("subscriptions")
        .update({ status: "active" })
        .eq("stripe_subscription_id", subscriptionId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const invoiceData = invoice as unknown as { subscription?: string };
    const subscriptionId = invoiceData.subscription;
    if (!subscriptionId) return;

    await supabaseAdmin
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_subscription_id", subscriptionId);
}
