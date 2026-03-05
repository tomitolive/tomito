import React from "react";
import { cn } from "@/lib/utils";

export function RamadanSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* Poster Skeleton */}
            <div className="relative aspect-[2/3] rounded-2xl bg-muted/40 border border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>

            {/* Info Area Skeleton */}
            <div className="space-y-3 px-1">
                <div className="h-4 bg-muted/40 rounded-lg w-3/4" />
                <div className="flex items-center gap-3">
                    <div className="h-3 bg-muted/30 rounded-md w-12" />
                    <div className="w-1 h-1 bg-muted/30 rounded-full" />
                    <div className="h-3 bg-muted/30 rounded-md w-16" />
                </div>
            </div>
        </div>
    );
}

export function RamadanGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {Array.from({ length: count }).map((_, i) => (
                <RamadanSkeleton key={i} />
            ))}
        </div>
    );
}
