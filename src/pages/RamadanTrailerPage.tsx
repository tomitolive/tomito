import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Play, Download, Star, Calendar, Clock,
    Home, ChevronRight, ListVideo, Sparkles
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PosterImage } from "@/components/PosterImage";
import { getImageUrl, searchMulti } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

// Utility to clean titles for better matching and TMDB searching
const cleanTitle = (title: string): string => {
    return title
        .replace(/^(مسلسل|برنامج)\s+/, "") // Remove prefix
        .replace(/\s+الحلقة\s+\d+.*$/, "") // Remove "الحلقة X" and everything after
        .replace(/\s+الحلقه\s+\d+.*$/, "") // Remove variation
        .replace(/\s+-\s+.*$/, "") // Remove suffix after dash
        .replace(/كامل|بجودة|عالية|مترجم|مدبلج/g, "")
        .trim();
};

interface Episode {
    id: string;
    title: string;
    episode_number: number | null;
    poster: string;
    description: string;
    watch_servers: any[];
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

export function RamadanTrailerPage() {
    const { slug } = useParams<{ slug: string }>();
    const seriesName = decodeURIComponent(slug || "");
    const [series, setSeries] = useState<SeriesItem | null>(null);
    const [tmdbPoster, setTmdbPoster] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

                    // Fetch TMDB poster
                    const searchName = found.clean_title || cleanTitle(found.title);
                    const searchResult = await searchMulti(searchName);
                    const bestMatch = searchResult.results?.find((r: any) =>
                        (r.media_type === "tv" || r.media_type === "movie") && r.poster_path
                    );
                    if (bestMatch?.poster_path) {
                        setTmdbPoster(getImageUrl(bestMatch.poster_path, "w780"));
                    }
                }
            } catch (err) {
                console.error("Failed to load Ramadan trailer data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [seriesName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <div className="pt-32 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-sm">جاري التجهيز...</p>
                </div>
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <div className="bg-white/5 p-12 rounded-[40px] border border-white/10 max-w-lg space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Play className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black">المسلسل غير موجود</h1>
                    <p className="text-muted-foreground text-lg">عذراً، لم نتمكن من العثور على البيانات المطلوبة لهذا المسلسل.</p>
                    <Link to="/ramadan" className="block">
                        <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-lg">العودة للقائمة</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <Navbar />

            {/* ── Dynamic Cinema Backdrop ── */}
            <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-[#050505]/90 to-[#050505] z-10" />
                {tmdbPoster || series.poster ? (
                    <div className="relative w-full h-full scale-110 blur-[80px] opacity-30">
                        <img
                            src={tmdbPoster || series.poster}
                            className="w-full h-full object-cover animate-slow-zoom"
                            alt=""
                        />
                    </div>
                ) : null}
            </div>

            <main className="container mx-auto px-4 pt-40 pb-24 relative z-20">
                {/* Modern Breadcrumbs */}
                <nav className="flex items-center gap-3 text-sm text-muted-foreground/60 mb-12 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2 font-bold focus:outline-none">
                        <Home className="w-4 h-4" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors font-bold focus:outline-none">رمضان 2026</Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-white font-black">{seriesName}</span>
                </nav>

                <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[400px_1fr] gap-12 lg:gap-20 items-start">
                    {/* Iconic Poster Column */}
                    <div className="relative group mx-auto md:mx-0 w-full max-w-[350px] md:max-w-none">
                        <div className="absolute -inset-1.5 bg-gradient-to-br from-primary via-purple-600 to-blue-600 rounded-[40px] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />
                        <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10">
                            <PosterImage
                                src={tmdbPoster || series.poster}
                                alt={seriesName}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Information Column */}
                    <div className="space-y-12">
                        <div className="space-y-8">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-xl">
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">حصري 2026</span>
                                </div>
                                <div className="flex items-center gap-2 text-yellow-500 font-black bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm tracking-tighter">9.1 / 10</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground/80 font-black bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shadow-xl uppercase tracking-widest text-[10px]">
                                    <Clock className="w-4 h-4 text-primary/60" />
                                    <span>45 MINS</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter drop-shadow-2xl">
                                {seriesName}
                            </h1>

                            <div className="flex items-center gap-4 text-sm md:text-base font-bold text-muted-foreground/60">
                                <Calendar className="w-6 h-6 text-primary/40" />
                                <span>موسم رمضان {series.year}</span>
                                <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                <span className="tracking-widest uppercase">دراما عربية</span>
                            </div>
                        </div>

                        <div className="space-y-6 max-w-4xl">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
                                <h3 className="text-xl font-black tracking-tight">قصة العمل</h3>
                            </div>
                            <p className="text-base md:text-lg text-muted-foreground/80 leading-[1.6] font-medium italic">
                                "{series.description || "لا يوجد وصف متوفر حالياً لهذا المسلسل، ولكن من المتوقع أن يكون من أبرز أعمال الموسم."}"
                            </p>
                        </div>

                        {/* Interactive Episode List */}
                        <div className="space-y-8 pt-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <h3 className="text-xl font-black flex items-center gap-4">
                                    <ListVideo className="w-8 h-8 text-primary" />
                                    قائمة الحلقات
                                </h3>
                                <div className="bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 text-sm font-black text-muted-foreground uppercase tracking-widest">
                                    {series.episodes?.length || 0} ITEMS
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {series.episodes?.map((ep, idx) => {
                                    const epNum = ep.episode_number || (idx + 1);
                                    return (
                                        <div key={ep.id} className="group relative">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity blur" />
                                            <div className="relative bg-white/[0.02] border border-white/5 rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/10 group-hover:translate-x-2">
                                                <div className="flex items-center gap-6 md:gap-8">
                                                    <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                                                        <div className="absolute inset-0 bg-primary/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                                                        <div className="relative w-full h-full bg-black border border-white/10 rounded-2xl flex items-center justify-center font-black text-primary text-2xl md:text-3xl shadow-2xl">
                                                            {epNum}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base md:text-lg font-black group-hover:text-primary transition-colors">الحلقة {epNum}</h4>
                                                        <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready to Stream</span>
                                                            <div className="w-1 h-1 bg-white rounded-full" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Full HD 1080p</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4">
                                                    <Link to={`/watch-ramadan/${encodeURIComponent(seriesName)}?episode=${epNum}`} className="flex-grow sm:flex-grow-0">
                                                        <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl font-black text-lg gap-4 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                                            <Play className="w-5 h-5 fill-current" />
                                                            ابدأ المشاهدة
                                                        </Button>
                                                    </Link>

                                                    {ep.download_links && ep.download_links.length > 0 && (
                                                        <Link to={`/ramadan-download/${encodeURIComponent(seriesName)}?episode=${epNum}`} className="flex-grow sm:flex-grow-0">
                                                            <Button variant="secondary" className="w-full sm:w-auto h-16 px-8 rounded-2xl font-black text-lg gap-4 border border-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
                                                                <Download className="w-5 h-5" />
                                                                تحميل الحلقة
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
