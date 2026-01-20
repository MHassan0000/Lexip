/**
 * Environment Variables Validation
 * Ensures all required environment variables are present at runtime
 */

const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
] as const;

const optionalEnvVars = [
    "NEXT_PUBLIC_APP_URL",
    "STRIPE_WEBHOOK_SECRET",
    "GEMINI_API_KEY",
    "TOGETHER_API_KEY",
    "NODE_ENV",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar = (typeof optionalEnvVars)[number];

function validateEnv() {
    const missingVars: string[] = [];

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    });

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missingVars.join("\n")}\n\nPlease check your .env.local file.`
        );
    }
}

// Validate on server-side only
if (typeof window === "undefined") {
    validateEnv();
}

// Type-safe environment variable access (SERVER-SIDE ONLY - never exposed to client)
export const env = {
    // Supabase
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },

    // Stripe
    stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        secretKey: process.env.STRIPE_SECRET_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },

    // AI (optional - uses fallback system)
    ai: {
        geminiApiKey: process.env.GEMINI_API_KEY,
        togetherApiKey: process.env.TOGETHER_API_KEY,
    },

    // App
    app: {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        isProduction: process.env.NODE_ENV === "production",
        isDevelopment: process.env.NODE_ENV === "development",
    },
} as const;
