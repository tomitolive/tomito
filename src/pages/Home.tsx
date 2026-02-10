import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";

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
    const [topRated, setTopRated] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    popularMoviesData,
                    popularTVData,
                    trendingData,
                    nowPlayingData,
                    onTheAirData,
                    topRatedData
                ] = await Promise.all([
                    fetchPopular("movie"),
                    fetchPopular("tv"),
                    fetchTrending("movie"),
                    fetchNowPlaying(),
                    fetchOnTheAir(),
                    fetchTopRated("movie")
                ]);

                setPopularMovies(popularMoviesData.results);
                setPopularTV(popularTVData.results);
                setTrendingMovies(trendingData);
                setLatestMovies(nowPlayingData.results);
                setLatestSeries(onTheAirData.results);
                setTopRated(topRatedData.results);
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
            <SEO
                title="مشاهدة أفلام ومسلسلات مجانية أونلاين"
                description="شاهد آلاف الأفلام والمسلسلات العربية والأجنبية مجاناً على Tomito. أحدث الأفلام بجودة HD، مسلسلات مترجمة ومشاهدة مباشرة بدون تحميل."
                keywords="مشاهدة افلام, تحميل مسلسلات, افلام اون لاين مجانا, مسلسلات مترجمة, شاهد نت, فشار, ايجي بست بديل, سيما فور يو, موقع افلام عربي, افلام جديدة, مسلسلات 2025"
            />

            <Navbar />
            <HeroCarousel items={popularMovies.slice(0, 10)} type="movie" />
            <div className="container mx-auto px-4 py-8 space-y-12">
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
