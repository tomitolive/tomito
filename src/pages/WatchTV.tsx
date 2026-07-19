import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Play, Star, Clock, Calendar, ArrowRight, Users, ChevronDown, Maximize2, Minimize2, Settings2, Server, Sparkles, Download, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import TrailerAd from "@/components/TrailerAd";
import { ContentRow } from "@/components/ContentRow";
import { GenreFilters } from "@/components/GenreFilters";
import { Button } from "@/components/ui/button";
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
  fetchTVDetails,
  fetchSeasonDetails,
  fetchCredits,
  fetchSimilar,
  getBackdropUrl,
  getImageUrl,
  getImdbIdFromTmdb,
  TVShowDetails,
  Episode,
  Cast,
  TVShow,
  t,
  TV_SERVERS,
  VideoServer,
  getVideoUrl
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { event as trackEvent } from "@/lib/analytics";


// Multiple Consumet instances — races them to find the fastest working one
const CONSUMET_INSTANCES = [
  'https://api.consumet.org',
  'https://consumet-api.netlify.app',
  'https://consumet.eltik.dev',
];

async function fetchConsumetTV(
  showId: string,
  season: number,
  episode: number,
  signal: AbortSignal
): Promise<string | null> {
  // Try all instances in parallel — first to return a valid source wins
  const races = CONSUMET_INSTANCES.map(async base => {
    const infoRes = await axios.get(
      `${base}/meta/tmdb/info/${showId}?type=tv`,
      { signal, timeout: 8000 }
    );
    const episodeObj = infoRes.data?.episodes?.find(
      (ep: any) => ep.season === season && ep.number === episode
    );
    if (!episodeObj?.id) throw new Error('Episode not found');

    const watchRes = await axios.get(
      `${base}/meta/tmdb/watch/${episodeObj.id}?id=${showId}`,
      { signal, timeout: 8000 }
    );
    const sources = watchRes.data?.sources;
    if (sources && sources.length > 0) return sources[0].url as string;
    throw new Error('No sources');
  });

  try {
    return await Promise.any(races);
  } catch {
    return null;
  }
}

interface HlsPlayerProps {
  url: string;
  title: string;
  isFullscreen: boolean;
}

function HlsPlayer({ url, title, isFullscreen }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: any = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      const scriptId = 'hls-js-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      const initHls = () => {
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      };

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = initHls;
        document.body.appendChild(script);
      } else {
        if ((window as any).Hls) {
          initHls();
        } else {
          const prevOnload = script.onload;
          script.onload = (e) => {
            if (prevOnload) (prevOnload as any)(e);
            initHls();
          };
        }
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        title={title}
      />
    </div>
  );
}

type UnifiedServer =
  | { kind: 'tmdb'; server: VideoServer }
  | { kind: 'direct'; id: string; name: string; url: string; badge?: string };

export default function WatchTV() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<TVShow[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState<VideoServer>(TV_SERVERS[0]);

  // ── Unified player state ──
  const [activeServerId, setActiveServerId] = useState<string>('vidsrc_to');
  const [unifiedIframeKey, setUnifiedIframeKey] = useState(0);
  const [unifiedFullscreen, setUnifiedFullscreen] = useState(false);
  const [consumetUrl, setConsumetUrl] = useState<string | null>(null);
  const [consumetReady, setConsumetReady] = useState(false);
  const unifiedContainerRef = useRef<HTMLDivElement>(null);

  const [topcimaServers, setTopcimaServers] = useState<any[]>([]);
  const [downloadServers, setDownloadServers] = useState<any[]>([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    if (!id) return;
const loadTopcima = async () => {
        try {
          const res = await fetch(`https://topcima-api.vercel.app/api/tv/${id}/season/${selectedSeason}/episode/${selectedEpisode}`);
          const data = await res.json();
          if (data && (data.watchServers || data.currentIframe)) {
            const servers = data.watchServers ? [...data.watchServers] : [];
            setTopcimaServers(servers);
            if (data.downloadLinks) {
              setDownloadServers(data.downloadLinks);
            }
            const valid = servers.filter((s: any) => s.name && typeof s.name === 'string' && !s.name.toLowerCase().includes("streamtape"));
            if (valid.length > 0) {
              setActiveServerId('topcima-0');
            }
          } else {
            setTopcimaServers([]);
            setDownloadServers([]);
          }
        } catch (err) {
          console.error("TopCima fetch error:", err);
          setTopcimaServers([]);
          setDownloadServers([]);
        }
      };
    loadTopcima();
  }, [id, selectedSeason, selectedEpisode]);

  // Sync fullscreen state with browser changes
  useEffect(() => {
    const handleFsChange = () => setUnifiedFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleNavigate = (s: number, e: number) => {
    setSearchParams({ season: s.toString(), episode: e.toString() });
  };

  // Fetch Consumet direct stream silently in background — races multiple instances
  useEffect(() => {
    if (!id) return;
    setConsumetUrl(null);
    setConsumetReady(false);
    const controller = new AbortController();

    fetchConsumetTV(id, selectedSeason, selectedEpisode, controller.signal).then(url => {
      if (url) {
        setConsumetUrl(url);
        setConsumetReady(true);
      } else {
        console.info('All Consumet instances failed. Iframe fallback active.');
      }
    }).catch(() => {
      console.info('Consumet fetch aborted or errored.');
    });

    return () => controller.abort();
  }, [id, selectedSeason, selectedEpisode]);

  // Load initial data
  useEffect(() => {
    const loadShow = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [showData, castData, similarData] = await Promise.all([
          fetchTVDetails(parseInt(id)),
          fetchCredits("tv", parseInt(id)),
          fetchSimilar("tv", parseInt(id)),
        ]);
        setShow(showData);
        setCast(castData.slice(0, 10));
        setSimilar(similarData as TVShow[]);

        // Fetch IMDB ID
        const imdb = await getImdbIdFromTmdb(parseInt(id), "tv");
        setImdbId(imdb);

        trackEvent({
          action: "view_item",
          category: "Content",
          label: showData.name,
          value: showData.id,
        });

        // Set initial season from URL or default to 1
        const urlSeason = parseInt(searchParams.get("season") || "1");
        const urlEpisode = parseInt(searchParams.get("episode") || "1");
        setSelectedSeason(urlSeason);
        setSelectedEpisode(urlEpisode);
      } catch (error) {
        console.error("Error loading show:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadShow();
    window.scrollTo(0, 0);
  }, [id]);

  // Load episodes when season changes
  useEffect(() => {
    const loadEpisodes = async () => {
      if (!id || !show) return;
      try {
        const seasonData = await fetchSeasonDetails(parseInt(id), selectedSeason);
        setEpisodes(seasonData.episodes);
      } catch (error) {
        console.error("Error loading episodes:", error);
      }
    };

    if (show) {
      loadEpisodes();
    }
  }, [id, show, selectedSeason]);

  useEffect(() => {
    setSearchParams({ season: String(selectedSeason), episode: String(selectedEpisode) });
    // Reset player state when episode changes
    setUnifiedIframeKey(k => k + 1);
  }, [selectedSeason, selectedEpisode, setSearchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
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

  if (!show) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("tvShowNotFound")}</h1>
            <Button asChild>
              <Link to="/">{t("backHome")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
  const currentEpisode = episodes.find((e) => e.episode_number === selectedEpisode);

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
    {
      kind: 'direct' as const,
      id: 'consumet',
      name: 'سيرفر مباشر (Consumet)',
      url: consumetUrl || '',
      badge: 'مباشر (بدون إعلانات)'
    },
    ...TV_SERVERS.map(s => ({ kind: 'tmdb' as const, server: s })),
  ];

  const activeEntry = allServers.find(s =>
    s.kind === 'tmdb' ? s.server.id === activeServerId : s.id === activeServerId
  ) || allServers[0];

  let iframeUrl = '';
  if (activeEntry.kind === 'tmdb' && show) {
    iframeUrl = getVideoUrl(activeEntry.server, show.id, 'tv', selectedSeason, selectedEpisode, imdbId || undefined, { autoplay: true });
  } else if (activeEntry.kind === 'direct' && activeEntry.id !== 'consumet') {
    iframeUrl = activeEntry.url;
  }

  const switchServer = (newId: string) => {
    setActiveServerId(newId);
    setUnifiedIframeKey(k => k + 1);
    window.dispatchEvent(new CustomEvent('trigger-ad-popup'));
  };

  const getServerId = (s: UnifiedServer) => s.kind === 'tmdb' ? s.server.id : s.id;
  const getServerName = (s: UnifiedServer) => s.kind === 'tmdb' ? s.server.name : s.name;

  return (
    <div className="min-h-screen text-foreground pb-16">
      <Navbar />
      <BackButton />
      <div className="container mx-auto px-4 pt-32 max-w-7xl">
        {/* Main Row: Video Player (Left) + Episodes/Seasons (Right) */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16 w-full">

          {/* Video Player Column */}
          <div className="w-full lg:w-[70%] flex flex-col gap-6">
            {/* Server Selection */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-foreground whitespace-nowrap">السيرفرات</label>
              <Select value={activeServerId} onValueChange={switchServer}>
                <SelectTrigger className="w-full h-12 bg-card/50 border-border/50 text-foreground font-semibold rounded-xl focus:ring-primary focus:ring-2 text-right rtl:text-right">
                  <SelectValue placeholder="اختر السيرفر" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  {allServers.map((s) => {
                    const sid = getServerId(s);
                    const sname = getServerName(s);
                    return (
                      <SelectItem key={sid} value={sid} className="text-foreground font-semibold cursor-pointer transition-colors focus:bg-primary/20 rtl:flex-row-reverse">
                        <div className="flex items-center gap-2 text-right">
                          <span>{sname}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Video Player */}
            <div
              ref={unifiedContainerRef}
              className="relative aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black border border-border/30 ring-1 ring-border/20"
            >
              {activeServerId === 'consumet' && consumetUrl ? (
                <HlsPlayer url={consumetUrl} title={show.name} isFullscreen={unifiedFullscreen} />
              ) : (
                <iframe
                  key={unifiedIframeKey}
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}

              {/* Consumet Ready Badge */}
              {consumetReady && activeServerId !== 'consumet' && (
                <button
                  onClick={() => { setActiveServerId('consumet'); setUnifiedIframeKey(k => k + 1); }}
                  className="absolute top-2 left-2 z-[9999] flex items-center gap-1.5 px-3 py-1.5 bg-green-600/90 hover:bg-green-500 text-white text-xs font-bold rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 animate-pulse"
                  dir="rtl"
                >
                  ✨ بث مباشر متاح — انقر للتبديل
                </button>
              )}

              {/* Floating Zoom Button - Bottom Right */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUnifiedFullscreen();
                }}
                className="absolute bottom-2 right-2 z-[9999] h-8 w-8 bg-black/50 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md shadow-2xl rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center opacity-50 hover:opacity-100"
              >
                {unifiedFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              {/* Download Button - Bottom Left */}
              
            </div>

            {/* Download Button Below Video */}
            {downloadServers.length > 0 && (
              <div className="mt-4" dir="rtl">
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] w-full justify-center"
                >
                  <Download className="w-4 h-4" />
                  تحميل الحلقة {selectedEpisode}
                </button>
              </div>
            )}
          </div>

          {/* Episodes & Seasons Sidebar */}
          <div className="w-full lg:w-[30%] flex flex-col gap-6">
            {/* Season Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-card border border-border/50 rounded-xl hover:border-primary/50 hover:bg-card/80 transition-all duration-300 font-semibold"
              >
                <span className="text-sm">{t("seasonLabel")} {selectedSeason}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isSeasonDropdownOpen && "rotate-180")} />
              </button>
              {isSeasonDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-card border border-border/50 rounded-xl shadow-2xl z-30 max-h-80 overflow-y-auto">
                  {validSeasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        setSelectedSeason(season.season_number);
                        setSelectedEpisode(1);
                        setIsSeasonDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-right px-5 py-3 hover:bg-muted/50 transition-colors text-sm font-medium",
                        selectedSeason === season.season_number && "bg-primary text-primary-foreground"
                      )}
                    >
                      {season.name} <span className="text-muted-foreground/70 text-xs">({t("episodesCount").replace("{count}", String(season.episode_count))})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Episode Info */}
            {currentEpisode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border/30">
                <Play className="w-4 h-4 text-primary" />
                <span className="line-clamp-1">الحلقة {selectedEpisode}: {currentEpisode.name}</span>
              </div>
            )}

            {/* Episodes List */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-lg font-bold">{t("episodesInSeason").replace("{season}", String(selectedSeason))}</h2>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => setSelectedEpisode(episode.episode_number)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border-2 group hover:scale-[1.02]",
                      selectedEpisode === episode.episode_number
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border/30 bg-card/50 hover:border-primary/50 hover:bg-card"
                    )}
                  >
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                      {episode.still_path ? (
                        <img
                          src={getImageUrl(episode.still_path, "w300")}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-sm mb-0.5 line-clamp-1">{t("episodeLabel")} {episode.episode_number}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{episode.name}</p>
                    </div>
                    {selectedEpisode === episode.episode_number && downloadServers.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDownloadModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg border border-primary/30 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Magsrv Ad — يظهر في المنتصف */}
        <TrailerAd adKey={`${id}-mid`} />

        {/* Bottom Section: RTL Info layout */}
        <div className="w-full mb-16" dir="rtl">
          {/* Title Section */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-foreground leading-tight tracking-tight">
              {show.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground mb-6">
              <span className="font-medium">{show.original_name}</span>
              {show.first_air_date && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{new Date(show.first_air_date).getFullYear()}</span>
                </>
              )}
              {show.vote_average && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-foreground">{show.vote_average.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-3">
              {show.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/category/tv/${genre.id}`}
                  className="px-4 py-2 bg-card/50 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-card hover:text-primary transition-all duration-300 text-sm font-medium"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl">
              {show.overview || t("noDescription")}
            </p>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-7 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold">{t("castMembers") || "طاقم العمل"}</h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-8 hide-scrollbar">
                {cast.map(actor => (
                  <div
                    key={actor.id}
                    onClick={() => navigate(`/actor/${actor.id}`)}
                    className="cursor-pointer flex-shrink-0 w-32 text-center group"
                  >
                    <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20">
                      <img
                        src={getImageUrl(actor.profile_path, "w500")}
                        alt={actor.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{actor.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{actor.character}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Shows */}
          {similar.length > 0 && (
            <div className="border-t border-border/30 pt-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-7 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold">{t("similarTV") || "مسلسلات مشابهة"}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {similar.slice(0, 12).map(sm => (
                  <MovieCard key={sm.id} item={sm} type="tv" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-12 pb-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="font-medium">© 2026 Tomito. All rights reserved.</div>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-foreground transition-colors font-medium">{t("home")}</Link>
            <Link to="/category/tv/all" className="hover:text-foreground transition-colors font-medium">{t("tvShows")}</Link>
          </div>
        </div>

        {/* Magsrv Ad — يظهر مباشرة تحت الفيديو */}
        <TrailerAd adKey={id || ''} />
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/80">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">تحميل الحلقة {selectedEpisode}</h3>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Flex wrap for desktop and mobile */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-muted-foreground mb-4">اختر السيرفر المفضل لتحميل الحلقة:</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {downloadServers.map((s: any, i: number) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold rounded-xl border border-primary/30 transition-all duration-300 hover:scale-[1.03] min-w-[140px] justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span className="truncate">{s.server}</span>
                    {s.quality && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">{s.quality}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
