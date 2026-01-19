// Together.ai Provider - Fast, free $25 credits for new accounts
// https://together.ai - Fast AI image generation with FLUX model

import type { AIProvider, GenerationOptions, GenerationResult, GeneratedImage } from "../types";
import { buildEnhancedPrompt } from "../types";

const TOGETHER_API_URL = "https://api.together.xyz/v1/images/generations";

export class TogetherProvider implements AIProvider {
    name = "together";
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.TOGETHER_API_KEY || "";
    }

    async generateImages(options: GenerationOptions): Promise<GenerationResult> {
        if (!this.apiKey) {
            return {
                success: false,
                error: "Together.ai API key not configured. Add TOGETHER_API_KEY to your environment.",
            };
        }

        try {
            const count = options.count || 1;
            const enhancedPrompt = buildEnhancedPrompt(options.prompt, options.style);

            console.log(`[Together] Generating ${count} image(s)...`);

            const images: GeneratedImage[] = [];

            // Together.ai is fast - usually under 10 seconds
            for (let i = 0; i < count; i++) {
                try {
                    const response = await fetch(TOGETHER_API_URL, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${this.apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            model: "black-forest-labs/FLUX.1-schnell-Free", // Fast, free model
                            prompt: enhancedPrompt,
                            width: 1280,
                            height: 720,
                            steps: 4, // Schnell is optimized for 4 steps
                            n: 1,
                            response_format: "b64_json",
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.text();
                        console.error(`[Together] API error: ${response.status} - ${errorData}`);
                        continue;
                    }

                    const data = await response.json();

                    if (data.data && data.data[0]?.b64_json) {
                        images.push({
                            base64: data.data[0].b64_json,
                            mimeType: "image/png",
                            width: 1280,
                            height: 720,
                        });
                        console.log(`[Together] Generated image ${i + 1}/${count}`);
                    }
                } catch (imageError) {
                    console.error(`[Together] Error generating image ${i + 1}:`, imageError);
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    error: "Failed to generate images with Together.ai",
                };
            }

            return {
                success: true,
                images,
                promptUsed: enhancedPrompt,
            };
        } catch (error) {
            console.error("[Together] Generation error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Image generation failed",
            };
        }
    }
}
