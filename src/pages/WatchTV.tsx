import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Play, Star, Clock, Calendar, ArrowRight, Users, ChevronDown, Maximize, Settings2, Server } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SupremePlayer } from "@/components/SupremePlayer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { GenreFilters } from "@/components/GenreFilters";
import { Button } from "@/components/ui/button";
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
  VideoServer
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { event as trackEvent } from "@/lib/analytics";
import { useSupremeServers } from "@/hooks/useSupremeServers";

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

  const supremeServers = useSupremeServers({
    seriesName: show?.name,
    seriesNameAr: show?.ar_name,
    episodeNumber: selectedEpisode,
  });

  const handleNavigate = (s: number, e: number) => {
    setSearchParams({ season: s.toString(), episode: e.toString() });
  };


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

  // Update URL when season/episode changes
  useEffect(() => {
    setSearchParams({ season: String(selectedSeason), episode: String(selectedEpisode) });
  }, [selectedSeason, selectedEpisode, setSearchParams]);

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

  if (!show) {
    return (
      <div className="min-h-screen bg-background">
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Background */}
      <div
        className="absolute inset-0 h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${getBackdropUrl(show.backdrop_path)})` }}
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
          <Link to="/category/tv/all" className="hover:text-primary transition-colors">{t("tvShows")}</Link>
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <span className="text-foreground">{show.name}</span>
        </nav>

        {/* Show Info Row */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 lg:w-64 mx-auto lg:mx-0">
            <img
              src={getImageUrl(show.poster_path, "w500")}
              alt={show.name}
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{show.name}</h1>
            {show.original_name !== show.name && (
              <p className="text-lg text-muted-foreground mb-4">{show.original_name}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="rating-badge">
                <Star className="w-4 h-4 fill-current" />
                {show.vote_average?.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t("seasonsCount").replace("{count}", String(show.number_of_seasons))}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {t("episodesCount").replace("{count}", String(show.number_of_episodes))}
              </div>
              {show.first_air_date && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(show.first_air_date).getFullYear()}
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {show.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/category/tv/${genre.id}`}
                  className="genre-tag"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Overview */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {show.overview || t("noDescription")}
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

        {/* Season & Episode Selection */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Season Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-accent transition-colors"
            >
              {t("seasonLabel")} {selectedSeason}
              <ChevronDown className={cn("w-4 h-4 transition-transform", isSeasonDropdownOpen && "rotate-180")} />
            </button>
            {isSeasonDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                {validSeasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => {
                      setSelectedSeason(season.season_number);
                      setSelectedEpisode(1);
                      setIsSeasonDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-right px-4 py-2 hover:bg-accent transition-colors",
                      selectedSeason === season.season_number && "bg-primary text-primary-foreground"
                    )}
                  >
                    {season.name} ({t("episodesCount").replace("{count}", String(season.episode_count))})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Player Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Play className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">
              {t("seasonLabel")} {selectedSeason} - {t("episodeLabel")} {selectedEpisode}
            </h2>
            {currentEpisode && (
              <span className="text-muted-foreground">| {currentEpisode.name}</span>
            )}
          </div>

          {/* Conditional Player Logic */}
          {supremeServers.length > 0 ? (
            <div className="mb-0">
              {/* New Frame/Supreme Player for Ramadan Series */}
              <SupremePlayer
                servers={supremeServers}
                title={`${show.name} - الحلقة ${selectedEpisode}`}
              />
            </div>
          ) : (
            <>
              {/* Server Selection UI for standard/foreign series */}
              <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
                {TV_SERVERS.map((server) => (
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

              {/* Simple Video Player Container */}
              <div className="max-w-4xl mx-auto">
                {show && (
                  <VideoPlayer
                    id={show.id}
                    type="tv"
                    title={show.name}
                    season={selectedSeason}
                    episode={selectedEpisode}
                    onNavigate={handleNavigate}
                    currentServer={currentServer}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Episodes Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t("episodesInSeason").replace("{season}", String(selectedSeason))}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {episodes.map((episode) => (
              <button
                key={episode.id}
                onClick={() => setSelectedEpisode(episode.episode_number)}
                className={cn(
                  "episode-card p-3 text-right",
                  selectedEpisode === episode.episode_number && "border-primary bg-primary/10"
                )}
              >
                <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                  {episode.still_path ? (
                    <img
                      src={getImageUrl(episode.still_path, "w500")}
                      alt={episode.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium text-sm line-clamp-1">{t("episodeLabel")} {episode.episode_number}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{episode.name}</p>
              </button>
            ))}
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

        {/* Similar Shows */}
        {similar.length > 0 && (
          <div className="mt-12">
            <GenreFilters type="tv" />
            <ContentRow title={t("similarTV")} items={similar} type="tv" />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
