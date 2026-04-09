import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { fetchByCompany, fetchCompanyDetails, t, TMDB_CONFIG } from "@/lib/tmdb";
import { PRODUCTION_COMPANIES } from "@/config/productionCompanies";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { PageLoader } from "@/components/PageLoader";

export default function CompanyContent() {
    const { companyId } = useParams<{ companyId: string }>();
    const [movies, setMovies] = useState<any[]>([]);
    const [tvShows, setTvShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [companyInfo, setCompanyInfo] = useState<any>(null);

    const company = PRODUCTION_COMPANIES.find(c => c.id === Number(companyId));

    const loadData = async (currentPage: number, append = false) => {
        if (!companyId) return;
        
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setMovies([]);
            setTvShows([]);
        }

        try {
            const data = await fetchByCompany(activeTab, companyId, currentPage);
            
            if (activeTab === "movie") {
                setMovies(prev => append ? [...prev, ...(data.results || [])] : (data.results || []));
            } else {
                setTvShows(prev => append ? [...prev, ...(data.results || [])] : (data.results || []));
            }
            
            setTotalPages(data.total_pages || 1);
        } catch (err) {
            console.error("Failed to fetch company content:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const loadCompanyInfo = async () => {
            if (!companyId) return;
            try {
                const info = await fetchCompanyDetails(Number(companyId));
                setCompanyInfo(info);
            } catch (err) {
                console.error("Failed to fetch company info:", err);
            }
        };
        loadCompanyInfo();
        setPage(1);
        loadData(1, false);
    }, [companyId, activeTab]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadData(nextPage, true);
    };

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
                        {(companyInfo?.logo_path || company?.logo) && (
                            <img src={companyInfo?.logo_path ? `${TMDB_CONFIG.IMG_URL}/original${companyInfo.logo_path}` : company?.logo} alt="" className="absolute left-0 top-0 w-64 h-64 object-contain opacity-5 -translate-x-1/4 -translate-y-1/4 pointer-events-none filter grayscale" />
                        )}

                        <div className="flex-shrink-0 w-full md:w-48 h-24 bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-white/10 shadow-inner">
                            {(companyInfo?.logo_path || company?.logo) && (
                                <img src={companyInfo?.logo_path ? `${TMDB_CONFIG.IMG_URL}/original${companyInfo.logo_path}` : company?.logo} alt={companyInfo?.name || company?.name} className="max-w-full max-h-full object-contain filter brightness-110 drop-shadow-lg" />
                            )}
                        </div>

                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gradient">
                                {company?.nameAr || companyInfo?.name}
                            </h1>
                            {companyInfo?.headquarters && (
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    {companyInfo.headquarters}
                                </p>
                            )}
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
                {loading && page === 1 ? (
                    <PageLoader />
                ) : displayContent.length > 0 ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fade-in">
                            {displayContent.map((item, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${(index % 20) * 50}ms` }}
                                >
                                    <MovieCard
                                        item={item as any}
                                        type={activeTab}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {page < totalPages && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="group relative flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-primary/25"
                                >
                                    {loadingMore ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                            <span>{t("loading")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t("loadMore")}</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-90" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
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
