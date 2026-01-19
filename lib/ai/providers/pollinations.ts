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
                    const seed = Math.floor(Math.random() * 1000000) + i;
                    const promptWithSeed = i > 0
                        ? `${enhancedPrompt}, variation ${i + 1}`
                        : enhancedPrompt;

                    // Pollinations API - just encode the prompt in the URL
                    const encodedPrompt = encodeURIComponent(promptWithSeed);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${seed}&nologo=true`;

                    console.log(`[Pollinations] Fetching image ${i + 1}: ${imageUrl.substring(0, 80)}...`);

                    // Fetch with timeout (Pollinations can take 30-60s for first generation)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

                    const response = await fetch(imageUrl, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'image/*',
                        },
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        console.error(`[Pollinations] Failed to fetch image ${i + 1}: ${response.status} ${response.statusText}`);
                        continue;
                    }

                    const contentType = response.headers.get('content-type') || 'image/jpeg';

                    // Convert to base64
                    const arrayBuffer = await response.arrayBuffer();

                    if (arrayBuffer.byteLength === 0) {
                        console.error(`[Pollinations] Empty response for image ${i + 1}`);
                        continue;
                    }

                    const base64 = Buffer.from(arrayBuffer).toString("base64");

                    images.push({
                        base64,
                        mimeType: contentType.includes('png') ? 'image/png' : 'image/jpeg',
                        width: 1280,
                        height: 720,
                    });

                    console.log(`[Pollinations] Generated image ${i + 1}/${count} (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
                } catch (imageError) {
                    if (imageError instanceof Error && imageError.name === 'AbortError') {
                        console.error(`[Pollinations] Timeout generating image ${i + 1}`);
                    } else {
                        console.error(`[Pollinations] Error generating image ${i + 1}:`, imageError);
                    }
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    error: "Failed to generate images. The AI service may be temporarily unavailable. Please try again.",
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
