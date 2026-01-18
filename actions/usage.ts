"use server";

import { createClient } from "@/lib/supabase/server";
import type { UsageLimit, Subscription } from "@/types/database";

// Types for action responses
interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================
// GET CURRENT USAGE
// =============================================

interface UsageInfo {
    usage: UsageLimit;
    subscription: Subscription | null;
    remainingGenerations: number;
    percentUsed: number;
}

export async function getCurrentUsage(): Promise<ActionResponse<UsageInfo>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get or create today's usage
        const { data: usage, error: usageError } = await supabase.rpc(
            "get_or_create_daily_usage",
            { p_user_id: user.id }
        );

        if (usageError) {
            console.error("Get usage error:", usageError);
            return { success: false, error: "Failed to get usage info" };
        }

        // Get subscription
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .single();

        const remainingGenerations = Math.max(0, usage.max_generations - usage.generations_count);
        const percentUsed = usage.max_generations > 0
            ? Math.round((usage.generations_count / usage.max_generations) * 100)
            : 0;

        return {
            success: true,
            data: {
                usage,
                subscription,
                remainingGenerations,
                percentUsed,
            },
        };
    } catch (error) {
        console.error("Get current usage error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// CHECK IF CAN GENERATE
// =============================================

export async function canGenerate(): Promise<ActionResponse<boolean>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get current usage
        const { data: usage, error: usageError } = await supabase.rpc(
            "get_or_create_daily_usage",
            { p_user_id: user.id }
        );

        if (usageError) {
            console.error("Check usage error:", usageError);
            return { success: false, error: "Failed to check usage" };
        }

        const canGenerate = usage.generations_count < usage.max_generations;

        return { success: true, data: canGenerate };
    } catch (error) {
        console.error("Can generate error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// GET USAGE HISTORY (for analytics)
// =============================================

interface UsageHistoryItem {
    date: string;
    count: number;
}

export async function getUsageHistory(
    days: number = 30
): Promise<ActionResponse<UsageHistoryItem[]>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: usageRecords, error: fetchError } = await supabase
            .from("usage_limits")
            .select("period_start, generations_count")
            .eq("user_id", user.id)
            .eq("period_type", "daily")
            .gte("period_start", startDate.toISOString().split("T")[0])
            .order("period_start", { ascending: true });

        if (fetchError) {
            console.error("Fetch usage history error:", fetchError);
            return { success: false, error: "Failed to fetch usage history" };
        }

        const history: UsageHistoryItem[] = (usageRecords || []).map((record) => ({
            date: record.period_start,
            count: record.generations_count,
        }));

        return { success: true, data: history };
    } catch (error) {
        console.error("Get usage history error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// GET SUBSCRIPTION INFO
// =============================================

export async function getSubscription(): Promise<ActionResponse<Subscription | null>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: subscription, error: fetchError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            // PGRST116 = no rows returned
            console.error("Fetch subscription error:", fetchError);
            return { success: false, error: "Failed to fetch subscription" };
        }

        return { success: true, data: subscription };
    } catch (error) {
        console.error("Get subscription error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// GET PLAN LIMITS
// =============================================

export function getPlanLimits(plan: string = "free") {
    const limits = {
        free: {
            dailyGenerations: 5,
            monthlyGenerations: 50,
            maxImageSize: "1280x720",
            features: ["Basic styles", "Standard quality"],
        },
        pro: {
            dailyGenerations: 100,
            monthlyGenerations: 2000,
            maxImageSize: "1920x1080",
            features: ["All styles", "HD quality", "Priority processing", "Custom branding"],
        },
        enterprise: {
            dailyGenerations: 1000,
            monthlyGenerations: -1, // Unlimited
            maxImageSize: "3840x2160",
            features: ["All styles", "4K quality", "Priority processing", "Custom branding", "API access", "Dedicated support"],
        },
    };

    return limits[plan as keyof typeof limits] || limits.free;
}
