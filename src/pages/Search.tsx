import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { searchMulti } from "@/lib/tmdb";
import { searchRamadan } from "@/lib/ramadan";
import { event as trackEvent } from "@/lib/analytics";
import { PageLoader } from "@/components/PageLoader";

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
                const [tmdbData, ramadanResults] = await Promise.all([
                    searchMulti(query),
                    searchRamadan(query)
                ]);

                const combined = [...ramadanResults, ...tmdbData.results];

                // Robust normalization for Arabic titles
                const normalize = (text: string) => {
                    if (!text) return "";
                    return text.toLowerCase()
                        .replace(/^(مسلسل|برنامج)\s+/, "")
                        .replace(/[أإآ]/g, "ا")
                        .replace(/[ى]/g, "ي")
                        .replace(/[ة]/g, "ه")
                        .replace(/\s+/g, " ")
                        .trim();
                };

                const ramadanTitles = new Set();
                ramadanResults.forEach(r => {
                    ramadanTitles.add(normalize(r.title));
                    if (r.clean_title) ramadanTitles.add(normalize(r.clean_title));
                });

                const unique = combined.filter(item => {
                    if (item.isRamadan) return true;
                    const itemTitle = normalize(item.title || item.name || "");
                    return !ramadanTitles.has(itemTitle);
                });

                setResults(unique);
                trackEvent({
                    action: "search",
                    category: "User Interaction",
                    label: query,
                    value: unique.length,
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
                    <PageLoader />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((item: any) => (
                            <MovieCard
                                key={item.id}
                                item={item}
                                type={item.media_type === "tv" ? "tv" : "movie"}
                                isRamadan={item.isRamadan}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
