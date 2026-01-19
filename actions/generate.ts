"use server";

/**
 * Generate Thumbnail Server Action
 * 
 * SECURITY MEASURES:
 * - Rate limiting (10 requests/minute per user)
 * - Input validation with Zod schema
 * - User authentication required
 * - Usage limits from subscription plan
 */

import { createClient } from "@/lib/supabase/server";
import { getAIProvider, getStyleById } from "@/lib/ai";
import { uploadMultipleImages } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import type { ThumbnailGeneration } from "@/types/database";
import { checkRateLimit, rateLimitExceededError } from "@/lib/security/rate-limit";
import { validateInput, generateInputSchema } from "@/lib/security/validation";

interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    retryAfter?: number; // For rate limit 429 responses
}

// =============================================
// GENERATE THUMBNAIL
// =============================================

interface GenerateInput {
    prompt: string;
    styleId?: string;
    count?: number;
    referenceImage?: {
        base64: string;
        mimeType: string;
    };
}

export async function generateThumbnail(
    input: GenerateInput
): Promise<ActionResponse<ThumbnailGeneration>> {
    try {
        const supabase = await createClient();

        // SECURITY: Get current user (authentication required)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // SECURITY: Rate limiting - 10 requests per minute per user
        const rateLimitResult = checkRateLimit("generate", user.id);
        if (!rateLimitResult.success) {
            return rateLimitExceededError(rateLimitResult);
        }

        // SECURITY: Validate and sanitize input
        const validation = validateInput(generateInputSchema, input);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const validatedInput = validation.data!;

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
        const style = validatedInput.styleId ? getStyleById(validatedInput.styleId) : undefined;

        // Create initial generation record
        const { data: generation, error: insertError } = await supabase
            .from("thumbnail_generations")
            .insert({
                user_id: user.id,
                prompt: validatedInput.prompt,
                style: validatedInput.styleId || null,
                status: "processing",
                metadata: {
                    style_name: style?.name,
                    requested_count: validatedInput.count || 1,
                },
            })
            .select()
            .single();

        if (insertError || !generation) {
            console.error("Insert error:", insertError);
            return { success: false, error: "Failed to create generation record" };
        }

        // Generate images using AI (auto-selects Together.ai or Gemini based on env)
        const provider = getAIProvider();
        const result = await provider.generateImages({
            prompt: validatedInput.prompt,
            style,
            count: validatedInput.count || 1,
            referenceImage: validatedInput.referenceImage,
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
