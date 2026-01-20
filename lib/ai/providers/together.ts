

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
                error: "Image generation service not configured. Please contact support.",
            };
        }

        try {
            const count = options.count || 1;
            const enhancedPrompt = buildEnhancedPrompt(options.prompt, options.style);
            const { width, height } = options.resolution || { width: 1280, height: 720 };

            const images: GeneratedImage[] = [];

            for (let i = 0; i < count; i++) {
                try {
                    const response = await fetch(TOGETHER_API_URL, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${this.apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            model: "black-forest-labs/FLUX.1-schnell-Free",
                            prompt: enhancedPrompt,
                            width,
                            height,
                            steps: 4,
                            n: 1,
                            response_format: "b64_json",
                        }),
                    });

                    if (!response.ok) {

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
                    }
                } catch {
                    // Silent fail for image errors
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    error: "Failed to generate images. Please try again.",
                };
            }

            return {
                success: true,
                images,
                promptUsed: enhancedPrompt,
            };
        } catch {
            return {
                success: false,
                error: "Image generation failed. Please try again later.",
            };
        }
    }
}
