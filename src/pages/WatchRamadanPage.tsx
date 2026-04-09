import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
    Play, Star, Clock, Calendar, ArrowRight, Home,
    ListVideo, Server, ChevronRight, Info, Sparkles,
    Maximize2, Minimize2, X
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { cn } from "@/lib/utils";
import { searchTV, fetchSeasonDetails, TMDB_CONFIG } from "@/lib/tmdb";
import { SupremePlayer } from "@/components/SupremePlayer";
import { PageLoader } from "@/components/PageLoader";

interface WatchServer {
    name: string;
    url: string;
}

interface Episode {
    id: string;
    title: string;
    episode_number: number | null;
    poster: string;
    description: string;
    watch_servers: WatchServer[];
    download_links: { name: string; url: string }[];
}

interface SeriesItem {
    id: string;
    title: string;
    clean_title: string;
    poster: string;
    description: string;
    year: string;
    type: string;
    episodes: Episode[];
}

// Returns a cleaned display name for a server
function getServerLabel(name: string): string {
    const cleaned = name.replace(/^\[IFRAME\]\s*/i, "").trim();
    const labels: Record<string, string> = {
        StreamHG: "StreamHG",
        EarnVids: "EarnVids",
        VK: "VK",
        doodstream: "DoodStream",
        vinovo: "Vinovo",
        mxdrop: "MxDrop",
        streamtape: "StreamTape",
        upshare: "UpShare",
    };
    return labels[cleaned] || cleaned;
}

// Smart image with graceful fallback
function EpisodeThumbnail({ src, alt }: { src: string; alt: string }) {
    const [failed, setFailed] = useState(false);
    if (failed || !src) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-black flex items-center justify-center">
                <Play className="w-4 h-4 text-primary fill-primary" />
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}

export function WatchRamadanPage() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [series, setSeries] = useState<SeriesItem | null>(null);
    const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);

    const seriesName = decodeURIComponent(slug || "").replace(/-/g, " ");

    // Helper: find VK server index, fallback to 0
    const findVKIndex = (servers: WatchServer[]): number => {
        const idx = servers.findIndex(s => s.name.toLowerCase().includes("vk"));
        return idx !== -1 ? idx : 0;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch granular JSON from new data directory
                const response = await fetch(`/data/ramadan/${slug}.json`);
                if (!response.ok) throw new Error("Series not found");
                const found: SeriesItem = await response.json();

                if (found) {
                    // Sort episodes by episode_number ascending
                    const sortedEpisodes = [...found.episodes].sort((a, b) =>
                        (a.episode_number || 0) - (b.episode_number || 0)
                    );
                    const updatedFound = { ...found, episodes: sortedEpisodes };

                    setSeries(updatedFound);
                    const urlEpNum = parseInt(searchParams.get("episode") || "0");
                    let epIdx = 0;
                    if (urlEpNum > 0) {
                        const idx = updatedFound.episodes.findIndex(
                            (e) => (e.episode_number === urlEpNum)
                        );
                        if (idx !== -1) epIdx = idx;
                    }
                    setSelectedEpisodeIndex(epIdx);

                    // Note: TMDB Enrichment is now handled server-side/during data merge
                    // to ensure all images (posters, backdrops, stills) are consistent and high-quality.
                }
            } catch (error) {
                console.error("Failed to load WatchRamadanPage data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug, searchParams]);

    // Keep URL in sync with current episode without triggering redundant state updates
    useEffect(() => {
        if (series && series.episodes.length > 0) {
            const ep = series.episodes[selectedEpisodeIndex];
            const epNum = ep.episode_number || (selectedEpisodeIndex + 1);
            const currentUrlEp = searchParams.get("episode");

            if (currentUrlEp !== String(epNum)) {
                setSearchParams({ episode: String(epNum) }, { replace: true });
            }
        }
    }, [selectedEpisodeIndex, series, searchParams, setSearchParams]);

    const selectEpisode = (index: number) => {
        setSelectedEpisodeIndex(index);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentEntry = series?.episodes[selectedEpisodeIndex];
    const episodeNumber = currentEntry?.episode_number || (selectedEpisodeIndex + 1);
    const servers = (currentEntry?.watch_servers || []).filter(s => !s.name.toLowerCase().includes("streamtape"));

    if (loading) return <PageLoader />;

    if (!series || series.episodes.length === 0) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <div className="bg-card p-10 rounded-2xl border border-border max-w-lg space-y-4">
                    <h1 className="text-2xl font-black">المسلسل غير موجود</h1>
                    <p className="text-muted-foreground text-sm">عذراً، لم نتمكن من العثور على أي حلقات لهذا المسلسل حالياً.</p>
                    <Button onClick={() => navigate("/ramadan")} className="w-full h-12 rounded-xl font-bold text-base gap-3">
                        <ArrowRight className="w-4 h-4" />
                        العودة إلى القائمة
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Navbar />

            {/* Cinematic Background Ambient Effects + Ramadan Crescents */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full opacity-40 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[130px] rounded-full opacity-30 -translate-x-1/2 translate-y-1/2" />
                {/* Crescent Moon Top-Right */}
                <svg className="absolute top-10 right-6 w-16 h-16 opacity-10 text-primary" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 5 A45 45 0 0 0 50 95 A30 30 0 0 1 50 5Z" />
                </svg>
                {/* Stars sprinkle */}
                <div className="absolute top-24 right-32 w-1 h-1 bg-yellow-300 rounded-full opacity-30 animate-pulse" />
                <div className="absolute top-40 right-16 w-1 h-1 bg-primary rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <main className="max-w-[1550px] mx-auto px-4 pt-32 pb-24 relative z-10">
                {/* High-End Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[11px] text-muted-foreground/60 mb-8 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar font-bold uppercase tracking-wide">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none">
                        <Home className="w-3.5 h-3.5" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors focus:outline-none">رمضان 2026</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link to={`/ramadan-trailer/${encodeURIComponent((series.clean_title || series.title).replace(/\s+/g, "-"))}`} className="hover:text-primary transition-colors focus:outline-none max-w-[150px] truncate">
                        {series.title}
                    </Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-primary font-black flex-shrink-0 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">الحلقة {episodeNumber}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-14 items-start">
                    {/* ── Main Production Column ── */}
                    <div className="space-y-8 flex flex-col">
                        {/* ── Supreme Video Player ── */}
                        <SupremePlayer
                            servers={servers.map(s => ({
                                name: getServerLabel(s.name),
                                url: s.url,
                                quality: "HD"
                            }))}
                            title={`${series.title} - الحلقة ${episodeNumber}`}
                        />

                        {/* ── Rich Episode Metadata ── */}
                        <div className="bg-card/30 border border-border rounded-3xl p-8 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Sparkles className="w-24 h-24 text-primary" />
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[9px] font-black tracking-widest uppercase">
                                    موسم رمضان 2026
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{series.title}</h1>
                                <p className="text-xl text-primary font-bold">الحلقة رقم {episodeNumber}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 relative z-10 text-[11px] font-bold">
                                {[
                                    { icon: <Calendar className="w-3.5 h-3.5 text-primary" />, text: series.year, label: "سنة الإنتاج" },
                                    { icon: <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />, text: "9.5 / 10", label: "التقييم" },
                                    { icon: <Clock className="w-3.5 h-3.5 text-primary" />, text: "45 دقيقة", label: "المدة" },
                                ].map(({ icon, text, label }, i) => (
                                    <div key={i} className="flex flex-col gap-1.5 p-4 bg-muted/50 border border-border rounded-2xl min-w-[120px] shadow-sm">
                                        <span className="text-[8px] text-muted-foreground/60 uppercase tracking-widest">{label}</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            {icon}
                                            <span>{text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {currentEntry?.description && (
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary" />
                                        <h3 className="text-lg font-black tracking-tight">ملخص الحلقة</h3>
                                    </div>
                                    <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                        {currentEntry.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 relative z-10">
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 rounded-xl gap-2 font-bold text-sm border-border hover:bg-accent transition-all"
                                    onClick={() => navigate(`/ramadan-trailer/${encodeURIComponent((series.clean_title || series.title).replace(/\s+/g, "-"))}`)}
                                >
                                    تفاصيل المسلسل
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── Modern Episode Sidebar ── */}
                    <div className="space-y-6 lg:sticky lg:top-32">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <ListVideo className="w-5 h-5 text-primary" />
                                الحلقات
                            </h3>
                            <div className="px-3 py-1 rounded-lg bg-muted border border-border text-[9px] font-black text-muted-foreground tracking-widest uppercase">
                                {series.episodes.length} ITEMS
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar p-1">
                            {series.episodes.map((ep, index) => {
                                const epNum = ep.episode_number || (index + 1);
                                const isActive = index === selectedEpisodeIndex;
                                return (
                                    <button
                                        key={ep.id}
                                        onClick={() => selectEpisode(index)}
                                        className={cn(
                                            "group relative flex flex-col p-2 rounded-xl border text-right transition-all duration-300 focus:outline-none",
                                            isActive
                                                ? "bg-primary border-primary shadow-lg shadow-primary/20"
                                                : "bg-card/50 border-border hover:bg-accent hover:border-primary/20 active:scale-95"
                                        )}
                                    >
                                        {/* Thumbnail Container */}
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted shadow-sm mb-2">
                                            <EpisodeThumbnail src={ep.poster || series.poster} alt={`الحلقة ${epNum}`} />
                                            {isActive ? (
                                                <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px] flex items-center justify-center">
                                                    <Play className="w-6 h-6 fill-white" />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Play className="w-6 h-6 fill-white drop-shadow-xl" />
                                                </div>
                                            )}
                                            <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-black text-white">
                                                EP {epNum}
                                            </div>
                                        </div>

                                        {/* Episode Info */}
                                        <div className="min-w-0">
                                            <p className={cn(
                                                "font-bold text-xs truncate leading-tight",
                                                isActive ? "text-white" : "text-foreground group-hover:text-primary"
                                            )}>الحلقة {epNum}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div >
            </main >

            <Footer />
            <BackButton />
        </div >
    );
}