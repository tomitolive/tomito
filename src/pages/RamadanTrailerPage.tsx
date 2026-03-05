import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Play, Download, Star, Calendar, Clock,
    Home, ChevronRight, ListVideo, Sparkles
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { PosterImage } from "@/components/PosterImage";
import { getImageUrl, searchMulti, searchTV, fetchSeasonDetails, TMDB_CONFIG } from "@/lib/tmdb";
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
    const seriesName = decodeURIComponent(slug || "").replace(/-/g, " ");
    const [series, setSeries] = useState<SeriesItem | null>(null);
    const [tmdbPoster, setTmdbPoster] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch granular JSON for instant loading
                const response = await fetch(`/ramadan-data/${slug}.json`);
                if (!response.ok) throw new Error("Series not found");
                const found: SeriesItem = await response.json();

                if (found) {
                    // Sort episodes by episode_number ascending
                    const sortedEpisodes = [...found.episodes].sort((a, b) =>
                        (a.episode_number || 0) - (b.episode_number || 0)
                    );
                    const updatedFound = { ...found, episodes: sortedEpisodes };
                    setSeries(updatedFound);
                    // Use pre-populated poster and backdrop from JSON
                    setTmdbPoster(updatedFound.poster || null);

                    // Note: TMDB Enrichment is now handled server-side/during data merge
                    // to ensure all images (posters, backdrops, stills) are consistent and high-quality.
                }
            } catch (err) {
                console.error("Failed to load Ramadan trailer data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

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
                {(series as any)?.backdrop || tmdbPoster || series.poster ? (
                    <div className="relative w-full h-full scale-105 blur-[60px] opacity-20">
                        <img
                            src={(series as any)?.backdrop || tmdbPoster || series.poster}
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {series.episodes?.map((ep, idx) => {
                                    const epNum = ep.episode_number || (idx + 1);
                                    return (
                                        <div key={ep.id} className="group relative">
                                            <div className="relative bg-card/40 border border-border rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300 hover:bg-card/60 hover:border-primary/20 hover:-translate-y-1 hover:shadow-xl">
                                                {/* Episode Thumbnail */}
                                                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                                                    <img
                                                        src={ep.poster || tmdbPoster || series.poster}
                                                        alt={`الحلقة ${epNum}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white">
                                                        EP {epNum}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">الحلقة {epNum}</h4>
                                                        <p className="text-[9px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">Ready to Stream • 1080p</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Link to={`/watch-ramadan/${encodeURIComponent(seriesName.replace(/\s+/g, "-"))}?episode=${epNum}`} className="w-full">
                                                            <Button className="w-full h-9 rounded-xl font-bold text-[10px] gap-2">
                                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                                مشاهدة
                                                            </Button>
                                                        </Link>

                                                        {ep.download_links && ep.download_links.length > 0 && (
                                                            <Link to={`/ramadan-download/${encodeURIComponent(seriesName.replace(/\s+/g, "-"))}?episode=${epNum}`} className="w-full">
                                                                <Button variant="secondary" className="w-full h-9 rounded-xl font-bold text-[10px] gap-2 border border-border">
                                                                    <Download className="w-3.5 h-3.5" />
                                                                    تحميل
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
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
            <BackButton />
        </div>
    );
}
