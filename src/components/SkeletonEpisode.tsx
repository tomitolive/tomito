import { cn } from "@/lib/utils";

interface SkeletonEpisodeProps {
    className?: string;
}

export function SkeletonEpisode({ className }: SkeletonEpisodeProps): JSX.Element {
    return (
        <div className={cn("skeleton-episode flex gap-4 p-4", className)}>
            {/* Thumbnail Skeleton */}
            <div className="relative w-40 aspect-video rounded-lg bg-muted overflow-hidden flex-shrink-0">
                <div className="skeleton-shimmer absolute inset-0" />
            </div>

            {/* Episode Info Skeleton */}
            <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-muted relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                </div>
                <div className="h-4 w-1/2 rounded bg-muted relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                </div>
                <div className="h-3 w-full rounded bg-muted relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                </div>
                <div className="h-3 w-5/6 rounded bg-muted relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                </div>
            </div>
        </div>
    );
}
