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
import { cn } from "@/lib/utils";

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
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [iframeKey, setIframeKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [shieldClicks, setShieldClicks] = useState(2);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync fullscreen state with browser changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    };

    const seriesName = decodeURIComponent(slug || "").replace(/-/g, " ");

    // Helper: find VK server index, fallback to 0
    const findVKIndex = (servers: WatchServer[]): number => {
        const idx = servers.findIndex(s => s.name.toLowerCase().includes("vk"));
        return idx !== -1 ? idx : 0;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/ramadan_2026_results.json");
                const data: SeriesItem[] = await response.json();

                const found = data.find(item =>
                    (item.clean_title && item.clean_title.toLowerCase() === seriesName.toLowerCase()) ||
                    (item.title && item.title.toLowerCase() === seriesName.toLowerCase())
                );

                if (found) {
                    setSeries(found);
                    const urlEpNum = parseInt(searchParams.get("episode") || "0");
                    let epIdx = 0;
                    if (urlEpNum > 0) {
                        const idx = found.episodes.findIndex(
                            (e) => (e.episode_number === urlEpNum)
                        );
                        if (idx !== -1) epIdx = idx;
                    }
                    setSelectedEpisodeIndex(epIdx);
                    // Default to VK server
                    const servers = found.episodes[epIdx]?.watch_servers || [];
                    setActiveServerIndex(findVKIndex(servers));
                }
            } catch (error) {
                console.error("Failed to load WatchRamadanPage data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [seriesName]);

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
        const epServers = series?.episodes[index]?.watch_servers || [];
        setActiveServerIndex(findVKIndex(epServers));
        setIframeKey((k) => k + 1);
        setShieldClicks(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const selectServer = (index: number) => {
        setActiveServerIndex(index);
        setIframeKey((k) => k + 1);
        setShieldClicks(2);
    };

    const currentEntry = series?.episodes[selectedEpisodeIndex];
    const episodeNumber = currentEntry?.episode_number || (selectedEpisodeIndex + 1);
    const servers = currentEntry?.watch_servers || [];
    const activeServer = servers[activeServerIndex];

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="pt-32 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

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
                        {/* ── Simple Video Player ── */}
                        <div className="relative aspect-video group/player">
                            <div
                                ref={containerRef}
                                className={cn(
                                    "relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
                                    isFullscreen && "rounded-none border-0"
                                )}
                            >
                                {activeServer ? (
                                    <div className="relative w-full h-full">
                                        <iframe
                                            key={iframeKey}
                                            src={activeServer.url}
                                            className="w-full h-full border-0"
                                            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share; accelerometer; gyroscope; focus-without-user-activation; layout-animations; speaker-selection"
                                            sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                                            referrerPolicy="origin"
                                            allowFullScreen
                                            scrolling="no"
                                            title={`${series.title} - الحلقة ${episodeNumber}`}
                                        />

                                        {/* Click Shield Overlay (Multi-Stage AdBlocker) - Ramadan Specific */}
                                        {shieldClicks > 0 && (
                                            <div
                                                className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[6px] cursor-pointer flex flex-col items-center justify-center group/shield transition-all duration-500"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShieldClicks(prev => prev - 1);
                                                }}
                                            >
                                                <div className="relative">
                                                    <div className={cn(
                                                        "absolute inset-0 bg-primary/20 blur-3xl rounded-full transition-all duration-700",
                                                        shieldClicks === 1 ? "bg-orange-500/30 scale-150" : "group-hover/shield:scale-150"
                                                    )} />
                                                    <div className={cn(
                                                        "relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 transition-all duration-500",
                                                        shieldClicks === 1 ? "bg-orange-500 scale-110 rotate-12" : "bg-primary group-hover/shield:scale-110"
                                                    )}>
                                                        {shieldClicks === 2 ? (
                                                            <Play className="w-12 h-12 fill-white translate-x-1" />
                                                        ) : (
                                                            <Sparkles className="w-12 h-12 text-white animate-pulse" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-10 text-center space-y-4 max-w-xs px-6">
                                                    <p className="text-2xl font-black text-white tracking-tight">
                                                        {shieldClicks === 2 ? "تشغيل آمن" : "تأكيد الحماية"}
                                                    </p>

                                                    <div className={cn(
                                                        "flex items-center gap-2 justify-center px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                                                        shieldClicks === 2
                                                            ? "bg-green-500/10 border border-green-500/20 text-green-500"
                                                            : "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                                                    )}>
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full animate-pulse",
                                                            shieldClicks === 2 ? "bg-green-500" : "bg-orange-500"
                                                        )} />
                                                        {shieldClicks === 2 ? "RAMADAN SHIELD ACTIVE" : "BLOCKING POPUPS... CLICK AGAIN"}
                                                    </div>

                                                    <p className="text-white/40 text-[10px] font-bold leading-relaxed">
                                                        {shieldClicks === 2
                                                            ? "اضغط هنا لبدء المشاهدة بدون إعلانات منبثقة أو بانيرات"
                                                            : "نقرة واحدة أخيرة لفتح المشغل بآمان تام"}
                                                    </p>
                                                </div>

                                                <div className="absolute bottom-10 flex flex-col items-center gap-2">
                                                    <div className="flex gap-1.5">
                                                        <div className={cn("w-8 h-1 rounded-full transition-all duration-500", shieldClicks <= 2 ? "bg-primary" : "bg-white/10")} />
                                                        <div className={cn("w-8 h-1 rounded-full transition-all duration-500", shieldClicks <= 1 ? "bg-primary" : "bg-white/10")} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                                        <Play className="w-12 h-12 opacity-10" />
                                        <p className="text-lg font-bold">لا يوجد رابط مشاهدة متاح حالياً</p>
                                    </div>
                                )}

                                {/* Floating Zoom Button */}
                                <div className="absolute bottom-4 right-4 z-[9999] opacity-100 lg:opacity-0 lg:group-hover/player:opacity-100 transition-opacity pointer-events-none">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFullscreen();
                                        }}
                                        className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md shadow-2xl rounded-full pointer-events-auto"
                                    >
                                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* ── Server Selection ── */}
                        {servers.length > 1 && (
                            <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
                                {servers.map((server, idx) => (
                                    <button
                                        key={`${server.name}-${idx}`}
                                        onClick={() => selectServer(idx)}
                                        className={cn(
                                            "h-9 px-4 rounded-lg transition-all backdrop-blur-md shadow-sm border flex items-center gap-2",
                                            idx === activeServerIndex
                                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
                                        )}
                                    >
                                        <Server className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wide">
                                            {getServerLabel(server.name)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

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

                        <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar p-1">
                            {series.episodes.map((ep, index) => {
                                const epNum = ep.episode_number || (index + 1);
                                const isActive = index === selectedEpisodeIndex;
                                return (
                                    <button
                                        key={ep.id}
                                        onClick={() => selectEpisode(index)}
                                        className={cn(
                                            "group relative flex items-center gap-3.5 p-3.5 rounded-2xl border text-right transition-all duration-300 focus:outline-none",
                                            isActive
                                                ? "bg-primary border-primary shadow-lg shadow-primary/20"
                                                : "bg-card/50 border-border hover:bg-accent hover:border-primary/20 active:scale-95"
                                        )}
                                    >
                                        {/* Thumbnail Container */}
                                        <div className="relative w-24 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-lg">
                                            <EpisodeThumbnail src={ep.poster} alt={`الحلقة ${epNum}`} />
                                            {isActive ? (
                                                <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px] flex items-center justify-center">
                                                    <div className="flex gap-1">
                                                        {[3, 5, 2].map((h, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-1 bg-white rounded-full animate-bounce"
                                                                style={{ height: `${h * 4}px`, animationDelay: `${i * 0.2}s` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Play className="w-5 h-5 fill-white drop-shadow-xl" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Episode Info */}
                                        <div className="min-w-0 pr-1">
                                            <p className={cn(
                                                "text-[8px] font-black uppercase tracking-widest mb-0.5",
                                                isActive ? "text-white/60" : "text-primary"
                                            )}>EPISODE {epNum}</p>
                                            <p className={cn(
                                                "font-bold text-base truncate leading-tight",
                                                isActive ? "text-white" : "text-foreground group-hover:text-primary"
                                            )}>الحلقة {epNum}</p>
                                            <p className={cn(
                                                "text-[8px] font-bold mt-1 text-muted-foreground/50",
                                                isActive && "text-white/50"
                                            )}>Full HD 1080p</p>
                                        </div>

                                        {isActive && (
                                            <div className="absolute -left-1 w-2 h-10 bg-white rounded-full translate-y-[-50%] top-1/2" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    );
}