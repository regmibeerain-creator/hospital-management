import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('shimmer rounded-xl', className)}
            {...props}
        />
    );
}

function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="shimmer h-8 w-56 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="shimmer h-80 rounded-2xl" />
                <div className="shimmer h-80 rounded-2xl" />
            </div>
        </div>
    );
}

export { Skeleton, CardSkeleton, DashboardSkeleton };
