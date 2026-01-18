"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error("Error Boundary caught an error:", error, errorInfo);

        // In production, you would send this to your error tracking service
        if (process.env.NODE_ENV === "production") {
            // Example: Send to error tracking
            // logErrorToService(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-100 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-text-secondary mb-6">
                            An unexpected error occurred. Please try again.
                        </p>
                        <Button
                            onClick={this.handleReset}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-6 text-left p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                <summary className="text-red-400 cursor-pointer text-sm font-medium">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-xs text-red-300 overflow-auto">
                                    {this.state.error.message}
                                    {"\n"}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
