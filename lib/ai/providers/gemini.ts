import { GoogleGenAI, Modality } from "@google/genai";
import type { AIProvider, GenerationOptions, GenerationResult, GeneratedImage } from "../types";
import { buildEnhancedPrompt } from "../types";

export class GeminiProvider implements AIProvider {
    name = "gemini";
    private client: GoogleGenAI;
    private model = "gemini-2.0-flash-exp-image-generation";

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.client = new GoogleGenAI({ apiKey: key });
    }

    async generateImages(options: GenerationOptions): Promise<GenerationResult> {
        try {
            const enhancedPrompt = buildEnhancedPrompt(options.prompt, options.style);
            const count = options.count || 1;
            const images: GeneratedImage[] = [];

            // Generate images (Gemini may support batch, but we'll do sequential for safety)
            for (let i = 0; i < count; i++) {
                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents: enhancedPrompt,
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
        } catch (error) {
            console.error("Gemini generation error:", error);

            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

            // Handle specific error cases
            if (errorMessage.includes("SAFETY")) {
                return {
                    success: false,
                    error: "The AI declined to generate this image due to safety guidelines. Please try a different prompt.",
                };
            }

            if (errorMessage.includes("quota") || errorMessage.includes("rate")) {
                return {
                    success: false,
                    error: "API rate limit reached. Please try again in a moment.",
                };
            }

            return {
                success: false,
                error: `Generation failed: ${errorMessage}`,
            };
        }
    }
}
