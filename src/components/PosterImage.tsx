import React, { useState, useEffect } from "react";
import { Play, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PosterImageProps {
    src: string;
    allPosters?: string[];
    alt: string;
    className?: string;
    priority?: boolean;
}

export function PosterImage({
    src,
    allPosters = [],
    alt,
    className,
    priority = false
}: PosterImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    // Reset state when src changes
    useEffect(() => {
        setImgSrc(src);
        setLoading(true);
        setError(false);
        setAttempt(0);
    }, [src]);

    const handleError = () => {
        const nextAttempt = attempt + 1;
        const posters = allPosters.filter(p => p !== src); // Avoid re-trying the same failing src

        if (nextAttempt <= posters.length) {
            setImgSrc(posters[nextAttempt - 1]);
            setAttempt(nextAttempt);
        } else {
            setError(true);
            setLoading(false);
        }
    };

    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    return (
        <div className={cn("relative w-full h-full overflow-hidden bg-muted", className)}>
            {/* Skeleton Loader */}
            {loading && !error && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Fallback Placeholder */}
            {error ? (
                <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center gap-3 bg-gradient-to-br from-gray-900 to-black border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ImageOff className="w-6 h-6 text-primary/60" />
                    </div>
                    <p className="text-white font-bold text-sm leading-tight line-clamp-3 px-2">
                        {alt}
                    </p>
                    <div className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Image not found
                    </div>
                </div>
            ) : (
                <img
                    src={imgSrc}
                    alt={alt}
                    className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        loading ? "opacity-0 scale-105" : "opacity-100 scale-100"
                    )}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        console.error(`Failed to load image: ${imgSrc}`, e);
                        handleError();
                    }}
                    onLoad={handleLoad}
                />
            )}

            {/* Decorative overlay for better contrast on titles if needed */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-60" />
        </div>
    );
}
