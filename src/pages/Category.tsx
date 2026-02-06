import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { fetchByGenre } from "@/lib/tmdb";

export default function Category() {
    const { type, genreId } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategory = async () => {
            setLoading(true);
            try {
                const data = await fetchByGenre(type as any, parseInt(genreId));
                setItems(data.results);
            } catch (err) {
                console.error("Failed to load category:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCategory();
    }, [type, genreId]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <h1 className="text-3xl font-bold mb-8">
                    {type === "movie" ? "أفلام" : "مسلسلات"}
                </h1>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {items.map((item) => (
                            <MovieCard key={item.id} item={item} type={type as any} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
