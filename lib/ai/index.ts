// AI Provider Factory
// Provider-agnostic AI client that can switch between different AI providers

import type { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { PollinationsProvider } from "./providers/pollinations";

export type AIProviderType = "gemini" | "pollinations";

let cachedProvider: AIProvider | null = null;
let cachedProviderType: AIProviderType | null = null;

// Default to pollinations (free, no API key needed)
const DEFAULT_PROVIDER: AIProviderType = "pollinations";

export function getAIProvider(providerType: AIProviderType = DEFAULT_PROVIDER): AIProvider {
    // Return cached provider if same type
    if (cachedProvider && cachedProviderType === providerType) {
        return cachedProvider;
    }

    // Create new provider based on type
    switch (providerType) {
        case "gemini":
            cachedProvider = new GeminiProvider();
            break;
        case "pollinations":
            cachedProvider = new PollinationsProvider();
            break;
        default:
            throw new Error(`Unknown AI provider: ${providerType}`);
    }

    cachedProviderType = providerType;
    return cachedProvider;
}

// Re-export types for convenience
export * from "./types";
