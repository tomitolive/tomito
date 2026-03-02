import { useState, useEffect } from "react";

export interface ExternalServer {
    name: string;
    url: string;
}

export interface ExternalDownloadLink {
    host: string;
    quality: string;
    url: string;
}

export interface ExternalMovie {
    id: string;
    title: string;
    year: string;
    watch_servers: ExternalServer[];
    download_links: ExternalDownloadLink[];
    description?: string;
    poster?: string | null;
}

interface ExternalIndexEntry {
    id: string;
    title: string;
    year: string;
    chunk_file: string;
}

const INDEX_URL = "https://raw.githubusercontent.com/TAYVR/22a7b977d937d38ee56bde36392be131/main/movies_data/index.json";
const CHUNK_BASE_URL = "https://raw.githubusercontent.com/TAYVR/22a7b977d937d38ee56bde36392be131/main/movies_data/chunks/";

// Module-level cache
let cachedIndex: ExternalIndexEntry[] | null = null;
let fetchIndexPromise: Promise<ExternalIndexEntry[]> | null = null;

async function loadExternalIndex(): Promise<ExternalIndexEntry[]> {
    if (cachedIndex) return cachedIndex;
    if (fetchIndexPromise) return fetchIndexPromise;

    fetchIndexPromise = fetch(INDEX_URL)
        .then((res) => res.json())
        .then((data) => {
            cachedIndex = data;
            return data;
        })
        .catch((err) => {
            console.error("Failed to load external movie index:", err);
            fetchIndexPromise = null;
            return [];
        });

    return fetchIndexPromise;
}

function normalize(str: string): string {
    return str
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // Arabic diacritics + tatweel
        .replace(/[^\w\s\u0621-\u064A]/gi, "") // Keep alphanumeric and Arabic characters
        .replace(/\s+/g, " ")
        .trim();
}

function titlesMatch(title1: string, title2: string): boolean {
    const n1 = normalize(title1);
    const n2 = normalize(title2);

    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Word-by-word match (at least 70%)
    const words1 = n1.split(" ").filter(w => w.length > 2);
    const words2 = n2.split(" ").filter(w => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return false;

    const matches = words1.filter(w => words2.includes(w)).length;
    return matches / Math.max(words1.length, words2.length) >= 0.7;
}

export function useExternalMovieData(title: string | undefined, year: string | undefined, arTitle?: string) {
    const [externalMovie, setExternalMovie] = useState<ExternalMovie | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!title || !year) return;

        let cancelled = false;
        setIsLoading(true);

        const fetchData = async () => {
            const index = await loadExternalIndex();
            if (cancelled) return;

            // Find match in index
            const matchIndex = index.find(item =>
                (titlesMatch(item.title, title) || (arTitle && titlesMatch(item.title, arTitle))) &&
                (item.year === year || Math.abs(parseInt(item.year) - parseInt(year)) <= 1)
            );

            if (matchIndex) {
                try {
                    const chunkRes = await fetch(`${CHUNK_BASE_URL}${matchIndex.chunk_file}`);
                    const chunkData: ExternalMovie[] = await chunkRes.json();
                    if (cancelled) return;

                    // Find actual movie in chunk
                    const movie = chunkData.find(m =>
                        (titlesMatch(m.title, title) || (arTitle && titlesMatch(m.title, arTitle))) &&
                        (m.year === year || Math.abs(parseInt(m.year) - parseInt(year)) <= 1)
                    );

                    if (movie) {
                        setExternalMovie(movie);
                    }
                } catch (err) {
                    console.error("Error loading chunk:", err);
                }
            }
            setIsLoading(false);
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [title, year, arTitle]);

    return { externalMovie, isLoading };
}
