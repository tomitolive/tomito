import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
    Play, Star, Clock, Calendar, ArrowRight, Home,
    ListVideo, Server, ChevronRight, Info, Sparkles
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
        savefiles: "SaveFiles",
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

    const seriesName = decodeURIComponent(slug || "");

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const selectServer = (index: number) => {
        setActiveServerIndex(index);
        setIframeKey((k) => k + 1);
    };

    const currentEntry = series?.episodes[selectedEpisodeIndex];
    const episodeNumber = currentEntry?.episode_number || (selectedEpisodeIndex + 1);
    const servers = currentEntry?.watch_servers || [];
    const activeServer = servers[activeServerIndex];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
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
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <div className="bg-white/5 p-12 rounded-[40px] border border-white/10 max-w-lg space-y-6">
                    <h1 className="text-4xl font-black">المسلسل غير موجود</h1>
                    <p className="text-muted-foreground text-lg">عذراً، لم نتمكن من العثور على أي حلقات لهذا المسلسل حالياً.</p>
                    <Button onClick={() => navigate("/ramadan")} className="w-full h-14 rounded-2xl font-black text-lg gap-3">
                        <ArrowRight className="w-5 h-5" />
                        العودة إلى القائمة
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <Navbar />

            {/* Cinematic Background Ambient Effects + Ramadan Crescents */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[140px] rounded-full opacity-40 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full opacity-30 -translate-x-1/2 translate-y-1/2" />
                {/* Crescent Moon Top-Right */}
                <svg className="absolute top-10 right-6 w-20 h-20 opacity-10 text-primary" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 5 A45 45 0 0 0 50 95 A30 30 0 0 1 50 5Z" />
                </svg>
                {/* Crescent Moon Bottom-Left */}
                <svg className="absolute bottom-20 left-6 w-14 h-14 opacity-[0.07] text-yellow-400" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 5 A45 45 0 0 0 50 95 A30 30 0 0 1 50 5Z" />
                </svg>
                {/* Stars sprinkle */}
                <div className="absolute top-24 right-32 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-20 animate-pulse" />
                <div className="absolute top-40 right-16 w-1 h-1 bg-primary rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-16 right-52 w-1 h-1 bg-white rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <main className="container mx-auto px-4 pt-36 pb-24">
                {/* High-End Breadcrumbs */}
                <nav className="flex items-center gap-3 text-sm text-muted-foreground/60 mb-10 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar font-bold">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2 focus:outline-none">
                        <Home className="w-4 h-4" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors focus:outline-none">رمضان 2026</Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link to={`/ramadan-trailer/${encodeURIComponent(series.clean_title || series.title)}`} className="hover:text-primary transition-colors focus:outline-none max-w-[200px] truncate">
                        {series.title}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-primary font-black flex-shrink-0 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">الحلقة {episodeNumber}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
                    {/* ── Main Production Column ── */}
                    <div className="space-y-10">
                        {/* ── Cinematic Video Player ── */}
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-br from-primary via-purple-600 to-blue-600 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000" />
                            <div
                                className="relative aspect-video rounded-[32px] overflow-hidden bg-black border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] ring-1 ring-white/10"
                            >
                                {activeServer ? (
                                    <iframe
                                        key={iframeKey}
                                        src={activeServer.url}
                                        className="w-full h-full"
                                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        scrolling="no"
                                        title={`${series.title} - الحلقة ${episodeNumber}`}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                                        <Play className="w-16 h-16 opacity-10" />
                                        <p className="text-xl font-bold">لا يوجد رابط مشاهدة متاح حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Multi-Server Selection ── */}
                        {servers.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Server className="w-6 h-6 text-primary" />
                                        <h3 className="text-xl font-black">تبديل السيرفر</h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">جميع السيرفرات تعمل</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {servers.map((server, idx) => (
                                        <button
                                            key={`${server.name}-${idx}`}
                                            onClick={() => selectServer(idx)}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-4 rounded-2xl text-[13px] font-black border transition-all duration-300 active:scale-95 group",
                                                idx === activeServerIndex
                                                    ? "bg-primary text-white border-primary shadow-[0_15px_30px_rgba(var(--primary),0.3)]"
                                                    : "bg-white/[0.05] text-muted-foreground border-white/5 hover:bg-white/[0.08] hover:text-white hover:border-white/20"
                                            )}
                                        >
                                            <Play className={cn("w-4 h-4", idx === activeServerIndex ? "fill-white" : "text-primary group-hover:fill-primary")} />
                                            {getServerLabel(server.name)}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground/60 font-medium">إذا توقف السيرفر عن العمل، يرجى تجربة سيرفر آخر.</p>
                            </div>
                        )}

                        {/* ── Rich Episode Metadata ── */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <Sparkles className="w-32 h-32 text-primary" />
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-black tracking-widest uppercase">
                                    موسم رمضان 2026
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">{series.title}</h1>
                                <p className="text-2xl text-primary/80 font-black">الحلقة رقم {episodeNumber}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 relative z-10 text-sm font-black">
                                {[
                                    { icon: <Calendar className="w-4 h-4 text-primary" />, text: series.year, label: "سنة الإنتاج" },
                                    { icon: <Star className="w-4 h-4 text-yellow-500 fill-current" />, text: "9.5 / 10", label: "التقييم" },
                                    { icon: <Clock className="w-4 h-4 text-primary" />, text: "45 دقيقة", label: "المدة" },
                                ].map(({ icon, text, label }, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-5 bg-white/5 border border-white/10 rounded-3xl min-w-[140px] shadow-xl">
                                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em]">{label}</span>
                                        <div className="flex items-center gap-2 text-lg">
                                            {icon}
                                            <span>{text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {currentEntry?.description && (
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <Info className="w-5 h-5 text-primary" />
                                        <h3 className="text-xl font-black tracking-tight">ملخص الحلقة</h3>
                                    </div>
                                    <p className="text-lg text-muted-foreground/70 leading-relaxed font-medium">
                                        {currentEntry.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 relative z-10">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-8 rounded-2xl gap-3 font-black text-base border-white/10 hover:bg-white/5 transition-all"
                                    onClick={() => navigate(`/ramadan-trailer/${encodeURIComponent(series.clean_title || series.title)}`)}
                                >
                                    تفاصيل المسلسل
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── Modern Episode Sidebar ── */}
                    <div className="space-y-8 lg:sticky lg:top-36">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <ListVideo className="w-6 h-6 text-primary" />
                                الحلقات
                            </h3>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
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
                                            "group relative flex items-center gap-4 p-4 rounded-[28px] border text-right transition-all duration-500 focus:outline-none",
                                            isActive
                                                ? "bg-primary border-primary shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)]"
                                                : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20 active:scale-95"
                                        )}
                                    >
                                        {/* Thumbnail Container */}
                                        <div className="relative w-28 aspect-video rounded-2xl overflow-hidden flex-shrink-0 bg-black/40 ring-1 ring-white/10 shadow-2xl">
                                            <EpisodeThumbnail src={ep.poster} alt={`الحلقة ${epNum}`} />
                                            {isActive ? (
                                                <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <div className="flex gap-1">
                                                        {[3, 5, 2].map((h, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-1.5 bg-white rounded-full animate-bounce"
                                                                style={{ height: `${h * 5}px`, animationDelay: `${i * 0.2}s` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Play className="w-6 h-6 fill-white drop-shadow-2xl" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Episode Info */}
                                        <div className="min-w-0 pr-2">
                                            <p className={cn(
                                                "text-[9px] font-black uppercase tracking-[0.2em] mb-1",
                                                isActive ? "text-white/60" : "text-primary"
                                            )}>EPISODE {epNum}</p>
                                            <p className={cn(
                                                "font-black text-lg md:text-xl truncate leading-tight",
                                                isActive ? "text-white" : "text-white/90 group-hover:text-white"
                                            )}>الحلقة {epNum}</p>
                                            <p className={cn(
                                                "text-[10px] font-bold mt-1.5",
                                                isActive ? "text-white/50" : "text-muted-foreground/40"
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
                </div>
            </main>

            <Footer />
        </div>
    );
}