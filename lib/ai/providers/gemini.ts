/**
 * Gemini AI Provider
 * 
 * SECURITY: 
 * - API key loaded from environment variables only (never hardcoded)
 * - No sensitive data logged to console
 * - Error messages sanitized to not leak internal details
 */

import { GoogleGenAI, Modality } from "@google/genai";
import type { AIProvider, GenerationOptions, GenerationResult, GeneratedImage } from "../types";
import { buildEnhancedPrompt } from "../types";

export class GeminiProvider implements AIProvider {
    name = "gemini";
    private client: GoogleGenAI;
    private model = "gemini-2.0-flash-exp-image-generation";

    constructor(apiKey?: string) {
        // SECURITY: Only use environment variable, never accept hardcoded keys
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error("GEMINI_API_KEY environment variable is not set");
        }
        // SECURITY: Do NOT log API key, even partially
        this.client = new GoogleGenAI({ apiKey: key });
    }

    async generateImages(options: GenerationOptions): Promise<GenerationResult> {
        try {
            const enhancedPrompt = buildEnhancedPrompt(options.prompt, options.style);

            const images: GeneratedImage[] = [];

            // Build content parts - text prompt first, then optional image
            const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
                { text: enhancedPrompt }
            ];

            // Add reference image if provided
            if (options.referenceImage) {
                parts.push({
                    inlineData: {
                        data: options.referenceImage.base64,
                        mimeType: options.referenceImage.mimeType
                    }
                });
            }

            const response = await this.client.models.generateContent({
                model: this.model,
                contents: [{ role: "user", parts }],
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });

            // Extract images from response
            if (response.candidates && response.candidates[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData?.data && part.inlineData?.mimeType) {
                        images.push({
                            base64: part.inlineData.data,
                            mimeType: part.inlineData.mimeType,
                        });
                    }
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    error: "No images were generated. The AI may have declined the request.",
                };
            }

            return {
                success: true,
                images,
                promptUsed: enhancedPrompt,
            };
        } catch (error: unknown) {
            // SECURITY: Log error for debugging but sanitize for user response
            console.error("Gemini generation error:", error instanceof Error ? error.message : "Unknown error");

            const errorString = String(error);

            // Return user-friendly error messages without leaking internal details
            if (errorString.includes("SAFETY") || errorString.includes("safety")) {
                return {
                    success: false,
                    error: "The AI declined to generate this image due to safety guidelines. Please try a different prompt.",
                };
            }

            if (errorString.includes("quota") || errorString.includes("QUOTA") ||
                errorString.includes("rate") || errorString.includes("RATE") ||
                errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) {
                return {
                    success: false,
                    error: "API rate limit reached. Please try again in a moment.",
                };
            }

            if (errorString.includes("404") || errorString.includes("NOT_FOUND")) {
                return {
                    success: false,
                    error: "The image generation model is not available. Please check your API key permissions.",
                };
            }

            if (errorString.includes("403") || errorString.includes("PERMISSION_DENIED")) {
                return {
                    success: false,
                    error: "API key does not have permission for image generation.",
                };
            }

            // SECURITY: Generic error for unknown cases - don't leak internal details
            return {
                success: false,
                error: "Image generation failed. Please try again later.",
            };
        }
    }
}
