"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
            theme="dark"
            toastOptions={{
                style: {
                    background: "#141420",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                },
                classNames: {
                    toast: "!bg-surface !border-border",
                    title: "!text-white",
                    description: "!text-text-secondary",
                    success: "!bg-green-500/10 !border-green-500/30",
                    error: "!bg-red-500/10 !border-red-500/30",
                    warning: "!bg-yellow-500/10 !border-yellow-500/30",
                    info: "!bg-blue-500/10 !border-blue-500/30",
                },
            }}
        />
    );
}
