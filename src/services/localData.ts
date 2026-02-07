export interface Movie {
    id: number;
    type: 'movie' | 'tv';
    title_en: string;
    title_ar: string;
    overview_en: string;
    overview_ar: string;
    poster: string;
    rating: number;
    date: string;
    popularity: number;
}

let cachedMovies: Movie[] | null = null;

/**
 * Fetches all movies from the local JSON file and caches them in memory.
 */
export async function getAllMovies(): Promise<Movie[]> {
    if (cachedMovies) return cachedMovies;

    try {
        const response = await fetch('/movies_data.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch movies: ${response.statusText}`);
        }
        cachedMovies = await response.json();
        return cachedMovies || [];
    } catch (error) {
        console.error('Error loading movies data:', error);
        return [];
    }
}

/**
 * Gets a movie or TV show by its ID.
 */
export async function getMovieById(id: string | number): Promise<Movie | undefined> {
    const movies = await getAllMovies();
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return movies.find(m => m.id === numericId);
}

/**
 * Searches for movies by title (English or Arabic).
 */
export async function searchMovies(query: string): Promise<Movie[]> {
    const movies = await getAllMovies();
    const lowerQuery = query.toLowerCase();

    return movies.filter(m =>
        m.title_en.toLowerCase().includes(lowerQuery) ||
        m.title_ar.includes(query)
    );
}

/**
 * Filters movies by type ('movie' or 'tv').
 */
export async function getMoviesByType(type: 'movie' | 'tv'): Promise<Movie[]> {
    const movies = await getAllMovies();
    return movies.filter(m => m.type === type);
}

/**
 * Gets the top rated movies/shows.
 */
export async function getTopRated(limit = 10): Promise<Movie[]> {
    const movies = await getAllMovies();
    return [...movies]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

/**
 * Gets the most popular movies/shows.
 */
export async function getPopular(limit = 20): Promise<Movie[]> {
    const movies = await getAllMovies();
    return [...movies]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, limit);
}
