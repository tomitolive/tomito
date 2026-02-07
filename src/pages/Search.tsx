import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { searchMulti } from "@/lib/tmdb";
import { event as trackEvent } from "@/lib/analytics";

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        const doSearch = async () => {
            setLoading(true);
            try {
                const data = await searchMulti(query);
                setResults(data.results);
                trackEvent({
                    action: "search",
                    category: "User Interaction",
                    label: query,
                    value: data.results.length,
                });
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        };
        doSearch();
    }, [query]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <h1 className="text-3xl font-bold mb-8">نتائج البحث عن: {query}</h1>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((item) => (
                            <MovieCard
                                key={item.id}
                                item={item}
                                type={item.media_type === "tv" ? "tv" : "movie"}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
