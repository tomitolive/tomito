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
    <div className="min-h-screen bg-background">
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

        {/* Load More */}
        {currentPage < totalPages && !isLoading && (
          <div className="text-center mt-8">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              {t("loadMore")}
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
