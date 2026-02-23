import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Play, Calendar, Star, Download, Sparkles, Filter } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { PosterImage } from "@/components/PosterImage";
import { cn, createSlugWithId } from "@/lib/utils";
import { t } from "@/lib/tmdb";

interface SeriesItem {
    tmdb_id: string;
    title: string;
    poster: string;
}

interface IndexEntry {
    t: string;
    b: number;
}

export default function SeriesDownloadList() {
    const [index, setIndex] = useState<Record<string, IndexEntry>>({});
    const [loadedSeries, setLoadedSeries] = useState<SeriesItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadedChunks, setLoadedChunks] = useState<number[]>([]);
    const [currentChunk, setCurrentChunk] = useState(1);
    const maxChunks = 19; // From directory listing earlier

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const idxRes = await fetch("/data_series/index.json");
                const idxData = await idxRes.json();
                setIndex(idxData);

                // Load first chunk
                await loadChunk(1);
            } catch (err) {
                console.error("Failed to load initial data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const loadChunk = async (chunkNum: number) => {
        if (chunkNum > maxChunks || loadedChunks.includes(chunkNum)) return;

        try {
            const res = await fetch(`/data_series/chunks/chunk_${chunkNum}.json`);
            const data = await res.json();

            const newItems: SeriesItem[] = data.map((item: any) => ({
                tmdb_id: item.tmdb_id,
                title: item.title,
                // Take the first season's poster as default
                poster: item.seasons?.[0]?.tmdb_poster || ""
            }));

            setLoadedSeries(prev => {
                // Avoid duplicates
                const existingIds = new Set(prev.map(i => i.tmdb_id));
                const filtered = newItems.filter(i => !existingIds.has(i.tmdb_id));
                return [...prev, ...filtered];
            });
            setLoadedChunks(prev => [...prev, chunkNum]);
            setCurrentChunk(chunkNum);
        } catch (err) {
            console.error(`Failed to load chunk ${chunkNum}:`, err);
        }
    };

    const handleLoadMore = () => {
        loadChunk(currentChunk + 1);
    };

    const filteredSeries = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return loadedSeries;

        // If searching, we might need to search the index too
        // But for UI display, we only show items we have data (posters) for
        // In a real scenario, we'd fetch specific chunks based on search results
        return loadedSeries.filter(s =>
            s.title.toLowerCase().includes(query)
        );
    }, [loadedSeries, searchQuery]);

    // Search logic for index (find items that aren't loaded yet)
    const indexSearchResults = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query || query.length < 3) return [];

        const results = Object.entries(index)
            .filter(([id, entry]) => entry.t.toLowerCase().includes(query))
            .filter(([id]) => !loadedSeries.some(s => s.tmdb_id === id))
            .slice(0, 10);

        return results;
    }, [index, searchQuery, loadedSeries]);

    const loadSpecificResult = async (tmdbId: string, bucket: number) => {
        await loadChunk(bucket);
        setSearchQuery(""); // Clear search to show the loaded item
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <SEO
                title="تحميل المسلسلات برابط واحد - مكتبة المسلسلات الكاملة"
                description="مكتبة شاملة لتحميل المسلسلات الكاملة بروابط مباشرة وسريعة. سيرفرات متعددة وجودات عالية."
            />
            <Navbar />

            {/* Premium Hero Section */}
            <div className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20" />

                <div className="container mx-auto px-4 relative">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Download className="w-4 h-4 text-primary animate-pulse" />
                            <span className="font-black tracking-widest uppercase text-[10px] text-primary">أكبر مكتبة للمسلسلات</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
                                <span className="text-primary italic">تحميل المسلسلات</span>
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">بروابط مباشرة</span>
                            </h1>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto font-medium">
                                استمتع بتحميل مواسم كاملة من مسلسلاتك المفضلة بضغطة واحدة. سيرفرات فائقة السرعة وجودات ريمكس أصلية.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
                            <div className="relative flex items-center">
                                <Search className="absolute right-5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                <Input
                                    type="text"
                                    placeholder="ابحث عن مسلسل (مثال: Game of Thrones, Breaking Bad...)"
                                    className="w-full h-14 pr-14 bg-card/40 backdrop-blur-3xl border-white/10 rounded-2xl text-sm focus:ring-0 focus:border-primary/50 transition-all font-bold"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Search Results from Index */}
                            {indexSearchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 border-b border-white/5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-1">نتائج البحث في الأرشيف:</p>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {indexSearchResults.map(([id, entry]) => (
                                            <button
                                                key={id}
                                                onClick={() => loadSpecificResult(id, entry.b)}
                                                className="w-full text-right px-5 py-4 hover:bg-primary/10 transition-colors flex items-center justify-between group"
                                            >
                                                <span className="font-bold text-sm group-hover:text-primary transition-colors">{entry.t}</span>
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-12 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                        <h2 className="text-xl font-black tracking-tight tracking-wide uppercase">قـائمة المـسلسلات</h2>
                    </div>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            جاري التحميل...
                        </div>
                    )}
                </div>

                {/* Grid */}
                {filteredSeries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                        {filteredSeries.map((series, idx) => (
                            <Link
                                key={series.tmdb_id}
                                to={`/tv/${createSlugWithId(series.tmdb_id, series.title)}`}
                                className="group relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500"
                                style={{ animationDelay: `${(idx % 20) * 30}ms` }}
                            >
                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted border border-white/5 transition-all duration-500 group-hover:scale-[1.03] group-hover:border-primary/40 group-hover:shadow-2xl">
                                    <PosterImage
                                        src={series.poster}
                                        alt={series.title}
                                        className="transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                        <Button className="w-full h-10 rounded-xl gap-2 font-black text-xs active:scale-95 transition-all bg-primary/90 backdrop-blur-md">
                                            <Download className="w-4 h-4" />
                                            تحميل الآن
                                        </Button>
                                    </div>
                                    <div className="absolute top-3 right-3 transition-opacity duration-300 group-hover:opacity-0">
                                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-[10px] font-black text-white tracking-tighter">HD</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 px-1">
                                    <h3 className="font-bold text-sm leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                                        {series.title}
                                    </h3>
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest group-hover:text-primary/40 transition-colors">Multiple Servers</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : !isLoading && (
                    <div className="text-center py-32 rounded-3xl border border-dashed border-white/10 bg-card/20">
                        <p className="text-muted-foreground">لم يتم العثور على نتائج</p>
                    </div>
                )}

                {/* Load More Button */}
                {!isLoading && currentChunk < maxChunks && searchQuery === "" && (
                    <div className="mt-20 text-center">
                        <Button
                            onClick={handleLoadMore}
                            variant="outline"
                            className="h-12 px-10 rounded-2xl border-white/10 hover:bg-primary hover:text-white transition-all font-black text-sm gap-3 group"
                        >
                            <Play className="w-4 h-4 rotate-90 fill-current group-hover:rotate-0 transition-transform" />
                            عرض المزيد من المسلسلات
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
            <BackButton />
        </div>
    );
}
