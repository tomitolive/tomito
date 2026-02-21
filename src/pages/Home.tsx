import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";

import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductionCompaniesBar } from "@/components/ProductionCompaniesBar";
import { fetchPopular, fetchTrending, fetchNowPlaying, fetchOnTheAir, fetchTopRated, searchMulti, TMDB_CONFIG, t } from "@/lib/tmdb";


export default function Home() {
    const [popularMovies, setPopularMovies] = useState<any[]>([]);
    const [popularTV, setPopularTV] = useState<any[]>([]);
    const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
    const [latestMovies, setLatestMovies] = useState<any[]>([]);
    const [latestSeries, setLatestSeries] = useState<any[]>([]);
    const [ramadanSeries, setRamadanSeries] = useState<any[]>([]);
    const [topRated, setTopRated] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch TMDB data
                const [
                    popularMoviesData,
                    popularTVData,
                    trendingData,
                    nowPlayingData,
                    onTheAirData,
                    topRatedData,
                ] = await Promise.all([
                    fetchPopular("movie"),
                    fetchPopular("tv"),
                    fetchTrending("movie"),
                    fetchNowPlaying(),
                    fetchOnTheAir(),
                    fetchTopRated("movie"),
                ]);

                setPopularMovies(popularMoviesData.results);
                setPopularTV(popularTVData.results);
                setTrendingMovies(trendingData);
                setLatestMovies(nowPlayingData.results);
                setLatestSeries(onTheAirData.results);
                setTopRated(topRatedData.results);

                // Fetch Ramadan Results data
                const ramadanResponse = await fetch("/ramadan_2026_results.json");
                const ramadanData = await ramadanResponse.json();

                // Search TMDB for each series to get proper images
                const first6 = ramadanData.slice(0, 6);
                const mappedRamadan = await Promise.all(
                    first6.map(async (series: any) => {
                        let tmdbPoster = series.poster;
                        let tmdbBackdrop = series.poster;
                        try {
                            const searchResult = await searchMulti(series.clean_title || series.title);
                            const hit = searchResult?.results?.[0];
                            if (hit?.poster_path) {
                                tmdbPoster = `${TMDB_CONFIG.IMG_URL}/w500${hit.poster_path}`;
                            }
                            if (hit?.backdrop_path) {
                                tmdbBackdrop = `${TMDB_CONFIG.IMG_URL}/original${hit.backdrop_path}`;
                            } else if (hit?.poster_path) {
                                tmdbBackdrop = `${TMDB_CONFIG.IMG_URL}/w780${hit.poster_path}`;
                            }
                        } catch (_) { /* keep original poster on error */ }
                        return {
                            id: series.id,
                            name: series.title,
                            clean_title: series.clean_title,
                            poster_path: tmdbPoster,
                            backdrop_path: tmdbBackdrop,
                            overview: series.description,
                            vote_average: 9.1,
                            first_air_date: series.year || "2026",
                            isSupreme: true
                        };
                    })
                );

                setRamadanSeries(mappedRamadan);

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
        <div className="min-h-screen bg-background text-foreground">
            <SEO
                title="مشاهدة أفلام ومسلسلات مجانية أونلاين"
                description="شاهد آلاف الأفلام والمسلسلات العربية والأجنبية مجاناً على Tomito. أحدث الأفلام بجودة HD، مسلسلات مترجمة ومشاهدة مباشرة بدون تحميل."
                keywords="مشاهدة افلام, تحميل مسلسلات, افلام اون لاين مجانا, مسلسلات مترجمة, شاهد نت, فشار, ايجي بست بديل, سيما فور يو, موقع افلام عربي, افلام جديدة, مسلسلات 2025"
            />

            <Navbar />
            <HeroCarousel items={popularTV.slice(0, 10)} type="tv" />
            <div className="container mx-auto px-4 py-8 space-y-12">

                {/* Ramadan 2026 Section */}
                {ramadanSeries.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                                <h2 className="text-2xl font-bold">مسلسلات رمضان 2026</h2>
                            </div>
                            <Link to="/ramadan" className="text-primary hover:underline font-medium text-sm">
                                عرض الكل
                            </Link>
                        </div>
                        <ContentRow
                            title=""
                            items={ramadanSeries.slice(0, 6)}
                            type="tv"
                            isRamadan={true}
                        />
                    </div>
                )}

                {/* Trending Section */}
                <ContentRow title={t("trendingMovies")} items={trendingMovies} type="movie" />

                {/* Production Companies Bar */}
                <ProductionCompaniesBar />

                {/* Latest Content Sections */}
                <ContentRow title={t("latestMovies")} items={latestMovies} type="movie" />
                <ContentRow title={t("latestSeries")} items={latestSeries} type="tv" />

                {/* Popular Sections */}
                <ContentRow title={t("popularMovies")} items={popularMovies} type="movie" />
                <ContentRow title={t("popularTV")} items={popularTV} type="tv" />

                {/* Opinion / Critics' Choice Section */}
                <ContentRow title={t("criticsChoice")} items={topRated} type="movie" />
            </div>
            <Footer />
        </div>
    );
}

