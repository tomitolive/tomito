import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Play, Calendar, Star, TrendingUp, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl, searchMulti } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { PosterImage } from "@/components/PosterImage";

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
    // For local UI state
    allPosters?: string[];
}

export default function RamadanPage() {
    const [allSeries, setAllSeries] = useState<SeriesItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/ramadan_2026_results.json");
                const data: SeriesItem[] = await response.json();

                // Initialize allPosters for fallback handling
                const initialSeries = data.map(item => ({
                    ...item,
                    allPosters: item.poster ? [item.poster] : []
                }));

                setAllSeries(initialSeries);

                // 2. Async fetch TMDB posters for unique series names
                const posterMap = new Map<string, string>();

                await Promise.all(
                    initialSeries.map(async (item) => {
                        const searchName = item.clean_title || cleanTitle(item.title);
                        if (searchName.length < 2) return;
                        try {
                            const searchResult = await searchMulti(searchName);
                            const bestMatch = searchResult.results?.find((r: any) =>
                                (r.media_type === "tv" || r.media_type === "movie") && r.poster_path
                            );
                            if (bestMatch?.poster_path) {
                                posterMap.set(item.id, getImageUrl(bestMatch.poster_path, "w500"));
                            }
                        } catch (err) {
                            console.error(`TMDB search failed for: ${item.title}`, err);
                        }
                    })
                );

                // 3. Update allSeries with TMDB posters where found
                setAllSeries(prev => prev.map(item => {
                    const tmdbPoster = posterMap.get(item.id);
                    if (tmdbPoster) {
                        return {
                            ...item,
                            poster: tmdbPoster,
                            allPosters: [tmdbPoster, ...(item.allPosters || [])]
                        };
                    }
                    return item;
                }));

            } catch (error) {
                console.error("Failed to load Ramadan data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredSeries = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return allSeries;
        return allSeries.filter((s) =>
            s.title.toLowerCase().includes(query) ||
            (s.clean_title && s.clean_title.toLowerCase().includes(query))
        );
    }, [allSeries, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <div className="pt-32 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-sm">جاري تحميل الموسم الرمضاني...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <SEO
                title="مسلسلات رمضان 2026 - حصرياً على Supreme"
                description="تغطية كاملة وحصرية لمسلسلات رمضان 2026. شاهد حلقاتك المفضلة بجودة عالية وسيرفرات سريعة."
            />
            <Navbar />

            {/* ── Premium Hero Section ── */}
            <div className="relative pt-40 pb-24 overflow-hidden">
                {/* Dynamic Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/10 blur-[130px] rounded-full -z-10 opacity-60" />
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20" />

                <div className="container mx-auto px-4 relative">
                    <div className="max-w-5xl mx-auto text-center space-y-10">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            <span className="font-black tracking-[0.3em] uppercase text-[11px] text-primary">الموسم الرمضاني 2026</span>
                        </div>

                        {/* Cinematic Title */}
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30">دراما</span>
                                <br />
                                <span className="inline-block text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.6)]">تستحق المشاهدة</span>
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground/60 leading-relaxed max-w-3xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                                نقدم لكم أضخم إنتاجات الموسم الرمضاني لعام 2026 في مكان واحد. استمتع بتجربة سينمائية لا تضاهى.
                            </p>
                        </div>

                        {/* High-End Search Implementation */}
                        <div className="relative max-w-3xl mx-auto group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/40 to-purple-600/40 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
                            <div className="relative flex items-center">
                                <Search className="absolute right-6 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                <Input
                                    type="text"
                                    placeholder="ابحث عن مسلسلك المفضل (مثلاً: الاختيار، المداح...)"
                                    className="w-full h-14 pr-16 bg-black/50 backdrop-blur-3xl border-white/10 rounded-[28px] text-base focus:ring-0 focus:border-primary/50 transition-all placeholder:text-muted-foreground/20 font-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-20">
                {/* ── Section Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_25px_rgba(var(--primary),1)]" />
                            <h2 className="text-2xl font-black tracking-tight">قائمة العروض</h2>
                        </div>
                        <p className="text-muted-foreground text-sm mr-6 font-medium">استكشف {filteredSeries.length} عمل فني حصري</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-black tracking-widest uppercase">
                        <span className="text-primary">ترتيب:</span>
                        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">الأحدث</button>
                        <button className="px-4 py-2 rounded-xl text-muted-foreground hover:text-white transition-colors">الأكثر تقييماً</button>
                    </div>
                </div>

                {/* ── Premium Series Grid ── */}
                {filteredSeries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16">
                        {filteredSeries.map((series, idx) => (
                            <Link
                                key={series.id}
                                to={`/ramadan-trailer/${encodeURIComponent(series.clean_title || cleanTitle(series.title))}`}
                                className="group relative flex flex-col gap-6 focus:outline-none animate-in fade-in zoom-in-95 duration-700"
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                {/* Futuristic Poster Card */}
                                <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 group-hover:scale-[1.05] group-hover:border-primary/40 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">
                                    <PosterImage
                                        src={series.poster}
                                        allPosters={series.allPosters}
                                        alt={series.title}
                                        className="transition-transform duration-1000 group-hover:scale-110 ease-out"
                                    />

                                    {/* Ultra Glass Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                                        <div className="translate-y-6 group-hover:translate-y-0 transition-all duration-700 ease-out space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary backdrop-blur-3xl border border-white/20 px-3 py-1.5 rounded-full shadow-xl shadow-primary/30">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{series.episodes?.length || 0} حلقة</span>
                                                </div>
                                            </div>
                                            <Button className="w-full h-14 rounded-2xl gap-3 font-black text-base shadow-2xl active:scale-95 group-hover:bg-primary group-hover:text-white transition-all">
                                                <Play className="w-5 h-5 fill-current" />
                                                مشاهدة العرض
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Floating Badges */}
                                    <div className="absolute top-5 right-5 transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
                                        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 px-3 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                            <span className="text-xs font-black tracking-tighter">9.2</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-5 left-5 transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
                                        <div className="bg-primary/80 backdrop-blur-2xl px-3 py-1.5 rounded-2xl shadow-xl shadow-primary/20">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">حصري</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Minimalist Luxury Info Area */}
                                <div className="space-y-3 px-2">
                                    <h3 className="font-black text-base md:text-lg leading-[1.1] line-clamp-2 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1">
                                        {series.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-[13px] font-bold text-muted-foreground/50">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary/60" />
                                            <span>{series.year}</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                        <span className="tracking-[0.2em] font-black text-primary/40 uppercase">Top 10</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-48 rounded-[60px] border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-md">
                        <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 animate-vertical-bounce">
                            <Search className="w-12 h-12 text-primary/30" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">نعتذر، لم نجد نتائج</h3>
                        <p className="text-muted-foreground/60 max-w-lg mx-auto text-sm font-medium leading-relaxed">
                            قد يكون الاسم مكتوباً بشكل مختلف. حاول استخدام كلمات مفتاحية مثل "رمضان" أو اسم الممثل.
                        </p>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="mt-12 rounded-[24px] h-16 px-12 font-black text-lg gap-3 shadow-2xl border border-white/5 hover:scale-105 transition-transform"
                            onClick={() => setSearchQuery("")}
                        >
                            إعادة ضبط البحث
                        </Button>
                    </div>
                )}
            </main>

            {/* ── High-Impact Call to Action ── */}
            <div className="container mx-auto px-4 mb-32 group">
                <div className="relative rounded-[60px] overflow-hidden p-16 md:p-24 text-center space-y-10 group-hover:shadow-[0_40px_100px_-20px_rgba(var(--primary),0.3)] transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-purple-800" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

                    <div className="relative z-10 space-y-8">
                        <TrendingUp className="w-16 h-16 text-white/40 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter">كن أول من يعلم!</h2>
                        <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto font-medium">
                            انضم لآلاف المتابعين على منصاتنا الاجتماعية واحصل على تنبيهات فورية وتغطية حصرية لما وراء الكواليس.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-6">
                            <Button size="lg" variant="secondary" className="h-12 px-8 rounded-[28px] font-black text-base gap-4 shadow-2xl hover:scale-110 transition-transform">
                                انضم للتيليجرام
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 rounded-[28px] font-black text-base gap-4 border-white/20 text-white hover:bg-white/10 transition-all">
                                تابعنا على فيسبوك
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
