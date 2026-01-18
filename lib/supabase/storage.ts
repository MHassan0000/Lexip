import { createClient } from "@supabase/supabase-js";

// Use service role for storage operations (server-side only)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

const BUCKET_NAME = "thumbnails";

export interface UploadResult {
    success: boolean;
    url?: string;
    path?: string;
    error?: string;
}

/**
 * Upload a base64 image to Supabase Storage
 */
export async function uploadBase64Image(
    base64Data: string,
    mimeType: string,
    userId: string,
    generationId: string,
    index: number = 0
): Promise<UploadResult> {
    try {
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, "base64");

        // Determine file extension from mime type
        const extension = mimeType.split("/")[1] || "png";

        // Create unique file path
        const fileName = `${generationId}_${index}.${extension}`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, buffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            console.error("Storage upload error:", error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            success: true,
            url: urlData.publicUrl,
            path: data.path,
        };
    } catch (error) {
        console.error("Upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
}

/**
 * Upload multiple base64 images
 */
export async function uploadMultipleImages(
    images: Array<{ base64: string; mimeType: string }>,
    userId: string,
    generationId: string
): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
        const result = await uploadBase64Image(
            images[i].base64,
            images[i].mimeType,
            userId,
            generationId,
            i
        );

        if (result.success && result.url) {
            urls.push(result.url);
        }
    }

    return urls;
}

/**
 * Delete images for a generation
 */
export async function deleteGenerationImages(
    userId: string,
    generationId: string
): Promise<boolean> {
    try {
        const { data: files } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .list(userId, {
                search: generationId,
            });

        if (files && files.length > 0) {
            const filePaths = files.map(f => `${userId}/${f.name}`);
            await supabaseAdmin.storage.from(BUCKET_NAME).remove(filePaths);
        }

        return true;
    } catch (error) {
        console.error("Delete images error:", error);
        return false;
    }
}
