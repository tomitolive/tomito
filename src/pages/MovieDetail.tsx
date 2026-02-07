import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { Star, Clock, Calendar } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { fetchMovieDetails, t } from "@/lib/tmdb";
import { MovieSEO } from "@/components/SEO/MovieSEO";
import { getMovieById, Movie as LocalMovie } from "@/services/localData";


export default function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [localMovie, setLocalMovie] = useState<LocalMovie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMovie = async () => {
            try {
                // Fetch TMDB data
                const data = await fetchMovieDetails(parseInt(id || "0"));
                setMovie(data);

                // Fetch local SEO data
                const localData = await getMovieById(id || "0");
                if (localData) setLocalMovie(localData);
            } catch (err) {
                console.error("Failed to fetch movie details:", err);
            } finally {
                setLoading(false);
            }
        };
        loadMovie();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (!movie) return <div className="h-screen flex items-center justify-center">Movie not found</div>;

    return (
        <div className="min-h-screen bg-background text-white">
            <MovieSEO movie={localMovie} lang="ar" />
            <Navbar />


            {/* Backdrop Hero */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    className="w-full h-full object-cover"
                    alt={movie.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto">
                    <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
                    <div className="flex gap-6 text-sm opacity-80 font-medium">
                        <span className="flex items-center gap-2"><Star size={18} fill="currentColor" className="text-yellow-500" /> {movie.vote_average?.toFixed(1)}</span>
                        <span className="flex items-center gap-2"><Clock size={18} /> {movie.runtime} min</span>
                        <span className="flex items-center gap-2"><Calendar size={18} /> {movie.release_date?.split('-')[0]}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <p className="text-xl leading-relaxed opacity-90 max-w-3xl">
                            {movie.overview}
                        </p>

                        <div className="mt-12">
                            <VideoPlayer
                                id={parseInt(id || "0")}
                                type="movie"
                                title={movie.title}
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            className="w-full rounded-xl shadow-2xl"
                            alt={movie.title}
                        />
                    </div>
                </div>

                <div className="mt-12">
                    <ContentRow title={t("similarMovies")} items={movie.similar?.results || []} type="movie" />
                </div>
            </div>
            <Footer />
        </div>
    );
}
