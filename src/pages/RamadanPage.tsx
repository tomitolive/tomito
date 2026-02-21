import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Play, Calendar, Star, Info, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface SupremeEntry {
    id: string;
    title: string;
    poster: string;
    description: string;
    year: string;
    type: string;
}

interface SeriesItem {
    id: string;
    name: string;
    poster: string;
    description: string;
    year: string;
    episodeCount: number;
}

export default function RamadanPage() {
    const [allSeries, setAllSeries] = useState<SeriesItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/ramadan_2026_supreme.json");
                const data: SupremeEntry[] = await response.json();

                // Unique series Map
                const seriesMap = new Map<string, SeriesItem>();

                data.forEach((entry) => {
                    // Robust title extraction
                    const titleMatch = entry.title.match(/^(?:مسلسل|برنامج)\s+(.+?)(?:\s+الحلقة|$)/);
                    const name = titleMatch ? titleMatch[1].trim() : entry.title.replace(/\s+الحلقة\s+\d+.*$/, "");

                    if (!seriesMap.has(name)) {
                        seriesMap.set(name, {
                            id: entry.id,
                            name,
                            poster: entry.poster,
                            description: entry.description,
                            year: entry.year || "2026",
                            episodeCount: 1,
                        });
                    } else {
                        const existing = seriesMap.get(name)!;
                        existing.episodeCount += 1;
                    }
                });

                setAllSeries(Array.from(seriesMap.values()));
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
        return allSeries.filter((s) => s.name.toLowerCase().includes(query));
    }, [allSeries, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <div className="pt-32 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">جاري تحميل مسلسلات رمضان...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <SEO
                title="مسلسلات رمضان 2026 | Tomito"
                description="استكشف وشاهد أحدث مسلسلات رمضان 2026 بجودة عالية."
                keywords="رمضان 2026, مسلسلات عربية, دراما رمضان, مشاهدة مباشرة"
            />
            <Navbar />

            {/* Hero Banner Area */}
            <div className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10" />
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-primary mb-4">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-bold tracking-widest uppercase text-sm">حصرياً 2026</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                            مسلسلات رمضان
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                            تغطية شاملة وحصرية لجميع المسلسلات والبرامج الرمضانية لعام 2026. شاهد حلقاتك المفضلة بجودة عالية وسيرفرات سريعة.
                        </p>

                        {/* Search Bar Implementation */}
                        <div className="relative max-w-xl group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="ابحث عن مسلسلك المفضل..."
                                className="w-full h-14 pr-12 bg-white/5 border-white/10 rounded-2xl text-lg focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.6)]" />
                        <h2 className="text-2xl font-bold">قائمة المسلسلات</h2>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
                            {filteredSeries.length} مسلسل
                        </span>
                    </div>
                </div>

                {filteredSeries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
                        {filteredSeries.map((series) => (
                            <Link
                                key={series.id}
                                to={`/watch-ramadan/${encodeURIComponent(series.name)}`}
                                className="group relative flex flex-col gap-4 focus:outline-none"
                            >
                                {/* Poster Card */}
                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-500 group-hover:scale-[1.03] group-hover:border-primary/50 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]">
                                    <img
                                        src={series.poster}
                                        alt={series.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                                        }}
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="bg-primary/20 backdrop-blur-md border border-primary/30 px-2 py-1 rounded-md">
                                                <span className="text-[10px] font-bold text-primary">{series.episodeCount} حلقة</span>
                                            </div>
                                        </div>
                                        <Button size="sm" className="w-full gap-2 font-bold shadow-lg shadow-primary/20">
                                            <Play className="w-4 h-4 fill-current" />
                                            شاهد الآن
                                        </Button>
                                    </div>

                                    {/* Rating/Badge (Static) */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-[11px] font-bold">8.5</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="space-y-1 px-1">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                        {series.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>{series.year}</span>
                                        <span>•</span>
                                        <span>دراما</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">لا توجد نتائج لـ "{searchQuery}"</h3>
                        <p className="text-muted-foreground">تأكد من كتابة الاسم بشكل صحيح أو جرب كلمات أخرى.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => setSearchQuery("")}
                        >
                            عرض كل المسلسلات
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
