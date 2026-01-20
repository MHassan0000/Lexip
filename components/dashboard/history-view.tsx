"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Trash2,
    Clock,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    Wand2,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGeneration } from "@/actions/generations";
import type { ThumbnailGeneration } from "@/types/database";
import { useRouter } from "next/navigation";

interface HistoryViewProps {
    generations: ThumbnailGeneration[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export function HistoryView({
    generations,
    currentPage,
    totalPages,
    totalItems,
}: HistoryViewProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedGen, setSelectedGen] = useState<ThumbnailGeneration | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; prompt: string } | null>(null);

    const handleDelete = async (id: string) => {
        setDeleteConfirm(null);
        setDeletingId(id);
        const result = await deleteGeneration(id);
        setDeletingId(null);

        if (result.success) {
            if (selectedGen?.id === id) setSelectedGen(null);
            router.refresh();
        }
    };

    const handleDownload = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `thumbnail-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            // Silent fail
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white font-(family-name:--font-space-grotesk)">
                        Generation History
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {totalItems} total generations
                    </p>
                </div>
                <Link href="/generate">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Wand2 className="w-4 h-4 mr-2" />
                        New Generation
                    </Button>
                </Link>
            </div>

            {/* Grid */}
            {generations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {generations.map((gen, index) => (
                        <motion.div
                            key={gen.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/50 transition-colors"
                        >
                            {/* Thumbnail */}
                            <div
                                className="relative aspect-video cursor-pointer"
                                onClick={() => setSelectedGen(gen)}
                            >
                                {gen.image_urls && gen.image_urls[0] ? (
                                    <Image
                                        src={gen.image_urls[0]}
                                        alt={gen.prompt}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-dark flex items-center justify-center">
                                        {gen.status === "processing" ? (
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        ) : gen.status === "failed" ? (
                                            <X className="w-8 h-8 text-red-500" />
                                        ) : (
                                            <Wand2 className="w-8 h-8 text-text-tertiary" />
                                        )}
                                    </div>
                                )}

                                {gen.status !== "completed" && (
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${gen.status === "processing"
                                        ? "bg-yellow-500/20 text-yellow-500"
                                        : "bg-red-500/20 text-red-500"
                                        }`}>
                                        {gen.status}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <p className="text-sm text-white font-medium line-clamp-2 mb-2">
                                    {gen.prompt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-text-tertiary">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(gen.created_at)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {gen.image_urls && gen.image_urls[0] && (
                                            <button
                                                onClick={() => handleDownload(gen.image_urls![0])}
                                                className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-dark transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setDeleteConfirm({ id: gen.id, prompt: gen.prompt })}
                                            disabled={deletingId === gen.id}
                                            className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deletingId === gen.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="p-12 rounded-2xl bg-surface border border-border text-center">
                    <Wand2 className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No generations yet</h3>
                    <p className="text-text-secondary mb-4">
                        Your generated thumbnails will appear here
                    </p>
                    <Link href="/generate">
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            Generate Your First Thumbnail
                        </Button>
                    </Link>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        href={`/history?page=${Math.max(1, currentPage - 1)}`}
                        className={`p-2 rounded-lg border transition-colors ${currentPage === 1
                            ? "border-border text-text-tertiary cursor-not-allowed"
                            : "border-border text-text-secondary hover:text-white hover:border-primary"
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <Link
                                    key={pageNum}
                                    href={`/history?page=${pageNum}`}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${currentPage === pageNum
                                        ? "bg-primary text-white"
                                        : "text-text-secondary hover:text-white hover:bg-surface"
                                        }`}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}
                    </div>

                    <Link
                        href={`/history?page=${Math.min(totalPages, currentPage + 1)}`}
                        className={`p-2 rounded-lg border transition-colors ${currentPage === totalPages
                            ? "border-border text-text-tertiary cursor-not-allowed"
                            : "border-border text-text-secondary hover:text-white hover:border-primary"
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative max-w-md w-full bg-surface rounded-2xl p-6 border border-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Delete Generation?</h3>
                                    <p className="text-sm text-text-secondary">This action cannot be undone</p>
                                </div>
                            </div>

                            <p className="text-text-secondary mb-6 line-clamp-2 text-sm bg-dark rounded-lg p-3 border border-border">
                                "{deleteConfirm.prompt}"
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleDelete(deleteConfirm.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedGen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedGen(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-4xl w-full bg-surface rounded-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedGen(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {selectedGen.image_urls && selectedGen.image_urls[0] && (
                                <div className="relative aspect-video">
                                    <Image
                                        src={selectedGen.image_urls[0]}
                                        alt={selectedGen.prompt}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            <div className="p-6 border-t border-border">
                                <p className="text-white mb-4">{selectedGen.prompt}</p>
                                <div className="flex items-center gap-3">
                                    {selectedGen.image_urls && selectedGen.image_urls[0] && (
                                        <Button
                                            onClick={() => handleDownload(selectedGen.image_urls![0])}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setDeleteConfirm({ id: selectedGen.id, prompt: selectedGen.prompt });
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
