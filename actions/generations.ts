"use server";

/**
 * Generation Management Server Actions
 * 
 * SECURITY MEASURES:
 * - Rate limiting on all actions
 * - Input validation with Zod schemas
 * - User authentication required
 * - RLS policies ensure data isolation
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ThumbnailGeneration } from "@/types/database";
import { checkRateLimit, rateLimitExceededError } from "@/lib/security/rate-limit";
import { validateInput, uuidSchema } from "@/lib/security/validation";
import { z } from "zod";

// Types for action responses
interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    retryAfter?: number;
}

// =============================================
// VALIDATION SCHEMAS
// =============================================

const createGenerationSchema = z.object({
    prompt: z.string().min(1).max(2000),
    style: z.string().max(50).optional(),
}).strict();

const updateGenerationSchema = z.object({
    generationId: uuidSchema,
    imageUrls: z.array(z.string().url()).max(10).optional(),
    status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
    errorMessage: z.string().max(500).optional(),
}).strict();

// =============================================
// CREATE GENERATION
// =============================================

interface CreateGenerationInput {
    prompt: string;
    style?: string;
}

export async function createGeneration(
    input: CreateGenerationInput
): Promise<ActionResponse<ThumbnailGeneration>> {
    try {
        const supabase = await createClient();

        // SECURITY: Authentication required
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // SECURITY: Rate limiting
        const rateLimitResult = checkRateLimit("default", user.id);
        if (!rateLimitResult.success) {
            return rateLimitExceededError(rateLimitResult);
        }

        // SECURITY: Input validation
        const validation = validateInput(createGenerationSchema, input);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const validatedInput = validation.data!;

        // Check usage limit
        const { data: canGenerate, error: usageError } = await supabase.rpc(
            "increment_usage",
            { p_user_id: user.id }
        );

        if (usageError) {
            console.error("Usage check error:", usageError);
            return { success: false, error: "Failed to check usage limits" };
        }

        if (!canGenerate) {
            return { success: false, error: "Daily generation limit reached. Upgrade for more!" };
        }

        // Create generation record
        const { data: generation, error: insertError } = await supabase
            .from("thumbnail_generations")
            .insert({
                user_id: user.id,
                prompt: validatedInput.prompt,
                style: validatedInput.style || null,
                status: "pending",
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return { success: false, error: "Failed to create generation" };
        }

        revalidatePath("/dashboard");
        revalidatePath("/generate");

        return { success: true, data: generation };
    } catch (error) {
        console.error("Create generation error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// UPDATE GENERATION (for AI completion)
// =============================================

interface UpdateGenerationInput {
    generationId: string;
    imageUrls?: string[];
    status?: ThumbnailGeneration["status"];
    errorMessage?: string;
}

export async function updateGeneration(
    input: UpdateGenerationInput
): Promise<ActionResponse<ThumbnailGeneration>> {
    try {
        const supabase = await createClient();

        // SECURITY: Authentication required
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // SECURITY: Input validation
        const validation = validateInput(updateGenerationSchema, input);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const validatedInput = validation.data!;

        // Update generation (RLS ensures user can only update their own)
        const { data: generation, error: updateError } = await supabase
            .from("thumbnail_generations")
            .update({
                image_urls: validatedInput.imageUrls,
                status: validatedInput.status,
                error_message: validatedInput.errorMessage,
            })
            .eq("id", validatedInput.generationId)
            .eq("user_id", user.id)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
            return { success: false, error: "Failed to update generation" };
        }

        revalidatePath("/dashboard");
        revalidatePath("/generate");

        return { success: true, data: generation };
    } catch (error) {
        console.error("Update generation error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// SELECT THUMBNAIL
// =============================================

export async function selectThumbnail(
    generationId: string,
    imageUrl: string
): Promise<ActionResponse<ThumbnailGeneration>> {
    try {
        const supabase = await createClient();

        // SECURITY: Authentication required
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // SECURITY: Input validation
        const idValidation = validateInput(uuidSchema, generationId);
        if (!idValidation.success) {
            return { success: false, error: "Invalid generation ID" };
        }

        const urlValidation = validateInput(z.string().url().max(500), imageUrl);
        if (!urlValidation.success) {
            return { success: false, error: "Invalid image URL" };
        }

        const { data: generation, error: updateError } = await supabase
            .from("thumbnail_generations")
            .update({ selected_image_url: urlValidation.data })
            .eq("id", idValidation.data)
            .eq("user_id", user.id)
            .select()
            .single();

        if (updateError) {
            console.error("Select thumbnail error:", updateError);
            return { success: false, error: "Failed to select thumbnail" };
        }

        revalidatePath("/dashboard");

        return { success: true, data: generation };
    } catch (error) {
        console.error("Select thumbnail error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

// =============================================
// DELETE GENERATION
// =============================================

export async function deleteGeneration(
    generationId: string
): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        // SECURITY: Authentication required
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // SECURITY: Rate limiting (prevent mass deletion abuse)
        const rateLimitResult = checkRateLimit("default", user.id);
        if (!rateLimitResult.success) {
            return rateLimitExceededError(rateLimitResult);
        }

        // SECURITY: Input validation
        const validation = validateInput(uuidSchema, generationId);
        if (!validation.success) {
            return { success: false, error: "Invalid generation ID" };
        }

        const { error: deleteError } = await supabase
            .from("thumbnail_generations")
            .delete()
            .eq("id", validation.data)
            .eq("user_id", user.id);

        if (deleteError) {
            console.error("Delete error:", deleteError);
            return { success: false, error: "Failed to delete generation" };
        }

        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Delete generation error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
