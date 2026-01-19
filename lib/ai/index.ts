// AI Provider Factory
// Provider-agnostic AI client that can switch between different AI providers

import type { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { PollinationsProvider } from "./providers/pollinations";

export type AIProviderType = "gemini" | "pollinations" | "auto";

let cachedProvider: AIProvider | null = null;
let cachedProviderType: AIProviderType | null = null;

// Auto-detect: use Gemini if API key exists, otherwise Pollinations (free)
function getAutoProvider(): AIProviderType {
    if (process.env.GEMINI_API_KEY) {
        console.log("[AI] Using Gemini (API key found)");
        return "gemini";
    }
    console.log("[AI] Using Pollinations (free, no API key needed)");
    return "pollinations";
}

export function getAIProvider(providerType: AIProviderType = "auto"): AIProvider {
    // Resolve "auto" to actual provider
    const resolvedType = providerType === "auto" ? getAutoProvider() : providerType;

    // Return cached provider if same type
    if (cachedProvider && cachedProviderType === resolvedType) {
        return cachedProvider;
    }

    // Create new provider based on type
    switch (resolvedType) {
        case "gemini":
            cachedProvider = new GeminiProvider();
            break;
        case "pollinations":
            cachedProvider = new PollinationsProvider();
            break;
        default:
            // Fallback to Pollinations
            cachedProvider = new PollinationsProvider();
    }

    cachedProviderType = resolvedType;
    return cachedProvider;
}

// Re-export types for convenience
export * from "./types";

