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
import { cn } from "@/lib/utils";

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [prompt]);

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
            const base64Data = base64Full.split(",")[1];
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
        <div className="min-h-[calc(100vh-theme(spacing.20))] bg-darker p-4 md:p-6 lg:p-8">
            <div className="container mx-auto max-w-[1800px] h-full">
                <div className="grid lg:grid-cols-12 gap-6 h-full items-start">

                    {/* LEFT COLUMN: Input / Chat Interface */}
                    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar pr-2">
                        {/* Header Section */}
                        <div className="flex items-center justify-between shrink-0">
                            <div>
                                <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-primary" />
                                    Create
                                </h1>
                            </div>

                            {/* Usage Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
                                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-sm font-medium text-white">{usage?.remaining || 0}</span>
                            </div>
                        </div>

                        {/* Main Input Card - Chatbot Style */}
                        <div className="flex flex-col gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-surface rounded-3xl border border-border p-5 shadow-xl flex flex-col gap-5 relative overflow-hidden"
                            >
                                {/* Background Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                {/* Text Area */}
                                <div className="space-y-2 relative z-10 w-full">
                                    <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Prompt</label>
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your thumbnail..."
                                        className="w-full min-h-[200px] px-4 py-4 rounded-2xl bg-dark/50 border border-border text-white placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:bg-dark focus:ring-1 focus:ring-primary/20 transition-all resize-none text-base leading-relaxed custom-scrollbar shadow-inner"
                                    />
                                </div>

                                {/* Controls Row */}
                                <div className="flex flex-col gap-5 relative z-10">

                                    {/* Style Selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Style</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {STYLE_PRESETS.map((style) => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setSelectedStyle(selectedStyle === style.id ? "" : style.id)}
                                                    className={cn(
                                                        "px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-center truncate shadow-sm",
                                                        selectedStyle === style.id
                                                            ? "bg-primary/20 border-primary text-white ring-1 ring-primary/30"
                                                            : "bg-dark border-border text-text-secondary hover:bg-surface-elevated hover:text-white"
                                                    )}
                                                >
                                                    {style.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex justify-between">
                                            Reference
                                            <span className="font-normal normal-case text-text-tertiary/70">(Optional)</span>
                                        </label>

                                        {referenceImage ? (
                                            <div className="relative p-2 rounded-xl bg-dark border border-border flex items-center gap-3 group">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                                    <Image src={referenceImage.preview} alt="Ref" fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-white truncate">Image Attached</p>
                                                    <p className="text-[10px] text-primary">Structure reference</p>
                                                </div>
                                                <button onClick={removeReferenceImage} className="p-1.5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-red-400 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                className={cn(
                                                    "border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex items-center justify-center gap-2 h-14",
                                                    isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-dark"
                                                )}
                                            >
                                                <Upload className="w-4 h-4 text-text-tertiary" />
                                                <span className="text-xs text-text-secondary">Upload Image</span>
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
                                    </div>

                                </div>

                                {/* Error Display */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs flex items-center gap-1.5 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Generate Action */}
                                <div className="mt-2">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim() || (usage?.remaining === 0)}
                                        className="w-full h-14 text-base font-bold rounded-xl bg-linear-to-r from-primary to-accent hover:opacity-90 shadow-glow transition-all"
                                    >
                                        {isGenerating ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Visualizing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 fill-white" />
                                                Generate
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Preview / Result Area - Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9 relative h-full min-h-[500px] lg:min-h-[calc(100vh-8rem)]">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-full rounded-3xl bg-dark/30 border border-white/5 backdrop-blur-md p-2 flex flex-col shadow-2xl relative"
                        >
                            <div className="flex-1 bg-darker rounded-[22px] relative overflow-hidden flex flex-col items-center justify-center border border-white/5 group bg-[url('/grid.svg')] bg-center bg-repeat opacity-90">

                                {/* Placeholder State */}
                                {!isGenerating && !selectedImage && (
                                    <div className="text-center p-8 max-w-lg relative z-10">
                                        <div className="w-24 h-24 bg-surface/50 backdrop-blur-md rounded-3xl border border-border flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 transform group-hover:scale-110 transition-transform duration-500">
                                            <ImageIcon className="w-10 h-10 text-primary/50" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Canvas Ready</h3>
                                        <p className="text-text-secondary text-lg leading-relaxed">
                                            Your masterpieces appear here. <br />
                                            Try "An astronaut meditating on Mars, cinematic lighting."
                                        </p>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isGenerating && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20 p-8 text-center">
                                        <div className="relative w-32 h-32 mb-8">
                                            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                                            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
                                            <div className="absolute inset-4 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin duration-[1.5s]" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-white/50 mb-3 animate-pulse">Generating...</h3>
                                        <p className="text-text-secondary font-medium">Crafting pixels from your imagination</p>
                                    </div>
                                )}

                                {/* Result Image */}
                                {selectedImage && (
                                    <div className="relative w-full h-full flex flex-col p-4 md:p-8">
                                        <div className="flex-1 relative w-full h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                            <Image
                                                src={selectedImage}
                                                alt="Generated Thumbnail"
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </div>

                                        {/* Hover Overlay Actions */}
                                        <div className="absolute top-10 right-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <Button
                                                onClick={() => handleDownload(selectedImage!)}
                                                size="icon"
                                                className="h-12 w-12 rounded-xl bg-white text-black hover:bg-white/90 shadow-xl"
                                                title="Download"
                                            >
                                                <Download className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-md border border-white/10"
                                                onClick={() => setSelectedImage(null)}
                                                title="Clear"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails History Strip - Bottom of Preview */}
                            {generation?.image_urls && generation.image_urls.length > 0 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90%] h-20 p-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex gap-3 overflow-x-auto custom-scrollbar shadow-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity delay-100 hover:opacity-100">
                                    {generation.image_urls.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(url)}
                                            className={cn(
                                                "relative aspect-video h-full rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                                                selectedImage === url ? "border-primary ring-2 ring-primary/20 scale-105" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                            )}
                                        >
                                            <Image src={url} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
