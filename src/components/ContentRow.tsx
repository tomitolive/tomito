import { Link } from "react-router-dom";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { Movie, TVShow, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { FocusContext } from "@noriginmedia/norigin-spatial-navigation";

interface ContentRowProps {
  title: string;
  items: (Movie | TVShow)[];
  type: "movie" | "tv";
  isLoading?: boolean;
  showAll?: string;
}

export function ContentRow({ title, items, type, isLoading, showAll }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
    const newScroll =
      direction === "left"
        ? scrollContainerRef.current.scrollLeft + scrollAmount
        : scrollContainerRef.current.scrollLeft - scrollAmount;
    scrollContainerRef.current.scrollTo({ left: newScroll, behavior: "smooth" });
  };

  return (
    <FocusContext.Provider value={`row-${title}`}>
      <section className="py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {showAll && (
            <Link
              to={showAll}
              className="text-sm text-primary hover:underline transition-colors"
            >
              {t("viewAll")}
            </Link>
          )}
        </div>

        {/* Content Row */}
        <div className="relative group">
          {/* Scroll Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 rounded-none",
              "bg-gradient-to-r from-background to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hidden md:flex items-center justify-start"
            )}
            onClick={() => scroll("left")}
          >
            <ChevronRight className="w-8 h-8 rtl-flip" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 rounded-none",
              "bg-gradient-to-l from-background to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hidden md:flex items-center justify-end"
            )}
            onClick={() => scroll("right")}
          >
            <ChevronLeft className="w-8 h-8 rtl-flip" />
          </Button>

          {/* Scrollable Content */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
          >
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 md:w-44 lg:w-48 snap-start">
                  <MovieCardSkeleton />
                </div>
              ))
              : items.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-36 md:w-44 lg:w-48 snap-start">
                  <MovieCard item={item} type={type} />
                </div>
              ))}
          </div>
        </div>
      </section>
    </FocusContext.Provider>
  );
}
