// AI Provider Factory
// Provider-agnostic AI client that can switch between different AI providers

import type { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { TogetherProvider } from "./providers/together";

export type AIProviderType = "gemini" | "together" | "auto";

let cachedProvider: AIProvider | null = null;
let cachedProviderType: AIProviderType | null = null;

// Auto-detect: prefer Together.ai (fast), fallback to Gemini
function getAutoProvider(): AIProviderType {
    if (process.env.TOGETHER_API_KEY) {
        return "together";
    }
    if (process.env.GEMINI_API_KEY) {
        return "gemini";
    }
    return "together";
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
        default:
            cachedProvider = new TogetherProvider();
    }

    cachedProviderType = resolvedType;
    return cachedProvider;
}

// Re-export types for convenience
export * from "./types";
