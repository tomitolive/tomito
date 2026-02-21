import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";

import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductionCompaniesBar } from "@/components/ProductionCompaniesBar";
import { fetchPopular, fetchTrending, fetchNowPlaying, fetchOnTheAir, fetchTopRated, t } from "@/lib/tmdb";


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

                // Fetch Ramadan Supreme data
                const ramadanResponse = await fetch("/ramadan_2026_supreme.json");
                const ramadanData = await ramadanResponse.json();

                // Group by series title to show unique items on home page
                const seriesMap = new Map();
                ramadanData.forEach((item: any) => {
                    const titleMatch = item.title.match(/^(?:مسلسل|برنامج)\s+(.+?)(?:\s+الحلقة|$)/);
                    const name = titleMatch ? titleMatch[1].trim() : item.title.replace(/\s+الحلقة\s+\d+.*$/, "");
                    if (!seriesMap.has(name)) {
                        seriesMap.set(name, {
                            id: item.id,
                            name: name,
                            poster_path: item.poster, // Use full URL directly
                            vote_average: 8.5,
                            first_air_date: item.year || "2026",
                            isSupreme: true // Flag to handle routing if needed
                        });
                    }
                });
                setRamadanSeries(Array.from(seriesMap.values()).slice(0, 12));

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
            <HeroCarousel items={popularMovies.slice(0, 10)} type="movie" />
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
                            items={ramadanSeries}
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

