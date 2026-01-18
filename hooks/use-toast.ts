"use client";

import { useCallback } from "react";
import { toast } from "sonner";

interface UseToastReturn {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
    loading: (message: string) => string | number;
    dismiss: (toastId?: string | number) => void;
    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => Promise<T>;
}

export function useToast(): UseToastReturn {
    const success = useCallback((message: string, description?: string) => {
        toast.success(message, { description });
    }, []);

    const error = useCallback((message: string, description?: string) => {
        toast.error(message, { description });
    }, []);

    const warning = useCallback((message: string, description?: string) => {
        toast.warning(message, { description });
    }, []);

    const info = useCallback((message: string, description?: string) => {
        toast.info(message, { description });
    }, []);

    const loading = useCallback((message: string) => {
        return toast.loading(message);
    }, []);

    const dismiss = useCallback((toastId?: string | number) => {
        toast.dismiss(toastId);
    }, []);

    const promiseToast = useCallback(
        async <T,>(
            promise: Promise<T>,
            messages: {
                loading: string;
                success: string;
                error: string;
            }
        ): Promise<T> => {
            return toast.promise(promise, messages) as Promise<T>;
        },
        []
    );

    return {
        success,
        error,
        warning,
        info,
        loading,
        dismiss,
        promise: promiseToast,
    };
}
