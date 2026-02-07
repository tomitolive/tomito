import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { fetchByGenre } from "@/lib/tmdb";

export default function Category() {
    const { type, genreId } = useParams();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Reset when category changes
    useEffect(() => {
        setItems([]);
        const initialLoad = async () => {
            setLoading(true);
            setPage(1);
            setHasMore(true);
            try {
                // Determine if we are fetching "all" or specific genre
                // If genreId is "all", parseInt returns NaN
                const gId = parseInt(genreId || "0"); // "all" -> NaN
                const data = await fetchByGenre(type as any, gId, 1);
                setItems(data.results);
                setHasMore(data.page < data.total_pages);
            } catch (err) {
                console.error("Failed to load category:", err);
            } finally {
                setLoading(false);
            }
        };
        initialLoad();
    }, [type, genreId]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
                && !loading
                && !isFetchingMore
                && hasMore
            ) {
                loadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [items, loading, hasMore, isFetchingMore]);

    const loadMore = async () => {
        if (isFetchingMore || !hasMore) return;
        setIsFetchingMore(true);
        try {
            const nextPage = page + 1;
            const gId = parseInt(genreId || "0");
            const data = await fetchByGenre(type as any, gId, nextPage);

            if (data.results && data.results.length > 0) {
                // Filter duplicates just in case
                setItems(prev => {
                    const existingIds = new Set(prev.map(i => i.id));
                    const newItems = data.results.filter((i: any) => !existingIds.has(i.id));
                    return [...prev, ...newItems];
                });
                setPage(nextPage);
                setHasMore(nextPage < data.total_pages);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Failed to load more:", err);
        } finally {
            setIsFetchingMore(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <h1 className="text-3xl font-bold mb-8 capitalize">
                    {genreId === "all"
                        ? (type === "movie" ? "All Movies" : "All TV Shows")
                        : (type === "movie" ? "أفلام" : "مسلسلات")
                    }
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {items.map((item) => (
                        <MovieCard key={item.id} item={item} type={type as any} />
                    ))}

                    {(loading || isFetchingMore) && [...Array(10)].map((_, i) => (
                        <div key={`skeleton-${i}`} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>

                {!hasMore && items.length > 0 && (
                    <div className="mt-8 text-center text-muted-foreground">
                        No more items to load
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
