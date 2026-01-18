// AI Provider Factory
// Provider-agnostic AI client that can switch between different AI providers

import type { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";

export type AIProviderType = "gemini"; // Add more providers here as needed

let cachedProvider: AIProvider | null = null;
let cachedProviderType: AIProviderType | null = null;

export function getAIProvider(providerType: AIProviderType = "gemini"): AIProvider {
    // Return cached provider if same type
    if (cachedProvider && cachedProviderType === providerType) {
        return cachedProvider;
    }

    // Create new provider based on type
    switch (providerType) {
        case "gemini":
            cachedProvider = new GeminiProvider();
            break;
        default:
            throw new Error(`Unknown AI provider: ${providerType}`);
    }

    cachedProviderType = providerType;
    return cachedProvider;
}

// Re-export types for convenience
export * from "./types";
