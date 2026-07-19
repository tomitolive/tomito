import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Maximize2, Minimize2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { MovieCard } from "@/components/MovieCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchMovieDetails,
  fetchCredits,
  fetchSimilar,
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
import TrailerAd from "@/components/TrailerAd";



export default function WatchMovie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Unified player state ──
  const [activeServerId, setActiveServerId] = useState<string>(MOVIE_SERVERS[0].id);
  const [unifiedIframeKey, setUnifiedIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state with browser
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const [topcimaServers, setTopcimaServers] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
const loadTopcima = async () => {
        try {
          const res = await fetch(`https://topcima-api.vercel.app/api/movie/${id}`);
          const data = await res.json();
          if (data && (data.watchServers || data.currentIframe)) {
            const servers = data.watchServers ? [...data.watchServers] : [];
            setTopcimaServers(servers);
          const valid = servers.filter((s: any) => s.name && typeof s.name === 'string' && !s.name.toLowerCase().includes("streamtape"));
          if (valid.length > 0) {
            setActiveServerId('topcima-0');
          }
        } else {
          setTopcimaServers([]);
        }
      } catch (err) {
        console.error("TopCima fetch error:", err);
        setTopcimaServers([]);
      }
    };
    loadTopcima();
  }, [id]);

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
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <Navbar />
        <h1 className="text-2xl font-bold">{t("movieNotFound")}</h1>
      </div>
    );
  }

  type UnifiedServer =
    | { kind: 'tmdb'; server: VideoServer }
    | { kind: 'direct'; id: string; name: string; url: string; badge?: string };

  const allServers: UnifiedServer[] = [
    ...topcimaServers
      .filter((s: any) => s.name && typeof s.name === 'string' && !s.name.toLowerCase().includes("streamtape"))
      .map((s: any, i: number) => ({
        kind: 'direct' as const,
        id: `topcima-${i}`,
        name: s.name,
        url: s.iframeUrl || s.url,
        badge: 'TopCima',
      })),
    ...MOVIE_SERVERS.map(s => ({ kind: 'tmdb' as const, server: s })),
  ];



  const activeEntry = allServers.find(s =>
    s.kind === 'tmdb' ? s.server.id === activeServerId : s.id === activeServerId
  ) || allServers[0];

  let iframeUrl = '';
  if (activeEntry.kind === 'tmdb' && movie) {
    iframeUrl = getVideoUrl(activeEntry.server, movie.id, 'movie', undefined, undefined, imdbId || undefined, { autoplay: true });
  } else if (activeEntry.kind === 'direct') {
    iframeUrl = activeEntry.url;
  }

  const switchServer = (newId: string) => {
    setActiveServerId(newId);
    setUnifiedIframeKey(k => k + 1);
  };

  const getServerId = (s: UnifiedServer) => s.kind === 'tmdb' ? s.server.id : s.id;
  const getServerName = (s: UnifiedServer) => s.kind === 'tmdb' ? s.server.name : s.name;

  return (
    <div className="min-h-screen text-foreground pb-12">
      <Navbar />
      <BackButton />
      <div className="container mx-auto px-4 pt-28">
        {/* Top Row: Video Player (70%) + Servers Sidebar (30%) */}
        <div className="flex flex-col-reverse lg:flex-row gap-6 mb-12 w-full max-w-7xl mx-auto">

          {/* Video Player */}
          <div className="w-full lg:w-[70%]">
            <div
              ref={containerRef}
              className="relative aspect-video rounded-xl shadow-2xl overflow-hidden bg-black border border-border/50"
            >
              {/* Fullscreen Button */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    containerRef.current?.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
                className="absolute bottom-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110 shadow-lg"
                title={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <iframe
                key={unifiedIframeKey}
                src={iframeUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>


          {/* Mobile Server Select */}
          <div className="w-full lg:hidden mb-2" dir="rtl">
            <Select value={activeServerId} onValueChange={(value) => switchServer(value)}>
              <SelectTrigger className="w-full h-14 bg-secondary/50 border-border text-foreground font-bold rounded-xl focus:ring-primary focus:ring-2 text-right rtl:text-right">
                <SelectValue placeholder="اختر السيرفر" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {allServers.map((s) => {
                  const sid = getServerId(s);
                  const sname = getServerName(s);
                  const isVip = sname.toLowerCase().includes('vip');
                  return (
                    <SelectItem key={sid} value={sid} className="text-foreground font-bold cursor-pointer transition-colors focus:bg-primary/20 rtl:flex-row-reverse">
                      <div className="flex items-center gap-2 text-right">
                        <span>{sname}</span>
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{isVip ? '4K VIP' : '1080p'}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Servers Sidebar */}
          <div className="hidden lg:grid w-[30%] grid-cols-2 content-start gap-3 lg:max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {allServers.map((s) => {
              const sid = getServerId(s);
              const sname = getServerName(s);
              const isActive = sid === (activeEntry.kind === 'tmdb' ? activeEntry.server.id : activeEntry.id);
              const isVip = sname.toLowerCase().includes('vip');
              const qualityBadge = isVip ? '4K' : '1080p';

              return (
                <button
                  key={sid}
                  onClick={() => switchServer(sid)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 w-full group border relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] font-bold tracking-wider",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-black/30 text-muted-foreground"
                  )}>
                    {qualityBadge}
                  </div>

                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors mt-2",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground group-hover:bg-background/80"
                  )}>
                    <Play className={cn("w-3.5 h-3.5 ml-0.5", isActive ? "fill-current" : "")} />
                  </div>

                  <span className={cn(
                    "font-bold tracking-wide transition-colors text-[13px] leading-tight line-clamp-1 mb-1",
                    isActive ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {sname}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Magsrv Ad — يظهر في المنتصف */}
        <TrailerAd adKey={`${id}-mid`} />

        {/* Bottom Section: RTL Info layout */}
        <div className="w-full mb-12" dir="rtl">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground leading-tight text-right w-full">
            {movie.title}
          </h1>

          {/* Original Title & Year */}
          <div className="text-lg text-muted-foreground mb-6 font-medium flex justify-start items-center gap-2 w-full text-right">
            <span>{movie.original_title}</span>
            {movie.release_date && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2.5 mb-8 justify-start">
            {movie.genres?.map(g => (
              <span key={g.id} className="genre-tag">
                {g.name}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl text-right mb-12">
            {movie.overview || t("noDescription")}
          </p>

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t("castMembers") || "طاقم العمل"}</h2>
              <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar justify-start">
                {cast.map(actor => (
                  <div key={actor.id} onClick={() => navigate(`/actor/${actor.id}`)} className="cursor-pointer flex-shrink-0 w-28 text-center group bg-transparent border-none">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-primary transition-colors shadow-sm">
                      <img src={getImageUrl(actor.profile_path, "w500")} alt={actor.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{actor.name}</div>
                    <div className="text-[12px] text-muted-foreground line-clamp-1 mt-1">{actor.character}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Movies */}
          {similar.length > 0 && (
            <div className="mt-12 border-t border-border pt-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">{t("similarMovies") || "أفلام مشابهة"}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 xl:gap-8">
                {similar.slice(0, 6).map(sm => (
                  <MovieCard key={sm.id} item={sm} type="movie" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 pb-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
          <div>Copyright © 2026, Inc. All rights reserved</div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
            <Link to="/category/movie/all" className="hover:text-foreground transition-colors">{t("movies")}</Link>
          </div>
        </div>

        {/* Magsrv Ad — يظهر مباشرة تحت الفيديو */}
        <TrailerAd adKey={id || ''} />
      </div>
    </div>
  );
}
