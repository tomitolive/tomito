import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Star, Calendar, ArrowRight, Users, Tv } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { Button } from "@/components/ui/button";
import {
    fetchTVDetails,
    fetchCredits,
    fetchSimilar,
    fetchVideos,
    getBackdropUrl,
    getImageUrl,
    TVShowDetails,
    Cast,
    TVShow,
    t
} from "@/lib/tmdb";
import { cn, getIdFromSlug } from "@/lib/utils";
import { event as trackEvent } from "@/lib/analytics";
import { SEO } from "@/components/SEO";


export default function TVTrailer() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
    const [cast, setCast] = useState<Cast[]>([]);
    const [similar, setSimilar] = useState<TVShow[]>([]);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTVShow = async () => {
            const actualId = getIdFromSlug(slug || "");
            if (!actualId) return;
            setIsLoading(true);
            try {
                const [tvData, castData, similarData, videosData] = await Promise.all([
                    fetchTVDetails(actualId),
                    fetchCredits("tv", actualId),
                    fetchSimilar("tv", actualId),
                    fetchVideos(actualId, "tv"),
                ]);
                setTVShow(tvData);
                setCast(castData.slice(0, 5));
                setSimilar(similarData as TVShow[]);

                // Find trailer (prefer official trailer, then teaser)
                const trailer = videosData.find(
                    (v: any) => v.type === "Trailer" && v.site === "YouTube"
                ) || videosData.find(
                    (v: any) => v.type === "Teaser" && v.site === "YouTube"
                );

                if (trailer) {
                    setTrailerKey(trailer.key);
                }

                trackEvent({
                    action: "view_trailer",
                    category: "Content",
                    label: tvData.name,
                    value: tvData.id,
                });
            } catch (error) {
                console.error("Error loading TV show:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTVShow();
        window.scrollTo(0, 0);
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">{t("loading")}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tvShow) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">المسلسل غير موجود</h1>
                        <Button asChild>
                            <Link to="/">{t("backHome")}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* SEO Meta Tags */}
            <SEO
                title={`مشاهدة تريلر ${tvShow.name} كامل HD`}
                description={`شاهد تريلر ${tvShow.name} الرسمي. ${tvShow.overview?.substring(0, 150)}...`}
                keywords={`${tvShow.name}, تريلر, مسلسل, مشاهدة, ${tvShow.genres?.map(g => g.name).join(', ')}, مسلسلات 2025, تحميل مسلسلات`}
                ogTitle={`تريلر ${tvShow.name}`}
                ogDescription={tvShow.overview || ''}
                ogType="video.other"
            />


            <Navbar />

            {/* Hero Background */}
            <div
                className="absolute inset-0 h-[40vh] bg-cover bg-center"
                style={{ backgroundImage: `url(${getBackdropUrl(tvShow.backdrop_path)})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
            </div>

            {/* Content */}
            <div className="relative pt-24 pb-8 container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link to="/" className="hover:text-primary transition-colors">{t("home")}</Link>
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                    <Link to="/category/tv/all" className="hover:text-primary transition-colors">{t("tvShows")}</Link>
                    <ArrowRight className="w-4 h-4 rtl-flip" />
                    <span className="text-foreground">{tvShow.name}</span>
                </nav>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Trailer Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Trailer Video */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                            {trailerKey ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0`}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    title={`${tvShow.name} Trailer`}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-muted-foreground mb-4">التريلر غير متوفر حالياً</p>
                                        <Button
                                            size="lg"
                                            className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95 px-8 py-6 text-lg font-bold"
                                            onClick={() => navigate(`/tv/${tvShow.id}/watch`)}
                                        >
                                            <Play className="w-6 h-6 mr-2 fill-current" />
                                            {t("watchTV")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Watch Now Button - Positioned directly under trailer */}
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95 px-6 py-8 text-xl font-bold group/btn"
                            onClick={() => navigate(`/tv/${tvShow.id}/watch`)}
                        >
                            <Play className="w-6 h-6 mr-3 fill-current group-hover/btn:animate-pulse" />
                            <span className="relative">
                                {t("watchNow")}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover/btn:w-full" />
                            </span>
                        </Button>

                        {/* TV Show Info */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{tvShow.name}</h1>
                            {tvShow.original_name !== tvShow.name && (
                                <p className="text-lg text-muted-foreground mb-4">{tvShow.original_name}</p>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="rating-badge">
                                    <Star className="w-4 h-4 fill-current" />
                                    {tvShow.vote_average?.toFixed(1)}
                                </div>
                                {tvShow.number_of_seasons && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Tv className="w-4 h-4" />
                                        {tvShow.number_of_seasons} {tvShow.number_of_seasons === 1 ? 'موسم' : 'مواسم'}
                                    </div>
                                )}
                                {tvShow.number_of_episodes && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Play className="w-4 h-4" />
                                        {tvShow.number_of_episodes} حلقة
                                    </div>
                                )}
                                {tvShow.first_air_date && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(tvShow.first_air_date).getFullYear()}
                                    </div>
                                )}
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tvShow.genres?.map((genre) => (
                                    <Link
                                        key={genre.id}
                                        to={`/category/tv/${genre.id}`}
                                        className="genre-tag"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Overview */}
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                {tvShow.overview || t("noDescription")}
                            </p>

                            {/* Cast */}
                            {cast.length > 0 && (
                                <div className="flex items-center gap-2 text-sm mb-6">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{t("actorsLabel")}</span>
                                    <div className="flex flex-wrap gap-1">
                                        {cast.map((actor, i) => (
                                            <Link
                                                key={actor.id}
                                                to={`/actor/${actor.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {actor.name}{i < 4 && cast.length > i + 1 ? "،" : ""}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Sidebar - Poster & Ad Space */}
                    <div className="space-y-6 flex flex-col items-center lg:items-center">
                        <img
                            src={getImageUrl(tvShow.poster_path, "w500")}
                            alt={tvShow.name}
                            className="w-full max-w-[280px] lg:max-w-[240px] rounded-xl shadow-2xl mx-auto"
                        />

                        {/* Ad Space Placeholder */}
                        <div className="hidden lg:block">
                            <div className="bg-muted/20 border border-muted rounded-xl p-4 text-center min-h-[300px] flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">مساحة إعلانية</p>
                            </div>
                        </div>
                    </div>
                </div>

                {similar.length > 0 && (
                    <div className="mt-12">
                        <ContentRow title={t("recommended")} items={similar} type="tv" />
                    </div>
                )}


            
            </div>

            <Footer />
        </div>
    );
}

