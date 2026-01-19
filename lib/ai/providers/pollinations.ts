// Pollinations.ai Provider - Free, no API key needed
// https://pollinations.ai - Free AI image generation

import type { AIProvider, GenerationOptions, GenerationResult, GeneratedImage } from "../types";
import { buildEnhancedPrompt } from "../types";

export class PollinationsProvider implements AIProvider {
    name = "pollinations";

    async generateImages(options: GenerationOptions): Promise<GenerationResult> {
        try {
            const count = options.count || 1;
            const enhancedPrompt = buildEnhancedPrompt(options.prompt, options.style);

            console.log(`[Pollinations] Generating ${count} image(s)...`);
            console.log(`[Pollinations] Prompt: ${enhancedPrompt.substring(0, 100)}...`);

            const images: GeneratedImage[] = [];

            // Generate images with slight prompt variations for diversity
            for (let i = 0; i < count; i++) {
                try {
                    // Add seed for variety when generating multiple images
                    const seed = Date.now() + i * 1000;
                    const promptWithSeed = i > 0
                        ? `${enhancedPrompt}, variation ${i + 1}`
                        : enhancedPrompt;

                    // Pollinations API - just encode the prompt in the URL
                    const encodedPrompt = encodeURIComponent(promptWithSeed);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${seed}&nologo=true`;

                    // Fetch the image
                    const response = await fetch(imageUrl);

                    if (!response.ok) {
                        console.error(`[Pollinations] Failed to fetch image ${i + 1}: ${response.status}`);
                        continue;
                    }

                    // Convert to base64
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString("base64");

                    images.push({
                        base64,
                        mimeType: "image/jpeg",
                        width: 1280,
                        height: 720,
                    });

                    console.log(`[Pollinations] Generated image ${i + 1}/${count}`);
                } catch (imageError) {
                    console.error(`[Pollinations] Error generating image ${i + 1}:`, imageError);
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    error: "Failed to generate any images",
                };
            }

            return {
                success: true,
                images,
                promptUsed: enhancedPrompt,
            };
        } catch (error) {
            console.error("[Pollinations] Generation error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Image generation failed",
            };
        }
    }
}
