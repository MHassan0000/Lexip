"use server";

import { createClient } from "@/lib/supabase/server";
import type { ThumbnailGeneration } from "@/types/database";

// Types for action responses
interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// =============================================
// GET GENERATION HISTORY
// =============================================

interface GetHistoryInput {
    page?: number;
    pageSize?: number;
    status?: ThumbnailGeneration["status"];
}

export async function getGenerationHistory(
    input: GetHistoryInput = {}
): Promise<ActionResponse<PaginatedResponse<ThumbnailGeneration>>> {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const page = input.page || 1;
        const pageSize = input.pageSize || 10;
        const offset = (page - 1) * pageSize;

        // Build query
        let query = supabase
            .from("thumbnail_generations")
            .select("*", { count: "exact" })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + pageSize - 1);

        // Filter by status if provided
        if (input.status) {
            query = query.eq("status", input.status);
        }

        const { data: generations, count, error: fetchError } = await query;

        if (fetchError) {
            console.error("Fetch history error:", fetchError);
            return { success: false, error: "Failed to fetch generation history" };
        }

        return {
            success: true,
            data: {
                items: generations || [],
                total: count || 0,
                page,
                pageSize,
                hasMore: (count || 0) > offset + pageSize,
            },
        };
    } catch (error) {
        console.error("Get history error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// GET SINGLE GENERATION
// =============================================

export async function getGeneration(
    generationId: string
): Promise<ActionResponse<ThumbnailGeneration>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: generation, error: fetchError } = await supabase
            .from("thumbnail_generations")
            .select("*")
            .eq("id", generationId)
            .eq("user_id", user.id)
            .single();

        if (fetchError) {
            console.error("Fetch generation error:", fetchError);
            return { success: false, error: "Generation not found" };
        }

        return { success: true, data: generation };
    } catch (error) {
        console.error("Get generation error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// GET RECENT GENERATIONS (for dashboard)
// =============================================

export async function getRecentGenerations(
    limit: number = 5
): Promise<ActionResponse<ThumbnailGeneration[]>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: generations, error: fetchError } = await supabase
            .from("thumbnail_generations")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (fetchError) {
            console.error("Fetch recent error:", fetchError);
            return { success: false, error: "Failed to fetch recent generations" };
        }

        return { success: true, data: generations || [] };
    } catch (error) {
        console.error("Get recent error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// GET GENERATION STATS
// =============================================

interface GenerationStats {
    totalGenerations: number;
    completedGenerations: number;
    thisMonthGenerations: number;
}

export async function getGenerationStats(): Promise<ActionResponse<GenerationStats>> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get total count
        const { count: totalGenerations } = await supabase
            .from("thumbnail_generations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        // Get completed count
        const { count: completedGenerations } = await supabase
            .from("thumbnail_generations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "completed");

        // Get this month count
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: thisMonthGenerations } = await supabase
            .from("thumbnail_generations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", startOfMonth.toISOString());

        return {
            success: true,
            data: {
                totalGenerations: totalGenerations || 0,
                completedGenerations: completedGenerations || 0,
                thisMonthGenerations: thisMonthGenerations || 0,
            },
        };
    } catch (error) {
        console.error("Get stats error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
