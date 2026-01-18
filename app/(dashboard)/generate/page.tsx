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
    ImageIcon
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
        <div className="min-h-screen bg-darker pt-20 pb-12">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white font-(family-name:--font-space-grotesk) mb-3">
                        Generate Thumbnail
                    </h1>
                    <p className="text-text-secondary">
                        Describe your video and let AI create the perfect thumbnail
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Input */}
                    <div className="space-y-6">
                        {/* Usage Info */}
                        {usage && (
                            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-primary" />
                                    <span className="text-text-secondary">
                                        <span className="text-white font-bold">{usage.remaining}</span> generations remaining today
                                    </span>
                                </div>
                                <div className="text-xs text-text-tertiary">
                                    {usage.plan === "free" ? (
                                        <Link href="/pricing" className="text-primary hover:underline">
                                            Upgrade for more
                                        </Link>
                                    ) : (
                                        <span className="capitalize">{usage.plan} Plan</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reference Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Reference Image <span className="text-text-tertiary font-normal">(optional)</span>
                            </label>

                            {referenceImage ? (
                                <div className="relative p-4 rounded-xl bg-surface border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-dark">
                                            <Image
                                                src={referenceImage.preview}
                                                alt="Reference"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">Image uploaded</p>
                                            <p className="text-xs text-text-tertiary">
                                                This image will be used as a reference for generation
                                            </p>
                                        </div>
                                        <button
                                            onClick={removeReferenceImage}
                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
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
                                    className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-text-tertiary bg-surface"
                                        }`}
                                >
                                    <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? "text-primary" : "text-text-tertiary"}`} />
                                    <p className="text-sm text-text-secondary mb-1">
                                        Drag & drop an image or <span className="text-primary">browse</span>
                                    </p>
                                    <p className="text-xs text-text-tertiary">
                                        PNG, JPG up to 10MB
                                    </p>
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

                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                Describe your thumbnail
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A shocked person looking at a giant pile of money with explosions in the background"
                                className="w-full h-32 px-4 py-3 rounded-xl bg-surface border border-border text-white placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Style Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white">
                                Choose a style
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {STYLE_PRESETS.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(selectedStyle === style.id ? "" : style.id)}
                                        className={`p-3 rounded-xl border transition-all text-center ${selectedStyle === style.id
                                            ? "bg-primary/20 border-primary text-white"
                                            : "bg-surface border-border text-text-secondary hover:border-text-tertiary"
                                            }`}
                                    >
                                        <span className="text-sm font-medium block">{style.name}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-text-tertiary">
                                {STYLE_PRESETS.find(s => s.id === selectedStyle)?.description}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim() || (usage?.remaining === 0)}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-bold rounded-xl"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5 mr-2" />
                                    Generate Thumbnail
                                </>
                            )}
                        </Button>

                        {usage?.remaining === 0 && (
                            <p className="text-center text-sm text-text-tertiary">
                                You've reached your daily limit.{" "}
                                <Link href="/pricing" className="text-primary hover:underline">
                                    Upgrade your plan
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* Right Column - Result */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="rounded-2xl bg-surface border border-border p-6 min-h-100 flex flex-col">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Generated Result
                            </h2>

                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 flex flex-col items-center justify-center gap-4"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                        <p className="text-text-secondary text-center">
                                            Generating your thumbnail...
                                            <br />
                                            <span className="text-xs text-text-tertiary">This may take 10-30 seconds</span>
                                        </p>
                                    </motion.div>
                                ) : selectedImage ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-dark mb-4">
                                            <Image
                                                src={selectedImage}
                                                alt="Generated thumbnail"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Image thumbnails if multiple */}
                                        {generation?.image_urls && generation.image_urls.length > 1 && (
                                            <div className="flex gap-2 mb-4">
                                                {generation.image_urls.map((url, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedImage(url)}
                                                        className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === url
                                                            ? "border-primary"
                                                            : "border-transparent opacity-60 hover:opacity-100"
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

                                        <Button
                                            onClick={() => handleDownload(selectedImage)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Thumbnail
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-text-tertiary"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-dark flex items-center justify-center">
                                            <Wand2 className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium mb-1">No thumbnail yet</p>
                                            <p className="text-sm">
                                                Enter a prompt and click generate to create your thumbnail
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
