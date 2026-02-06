import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ContentRow } from "@/components/ContentRow";
import { fetchTrending, fetchPopular, fetchTopRated, Movie, TVShow, t } from "@/lib/tmdb";

const Index = () => {
  const [trending, setTrending] = useState<(Movie | TVShow)[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<TVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingData, popularMoviesData, popularTVData, topMoviesData, topTVData] = await Promise.all([
          fetchTrending("movie", "week"),
          fetchPopular("movie"),
          fetchPopular("tv"),
          fetchTopRated("movie"),
          fetchTopRated("tv"),
        ]);

        setTrending(trendingData.slice(0, 10));
        setPopularMovies(popularMoviesData.results as Movie[]);
        setPopularTV(popularTVData.results as TVShow[]);
        setTopRatedMovies(topMoviesData.results as Movie[]);
        setTopRatedTV(topTVData.results as TVShow[]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroCarousel items={trending} type="movie" />

      {/* Content Sections */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <ContentRow
          title={t("trendingMovies")}
          items={popularMovies}
          type="movie"
          isLoading={isLoading}
          showAll="/category/movie/all"
        />

        <ContentRow
          title={t("trendingTV")}
          items={popularTV}
          type="tv"
          isLoading={isLoading}
          showAll="/category/tv/all"
        />

        <ContentRow
          title={t("topRatedMovies")}
          items={topRatedMovies}
          type="movie"
          isLoading={isLoading}
          showAll="/category/movie/all"
        />

        <ContentRow
          title={t("topRatedTV")}
          items={topRatedTV}
          type="tv"
          isLoading={isLoading}
          showAll="/category/tv/all"
        />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
