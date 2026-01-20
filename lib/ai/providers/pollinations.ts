import type { AIProvider, GenerationOptions, GenerationResult, GeneratedImage } from "../types";
import { buildEnhancedPrompt } from "../types";

export class PollinationsProvider implements AIProvider {
    name = "pollinations";

    async generateImages(options: GenerationOptions): Promise<GenerationResult> {
        try {
            const count = options.count || 1;
            const enhancedPrompt = buildEnhancedPrompt(options.prompt, options.style);
            const { width, height } = options.resolution || { width: 1280, height: 720 };

            const images: GeneratedImage[] = [];

            for (let i = 0; i < count; i++) {
                try {
                    const seed = Math.floor(Math.random() * 1000000) + i;
                    const encodedPrompt = encodeURIComponent(enhancedPrompt);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 120000);

                    const response = await fetch(imageUrl, {
                        signal: controller.signal,
                        headers: { 'Accept': 'image/*' },
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) continue;

                    const contentType = response.headers.get('content-type') || 'image/jpeg';
                    const arrayBuffer = await response.arrayBuffer();

                    if (arrayBuffer.byteLength === 0) continue;

                    const base64 = Buffer.from(arrayBuffer).toString("base64");

                    images.push({
                        base64,
                        mimeType: contentType.includes('png') ? 'image/png' : 'image/jpeg',
                        width,
                        height,
                    });
                } catch {
                    // Silent fail for individual image errors
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    error: "Failed to generate images. Please try again.",
                };
            }

            return { success: true, images, promptUsed: enhancedPrompt };
        } catch {
            return { success: false, error: "Image generation failed. Please try again." };
        }
    }
}
