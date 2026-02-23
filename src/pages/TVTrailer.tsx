import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Star, Calendar, ArrowRight, Users, Tv, Download, Server, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import {
    fetchTVDetails,
    fetchCredits,
    fetchSimilar,
    fetchVideos,
    getBackdropUrl,
    getImageUrl,
    TVShowDetails,
    Cast,
    TVShow,
    t
} from "@/lib/tmdb";
import { cn, getIdFromSlug } from "@/lib/utils";
import { event as trackEvent } from "@/lib/analytics";
import { SEO } from "@/components/SEO";


// Types for sharded data
interface DownloadLink {
    host: string;
    quality: string;
    url: string;
}

interface Season {
    season: string;
    downloads: DownloadLink[];
}

interface SeriesShardedData {
    tmdb_id: string;
    title: string;
    seasons: Season[];
}

// Global cache for index
let seriesIndexCache: Record<string, { t: string, b: number }> | null = null;

export default function TVTrailer() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const downloadSectionRef = useRef<HTMLDivElement>(null);

    const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
    const [cast, setCast] = useState<Cast[]>([]);
    const [similar, setSimilar] = useState<TVShow[]>([]);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Download data state
    const [downloadData, setDownloadData] = useState<SeriesShardedData | null>(null);
    const [isDownloadingLoading, setIsDownloadingLoading] = useState(false);
    const [activeSeason, setActiveSeason] = useState<string | null>(null);

    useEffect(() => {
        const loadTVShow = async () => {
            const actualId = getIdFromSlug(slug || "");
            if (!actualId) return;
            setIsLoading(true);
            try {
                const [tvData, castData, similarData, videosData] = await Promise.all([
                    fetchTVDetails(actualId),
                    fetchCredits("tv", actualId),
                    fetchSimilar("tv", actualId),
                    fetchVideos(actualId, "tv"),
                ]);
                setTVShow(tvData);
                setCast(castData.slice(0, 5));
                setSimilar(similarData as TVShow[]);

                // Find trailer (prefer official trailer, then teaser)
                const trailer = videosData.find(
                    (v: any) => v.type === "Trailer" && v.site === "YouTube"
                ) || videosData.find(
                    (v: any) => v.type === "Teaser" && v.site === "YouTube"
                );

                if (trailer) {
                    setTrailerKey(trailer.key);
                }

                trackEvent({
                    action: "view_trailer",
                    category: "Content",
                    label: tvData.name,
                    value: tvData.id,
                });

                // --- Load Sharded Data ---
                loadShardedData(actualId);

            } catch (error) {
                console.error("Error loading TV show:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const loadShardedData = async (tmdbId: string) => {
            setIsDownloadingLoading(true);
            try {
                // 1. Get or Load Index
                if (!seriesIndexCache) {
                    const idxRes = await fetch("/data_series/index.json");
                    seriesIndexCache = await idxRes.json();
                }

                // 2. Find in Index
                const entry = seriesIndexCache?.[tmdbId.toString()];
                if (entry && entry.b) {
                    // 3. Fetch specific chunk
                    const chunkRes = await fetch(`/data_series/chunks/chunk_${entry.b}.json`);
                    const chunkData: SeriesShardedData[] = await chunkRes.json();

                    // 4. Find the show in chunk
                    const showData = chunkData.find(s => s.tmdb_id === tmdbId.toString());
                    if (showData) {
                        setDownloadData(showData);
                        if (showData.seasons.length > 0) {
                            setActiveSeason(showData.seasons[0].season);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load download data:", err);
            } finally {
                setIsDownloadingLoading(false);
            }
        };

        loadTVShow();
        window.scrollTo(0, 0);
    }, [slug]);

    const scrollToDownloads = () => {
        downloadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const groupedLinks = useMemo(() => {
        if (!downloadData || !activeSeason) return {};
        const season = downloadData.seasons.find(s => s.season === activeSeason);
        if (!season) return {};

        const groups: Record<string, DownloadLink[]> = {};
        season.downloads.forEach(link => {
            if (!groups[link.quality]) {
                groups[link.quality] = [];
            }
            groups[link.quality].push(link);
        });
        return groups;
    }, [downloadData, activeSeason]);

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

    if (!tvShow) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">المسلسل غير موجود</h1>
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
            {/* SEO Meta Tags */}
            <SEO
                title={`مشاهدة تريلر ${tvShow.name} كامل HD`}
                description={`شاهد تريلر ${tvShow.name} الرسمي. ${tvShow.overview?.substring(0, 150)}...`}
                keywords={`${tvShow.name}, تريلر, مسلسل, مشاهدة, ${tvShow.genres?.map(g => g.name).join(', ')}, مسلسلات 2025, تحميل مسلسلات`}
                ogTitle={`تريلر ${tvShow.name}`}
                ogDescription={tvShow.overview || ''}
                ogType="video.other"
                canonical={`https://tomito.xyz/tv/${slug}`}
            />


            <Navbar />

            {/* Hero Background */}
            <div
                className="absolute inset-0 h-[40vh] bg-cover bg-center"
                style={{ backgroundImage: `url(${getBackdropUrl(tvShow.backdrop_path)})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
            </div>

            {/* Content */}
            <div className="relative pt-24 pb-8 container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link to="/" className="hover:text-primary transition-colors">{t("home")}</Link>
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                    <Link to="/category/tv/all" className="hover:text-primary transition-colors">{t("tvShows")}</Link>
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                    <span className="text-foreground">{tvShow.name}</span>
                </nav>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Trailer Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Trailer Video */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                            {trailerKey ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0`}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={`${tvShow.name} Trailer`}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-muted-foreground mb-4">التريلر غير متوفر حالياً</p>
                                        <Button
                                            size="lg"
                                            className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95 px-8 py-6 text-lg font-bold"
                                            onClick={() => navigate(`/tv/${tvShow.id}/watch`)}
                                        >
                                            <Play className="w-6 h-6 mr-2 fill-current" />
                                            {t("watchTV")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Watch Now Button - Positioned directly under trailer */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] active:scale-95 px-6 py-8 text-xl font-bold group/btn"
                                onClick={() => navigate(`/tv/${tvShow.id}/watch`)}
                            >
                                <Play className="w-6 h-6 mr-3 fill-current group-hover/btn:animate-pulse" />
                                <span className="relative">
                                    {t("watchNow")}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover/btn:w-full" />
                                </span>
                            </Button>

                            {downloadData && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="flex-1 border-primary/20 hover:bg-primary/5 text-primary px-6 py-8 text-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
                                    onClick={scrollToDownloads}
                                >
                                    <Download className="w-6 h-6 mr-3" />
                                    تحميل المسلسل
                                </Button>
                            )}
                        </div>

                        {/* TV Show Info */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{tvShow.name}</h1>
                            {tvShow.original_name !== tvShow.name && (
                                <p className="text-lg text-muted-foreground mb-4">{tvShow.original_name}</p>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="rating-badge">
                                    <Star className="w-4 h-4 fill-current" />
                                    {tvShow.vote_average?.toFixed(1)}
                                </div>
                                {tvShow.number_of_seasons && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Tv className="w-4 h-4" />
                                        {tvShow.number_of_seasons} {tvShow.number_of_seasons === 1 ? 'موسم' : 'مواسم'}
                                    </div>
                                )}
                                {tvShow.number_of_episodes && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Play className="w-4 h-4" />
                                        {tvShow.number_of_episodes} حلقة
                                    </div>
                                )}
                                {tvShow.first_air_date && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(tvShow.first_air_date).getFullYear()}
                                    </div>
                                )}
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tvShow.genres?.map((genre) => (
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
                                {tvShow.overview || t("noDescription")}
                            </p>

                            {/* Cast */}
                            {cast.length > 0 && (
                                <div className="flex items-center gap-2 text-sm mb-6">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t("actorsLabel")}</span>
                                    <div className="flex flex-wrap gap-1">
                                        {cast.map((actor, i) => (
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

                    {/* Sidebar - Poster & Ad Space */}
                    <div className="space-y-6 flex flex-col items-center lg:items-center">
                        <img
                            src={getImageUrl(tvShow.poster_path, "w500")}
                            alt={tvShow.name}
                            className="w-full max-w-[280px] lg:max-w-[240px] rounded-xl shadow-2xl mx-auto"
                        />


                    </div>
                </div>

                {similar.length > 0 && (
                    <div className="mt-12">
                        <ContentRow title={t("recommended")} items={similar} type="tv" />
                    </div>
                )}


                {/* Download Section */}
                {downloadData && (
                    <div ref={downloadSectionRef} className="mt-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                                    <h2 className="text-3xl font-black tracking-tight">{t("download" as any) || "تحميل المسلسل"}</h2>
                                </div>
                                <p className="text-muted-foreground text-sm font-medium mr-5">
                                    روابط تحميل مباشرة سريعة لجميع مواسم {tvShow.name}
                                </p>
                            </div>

                            {/* Season Selector */}
                            <div className="flex flex-wrap gap-2 mr-5">
                                {downloadData.seasons.map((s) => (
                                    <button
                                        key={s.season}
                                        onClick={() => setActiveSeason(s.season)}
                                        className={cn(
                                            "px-6 py-2 rounded-xl text-sm font-bold transition-all border",
                                            activeSeason === s.season
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground"
                                        )}
                                    >
                                        الموسم {s.season}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Links Grid */}
                        <div className="grid gap-6">
                            {Object.entries(groupedLinks).length > 0 ? (
                                Object.entries(groupedLinks).map(([quality, links]) => (
                                    <div key={quality} className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 hover:bg-card/60 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "px-4 py-1 rounded-lg text-xs font-black uppercase tracking-widest border",
                                                quality.includes("1080") || quality.toLowerCase() === "fhd"
                                                    ? "bg-primary/10 text-primary border-primary/20"
                                                    : "bg-white/5 text-muted-foreground border-white/10"
                                            )}>
                                                {quality}
                                            </div>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {links.map((link, idx) => (
                                                <a
                                                    key={idx}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group/link block"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group-hover/link:-translate-y-1">
                                                        <Server className="w-5 h-5 text-muted-foreground group-hover/link:text-primary transition-colors" />
                                                        <span className="text-xs font-bold text-muted-foreground group-hover/link:text-foreground line-clamp-1">{link.host}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-muted-foreground">لا توجد روابط تحميل متاحة لهذا الموسم حالياً</p>
                                </div>
                            )}
                        </div>

                        {/* CTA / Info Box */}
                        <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
                            <div className="flex gap-6 items-start text-right md:text-right">
                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary">
                                    <Download className="w-7 h-7" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-lg">تحميل آمن وسريع</h4>
                                    <p className="text-muted-foreground/80 text-sm font-medium leading-relaxed max-w-xl">
                                        نحن نوفر أفضل سيرفرات التحميل المباشرة لضمان أفضل تجربة. في حال تعطل أحد الروابط يمكنك دائماً تجربة سيرفر بديل أو مراسلتنا.
                                    </p>
                                </div>
                            </div>
                            <Button className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                انضم لمجتمعنا
                            </Button>
                        </div>
                    </div>
                )}

            </div>

            <Footer />
            <BackButton />
        </div>
    );
}

