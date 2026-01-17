export default function HomePage() {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
            <div className="container mx-auto px-4 py-20">
                <div className="text-center space-y-8">
                    <h1 className="text-6xl md:text-8xl font-bold font-[family-name:var(--font-space-grotesk)]">
                        <span className="gradient-text">Lexip</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-[#a1a1aa] max-w-2xl mx-auto">
                        AI-Powered Thumbnail Generator
                    </p>

                    <div className="inline-flex gap-4">
                        <div className="px-6 py-3 rounded-lg glass border border-[#8b5cf6]/30 glow-primary">
                            <p className="text-sm text-[#a1a1aa]">✅ App is running</p>
                        </div>
                        <div className="px-6 py-3 rounded-lg glass border border-[#3b82f6]/30 glow-accent">
                            <p className="text-sm text-[#a1a1aa]">🎨 Theme loaded</p>
                        </div>
                    </div>

                    <div className="mt-12 space-y-4">
                        <p className="text-sm text-[#71717a]">Foundation ready for Phase 2</p>
                        <div className="flex justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

