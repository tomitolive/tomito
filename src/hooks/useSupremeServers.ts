import { useState, useEffect } from "react";

export interface SupremeServer {
    name: string;
    url: string;
    quality: string;
}

interface SupremeEntry {
    title: string;
    original_url: string;
    servers?: { name: string; url: string; quality?: string }[];
    watch_servers?: { name: string; url: string }[];
}

// Module-level cache so we only fetch once
let cachedData: SupremeEntry[] | null = null;
let fetchPromise: Promise<SupremeEntry[]> | null = null;

async function loadSupremeData(): Promise<SupremeEntry[]> {
    if (cachedData) return cachedData;
    if (fetchPromise) return fetchPromise;

    fetchPromise = Promise.all([
        fetch("/supreme_results.json").then((res) => res.json()),
        fetch("/ramadan_2026_results.json").then((res) => res.json()).catch(() => []), // Gracefully handle if missing
    ])
        .then(([supremeData, ramadanData]: [SupremeEntry[], any[]]) => {
            // Flatten nested Ramadan data: episodes become individual entries for matching
            const flattenedRamadan: SupremeEntry[] = [];

            ramadanData.forEach((series: any) => {
                if (series.episodes && Array.isArray(series.episodes)) {
                    series.episodes.forEach((ep: any) => {
                        flattenedRamadan.push({
                            title: ep.title,
                            original_url: "", // Not used in this context
                            servers: (ep.watch_servers || []).map((s: any) => ({
                                ...s,
                                quality: s.quality || "HD",
                            })),
                        });
                    });
                }
            });

            const combined = [...supremeData, ...flattenedRamadan];
            cachedData = combined;
            return combined;
        })
        .catch((err) => {
            console.error("Failed to load supreme data:", err);
            fetchPromise = null;
            return [];
        });

    return fetchPromise;
}

/**
 * Normalize a string for fuzzy matching:
 * - lowercase
 * - remove diacritics / tatweel
 * - collapse spaces
 */
function normalize(str: string): string {
    return str
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // Arabic diacritics + tatweel
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Extract episode number from a JSON title like:
 * "مشاهدة مسلسل Being Gordon Ramsay الموسم الاول الحلقة 1 مترجمة8.1"
 */
function extractEpisodeNumber(title: string): number | null {
    // Match "الحلقة <number>" or "الحلقه <number>"
    const match = title.match(/الحلق[ةه]\s+(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if a JSON title contains the given series name (fuzzy).
 */
function titleContainsSeriesName(jsonTitle: string, seriesName: string): boolean {
    const normTitle = normalize(jsonTitle);
    const normSeries = normalize(seriesName);
    // Try exact substring match first
    if (normTitle.includes(normSeries)) return true;
    // Try word-by-word: at least 60% of series words present in title
    const seriesWords = normSeries.split(" ").filter((w) => w.length > 2);
    if (seriesWords.length === 0) return false;
    const matchCount = seriesWords.filter((w) => normTitle.includes(w)).length;
    return matchCount / seriesWords.length >= 0.6;
}

/**
 * Check if a JSON title matches a movie title (fuzzy, no episode keyword).
 */
function titleMatchesMovie(jsonTitle: string, movieTitle: string): boolean {
    // Must NOT be an episode
    if (/الحلق[ةه]/.test(jsonTitle)) return false;
    const normTitle = normalize(jsonTitle);
    const normMovie = normalize(movieTitle);
    if (normTitle.includes(normMovie)) return true;
    const movieWords = normMovie.split(" ").filter((w) => w.length > 2);
    if (movieWords.length === 0) return false;
    const matchCount = movieWords.filter((w) => normTitle.includes(w)).length;
    return matchCount / movieWords.length >= 0.6;
}

interface UseSupremeServersOptions {
    movieTitle?: string;
    movieTitleAr?: string;
    seriesName?: string;
    seriesNameAr?: string;
    episodeNumber?: number;
}

export function useSupremeServers({
    movieTitle,
    movieTitleAr,
    seriesName,
    seriesNameAr,
    episodeNumber,
}: UseSupremeServersOptions): SupremeServer[] {
    const [servers, setServers] = useState<SupremeServer[]>([]);

    useEffect(() => {
        let cancelled = false;

        loadSupremeData().then((data) => {
            if (cancelled) return;

            let matchedServers: SupremeServer[] = [];

            if (movieTitle) {
                // Movie mode: find first entry matching the movie title
                const entry = data.find((e) =>
                    titleMatchesMovie(e.title, movieTitle) ||
                    (movieTitleAr && titleMatchesMovie(e.title, movieTitleAr))
                );
                if (entry) {
                    matchedServers = (entry.servers || [])
                        .filter((s) => s.name !== "EXTERNAL_LINK")
                        .map((s) => ({
                            name: s.name,
                            url: s.url,
                            quality: s.quality || "HD",
                        }));
                }
            } else if (seriesName && episodeNumber !== undefined) {
                // TV mode: find entry matching series name + episode number
                const entry = data.find((e) => {
                    const epNum = extractEpisodeNumber(e.title);
                    return (
                        epNum === episodeNumber &&
                        (titleContainsSeriesName(e.title, seriesName) ||
                            (seriesNameAr && titleContainsSeriesName(e.title, seriesNameAr)))
                    );
                });
                if (entry) {
                    matchedServers = (entry.servers || [])
                        .filter((s) => s.name !== "EXTERNAL_LINK")
                        .map((s) => ({
                            name: s.name,
                            url: s.url,
                            quality: s.quality || "HD",
                        }));
                }
            }

            setServers(matchedServers);
        });

        return () => {
            cancelled = true;
        };
    }, [movieTitle, movieTitleAr, seriesName, seriesNameAr, episodeNumber]);

    return servers;
}
