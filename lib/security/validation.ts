/**
 * Input Validation Schemas
 * 
 * OWASP Best Practice: Validate all user inputs on the server-side.
 * Uses Zod for schema-based validation with type inference.
 * 
 * Security measures implemented:
 * - String length limits to prevent memory exhaustion
 * - Type checking to prevent type confusion attacks
 * - Enum validation for known values
 * - Sanitization of dangerous characters
 */

import { z } from "zod";
import { STYLE_PRESETS } from "@/lib/ai/types";

// =============================================
// SANITIZATION HELPERS
// =============================================

/**
 * Sanitize a string by removing potentially dangerous characters
 * while preserving normal text content.
 */
export function sanitizeString(input: string): string {
    return input
        // Remove null bytes (can cause issues in C-based systems)
        .replace(/\0/g, '')
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Trim whitespace
        .trim();
}

/**
 * Sanitize HTML to prevent XSS attacks
 * For prompts, we want to strip all HTML tags
 */
export function stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

// =============================================
// VALIDATION SCHEMAS
// =============================================

// Valid style IDs from our presets
const validStyleIds = STYLE_PRESETS.map(s => s.id);

/**
 * Schema for thumbnail generation input
 * 
 * Security constraints:
 * - prompt: max 2000 chars (reasonable for AI prompts)
 * - styleId: must be from predefined list
 * - count: 1-4 images max
 * - referenceImage: validated base64 with size limit
 */
export const generateInputSchema = z.object({
    prompt: z
        .string()
        .min(1, "Prompt is required")
        .max(2000, "Prompt must be 2000 characters or less")
        .transform(val => sanitizeString(stripHtml(val))),

    styleId: z
        .string()
        .optional()
        .refine(
            val => !val || validStyleIds.includes(val),
            "Invalid style ID"
        ),

    count: z
        .number()
        .int()
        .min(1)
        .max(4)
        .optional()
        .default(1),

    referenceImage: z
        .object({
            base64: z
                .string()
                .max(15 * 1024 * 1024, "Image must be under 10MB") // Base64 is ~33% larger
                .refine(
                    val => /^[A-Za-z0-9+/=]+$/.test(val),
                    "Invalid base64 data"
                ),
            mimeType: z
                .string()
                .refine(
                    val => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(val),
                    "Invalid image type. Allowed: JPEG, PNG, GIF, WebP"
                ),
        })
        .optional(),
}).strict(); // Reject any unexpected fields

export type ValidatedGenerateInput = z.infer<typeof generateInputSchema>;

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
    page: z.number().int().min(1).max(1000).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
}).strict();

export type ValidatedPagination = z.infer<typeof paginationSchema>;

/**
 * Schema for UUID parameters
 */
export const uuidSchema = z
    .string()
    .uuid("Invalid ID format");

/**
 * Schema for profile update
 */
export const profileUpdateSchema = z.object({
    fullName: z
        .string()
        .min(1)
        .max(100)
        .transform(sanitizeString)
        .optional(),
    avatarUrl: z
        .string()
        .url("Invalid URL format")
        .max(500)
        .optional(),
}).strict();

export type ValidatedProfileUpdate = z.infer<typeof profileUpdateSchema>;

// =============================================
// VALIDATION HELPER
// =============================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Validate input against a schema and return a standardized result
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    input: unknown
): ValidationResult<T> {
    try {
        const data = schema.parse(input);
        return { success: true, data };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return first error message for user-friendly feedback
            const firstError = error.errors[0];
            const path = firstError.path.join('.');
            const message = path
                ? `${path}: ${firstError.message}`
                : firstError.message;

            return { success: false, error: message };
        }
        return { success: false, error: "Validation failed" };
    }
}
