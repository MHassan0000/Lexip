"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ThumbnailGeneration } from "@/types/database";

// Types for action responses
interface ActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

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
                prompt: input.prompt,
                style: input.style || null,
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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        // Update generation (RLS ensures user can only update their own)
        const { data: generation, error: updateError } = await supabase
            .from("thumbnail_generations")
            .update({
                image_urls: input.imageUrls,
                status: input.status,
                error_message: input.errorMessage,
            })
            .eq("id", input.generationId)
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: generation, error: updateError } = await supabase
            .from("thumbnail_generations")
            .update({ selected_image_url: imageUrl })
            .eq("id", generationId)
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Unauthorized" };
        }

        const { error: deleteError } = await supabase
            .from("thumbnail_generations")
            .delete()
            .eq("id", generationId)
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
