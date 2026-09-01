import { supabase } from './supabase';

/**
 * 1. Method to check if a movie exists in your Supabase database table
 * @param tmdbId - TMDB Movie ID (or primary key)
 * @param tableName - Name of your table (default: 'movies')
 */
export async function isMovieInDatabase(
    tmdbId: number | string,
    tableName: string = 'movies'
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .or(`tmdb_id.eq.${tmdbId},id.eq.${tmdbId}`)
            .limit(1);

        if (error) {
            console.error(`[Supabase Error] checking ${tableName}:`, error.message);
            return false;
        }

        return Array.isArray(data) && data.length > 0;
    } catch (err) {
        console.error('[Supabase Exception]:', err);
        return false;
    }
}

/**
 * Fetches movie record from Supabase database by TMDB ID.
 * @param tmdbId - TMDB Movie ID
 * @param tableName - Name of table (default: 'movies')
 */
export async function getMovieByTmdbId(
    tmdbId: number | string,
    tableName: string = 'movies'
): Promise<any | null> {
    try {
        console.log(`%c[Supabase Table Test] Querying table "${tableName}" for TMDB ID ${tmdbId}`, "color: #00ff00; font-size: 14px; font-weight: bold;");

        // Fetch sample rows to print structure clearly in console
        const { data: sampleRows, error: sampleErr } = await supabase.from(tableName).select('*').limit(3);
        if (sampleErr) {
            console.error(`❌ [Supabase Table Test Error]:`, sampleErr.message);
        } else if (sampleRows && sampleRows.length > 0) {
            console.log(`🔥 [Supabase Table Data Structure] Columns:`, Object.keys(sampleRows[0]));
            console.table(sampleRows);
        } else {
            console.log(`⚠️ [Supabase Table Data Structure] Table "${tableName}" exists but is empty (0 rows).`);
        }

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .or(`tmdb_id.eq.${tmdbId},id.eq.${tmdbId}`);

        if (error) {
            console.error(`[Supabase Error] fetching movie from ${tableName}:`, error.message);
            return null;
        }

        if (data && data.length > 0) {
            console.log(`✅ [Supabase Match Found for ${tmdbId}]:`, data[0]);
            return data[0];
        } else {
            console.log(`ℹ️ [Supabase No Match] No movie found matching TMDB ID ${tmdbId}`);
            return null;
        }
    } catch (err) {
        console.error('[Supabase Exception] fetching movie:', err);
        return null;
    }
}

/**
 * Fetches TV show or episode record from Supabase database by TMDB ID, season, and episode.
 * Tables checked: 'tv_shows', 'episodes', 'tv', or custom tableName.
 */
export async function getTVEpisodeByDetails(
    tmdbId: number | string,
    seasonNumber?: number,
    episodeNumber?: number,
    tableName: string = 'episodes'
): Promise<any | null> {
    try {
        console.log(`[Supabase Query] Searching ${tableName} for tmdb_id/tv_id: ${tmdbId}, S:${seasonNumber}, E:${episodeNumber}`);

        let query = supabase.from(tableName).select('*').or(`tmdb_id.eq.${tmdbId},tv_id.eq.${tmdbId},show_id.eq.${tmdbId}`);

        if (seasonNumber !== undefined) {
            query = query.eq('season_number', seasonNumber);
        }
        if (episodeNumber !== undefined) {
            query = query.eq('episode_number', episodeNumber);
        }

        const { data, error } = await query;

        if (error) {
            // Silently log or ignore if table doesn't exist
            if (!error.message.includes('Could not find')) {
                console.error(`[Supabase Error] fetching TV from ${tableName}:`, error.message);
            }
            return null;
        }

        console.log(`[Supabase Result] Found ${data?.length || 0} rows for TV ${tmdbId}:`, data);
        return data && data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error('[Supabase Exception] fetching TV episode:', err);
        return null;
    }
}



/**
 * 2. Method to fetch the first movie and print its exact column structure
 * @param tableName - Name of your table (default: 'movies')
 */
export async function checkFirstMovieStructure(tableName: string = 'movies') {
    console.log(`🔍 Fetching first record from table "${tableName}"...`);

    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            console.error(`❌ Error reading table "${tableName}":`, error.message);
            return null;
        }

        if (!data || data.length === 0) {
            console.log(`⚠️ Table "${tableName}" is empty or no records returned.`);
            return null;
        }

        const firstMovie = data[0];
        console.log(`✅ Connection Successful!`);
        console.log(`📋 First Movie Record Data:`, firstMovie);
        console.log(`🧱 Columns structure:`, Object.keys(firstMovie));

        return firstMovie;
    } catch (err) {
        console.error('❌ Exception during connection test:', err);
        return null;
    }
}
