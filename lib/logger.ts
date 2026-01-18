// Logging utility for server-side error tracking
// In production, you would connect this to services like Sentry, LogRocket, etc.

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
    userId?: string;
    action?: string;
    metadata?: Record<string, unknown>;
}

class Logger {
    private isDev = process.env.NODE_ENV === "development";

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    info(message: string, context?: LogContext) {
        console.log(this.formatMessage("info", message, context));
    }

    warn(message: string, context?: LogContext) {
        console.warn(this.formatMessage("warn", message, context));
    }

    error(message: string, error?: Error, context?: LogContext) {
        const errorDetails = error
            ? {
                ...context,
                errorMessage: error.message,
                errorStack: this.isDev ? error.stack : undefined,
            }
            : context;

        console.error(this.formatMessage("error", message, errorDetails));

        // In production, send to error tracking service
        if (!this.isDev && error) {
            this.sendToErrorTracking(message, error, context);
        }
    }

    debug(message: string, context?: LogContext) {
        if (this.isDev) {
            console.debug(this.formatMessage("debug", message, context));
        }
    }

    // Placeholder for error tracking integration
    private sendToErrorTracking(
        message: string,
        error: Error,
        context?: LogContext
    ) {
        // Example: Sentry.captureException(error, { extra: { message, ...context } });
        // Example: LogRocket.captureException(error);
    }
}

export const logger = new Logger();

// Helper function for action responses
export function logActionError(
    action: string,
    error: unknown,
    userId?: string
) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Action failed: ${action}`, err, { userId, action });
}
