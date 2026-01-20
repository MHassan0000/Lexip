export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="h-9 w-40 bg-surface rounded-lg" />
                    <div className="h-5 w-64 bg-surface/50 rounded mt-2" />
                </div>
                <div className="h-10 w-36 bg-primary/20 rounded-full" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-surface border border-border">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-dark" />
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-dark rounded mb-2" />
                                <div className="h-8 w-16 bg-dark rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart and recent section skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 p-6 rounded-2xl bg-surface border border-border">
                    <div className="h-6 w-40 bg-dark rounded mb-6" />
                    <div className="h-64 bg-dark/50 rounded-xl" />
                </div>
                <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border">
                    <div className="h-6 w-40 bg-dark rounded mb-6" />
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-video bg-dark rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
