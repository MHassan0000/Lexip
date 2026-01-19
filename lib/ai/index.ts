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
    // Together.ai is fast (< 10s) and has free credits
    if (process.env.TOGETHER_API_KEY) {
        console.log("[AI] Using Together.ai (fast, free credits)");
        return "together";
    }
    // Gemini if configured
    if (process.env.GEMINI_API_KEY) {
        console.log("[AI] Using Gemini (API key found)");
        return "gemini";
    }
    // Default to Together (will show API key error if not configured)
    console.log("[AI] No API key found - defaulting to Together.ai");
    return "together";
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
