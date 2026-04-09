import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Star, Clock, Calendar, ArrowRight, Users, Server, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { GenreFilters } from "@/components/GenreFilters";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
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
  VideoServer,
  getVideoUrl
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { event as trackEvent } from "@/lib/analytics";
import { useSupremeServers } from "@/hooks/useSupremeServers";
import { useExternalMovieData } from "@/hooks/useExternalMovieData";
import { PageLoader } from "@/components/PageLoader";


export default function WatchMovie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Unified player state ──
  // type: 'tmdb' uses getVideoUrl for MOVIE_SERVERS, 'direct' uses url as-is
  const [activeServerId, setActiveServerId] = useState<string>(MOVIE_SERVERS[0].id);
  const [unifiedIframeKey, setUnifiedIframeKey] = useState(0);
  const [unifiedShield, setUnifiedShield] = useState(0);
  const [unifiedFullscreen, setUnifiedFullscreen] = useState(false);
  const unifiedContainerRef = useRef<HTMLDivElement>(null);

  const supremeServers = useSupremeServers({
    movieTitle: movie?.title,
    movieTitleAr: movie?.ar_title
  });

  const { externalMovie } = useExternalMovieData(
    movie?.title,
    movie?.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
    movie?.ar_title
  );

  // External watch servers (now embedded as iframe player)
  const externalWatchServers = externalMovie?.watch_servers || [];

  // Sync fullscreen state with browser changes
  useEffect(() => {
    const handleFsChange = () => setUnifiedFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

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

  if (isLoading) return <PageLoader />;

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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowRight className="w-4 h-4 rtl-flip" />
          </Button>
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

        {/* ── Unified Video Player Section ── */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            {t("watchMovie")}
          </h2>

          {(() => {
            // Build unified server list
            type UnifiedServer =
              | { kind: 'tmdb'; server: VideoServer }
              | { kind: 'direct'; id: string; name: string; url: string; badge?: string };

            const allServers: UnifiedServer[] = [
              ...externalWatchServers
                .filter(s => s.name !== 'متعدد الجودات' && !s.name.toLowerCase().includes("streamtape"))
                .map((s, i) => ({
                  kind: 'direct' as const,
                  id: `ext-${i}`,
                  name: s.name,
                  url: s.url,
                  badge: 'مزوّد آخر',
                })),
              ...supremeServers
                .filter(s => !s.name.toLowerCase().includes("streamtape"))
                .map((s, i) => ({
                  kind: 'direct' as const,
                  id: `sup-${i}`,
                  name: s.name,
                  url: s.url,
                  badge: 'إضافي',
                })),
              ...MOVIE_SERVERS.map(s => ({ kind: 'tmdb' as const, server: s })),
            ];

            // Prioritize server_5: find it and move to front
            const s5Index = allServers.findIndex(s => (s.kind === 'tmdb' && s.server.id === 'server_5') || (s.kind === 'direct' && s.name === 'سيرفر 5'));
            if (s5Index > -1) {
              const [s5] = allServers.splice(s5Index, 1);
              allServers.unshift(s5);
            }

            const activeEntry = allServers.find(s =>
              s.kind === 'tmdb' ? s.server.id === activeServerId : s.id === activeServerId
            ) || allServers[0];

            // Update activeServerId if it's the default and we want to auto-select the now-prioritized first server
            if (activeServerId === 'server_6' && allServers.length > 0) {
              const firstSid = allServers[0].kind === 'tmdb' ? allServers[0].server.id : allServers[0].id;
              if (firstSid !== activeServerId) {
                setActiveServerId(firstSid);
              }
            }

            // Compute the iframe URL
            let iframeUrl = '';
            if (activeEntry.kind === 'tmdb' && movie) {
              iframeUrl = getVideoUrl(activeEntry.server, movie.id, 'movie', undefined, undefined, imdbId || undefined, { autoplay: true });
            } else if (activeEntry.kind === 'direct') {
              iframeUrl = activeEntry.url;
            }

            const switchServer = (newId: string) => {
              setActiveServerId(newId);
              setUnifiedIframeKey(k => k + 1);
              // Trigger recruitment ad modal on server switch
              window.dispatchEvent(new CustomEvent('trigger-ad-popup'));
            };

            const toggleFullscreen = async () => {
              if (!unifiedContainerRef.current) return;
              try {
                if (!document.fullscreenElement) {
                  await unifiedContainerRef.current.requestFullscreen();
                } else {
                  await document.exitFullscreen();
                }
              } catch (err) { console.error(err); }
            };

            const getServerId = (s: UnifiedServer) => s.kind === 'tmdb' ? s.server.id : s.id;
            const getServerName = (s: UnifiedServer) => s.kind === 'tmdb' ? s.server.name : s.name;
            const getBadge = (s: UnifiedServer): string | undefined => s.kind === 'direct' ? s.badge : undefined;

            return (
              <>
                {/* Unified Server Selection */}
                <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
                  {allServers.map((s) => {
                    const sid = getServerId(s);
                    const sname = getServerName(s);
                    const badge = getBadge(s);
                    const isActive = sid === activeServerId;
                    return (
                      <button
                        key={sid}
                        onClick={() => switchServer(sid)}
                        className={cn(
                          "h-9 px-4 rounded-lg transition-all backdrop-blur-md shadow-sm border flex items-center gap-2 relative",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
                        )}
                      >
                        <Server className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">{sname}</span>
                        {badge && (
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                            isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                          )}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Unified Video Player */}
                <div className="max-w-4xl mx-auto relative group/player">
                  <div
                    ref={unifiedContainerRef}
                    className={cn(
                      "relative aspect-video rounded-xl shadow-2xl border border-border/50 overflow-hidden bg-black transition-all duration-300",
                      unifiedFullscreen && "rounded-none border-0"
                    )}
                  >
                    <iframe
                      key={unifiedIframeKey}
                      src={iframeUrl}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share; accelerometer; gyroscope; focus-without-user-activation"
                      referrerPolicy="origin"
                      allowFullScreen
                      scrolling="no"
                      title={`${movie.title} - ${getServerName(activeEntry)}`}
                    />

                    {/* AdBlock Shield */}
                    {unifiedShield > 0 && (
                      <div
                        className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[6px] cursor-pointer flex flex-col items-center justify-center group/shield transition-all duration-500"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUnifiedShield(prev => prev - 1);
                        }}
                      >
                        <div className="relative">
                          <div className={cn(
                            "absolute inset-0 bg-primary/20 blur-3xl rounded-full transition-all duration-700",
                            unifiedShield === 1 ? "bg-orange-500/30 scale-150" : "group-hover/shield:scale-150"
                          )} />
                          <div className={cn(
                            "relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 transition-all duration-500",
                            unifiedShield === 1 ? "bg-orange-500 scale-110 rotate-12" : "bg-primary group-hover/shield:scale-110"
                          )}>
                            {unifiedShield === 2 ? (
                              <Play className="w-12 h-12 fill-white translate-x-1" />
                            ) : (
                              <Sparkles className="w-12 h-12 text-white animate-pulse" />
                            )}
                          </div>
                        </div>

                        <div className="mt-10 text-center space-y-4 max-w-xs px-6">
                          <p className="text-2xl font-black text-white tracking-tight">
                            {unifiedShield === 2 ? "تشغيل آمن" : "تأكيد الحماية"}
                          </p>
                          <div className={cn(
                            "flex items-center gap-2 justify-center px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                            unifiedShield === 2
                              ? "bg-green-500/10 border border-green-500/20 text-green-500"
                              : "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                          )}>
                            <div className={cn(
                              "w-2 h-2 rounded-full animate-pulse",
                              unifiedShield === 2 ? "bg-green-500" : "bg-orange-500"
                            )} />
                            {unifiedShield === 2 ? "SHIELD ACTIVE" : "BLOCKING POPUPS... CLICK AGAIN"}
                          </div>
                          <p className="text-white/40 text-[10px] font-bold leading-relaxed">
                            {unifiedShield === 2
                              ? "اضغط هنا لبدء المشاهدة بدون إعلانات منبثقة"
                              : "نقرة واحدة أخيرة لفتح المشغل بأمان تام"}
                          </p>
                        </div>

                        <div className="absolute bottom-10 flex flex-col items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className={cn("w-8 h-1 rounded-full transition-all duration-500", unifiedShield <= 2 ? "bg-primary" : "bg-white/10")} />
                            <div className={cn("w-8 h-1 rounded-full transition-all duration-500", unifiedShield <= 1 ? "bg-primary" : "bg-white/10")} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fullscreen Button */}
                    <div className="absolute bottom-4 right-4 z-[9999] opacity-100 lg:opacity-0 lg:group-hover/player:opacity-100 transition-opacity pointer-events-none">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md shadow-2xl rounded-full pointer-events-auto flex items-center justify-center"
                      >
                        {unifiedFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
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
      <BackButton />
    </div>
  );
}
