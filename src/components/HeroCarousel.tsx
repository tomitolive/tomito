
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Info, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackdropUrl, Movie, TVShow, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  items: (Movie | TVShow)[];
  type: "movie" | "tv";
}

export function HeroCarousel({ items, type }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [items.length, isAutoPlaying]);

  if (items.length === 0) {
    return (
      <div className="h-[70vh] bg-gradient-to-b from-muted to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const title = "title" in currentItem ? currentItem.title : currentItem.name;
  const overview = currentItem.overview || t("noDescription");
  const rating = currentItem.vote_average?.toFixed(1) || "N/A";
  const link = type === "movie" ? `/movie/${currentItem.id}` : `/tv/${currentItem.id}`;
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goNext = () => goToSlide((currentIndex + 1) % items.length);
  const goPrev = () => goToSlide((currentIndex - 1 + items.length) % items.length);

  return (
    <div className="relative h-[70vh] lg:h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-gradient-side" />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/30 to-background/80" />

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl animate-fade-in" key={currentItem.id}>
          {/* Rating Badge */}
          <div className="inline-flex items-center gap-2 rating-badge mb-4">
            <Star className="w-4 h-4 fill-current" />
            {rating}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-base md:text-lg text-gray-200 mb-6 line-clamp-3 max-w-xl">
            {overview}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link to={link}>
                <Play className="w-5 h-5 fill-current" />
                {t("watchNow")}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="gap-2 text-base">
              <Link to={link}>
                <Info className="w-5 h-5" />
                {t("moreInfo")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/30 hover:bg-primary hover:text-primary-foreground text-white"
          onClick={goPrev}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-black/30 hover:bg-primary hover:text-primary-foreground text-white"
          onClick={goNext}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {items.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-1.5 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}
