export default function HistoryLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-8 w-32 bg-surface rounded-lg" />
                    <div className="h-4 w-48 bg-surface/50 rounded mt-2" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-surface rounded-lg" />
                    <div className="h-10 w-24 bg-surface rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-2xl bg-surface border border-border overflow-hidden">
                        <div className="aspect-video bg-dark" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 w-3/4 bg-dark rounded" />
                            <div className="h-3 w-1/2 bg-dark/50 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
