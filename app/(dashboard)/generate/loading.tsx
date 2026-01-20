export default function GenerateLoading() {
    return (
        <div className="min-h-[calc(100vh-5rem)] animate-pulse">
            <div className="w-full h-full min-h-[calc(100vh-5rem)] mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                <div className="grid lg:grid-cols-12 gap-6 h-full items-start">
                    {/* Left column skeleton */}
                    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="h-6 w-24 bg-surface rounded" />
                            <div className="h-8 w-20 bg-surface rounded-full" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-32 bg-surface rounded-2xl" />
                            <div className="h-12 bg-surface rounded-xl" />
                            <div className="h-24 bg-surface rounded-2xl" />
                        </div>
                    </div>

                    {/* Right column skeleton */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="aspect-video bg-surface rounded-3xl border border-border" />
                    </div>
                </div>
            </div>
        </div>
    );
}
