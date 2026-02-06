import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, Film, Tv, User, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchMulti, getImageUrl, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type MediaType = "all" | "movie" | "tv" | "person";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaType>("all");
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const data = await searchMulti(q);
      setResults(data.results);
      setTotalResults(data.total_results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const filteredResults = results.filter((item) => {
    if (mediaFilter === "all") return true;
    return item.media_type === mediaFilter;
  });

  const stats = {
    movies: results.filter((r) => r.media_type === "movie").length,
    tv: results.filter((r) => r.media_type === "tv").length,
    person: results.filter((r) => r.media_type === "person").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">{t("home")}</Link>
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <span className="text-foreground">{t("search")}</span>
        </nav>

        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {query ? `${t("searchResultsFor")} "${query}"` : t("searchMoviesSeriesActors")}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("searchPlaceholderFull")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pr-12 text-lg bg-card border-border"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <SearchIcon className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {/* Results Stats */}
          {query && !isLoading && (
            <p className="mt-4 text-muted-foreground">
              {t("resultsFound").replace("{count}", String(totalResults))}
            </p>
          )}
        </div>

        {/* Filters */}
        {results.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={mediaFilter === "all" ? "default" : "secondary"}
              onClick={() => setMediaFilter("all")}
              className="gap-2"
            >
              {t("all")}
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {results.length}
              </span>
            </Button>
            <Button
              variant={mediaFilter === "movie" ? "default" : "secondary"}
              onClick={() => setMediaFilter("movie")}
              className="gap-2"
            >
              <Film className="w-4 h-4" />
              {t("movies")}
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {stats.movies}
              </span>
            </Button>
            <Button
              variant={mediaFilter === "tv" ? "default" : "secondary"}
              onClick={() => setMediaFilter("tv")}
              className="gap-2"
            >
              <Tv className="w-4 h-4" />
              {t("tvShows")}
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {stats.tv}
              </span>
            </Button>
            <Button
              variant={mediaFilter === "person" ? "default" : "secondary"}
              onClick={() => setMediaFilter("person")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              {t("actors")}
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {stats.person}
              </span>
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t("searching")}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && filteredResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredResults.map((item) => {
              if (item.media_type === "person") {
                return (
                  <Link
                    key={item.id}
                    to={`/actor/${item.id}`}
                    className="actor-card"
                  >
                    <img
                      src={getImageUrl(item.profile_path, "w500")}
                      alt={item.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                    <p className="text-sm font-medium text-center mt-2">{item.name}</p>
                    <p className="text-xs text-muted-foreground text-center">{t("actor")}</p>
                  </Link>
                );
              }
              return (
                <MovieCard
                  key={item.id}
                  item={item}
                  type={item.media_type as "movie" | "tv"}
                />
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && filteredResults.length === 0 && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("noResults")}</h2>
            <p className="text-muted-foreground">{t("tryDifferentKeywords")}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !query && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("startSearch")}</h2>
            <p className="text-muted-foreground">{t("searchMoviesSeriesActors")}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
