import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Play, Calendar, Star, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { PosterImage } from "@/components/PosterImage";
import { RamadanGridSkeleton } from "@/components/RamadanSkeleton";
import { HeroCarousel } from "@/components/HeroCarousel";

// Utility to clean titles
const cleanTitle = (title: string): string => {
    return title
        .replace(/^(مسلسل|برنامج)\s+/, "")
        .replace(/\s+الحلقة\s+\d+.*$/, "")
        .replace(/\s+الحلقه\s+\d+.*$/, "")
        .replace(/\s+-\s+.*$/, "")
        .replace(/كامل|بجودة|عالية|مترجم|مدبلج/g, "")
        .trim();
};

const ITEMS_PER_PAGE = 18;

interface Episode {
    id: string;
    title: string;
    episode_number: number | null;
    poster: string;
    description: string;
    watch_servers: any[];
    download_links: any[];
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
    isSupreme?: boolean;
    allPosters?: string[];
    episode_count?: number;
}

export default function RamadanPage() {
    const [allSeries, setAllSeries] = useState<SeriesItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const observerTarget = useRef<HTMLDivElement>(null);

    // 1. Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 2. Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/data/ramadan.json");
                const data: SeriesItem[] = await response.json();

                const initialSeries = data.map(item => {
                    const posters = item.poster ? [item.poster] : [];
                    return {
                        ...item,
                        allPosters: posters
                    };
                });

                setAllSeries(initialSeries);
            } catch (error) {
                console.error("Failed to load Ramadan data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 3. Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loading, allSeries]);

    const filteredSeries = useMemo(() => {
        const query = debouncedQuery.toLowerCase().trim();
        let filtered = allSeries;

        if (query) {
            filtered = allSeries.filter((s) =>
                s.title.toLowerCase().includes(query) ||
                (s.clean_title && s.clean_title.toLowerCase().includes(query))
            );
        }

        return [...filtered].sort((a, b) => {
            if (a.isSupreme && !b.isSupreme) return -1;
            if (!a.isSupreme && b.isSupreme) return 1;
            const isTmdbA = a.poster && (a.poster.includes("tmdb.org") || a.poster.includes("image.tmdb.org"));
            const isTmdbB = b.poster && (b.poster.includes("tmdb.org") || b.poster.includes("image.tmdb.org"));
            if (isTmdbA && !isTmdbB) return -1;
            if (!isTmdbA && isTmdbB) return 1;
            return 0;
        });
    }, [allSeries, debouncedQuery]);

    const visibleSeries = useMemo(() => {
        return filteredSeries.slice(0, visibleCount);
    }, [filteredSeries, visibleCount]);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <SEO
                title="مسلسلات رمضان 2026 - حصرياً على Supreme"
                description="تغطية كاملة وحصرية لمسلسلات رمضان 2026. شاهد حلقاتك المفضلة بجودة عالية وسيرفرات سريعة."
            />
            <Navbar />

            {/* Restore Hero Carousel */}
            {!loading && allSeries.length > 0 && (
                <HeroCarousel
                    items={(allSeries.some(s => s.isSupreme)
                        ? allSeries.filter(s => s.isSupreme)
                        : allSeries.slice(0, 10)
                    ).map(s => ({
                        id: s.id,
                        name: s.title,
                        clean_title: s.clean_title,
                        poster_path: s.poster,
                        backdrop_path: (s as any).backdrop || s.poster,
                        overview: (s as any).description || "",
                        vote_average: 9.1,
                        first_air_date: s.year || "2026",
                        isSupreme: s.isSupreme === true
                    } as any))
                    }
                    type="tv"
                />
            )}

            {/* Re-positioned Search Bar Below Hero */}
            <div className="container mx-auto px-4 mt-8">
                <div className="relative max-w-2xl mx-auto group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity duration-500" />
                    <div className="relative flex items-center">
                        <Search className="absolute right-5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                            type="text"
                            placeholder="ابحث عن مسلسلك المفضل..."
                            className="w-full h-12 pr-14 bg-card/50 backdrop-blur-3xl border-border rounded-2xl text-sm focus:ring-0 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                            <h2 className="text-xl font-black tracking-tight">قائمة العروض</h2>
                        </div>
                        {!loading && <p className="text-muted-foreground text-xs mr-4.5 font-medium">استكشف {filteredSeries.length} عمل فني حصري</p>}
                    </div>
                </div>

                {loading ? (
                    <RamadanGridSkeleton />
                ) : filteredSeries.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                            {visibleSeries.map((series, idx) => (
                                <Link
                                    key={series.id}
                                    to={`/ramadan-trailer/${encodeURIComponent((series.clean_title || cleanTitle(series.title)).replace(/\s+/g, "-"))}`}
                                    className="group relative flex flex-col gap-6 focus:outline-none animate-in fade-in zoom-in-95 duration-700"
                                    style={{ animationDelay: `${(idx % ITEMS_PER_PAGE) * 40}ms` }}
                                >
                                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted border border-border transition-all duration-500 group-hover:scale-[1.03] group-hover:border-primary/40 group-hover:shadow-xl">
                                        <PosterImage
                                            src={series.poster}
                                            allPosters={series.allPosters}
                                            alt={series.title}
                                            className="transition-transform duration-700 group-hover:scale-105 ease-out"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                            <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-primary/90 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg">
                                                        <span className="text-[9px] font-black text-white uppercase tracking-wider">{series.episode_count || 0} حلقة</span>
                                                    </div>
                                                </div>
                                                <Button className="w-full h-10 rounded-xl gap-2 font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Play className="w-4 h-4 fill-current" />
                                                    مشاهدة العرض
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
                                            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                <span className="text-[10px] font-black text-white tracking-tighter">9.2</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 px-1">
                                        <h3 className="font-bold text-sm leading-tight line-clamp-2 transition-all duration-300 group-hover:text-primary">
                                            {series.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/60">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{series.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Infinite Scroll Target */}
                        {visibleCount < filteredSeries.length && (
                            <div ref={observerTarget} className="w-full py-20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 rounded-3xl border border-dashed border-border bg-card/10 backdrop-blur-md">
                        <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Search className="w-10 h-10 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">نعتذر، لم نجد نتائج</h3>
                        <Button
                            variant="secondary"
                            className="mt-10 rounded-xl h-12 px-8 font-bold text-sm"
                            onClick={() => setSearchQuery("")}
                        >
                            إعادة ضبط البحث
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
            <BackButton />
        </div>
    );
}
