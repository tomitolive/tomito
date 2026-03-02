export interface WatchServer {
    name: string;
    url: string;
}

export interface Episode {
    id: string;
    title: string;
    episode_number: number | null;
    poster: string;
    description: string;
    watch_servers: WatchServer[];
    download_links: { name: string; url: string }[];
}

export interface SeriesItem {
    id: string;
    title: string;
    clean_title: string;
    poster: string;
    description: string;
    year: string;
    type: "series";
    episodes: Episode[];
    media_type?: "tv"; // Added for compatibility with SearchPage
}

let ramadanData: SeriesItem[] | null = null;

export async function getRamadanData(): Promise<SeriesItem[]> {
    if (ramadanData) return ramadanData;
    try {
        const response = await fetch("/ramadan_2026_results.json");
        ramadanData = await response.json();
        return ramadanData || [];
    } catch (error) {
        console.error("Failed to load ramadan data:", error);
        return [];
    }
}

export async function searchRamadan(query: string): Promise<SeriesItem[]> {
    const data = await getRamadanData();
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return data.filter(item =>
        (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
        (item.clean_title && item.clean_title.toLowerCase().includes(lowerQuery)) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
    ).map(item => ({
        ...item,
        poster_path: item.poster,
        media_type: "tv" as const, // Treat as TV shows for the SearchPage UI
        isRamadan: true
    }));
}
