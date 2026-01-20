import type { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { TogetherProvider } from "./providers/together";
import { PollinationsProvider } from "./providers/pollinations";

export type AIProviderType = "gemini" | "together" | "pollinations" | "auto";

let cachedProvider: AIProvider | null = null;
let cachedProviderType: AIProviderType | null = null;

// Auto-detect: prefer Together.ai, then Gemini, fallback to Pollinations (free, no key)
function getAutoProvider(): AIProviderType {
    if (process.env.TOGETHER_API_KEY) {
        return "together";
    }
    if (process.env.GEMINI_API_KEY) {
        return "gemini";
    }
    // Fallback to Pollinations for local testing (free, no API key needed)
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

export * from "./types";
