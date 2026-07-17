import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, ChevronLeft } from "lucide-react";
import { fetchByCompany, t } from "@/lib/tmdb";
import { PRODUCTION_COMPANIES } from "@/config/productionCompanies";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import TrailerAd from "@/components/TrailerAd";
import { BackButton } from "@/components/BackButton";

export default function CompanyContent() {
    const { companyId } = useParams<{ companyId: string }>();
    const [movies, setMovies] = useState<any[]>([]);
    const [tvShows, setTvShows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const company = PRODUCTION_COMPANIES.find(c => c.id === Number(companyId));

    useEffect(() => {
        const loadData = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const [movieData, tvData] = await Promise.all([
                    fetchByCompany("movie", companyId, currentPage),
                    fetchByCompany("tv", companyId, currentPage)
                ]);
                setMovies(movieData.results || []);
                setTvShows(tvData.results || []);
                setTotalPages(Math.max(movieData.total_pages || 1, tvData.total_pages || 1));
            } catch (err) {
                console.error("Failed to fetch company content:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [companyId, currentPage]);

    const displayContent = activeTab === "movie" ? movies : tvShows;

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen text-foreground">
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
                    <>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-secondary/30 border border-white/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    الأول
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-secondary/30 border border-white/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    السابق
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                                                    currentPage === pageNum
                                                        ? "bg-primary text-primary-foreground shadow-lg"
                                                        : "bg-secondary/30 border border-white/10 hover:bg-primary/20"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-secondary/30 border border-white/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                >
                                    التالي
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-secondary/30 border border-white/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    الأخير
                                </button>

                                <span className="text-muted-foreground text-sm mr-4">
                                    صفحة {currentPage} من {totalPages}
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-card/20 rounded-2xl border border-dashed border-white/10">
                        <p className="text-muted-foreground text-xl">
                            {t("noContent" as any) || "لا يوجد محتوى متوفر حالياً"}
                        </p>
                    </div>
                )}
            </main>

            {/* Magsrv Ad — يظهر مباشرة تحت الفيديو */}
            <TrailerAd adKey={companyId || ''} />

            <Footer />
            <BackButton />
        </div>
    );
}
