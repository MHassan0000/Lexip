"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wand2,
    Loader2,
    AlertCircle,
    Download,
    Sparkles,
    Zap,
    Upload,
    X,
    ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { STYLE_PRESETS } from "@/lib/ai/types";
import { generateThumbnail, getUsageInfo } from "@/actions/generate";
import type { ThumbnailGeneration } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

export default function GeneratePage() {
    const [prompt, setPrompt] = useState("");
    const [selectedStyle, setSelectedStyle] = useState<string>("gaming");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generation, setGeneration] = useState<ThumbnailGeneration | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number; plan: string } | null>(null);

    // Image upload state
    const [referenceImage, setReferenceImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch usage info on mount
    useEffect(() => {
        async function fetchUsage() {
            const result = await getUsageInfo();
            if (result.success && result.data) {
                setUsage(result.data);
            }
        }
        fetchUsage();
    }, [generation]);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("Image must be less than 10MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Full = e.target?.result as string;
            const base64Data = base64Full.split(",")[1]; // Remove data:image/...;base64, prefix
            setReferenceImage({
                base64: base64Data,
                mimeType: file.type,
                preview: base64Full
            });
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const removeReferenceImage = () => {
        setReferenceImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt describing your thumbnail");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneration(null);
        setSelectedImage(null);

        const result = await generateThumbnail({
            prompt: prompt.trim(),
            styleId: selectedStyle,
            count: 1,
            referenceImage: referenceImage ? {
                base64: referenceImage.base64,
                mimeType: referenceImage.mimeType
            } : undefined,
        });

        setIsGenerating(false);

        if (result.success && result.data) {
            setGeneration(result.data);
            if (result.data.image_urls && result.data.image_urls.length > 0) {
                setSelectedImage(result.data.image_urls[0]);
            }
        } else {
            setError(result.error || "Failed to generate thumbnail");
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
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-darker pt-4 pb-12">
            <div className="container mx-auto max-w-7xl">
                {/* Visual Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/30">
                        <Wand2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-3 tracking-tight">
                        Generate Thumbnail
                    </h1>
                    <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                        Transform your ideas into viral thumbnails with our advanced AI engine.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column - Input Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Usage Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-5 rounded-2xl bg-surface border border-border overflow-hidden relative"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-yellow-500/10">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Daily Credits</p>
                                        <p className="text-white font-bold text-lg">
                                            {usage ? usage.remaining : "..."} <span className="text-text-tertiary text-sm font-normal">left</span>
                                        </p>
                                    </div>
                                </div>
                                {usage?.plan === "free" && (
                                    <Link href="/pricing">
                                        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10">
                                            Upgrade
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-surface rounded-2xl border border-border p-6 space-y-6"
                        >
                            {/* Prompt Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white flex justify-between">
                                    Prompt
                                    <span className="text-xs text-text-tertiary">Describe specifically</span>
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., A shocked YouTube creator looking at a floating holographic interface, cyberpunk city background, vibrant neon colors, high contrast, 8k resolution..."
                                    className="w-full h-32 px-4 py-3 rounded-xl bg-dark border border-border text-white placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all custom-scrollbar"
                                />
                            </div>

                            {/* Reference Image */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Reference Image <span className="text-text-tertiary font-normal text-xs">(optional)</span>
                                </label>

                                {referenceImage ? (
                                    <div className="relative p-3 rounded-xl bg-dark border border-border group overflow-hidden">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface">
                                                <Image
                                                    src={referenceImage.preview}
                                                    alt="Reference"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium truncate">Uploaded Image</p>
                                                <p className="text-xs text-text-tertiary">Using as structure ref</p>
                                            </div>
                                            <button
                                                onClick={removeReferenceImage}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center group ${isDragging
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-dark"
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-2 py-2">
                                            <div className="p-2 rounded-full bg-surface group-hover:bg-primary/10 transition-colors">
                                                <Upload className={`w-5 h-5 ${isDragging ? "text-primary" : "text-text-tertiary group-hover:text-primary"}`} />
                                            </div>
                                            <p className="text-xs text-text-secondary">
                                                <span className="text-primary font-medium hover:underline">Click to upload</span> or drag image
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Style Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Style Preset</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLE_PRESETS.map((style) => (
                                        <motion.button
                                            key={style.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedStyle(selectedStyle === style.id ? "" : style.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedStyle === style.id
                                                ? "bg-primary/20 border-primary text-white ring-1 ring-primary/50"
                                                : "bg-dark border-border text-text-secondary hover:border-border-bright hover:bg-surface-elevated"
                                                }`}
                                        >
                                            <span className="text-sm font-medium block mb-1">{style.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                        <p className="text-xs text-red-300">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Generate Button */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim() || (usage?.remaining === 0)}
                                    className="w-full h-14 bg-linear-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary text-white text-lg font-bold rounded-xl shadow-glow transition-all"
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Creating Magic...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 fill-white/20" />
                                            <span>Generate Thumbnail</span>
                                        </div>
                                    )}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column - Preview Area */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-24 min-h-150 rounded-3xl bg-surface/50 border border-border backdrop-blur-sm p-1 shadow-2xl flex flex-col"
                        >
                            <div className="flex-1 bg-darker/50 rounded-[22px] border border-white/5 relative overflow-hidden group flex flex-col">
                                {isGenerating ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                                            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                                            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Generating your masterpiece...</h3>
                                        <p className="text-text-tertiary text-center max-w-sm">
                                            Our AI is analyzing your prompt, composing the scene, and rendering high-quality details.
                                        </p>
                                    </div>
                                ) : selectedImage ? (
                                    <div className="relative flex-1 group/image">
                                        <Image
                                            src={selectedImage}
                                            alt="Generated thumbnail"
                                            fill
                                            className="object-contain"
                                        />

                                        {/* Overlay Controls */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity flex items-end justify-between">
                                            <div className="space-y-1">
                                                <p className="text-white font-medium line-clamp-1">{prompt.slice(0, 50)}...</p>
                                                <p className="text-xs text-white/70">Generated with {selectedStyle} style</p>
                                            </div>
                                            <Button
                                                onClick={() => handleDownload(selectedImage!)}
                                                className="bg-white text-black hover:bg-white/90"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-24 h-24 rounded-3xl bg-surface border border-border flex items-center justify-center mb-6 rotate-3 transform transition-transform group-hover:rotate-6 shadow-xl">
                                            <ImageIcon className="w-10 h-10 text-text-tertiary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Ready to Create</h3>
                                        <p className="text-text-secondary max-w-md">
                                            Your generated thumbnails will appear here in high resolution.
                                            Try describing a scene with "vibrant colors" and "expressive faces".
                                        </p>
                                    </div>
                                )}

                                {/* History Strip (if multiple) */}
                                {generation?.image_urls && generation.image_urls.length > 1 && (
                                    <div className="h-24 border-t border-white/10 bg-black/20 p-2 flex gap-2 overflow-x-auto">
                                        {generation.image_urls.map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedImage(url)}
                                                className={`relative aspect-video h-full rounded-lg overflow-hidden border-2 transition-all ${selectedImage === url
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-transparent opacity-50 hover:opacity-100"
                                                    }`}
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`Option ${i + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
