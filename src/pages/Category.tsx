import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { fetchByGenre } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight } from "lucide-react";
import NewAd from "@/components/NewAd";

export default function Category() {
    const { type, genreId } = useParams();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Load popup script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://pl30597544.profitableratecpmnetwork.com/c3/e8/93/c3e893c4344bbee9205294b8e255c444.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Reset when category changes
    useEffect(() => {
        setItems([]);
        const initialLoad = async () => {
            setLoading(true);
            setPage(1);
            try {
                const gId = parseInt(genreId || "0");
                const data = await fetchByGenre(type as any, gId, 1);
                setItems(data.results);
                setTotalPages(data.total_pages);
            } catch (err) {
                console.error("Failed to load category:", err);
            } finally {
                setLoading(false);
            }
        };
        initialLoad();
    }, [type, genreId]);

    // Load page when page changes
    useEffect(() => {
        if (page === 1) return;
        const loadPage = async () => {
            setLoading(true);
            try {
                const gId = parseInt(genreId || "0");
                const data = await fetchByGenre(type as any, gId, page);
                setItems(data.results);
            } catch (err) {
                console.error("Failed to load page:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPage();
    }, [page]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <h1 className="text-3xl font-bold mb-8 capitalize">
                    {genreId === "all"
                        ? (type === "movie" ? "All Movies" : "All TV Shows")
                        : (type === "movie" ? "أفلام" : "مسلسلات")
                    }
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {loading ? [...Array(10)].map((_, i) => (
                        <div key={`skeleton-${i}`} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                    )) : items.map((item) => (
                        <MovieCard key={item.id} item={item} type={type as any} />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                        >
                            <ArrowRight className="w-4 h-4 rtl-flip" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronDown className="w-4 h-4 rotate-90 rtl-flip" />
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }
                            
                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronDown className="w-4 h-4 -rotate-90 rtl-flip" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                        >
                            <ArrowRight className="w-4 h-4 rotate-180 rtl-flip" />
                        </Button>
                    </div>
                )}
            </div>
            <Footer />
            <BackButton />
        </div>
    );
}
