import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { fetchByCompany, t } from "@/lib/tmdb";
import { PRODUCTION_COMPANIES } from "@/config/productionCompanies";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";

export default function CompanyContent() {
    const { companyId } = useParams<{ companyId: string }>();
    const [movies, setMovies] = useState<any[]>([]);
    const [tvShows, setTvShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");

    const company = PRODUCTION_COMPANIES.find(c => c.id === Number(companyId));

    useEffect(() => {
        const loadData = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const [movieData, tvData] = await Promise.all([
                    fetchByCompany("movie", companyId),
                    fetchByCompany("tv", companyId)
                ]);
                setMovies(movieData.results || []);
                setTvShows(tvData.results || []);
            } catch (err) {
                console.error("Failed to fetch company content:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [companyId]);

    const displayContent = activeTab === "movie" ? movies : tvShows;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12">
                {/* Header Section */}
                <div className="mb-12 animate-fade-in text-right">
                    <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors group">
                        <span>{t("home")}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex flex-col md:flex-row-reverse items-start md:items-center gap-8 bg-card/40 backdrop-blur-md p-8 rounded-3xl border border-primary/20 shadow-2xl relative overflow-hidden">
                        {/* Background subtle logo */}
                        {company?.logo && (
                            <img src={company.logo} alt="" className="absolute left-0 top-0 w-64 h-64 object-contain opacity-5 -translate-x-1/4 -translate-y-1/4 pointer-events-none filter grayscale" />
                        )}

                        <div className="flex-shrink-0 w-full md:w-48 h-24 bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-white/10 shadow-inner">
                            {company?.logo && (
                                <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain filter brightness-110 drop-shadow-lg" />
                            )}
                        </div>

                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gradient">
                                {company?.nameAr}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="flex justify-center mb-8 bg-secondary/30 p-1 rounded-xl inline-flex w-auto mx-auto border border-white/5">
                    <button
                        onClick={() => setActiveTab("movie")}
                        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "movie" ? "bg-primary text-primary-foreground shadow-lg" : "hover:text-primary"}`}
                    >
                        {t("movies")}
                    </button>
                    <button
                        onClick={() => setActiveTab("tv")}
                        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "tv" ? "bg-primary text-primary-foreground shadow-lg" : "hover:text-primary"}`}
                    >
                        {t("tvShows")}
                    </button>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : displayContent.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fade-in">
                        {displayContent.map((item, index) => (
                            <div
                                key={item.id}
                                className="animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <MovieCard
                                    item={item as any}
                                    type={activeTab}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card/20 rounded-2xl border border-dashed border-white/10">
                        <p className="text-muted-foreground text-xl">
                            {t("noContent" as any) || "لا يوجد محتوى متوفر حالياً"}
                        </p>
                    </div>
                )}
            </main>

            <Footer />
            <BackButton />
        </div>
    );
}
