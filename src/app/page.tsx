"use client";

import { useEffect, useState } from "react";
import { ContentRow } from "../components/ContentRow";
import { HeroCarousel } from "../components/HeroCarousel";
import { ProductionCompaniesBar } from "../components/ProductionCompaniesBar";
import { PageLoader } from "../components/PageLoader";
import { fetchPopular, fetchTrending, fetchNowPlaying, fetchOnTheAir, fetchTopRated, t } from "../lib/tmdb";

export default function Home() {
    const [popularMovies, setPopularMovies] = useState<any[]>([]);
    const [ लोकप्रियTV, setPopularTV] = useState<any[]>([]); // Keep variable names as they were just in case
    const [popularTVData, setpopularTVData] = useState<any[]>([])
    const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
    const [latestMovies, setLatestMovies] = useState<any[]>([]);
    const [latestSeries, setLatestSeries] = useState<any[]>([]);
    const [topRated, setTopRated] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    moviesData,
                    tvData,
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

                setPopularMovies(moviesData.results);
                setpopularTVData(tvData.results);
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

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-12">
            {/* The wrapper bg/text classes, navbar, and footer are in layout.tsx */}
            <HeroCarousel items={popularTVData.slice(0, 10)} type="tv" />
            <div className="container mx-auto px-4 py-8 space-y-12">
                
                <ContentRow title={t("trendingMovies")} items={trendingMovies} type="movie" />
                
                <ProductionCompaniesBar />

                <ContentRow title={t("latestMovies")} items={latestMovies} type="movie" />
                <ContentRow title={t("latestSeries")} items={latestSeries} type="tv" />

                <ContentRow title={t("popularMovies")} items={popularMovies} type="movie" />
                <ContentRow title={t("popularTV")} items={popularTVData} type="tv" />

                <ContentRow title={t("criticsChoice")} items={topRated} type="movie" />
            </div>
        </div>
    );
}
