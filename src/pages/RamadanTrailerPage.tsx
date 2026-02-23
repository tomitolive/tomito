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
import { SEO } from "@/components/SEO";

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
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="pt-32 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-[10px]">جاري التجهيز...</p>
                </div>
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <div className="bg-card p-10 rounded-2xl border border-border max-w-lg space-y-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-black">المسلسل غير موجود</h1>
                    <p className="text-muted-foreground text-sm">عذراً، لم نتمكن من العثور على البيانات المطلوبة لهذا المسلسل.</p>
                    <Link to="/ramadan" className="block">
                        <Button variant="secondary" className="w-full h-12 rounded-xl font-bold text-base">العودة للقائمة</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <SEO
                title={`مشاهدة تريلر ${seriesName} | رمضان 2026`}
                description={`شاهد تريلر ${seriesName} الرسمي وتعرف على قصة المسلسل وقائمة الحلقات في موسم رمضان 2026.`}
                keywords={`${seriesName}, تريلر, رمضان 2026, مسلسلات رمضان, مشاهدة, ${seriesName} الحلقة 1`}
                canonical={`https://tomito.xyz/ramadan-trailer/${slug}`}
            />
            <Navbar />

            {/* ── Dynamic Cinema Backdrop ── */}
            <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/90 to-background z-10" />
                {tmdbPoster || series.poster ? (
                    <div className="relative w-full h-full scale-105 blur-[60px] opacity-20">
                        <img
                            src={tmdbPoster || series.poster}
                            className="w-full h-full object-cover animate-slow-zoom"
                            alt=""
                        />
                    </div>
                ) : null}
            </div>

            <main className="container mx-auto px-4 pt-32 pb-24 relative z-20">
                {/* Modern Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[11px] text-muted-foreground/60 mb-10 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar uppercase font-bold">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none">
                        <Home className="w-3.5 h-3.5" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors focus:outline-none">رمضان 2026</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-foreground font-black tracking-wide">{seriesName}</span>
                </nav>

                <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[400px_1fr] gap-12 lg:gap-20 items-start">
                    {/* Iconic Poster Column */}
                    <div className="relative group mx-auto md:mx-0 w-full max-w-[300px] md:max-w-none">
                        <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-10 group-hover:opacity-30 transition duration-1000" />
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-2xl ring-1 ring-border/10">
                            <PosterImage
                                src={tmdbPoster || series.poster}
                                alt={seriesName}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Information Column */}
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-xl">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="text-[9px] font-black tracking-[0.15em] uppercase text-primary">حصري 2026</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-yellow-600 font-bold bg-muted px-3 py-1 rounded-lg border border-border shadow-sm">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-xs tracking-tighter">9.1 / 10</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground font-black bg-muted px-3 py-1 rounded-lg border border-border shadow-sm uppercase tracking-widest text-[9px]">
                                    <Clock className="w-3.5 h-3.5 text-primary/60" />
                                    <span>45 MINS</span>
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
                                {seriesName}
                            </h1>

                            <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-muted-foreground/80">
                                <Calendar className="w-5 h-5 text-primary/40" />
                                <span>موسم رمضان {series.year}</span>
                                <div className="w-1 h-1 bg-border rounded-full" />
                                <span className="tracking-widest uppercase">دراما عربية</span>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-3xl">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                                <h3 className="text-lg font-black tracking-tight uppercase">قصة العمل</h3>
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-medium italic">
                                "{series.description || "لا يوجد وصف متوفر حالياً لهذا المسلسل، ولكن من المتوقع أن يكون من أبرز أعمال الموسم."}"
                            </p>
                        </div>

                        {/* Interactive Episode List */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h3 className="text-lg font-black flex items-center gap-3 uppercase">
                                    <ListVideo className="w-6 h-6 text-primary" />
                                    قائمة الحلقات
                                </h3>
                                <div className="bg-muted px-4 py-1.5 rounded-lg border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    {series.episodes?.length || 0} ITEMS
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {series.episodes?.map((ep, idx) => {
                                    const epNum = ep.episode_number || (idx + 1);
                                    return (
                                        <div key={ep.id} className="group relative">
                                            <div className="relative bg-card/40 border border-border rounded-2xl p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 hover:bg-card/60 hover:border-primary/20 hover:translate-x-1">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                                                        <div className="absolute inset-0 bg-primary/5 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                                                        <div className="relative w-full h-full bg-background border border-border rounded-xl flex items-center justify-center font-black text-primary text-xl md:text-2xl shadow-sm">
                                                            {epNum}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm md:text-base font-bold group-hover:text-primary transition-colors">الحلقة {epNum}</h4>
                                                        <div className="flex items-center gap-2 mt-1 opacity-50">
                                                            <span className="text-[8px] font-black uppercase tracking-wider">Ready to Stream</span>
                                                            <div className="w-1 h-1 bg-border rounded-full" />
                                                            <span className="text-[8px] font-black uppercase tracking-wider">Full HD 1080p</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Link to={`/watch-ramadan/${encodeURIComponent(seriesName)}?episode=${epNum}`} className="flex-grow sm:flex-grow-0">
                                                        <Button className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold text-sm gap-3 transition-all">
                                                            <Play className="w-4 h-4 fill-current" />
                                                            ابدأ المشاهدة
                                                        </Button>
                                                    </Link>

                                                    {ep.download_links && ep.download_links.length > 0 && (
                                                        <Link to={`/ramadan-download/${encodeURIComponent(seriesName)}?episode=${epNum}`} className="flex-grow sm:flex-grow-0">
                                                            <Button variant="secondary" className="w-full sm:w-auto h-11 px-5 rounded-xl font-bold text-sm gap-3 border border-border hover:bg-accent transition-all">
                                                                <Download className="w-4 h-4" />
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
