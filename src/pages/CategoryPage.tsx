import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Filter, ChevronDown, Grid, Rows } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { fetchByGenre, fetchPopular, fetchGenres, Genre, Movie, TVShow, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const { type, genreId } = useParams<{ type: "movie" | "tv"; genreId: string }>();
  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [gridView, setGridView] = useState<"grid" | "list">("grid");

  const mediaType = type as "movie" | "tv";
  const isAllCategory = genreId === "all";
  const currentGenre = genres.find((g) => g.id === parseInt(genreId || "0"));

  // Load popup script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl30597544.profitableratecpmnetwork.com/c3/e8/93/c3e893c4344bbee9205294b8e255c444.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await fetchGenres(mediaType);
        setGenres(genresData);
      } catch (error) {
        console.error("Error loading genres:", error);
      }
    };
    loadGenres();
  }, [mediaType]);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        let data;
        if (isAllCategory) {
          data = await fetchPopular(mediaType, currentPage);
        } else {
          data = await fetchByGenre(mediaType, parseInt(genreId || "0"), currentPage);
        }
        setItems((prev) => (currentPage === 1 ? data.results : [...prev, ...data.results]));
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, [mediaType, genreId, currentPage]);

  // Reset when category changes
  useEffect(() => {
    setItems([]);
    setCurrentPage(1);
  }, [mediaType, genreId]);

  const categoryTitle = isAllCategory
    ? mediaType === "movie"
      ? t("allMovies")
      : t("allTVShows")
    : currentGenre?.name || t("category");

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-8 container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">{t("home")}</Link>
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <span className="text-foreground">{categoryTitle}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">{categoryTitle}</h1>

          <div className="flex items-center gap-3">
            {/* Genre Filter Dropdown */}
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {t("filterByGenre")}
                <ChevronDown className={cn("w-4 h-4 transition-transform", isGenreDropdownOpen && "rotate-180")} />
              </Button>

              {isGenreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
                  <Link
                    to={`/category/${mediaType}/all`}
                    onClick={() => setIsGenreDropdownOpen(false)}
                    className={cn(
                      "block px-4 py-2 hover:bg-accent transition-colors",
                      isAllCategory && "bg-primary text-primary-foreground"
                    )}
                  >
                    {t("all")}
                  </Link>
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      to={`/category/${mediaType}/${genre.id}`}
                      onClick={() => setIsGenreDropdownOpen(false)}
                      className={cn(
                        "block px-4 py-2 hover:bg-accent transition-colors",
                        genreId === String(genre.id) && "bg-primary text-primary-foreground"
                      )}
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-none", gridView === "grid" && "bg-secondary")}
                onClick={() => setGridView("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-none", gridView === "list" && "bg-secondary")}
                onClick={() => setGridView("list")}
              >
                <Rows className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          <Link
            to={`/category/${mediaType}/all`}
            className={cn("genre-tag whitespace-nowrap", isAllCategory && "bg-primary text-primary-foreground")}
          >
            {t("all")}
          </Link>
          {genres.map((genre) => (
            <Link
              key={genre.id}
              to={`/category/${mediaType}/${genre.id}`}
              className={cn(
                "genre-tag whitespace-nowrap",
                genreId === String(genre.id) && "bg-primary text-primary-foreground"
              )}
            >
              {genre.name}
            </Link>
          ))}
        </div>

        {/* Content Grid */}
        <div
          className={cn(
            "grid gap-4",
            gridView === "grid"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              : "grid-cols-1 md:grid-cols-2"
          )}
        >
          {isLoading && currentPage === 1
            ? Array.from({ length: 18 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))
            : items.map((item) => (
              <MovieCard key={item.id} item={item} type={mediaType} />
            ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ArrowRight className="w-4 h-4 rtl-flip" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronDown className="w-4 h-4 rotate-90 rtl-flip" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronDown className="w-4 h-4 -rotate-90 rtl-flip" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ArrowRight className="w-4 h-4 rotate-180 rtl-flip" />
            </Button>
          </div>
        )}

        {/* Loading More */}
        {isLoading && currentPage > 1 && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
