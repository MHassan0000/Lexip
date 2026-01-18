"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-darker min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Something went wrong!
                    </h1>
                    <p className="text-text-secondary mb-8">
                        We're sorry, but something unexpected happened. Please try again or go back home.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={reset}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Link href="/">
                            <Button variant="secondary" className="w-full sm:w-auto">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
                            <p className="text-red-400 text-sm font-medium mb-2">Error Details:</p>
                            <pre className="text-xs text-red-300 overflow-auto">
                                {error.message}
                            </pre>
                            {error.digest && (
                                <p className="text-xs text-text-tertiary mt-2">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
