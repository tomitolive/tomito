import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { HeroCarousel } from "@/components/HeroCarousel";
import { fetchPopular } from "@/lib/tmdb";

export default function Home() {
    const [movies, setMovies] = useState<any[]>([]);
    const [tvShows, setTvShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [moviesData, tvData] = await Promise.all([
                    fetchPopular("movie"),
                    fetchPopular("tv")
                ]);
                setMovies(moviesData.results);
                setTvShows(tvData.results);
            } catch (err) {
                console.error("Failed to fetch dynamic data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <HeroCarousel items={movies.slice(0, 10)} type="movie" />
            <div className="container mx-auto px-4 py-8 space-y-12">
                <ContentRow title="أفلام شائعة" items={movies} type="movie" />
                <ContentRow title="مسلسلات شائعة" items={tvShows} type="tv" />
            </div>
            <Footer />
        </div>
    );
}
