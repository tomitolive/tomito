
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTextDirection, HeroMediaItem, Movie, TVShow, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  items: (HeroMediaItem | (Movie | TVShow & { mediaType?: "movie" | "tv" }))[];
  type?: "movie" | "tv";
  fullViewport?: boolean;
}

function getItemMediaType(
  item: Movie | TVShow | HeroMediaItem,
  fallback: "movie" | "tv" = "movie"
): "movie" | "tv" {
  if ("mediaType" in item && item.mediaType) return item.mediaType;
  if ("first_air_date" in item && item.first_air_date) return "tv";
  if ("release_date" in item && item.release_date) return "movie";
  return fallback;
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.round(rating / 2));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < filled
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function HeroCarousel({ items, type = "movie", fullViewport = false }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const isRtl = getTextDirection() === "rtl";

  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [items.length, isAutoPlaying]);

  if (items.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        fullViewport ? "h-screen" : "h-[70vh]"
      )}>
        <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const itemType = getItemMediaType(currentItem, type);
  const title = "title" in currentItem ? (currentItem as any).title : (currentItem as any).name;
  const overview = currentItem.overview || t("noDescription");
  const rating = currentItem.vote_average || 0;

  const isSupreme = (currentItem as any).isSupreme;
  const link = isSupreme
    ? `/ramadan-trailer/${encodeURIComponent((currentItem as any).clean_title || title)}`
    : itemType === "movie"
      ? `/movie/${currentItem.id}`
      : `/tv/${currentItem.id}`;

  const posterUrl = (() => {
    const path = currentItem.poster_path;
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    return getImageUrl(path, "w500");
  })();

  const getPosterSrc = (item: Movie | TVShow) => {
    const path = item.poster_path;
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    return getImageUrl(path, "w500");
  };

  const subtitle = itemType === "tv"
    ? (currentItem as TVShow).first_air_date?.slice(0, 4) || ""
    : (currentItem as Movie).release_date?.slice(0, 4) || "";

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className={cn(
      "relative overflow-hidden",
      fullViewport ? "h-auto md:h-screen" : "h-[70vh] lg:h-[85vh]"
    )}>
      <div className="relative h-full container mx-auto px-4 pt-[84px] pb-4 md:pt-14 md:pb-36 flex items-start md:items-center">
        <div
          key={currentItem.id}
          className={cn(
            "w-full max-w-5xl mx-auto flex flex-col gap-4 md:gap-10 animate-fade-in",
            isRtl ? "md:flex-row-reverse" : "md:flex-row"
          )}
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="flex-1 flex flex-col justify-center min-w-0 order-2 md:order-none">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 leading-tight">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm md:text-base text-muted-foreground mb-3 hidden md:block">{subtitle}</p>
            )}

            <div className="mb-4 hidden md:block">
              <StarRating rating={rating} />
            </div>

            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 line-clamp-3 md:line-clamp-4 leading-relaxed">
              {overview}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 text-base rounded-full px-6">
                <Link
                  to={link}
                >
                  <Play className="w-5 h-5 fill-current" />
                  {t("watchNow")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base rounded-full px-6">
                <Link
                  to={link}
                >
                  <Info className="w-5 h-5" />
                  {t("moreInfo")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 w-[220px] md:w-48 lg:w-56 xl:w-64 mx-auto md:mx-0 order-1 md:order-none">
            <img
              src={posterUrl}
              alt={title}
              className="w-full aspect-[2/3] max-h-[38vh] md:max-h-none object-cover rounded-lg shadow-[var(--shadow-card)]"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Mini cards */}
      <div className="relative md:absolute md:bottom-0 inset-x-0 z-10 pb-4 md:pb-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar justify-start md:justify-center">
            {items.slice(0, 10).map((item, index) => {
              const itemTitle = "title" in item ? (item as any).title : (item as any).name;
              const isActive = index === currentIndex;
              const mediaType = getItemMediaType(item, type);
              return (
                <button
                  key={`${mediaType}-${item.id}`}
                  onClick={() => goToSlide(index)}
                  aria-label={itemTitle}
                  className={cn(
                    "relative flex-shrink-0 w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-lg overflow-hidden transition-all duration-300",
                    isActive
                      ? "ring-2 ring-primary scale-105 shadow-[var(--shadow-glow)]"
                      : "opacity-50 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <img
                    src={getPosterSrc(item)}
                    alt={itemTitle}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
