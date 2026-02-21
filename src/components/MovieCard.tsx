import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { getImageUrl, Movie, TVShow, fetchVideos } from "@/lib/tmdb";
import { cn, createSlugWithId } from "@/lib/utils";
import { useFocusable } from "@/hooks/useFocusable";

type MediaType = "movie" | "tv";

interface MovieCardProps {
  item: Movie | TVShow | any;
  type: MediaType;
  className?: string;
  isRamadan?: boolean;
}

export function MovieCard({
  item,
  type,
  className,
}: MovieCardProps): JSX.Element {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didPreviewRef = useRef(false);
  const isTouchRef = useRef(false);

  const title = "title" in item ? item.title : item.name;
  const releaseDate =
    "release_date" in item ? item.release_date : item.first_air_date;

  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const rating =
    typeof item.vote_average === "number"
      ? item.vote_average.toFixed(1)
      : "N/A";

  const link = item.isSupreme
    ? `/watch-ramadan/${encodeURIComponent(title)}`
    : type === "movie"
      ? `/movie/${createSlugWithId(item.id, title)}`
      : `/tv/${createSlugWithId(item.id, title)}`;

  // Spatial navigation support
  const { ref, focused } = useFocusable({
    onEnterPress: () => {
      navigate(link);
    },
  });

  const fetchTrailer = async () => {
    try {
      const videos = await fetchVideos(item.id, type);
      const trailer = videos.find(
        (v: any) =>
          v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      );
      if (trailer) {
        setTrailerKey(trailer.key);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    timeoutRef.current = setTimeout(() => {
      didPreviewRef.current = true;
      fetchTrailer();
    }, 1000); // Wait 1s before playing (Netflix style)
  };

  const handleTouchStart = () => {
    isTouchRef.current = true;
    handleMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Reset the preview flag after a short delay to allow onClick to check it
    setTimeout(() => {
      didPreviewRef.current = false;
      isTouchRef.current = false;
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only block navigation if it was a touch interaction AND we showed the preview
    // This allows desktop clicks to work always, but prevents mobile long-press release from navigating
    if (isTouchRef.current && didPreviewRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(link);
  };

  return (
    <div
      ref={ref as any}
      className={cn(
        "group relative block cursor-pointer transition-all duration-300",
        focused && "focused scale-105 z-10",
        isHovered && "z-20 scale-110",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart} // Proper touch handling
      onTouchEnd={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-md transition-shadow duration-500 group-hover:shadow-2xl">
        {isPlaying && trailerKey ? (
          <div className="absolute inset-0 z-10 bg-black overflow-hidden rounded-lg">
            <div className="absolute inset-0 animate-in fade-in duration-700">
              {/* Centered Iframe with "Cover" Effect */}
              <div className="absolute top-1/2 left-1/2 w-[400%] h-[170%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailerKey}&showinfo=0&fs=0&disablekb=1&iv_load_policy=3`}
                  title={title}
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.7) contrast(1.1)" }}
                />
              </div>
            </div>
          </div>
        ) : null}

        <img
          src={item.isSupreme ? item.poster_path : getImageUrl(item.poster_path, "w500")}
          alt={title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            !isPlaying && "group-hover:scale-110 group-hover:rotate-1"
          )}
          loading="lazy"
        />

        {/* Gradient Overlay - Ensure z-index is higher than video (z-10) */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {rating}
        </div>

        {/* Info Slide-up */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="line-clamp-2 text-sm font-bold text-white">{title}</h3>
          <p className="text-xs text-gray-300">{year}</p>
        </div>
      </div>

      {/* Title Mobile */}
      <div className="mt-2 lg:hidden transition-colors duration-300 group-hover:text-primary">
        <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </div>
  );
}

/* Enhanced Skeleton with Shimmer */
export function MovieCardSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-lg bg-muted relative overflow-hidden">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>
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
