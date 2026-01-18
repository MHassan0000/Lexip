/**
 * Rate Limiting Utility
 * 
 * OWASP Best Practice: Implement rate limiting to prevent abuse and DoS attacks.
 * This module provides IP-based and user-based rate limiting with configurable limits.
 * 
 * Note: This is an in-memory implementation suitable for single-instance deployments.
 * For production multi-instance deployments, consider using Redis or a similar distributed store.
 */

// Rate limit configuration per action type
interface RateLimitConfig {
    maxRequests: number;      // Maximum requests allowed in the window
    windowMs: number;         // Time window in milliseconds
    blockDurationMs?: number; // How long to block after limit exceeded (optional)
}

// Default rate limits for different action types
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    // Generation is expensive - limit to 10 per minute per user
    generate: {
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
        blockDurationMs: 60 * 1000, // Block for 1 minute after exceeded
    },
    // General API access - 60 requests per minute
    default: {
        maxRequests: 60,
        windowMs: 60 * 1000,
    },
    // Auth attempts - stricter limit to prevent brute force
    auth: {
        maxRequests: 5,
        windowMs: 60 * 1000,
        blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    },
};

// In-memory store for rate limiting
// Key format: `${actionType}:${identifier}` where identifier is IP or userId
interface RateLimitEntry {
    count: number;
    resetTime: number;
    blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // Seconds until reset
    retryAfter?: number; // Seconds to wait if blocked (for 429 response)
}

/**
 * Check and update rate limit for an identifier
 * 
 * @param actionType - Type of action (e.g., 'generate', 'auth')
 * @param identifier - IP address or user ID
 * @returns Rate limit check result
 */
export function checkRateLimit(
    actionType: string,
    identifier: string
): RateLimitResult {
    const config = RATE_LIMITS[actionType] || RATE_LIMITS.default;
    const key = `${actionType}:${identifier}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
        const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
        return {
            success: false,
            remaining: 0,
            resetIn: retryAfter,
            retryAfter,
        };
    }

    // Reset if window expired
    if (!entry || entry.resetTime < now) {
        entry = {
            count: 0,
            resetTime: now + config.windowMs,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        // Apply block if configured
        if (config.blockDurationMs) {
            entry.blockedUntil = now + config.blockDurationMs;
            rateLimitStore.set(key, entry);
        }

        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return {
            success: false,
            remaining: 0,
            resetIn: retryAfter,
            retryAfter,
        };
    }

    // Increment count and store
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Get client IP from request headers
 * Handles proxied requests (X-Forwarded-For, etc.)
 * 
 * SECURITY: In production, ensure your proxy is configured correctly
 * to prevent IP spoofing via X-Forwarded-For header.
 */
export function getClientIP(headers: Headers): string {
    // Check common proxy headers
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        // X-Forwarded-For can contain multiple IPs; take the first (original client)
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = headers.get('x-real-ip');
    if (realIP) {
        return realIP.trim();
    }

    // Fallback - should not happen in production
    return 'unknown';
}

/**
 * Format a 429 Too Many Requests error response
 */
export function rateLimitExceededError(result: RateLimitResult): {
    success: false;
    error: string;
    retryAfter: number;
} {
    return {
        success: false,
        error: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter || 60,
    };
}
