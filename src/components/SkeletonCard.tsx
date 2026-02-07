import { cn } from "@/lib/utils";

interface SkeletonCardProps {
    className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps): JSX.Element {
    return (
        <div className={cn("skeleton-card", className)}>
            {/* Card Image Skeleton */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                <div className="skeleton-shimmer absolute inset-0" />
            </div>

            {/* Title Skeleton - Mobile */}
            <div className="mt-2 space-y-1">
                <div className="h-4 w-3/4 rounded bg-muted relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                </div>
                <div className="h-3 w-1/2 rounded bg-muted relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                </div>
            </div>
        </div>
    );
}
