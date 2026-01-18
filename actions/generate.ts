"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider, getStyleById } from "@/lib/ai";
import { uploadMultipleImages } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import type { ThumbnailGeneration } from "@/types/database";

interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================
// GENERATE THUMBNAIL
// =============================================

interface GenerateInput {
    prompt: string;
    styleId?: string;
    count?: number;
}

export async function generateThumbnail(
    input: GenerateInput
): Promise<ActionResponse<ThumbnailGeneration>> {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Check usage limit first (without incrementing)
        const { data: usage, error: usageError } = await supabase.rpc(
            "get_or_create_daily_usage",
            { p_user_id: user.id }
        );

        if (usageError) {
            console.error("Usage check error:", usageError);
            return { success: false, error: "Failed to check usage limits" };
        }

        // Check if user has remaining generations
        if (usage.generations_count >= usage.max_generations) {
            return {
                success: false,
                error: "Daily generation limit reached. Upgrade your plan for more generations!"
            };
        }

        // Get style preset if provided
        const style = input.styleId ? getStyleById(input.styleId) : undefined;

        // Create initial generation record
        const { data: generation, error: insertError } = await supabase
            .from("thumbnail_generations")
            .insert({
                user_id: user.id,
                prompt: input.prompt,
                style: input.styleId || null,
                status: "processing",
                metadata: {
                    style_name: style?.name,
                    requested_count: input.count || 1,
                },
            })
            .select()
            .single();

        if (insertError || !generation) {
            console.error("Insert error:", insertError);
            return { success: false, error: "Failed to create generation record" };
        }

        // Generate images using AI
        const provider = getAIProvider("gemini");
        const result = await provider.generateImages({
            prompt: input.prompt,
            style,
            count: input.count || 1,
        });

        if (!result.success || !result.images || result.images.length === 0) {
            // Update generation as failed - DO NOT increment usage
            await supabase
                .from("thumbnail_generations")
                .update({
                    status: "failed",
                    error_message: result.error || "No images generated",
                })
                .eq("id", generation.id);

            return { success: false, error: result.error || "Failed to generate images" };
        }

        // Upload images to Supabase Storage
        const imageUrls = await uploadMultipleImages(
            result.images.map(img => ({
                base64: img.base64,
                mimeType: img.mimeType,
            })),
            user.id,
            generation.id
        );

        if (imageUrls.length === 0) {
            await supabase
                .from("thumbnail_generations")
                .update({
                    status: "failed",
                    error_message: "Failed to upload images",
                })
                .eq("id", generation.id);

            return { success: false, error: "Failed to upload generated images" };
        }

        // SUCCESS! Now increment usage count
        await supabase.rpc("increment_usage", { p_user_id: user.id });

        // Update generation with image URLs
        const { data: updatedGeneration, error: updateError } = await supabase
            .from("thumbnail_generations")
            .update({
                status: "completed",
                image_urls: imageUrls,
                metadata: {
                    ...generation.metadata,
                    prompt_used: result.promptUsed,
                    images_generated: imageUrls.length,
                },
            })
            .eq("id", generation.id)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
        }

        revalidatePath("/dashboard");
        revalidatePath("/generate");

        return {
            success: true,
            data: updatedGeneration || generation
        };
    } catch (error) {
        console.error("Generate thumbnail error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// =============================================
// GET USAGE INFO FOR UI
// =============================================

interface UsageInfo {
    used: number;
    limit: number;
    remaining: number;
    plan: string;
}

export async function getUsageInfo(): Promise<ActionResponse<UsageInfo>> {
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
            console.error("Get usage error:", usageError);
            return { success: false, error: "Failed to get usage info" };
        }

        // Get subscription plan
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("plan")
            .eq("user_id", user.id)
            .single();

        return {
            success: true,
            data: {
                used: usage.generations_count,
                limit: usage.max_generations,
                remaining: Math.max(0, usage.max_generations - usage.generations_count),
                plan: subscription?.plan || "free",
            },
        };
    } catch (error) {
        console.error("Get usage info error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
