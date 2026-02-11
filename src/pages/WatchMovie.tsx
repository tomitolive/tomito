import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Clock, Calendar, ArrowRight, Users, Maximize, Settings2, Server } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { GenreFilters } from "@/components/GenreFilters";
import { Button } from "@/components/ui/button";
import {
  fetchMovieDetails,
  fetchCredits,
  fetchSimilar,
  getBackdropUrl,
  getImageUrl,
  getImdbIdFromTmdb,
  MovieDetails,
  Cast,
  Movie,
  t,
  MOVIE_SERVERS,
  VideoServer
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { event as trackEvent } from "@/lib/analytics";


export default function WatchMovie() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentServer, setCurrentServer] = useState<VideoServer>(MOVIE_SERVERS[0]);


  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [movieData, castData, similarData] = await Promise.all([
          fetchMovieDetails(parseInt(id)),
          fetchCredits("movie", parseInt(id)),
          fetchSimilar("movie", parseInt(id)),
        ]);
        setMovie(movieData);
        setCast(castData.slice(0, 10));
        setSimilar(similarData as Movie[]);

        // Fetch IMDB ID for servers that need it
        const imdb = await getImdbIdFromTmdb(parseInt(id), "movie");
        setImdbId(imdb);

        trackEvent({
          action: "view_item",
          category: "Content",
          label: movieData.title,
          value: movieData.id,
        });
      } catch (error) {
        console.error("Error loading movie:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("movieNotFound")}</h1>
            <Button asChild>
              <Link to="/">{t("backHome")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Background */}
      <div
        className="absolute inset-0 h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative pt-24 pb-8 container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">{t("home")}</Link>
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <Link to="/category/movie/all" className="hover:text-primary transition-colors">{t("movies")}</Link>
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <span className="text-foreground">{movie.title}</span>
        </nav>

        {/* Movie Info Row */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 lg:w-64 mx-auto lg:mx-0">
            <img
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{movie.title}</h1>
            {movie.original_title !== movie.title && (
              <p className="text-lg text-muted-foreground mb-4">{movie.original_title}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="rating-badge">
                <Star className="w-4 h-4 fill-current" />
                {movie.vote_average?.toFixed(1)}
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {Math.floor(movie.runtime / 60)}{t("hoursShort")} {movie.runtime % 60}{t("minutesShort")}
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(movie.release_date).getFullYear()}
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/category/movie/${genre.id}`}
                  className="genre-tag"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Overview */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {movie.overview || t("noDescription")}
            </p>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("actorsLabel")}</span>
                <div className="flex flex-wrap gap-1">
                  {cast.slice(0, 5).map((actor, i) => (
                    <Link
                      key={actor.id}
                      to={`/actor/${actor.id}`}
                      className="text-primary hover:underline"
                    >
                      {actor.name}{i < 4 && cast.length > i + 1 ? "،" : ""}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Player Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            {t("watchMovie")}
          </h2>


          {/* Server Selection UI - Moved from inside VideoPlayer */}
          <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
            {MOVIE_SERVERS.map((server) => (
              <button
                key={server.id}
                onClick={() => setCurrentServer(server)}
                className={cn(
                  "h-9 px-4 rounded-lg transition-all backdrop-blur-md shadow-sm border flex items-center gap-2",
                  currentServer.id === server.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
                )}
              >
                <Server className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">{server.name}</span>
              </button>
            ))}
          </div>

          {/* Video Player Container */}
          <div className="relative group max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl border border-border/50">
            {movie && (
              <VideoPlayer
                id={movie.id}
                type="movie"
                title={movie.title}
                currentServer={currentServer}
              />
            )}
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t("castMembers")}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {cast.map((actor) => (
                <Link
                  key={actor.id}
                  to={`/actor/${actor.id}`}
                  className="actor-card flex-shrink-0 w-28"
                >
                  <img
                    src={getImageUrl(actor.profile_path, "w500")}
                    alt={actor.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <p className="text-sm font-medium text-center mt-2 line-clamp-1">{actor.name}</p>
                  <p className="text-xs text-muted-foreground text-center line-clamp-1">{actor.character}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="mt-12">
            <GenreFilters type="movie" />
            <ContentRow title={t("similarMovies")} items={similar} type="movie" />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
