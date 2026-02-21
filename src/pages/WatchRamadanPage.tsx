import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
    Play, Star, Clock, Calendar, ArrowRight, Home,
    Share2, ListVideo, Server, ChevronRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WatchServer {
    name: string;
    url: string;
}

interface SupremeEntry {
    id: string;
    title: string;
    poster: string;
    description: string;
    year: string;
    watch_servers: WatchServer[];
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
        streamtape: "StreamTape",
        upshare: "UpShare",
    };
    return labels[cleaned] || cleaned;
}

export function WatchRamadanPage() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [seriesEpisodes, setSeriesEpisodes] = useState<SupremeEntry[]>([]);
    const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [iframeKey, setIframeKey] = useState(0);

    const seriesName = decodeURIComponent(slug || "");

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/ramadan_2026_supreme.json");
                const data: SupremeEntry[] = await response.json();

                const filtered = data.filter((item) => {
                    const titleMatch = item.title.match(/^(?:مسلسل|برنامج)\s+(.+?)(?:\s+الحلقة|$)/);
                    const name = titleMatch ? titleMatch[1].trim() : item.title.replace(/\s+الحلقة\s+\d+.*$/, "");
                    return name.toLowerCase() === seriesName.toLowerCase();
                });

                const sorted = filtered.sort((a, b) => {
                    const numA = parseInt(a.title.match(/الحلقة\s+(\d+)/)?.[1] || "0");
                    const numB = parseInt(b.title.match(/الحلقة\s+(\d+)/)?.[1] || "0");
                    return numA - numB;
                });

                setSeriesEpisodes(sorted);

                const urlEpNum = parseInt(searchParams.get("episode") || "0");
                if (urlEpNum > 0) {
                    const idx = sorted.findIndex(
                        (e) => parseInt(e.title.match(/الحلقة\s+(\d+)/)?.[1] || "0") === urlEpNum
                    );
                    if (idx !== -1) setSelectedEpisodeIndex(idx);
                }
            } catch (error) {
                console.error("Failed to load WatchRamadanPage data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [seriesName]);

    // Keep URL in sync with current episode
    useEffect(() => {
        if (seriesEpisodes.length > 0) {
            const epNum =
                seriesEpisodes[selectedEpisodeIndex].title.match(/الحلقة\s+(\d+)/)?.[1] || "1";
            setSearchParams({ episode: epNum });
        }
    }, [selectedEpisodeIndex, seriesEpisodes]);

    const selectEpisode = (index: number) => {
        setSelectedEpisodeIndex(index);
        setActiveServerIndex(0);
        setIframeKey((k) => k + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const selectServer = (index: number) => {
        setActiveServerIndex(index);
        setIframeKey((k) => k + 1);
    };

    const currentEntry = seriesEpisodes[selectedEpisodeIndex];
    const episodeNumber = currentEntry?.title.match(/الحلقة\s+(\d+)/)?.[1] || "1";
    const servers = currentEntry?.watch_servers || [];
    const activeServer = servers[activeServerIndex];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (seriesEpisodes.length === 0) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <h1 className="text-3xl font-bold mb-4">المسلسل غير موجود</h1>
                <p className="text-muted-foreground mb-8">
                    عذراً، لم نتمكن من العثور على أي حلقات لهذا المسلسل حالياً.
                </p>
                <Button onClick={() => navigate("/ramadan")} className="gap-2">
                    <ArrowRight className="w-4 h-4" />
                    العودة إلى القائمة
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            {/* Ambient glow */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,73,175,0.12)_0%,transparent_65%)] pointer-events-none" />

            <main className="container mx-auto px-4 pt-28 pb-20">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-1">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <Home className="w-4 h-4" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors">رمضان 2026</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-white font-semibold max-w-[180px] truncate">{seriesName}</span>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-primary font-black">الحلقة {episodeNumber}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
                    {/* ── Main column ── */}
                    <div className="space-y-6">
                        {/* ── Video Player ── */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/25 to-purple-600/25 rounded-3xl blur-sm opacity-30 pointer-events-none" />
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl">
                                {activeServer ? (
                                    <iframe
                                        key={iframeKey}
                                        src={activeServer.url}
                                        className="w-full h-full"
                                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                        title={`${seriesName} - الحلقة ${episodeNumber}`}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        لا يوجد رابط مشاهدة متاح
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Server Buttons ── */}
                        {servers.length > 0 && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-3">
                                <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                    <Server className="w-4 h-4 text-primary" />
                                    اختر السيرفر
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {servers.map((server, idx) => (
                                        <button
                                            key={`${server.name}-${idx}`}
                                            onClick={() => selectServer(idx)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200",
                                                idx === activeServerIndex
                                                    ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                                                    : "bg-white/[0.04] text-muted-foreground border-white/10 hover:bg-white/[0.08] hover:text-white hover:border-white/25"
                                            )}
                                        >
                                            <Play className={cn("w-3.5 h-3.5", idx === activeServerIndex ? "text-white" : "text-primary")} />
                                            {getServerLabel(server.name)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Episode Metadata ── */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black">{seriesName}</h1>
                                <h2 className="text-lg text-primary font-bold mt-1">الحلقة {episodeNumber}</h2>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm">
                                {[
                                    { icon: <Calendar className="w-4 h-4 text-primary" />, text: currentEntry.year },
                                    { icon: <Star className="w-4 h-4 text-yellow-400 fill-current" />, text: "8.5 / 10" },
                                    { icon: <Clock className="w-4 h-4 text-primary" />, text: "45 دقيقة" },
                                ].map(({ icon, text }, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                        {icon}
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>

                            {currentEntry.description && (
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {currentEntry.description}
                                </p>
                            )}

                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-2 rounded-xl"
                                onClick={() => navigator.share?.({ title: `${seriesName} - الحلقة ${episodeNumber}`, url: window.location.href })}
                            >
                                <Share2 className="w-4 h-4" />
                                مشاركة الحلقة
                            </Button>
                        </div>
                    </div>

                    {/* ── Episode Sidebar ── */}
                    <div className="space-y-4 lg:sticky lg:top-28">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <ListVideo className="w-5 h-5 text-primary" />
                                الحلقات
                            </h3>
                            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md font-bold">
                                {seriesEpisodes.length} حلقة
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 max-h-[75vh] overflow-y-auto pr-1"
                            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                            {seriesEpisodes.map((ep, index) => {
                                const epNum = ep.title.match(/الحلقة\s+(\d+)/)?.[1] || String(index + 1);
                                const isActive = index === selectedEpisodeIndex;
                                return (
                                    <button
                                        key={ep.id}
                                        onClick={() => selectEpisode(index)}
                                        className={cn(
                                            "group flex items-center gap-3 p-3 rounded-xl border text-right transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15"
                                        )}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                            <img
                                                src={ep.poster}
                                                alt={`الحلقة ${epNum}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {isActive && (
                                                <div className="absolute inset-0 bg-primary/50 flex items-center justify-center gap-0.5">
                                                    {[4, 6, 3].map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-1 bg-white rounded-full animate-bounce"
                                                            style={{ height: `${h * 4}px`, animationDelay: `${i * 0.15}s` }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0">
                                            <p className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                isActive ? "text-primary" : "text-muted-foreground"
                                            )}>EP {epNum}</p>
                                            <p className={cn(
                                                "font-bold text-sm",
                                                isActive ? "text-white" : "text-white/60 group-hover:text-white"
                                            )}>الحلقة {epNum}</p>
                                        </div>
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