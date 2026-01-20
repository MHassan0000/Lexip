import type { AIProvider, GenerationOptions, GenerationResult } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { TogetherProvider } from "./providers/together";
import { PollinationsProvider } from "./providers/pollinations";

export type AIProviderType = "gemini" | "together" | "pollinations" | "auto";

let cachedProvider: AIProvider | null = null;
let cachedProviderType: AIProviderType | null = null;

function getAutoProvider(): AIProviderType {
    if (process.env.GEMINI_API_KEY) {
        return "gemini";
    }
    if (process.env.TOGETHER_API_KEY) {
        return "together";
    }
    return "pollinations";
}

export function getAIProvider(providerType: AIProviderType = "auto"): AIProvider {
    const resolvedType = providerType === "auto" ? getAutoProvider() : providerType;

    if (cachedProvider && cachedProviderType === resolvedType) {
        return cachedProvider;
    }

    switch (resolvedType) {
        case "gemini":
            cachedProvider = new GeminiProvider();
            break;
        case "together":
            cachedProvider = new TogetherProvider();
            break;
        case "pollinations":
            cachedProvider = new PollinationsProvider();
            break;
        default:
            cachedProvider = new PollinationsProvider();
    }

    cachedProviderType = resolvedType;
    return cachedProvider;
}

// Auto-fallback
export async function generateWithFallback(options: GenerationOptions): Promise<GenerationResult> {
    const providers: AIProviderType[] = [];

    if (process.env.GEMINI_API_KEY) providers.push("gemini");
    if (process.env.TOGETHER_API_KEY) providers.push("together");
    providers.push("pollinations");

    let lastError = "No AI providers available";


    for (const providerType of providers) {
        try {
            const provider = getAIProvider(providerType);
            const result = await provider.generateImages(options);

            if (result.success) {
                return result;
            }


            lastError = result.error || "Unknown error";
        } catch (error) {
            lastError = error instanceof Error ? error.message : "Unknown error";
        }
    }

    // All providers failed
    return {
        success: false,
        error: `All AI providers failed. Last error: ${lastError}`,
    };
}

export * from "./types";
