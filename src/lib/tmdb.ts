// TMDB API Configuration
export const TMDB_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || "882e741f7283dc9ba1654d4692ec30f6",
  BASE_URL: import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3",
  IMG_URL: import.meta.env.VITE_TMDB_IMG_URL || "https://image.tmdb.org/t/p",
  // Default language settings
  DEFAULT_LANGUAGE: "ar",
  SUPPORTED_LANGUAGES: [
    { code: "ar", name: "العربية" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
  ],
} as const;

// Language management
export type Language = "ar" | "en" | "fr" | "es";

export interface LanguageConfig {
  current: Language;
}

// Global language state
let currentLanguage: Language = TMDB_CONFIG.DEFAULT_LANGUAGE as Language;

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLanguage', lang);
    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}

export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('preferredLanguage') as Language;
    if (savedLang && ['ar', 'en', 'fr', 'es'].includes(savedLang)) {
      currentLanguage = savedLang;
    }
  }
  return currentLanguage;
}

// Initialize language from localStorage
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('preferredLanguage') as Language;
  if (savedLang && ['ar', 'en', 'fr', 'es'].includes(savedLang)) {
    currentLanguage = savedLang;
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }
}

// Image URL functions
export const getImageUrl = (path: string | null, size: "w500" | "w780" | "w1280" | "original" = "w500") => {
  if (!path) return "/placeholder.svg";
  return `${TMDB_CONFIG.IMG_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null) => {
  if (!path) return null;
  return `${TMDB_CONFIG.IMG_URL}/original${path}`;
};

// Types
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  popularity: number;
  // حقول اللغة الإضافية
  ar_title?: string;
  en_title?: string;
  ar_overview?: string;
  en_overview?: string;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  // حقول اللغة الإضافية
  ar_name?: string;
  en_name?: string;
  ar_overview?: string;
  en_overview?: string;
}

export interface Genre {
  id: number;
  name: string;
  ar_name?: string;
  en_name?: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  ar_name?: string;
  en_name?: string;
  ar_character?: string;
  en_character?: string;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
  ar_name?: string;
  en_name?: string;
  ar_overview?: string;
  en_overview?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number;
  ar_name?: string;
  en_name?: string;
  ar_overview?: string;
  en_overview?: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  budget: number;
  revenue: number;
  imdb_id: string;
  ar_tagline?: string;
  en_tagline?: string;
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  seasons: Season[];
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string;
}

// Helper functions for multilingual content
// Helper functions for multilingual content
export function getMovieTitle(movie: Movie): string {
  // Always return English/Original title as requested
  return movie.en_title || movie.title || movie.original_title;
}

export function getMovieOverview(movie: Movie): string {
  // Use the available localized overview or default to the main overview
  const lang = getCurrentLanguage();
  if (lang === 'ar' && movie.ar_overview) return movie.ar_overview;
  return movie.overview;
}

export function getTVShowName(tvShow: TVShow): string {
  // Always return English/Original name as requested
  return tvShow.en_name || tvShow.name || tvShow.original_name;
}

export function getTVShowOverview(tvShow: TVShow): string {
  // Use the available localized overview or default to the main overview
  const lang = getCurrentLanguage();
  if (lang === 'ar' && tvShow.ar_overview) return tvShow.ar_overview;
  return tvShow.overview;
}

export function getGenreName(genre: Genre): string {
  const lang = getCurrentLanguage();
  if (lang === 'ar' && genre.ar_name) return genre.ar_name;
  if (lang === 'en' && genre.en_name) return genre.en_name;
  return genre.name;
}

// Internal helper to merge English titles with Localized content
async function fetchAndMergeLocale(url: string, page?: number) {
  const lang = getCurrentLanguage();
  const baseUrl = url.includes('?') ? url : `${url}?api_key=${TMDB_CONFIG.API_KEY}`;
  const pageParam = page ? `&page=${page}` : '';

  if (lang === 'en') {
    const response = await fetch(`${baseUrl}&language=en${pageParam}`);
    const data = await response.json();
    if (data.results) {
      data.results = data.results.map((item: any) => ({
        ...item,
        en_title: item.title || item.name,
        en_name: item.title || item.name,
      }));
    }
    return data;
  }

  const [localeResponse, enResponse] = await Promise.all([
    fetch(`${baseUrl}&language=${lang}${pageParam}`),
    fetch(`${baseUrl}&language=en${pageParam}`)
  ]);

  const [localeData, enData] = await Promise.all([localeResponse.json(), enResponse.json()]);

  if (!enData.results) return enData;

  const mergedResults = enData.results.map((item: any, index: number) => {
    const localeItem = localeData.results?.find((l: any) => l.id === item.id) || localeData.results?.[index];
    return {
      ...item,
      overview: localeItem?.overview || item.overview,
      ...(lang === 'ar' ? { ar_overview: localeItem?.overview } : {}),
      en_title: item.title || item.name,
      en_name: item.title || item.name,
      title: item.title || item.name,
      name: item.title || item.name
    };
  });

  return { ...enData, results: mergedResults };
}

export async function fetchTrending(mediaType: "movie" | "tv" = "movie", timeWindow: "day" | "week" = "week") {
  const url = `${TMDB_CONFIG.BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_CONFIG.API_KEY}`;
  const data = await fetchAndMergeLocale(url);
  return data.results as (Movie | TVShow)[];
}

export async function fetchPopular(mediaType: "movie" | "tv" = "movie", page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/${mediaType}/popular?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchTopRated(mediaType: "movie" | "tv" = "movie", page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/${mediaType}/top_rated?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchByGenre(mediaType: "movie" | "tv", genreId: number, page = 1) {
  const isAll = isNaN(genreId);
  const genreParam = isAll ? "" : `&with_genres=${genreId}`;

  const [arResponse, enResponse] = await Promise.all([
    fetch(`${TMDB_CONFIG.BASE_URL}/discover/${mediaType}?api_key=${TMDB_CONFIG.API_KEY}&language=ar${genreParam}&page=${page}`),
    fetch(`${TMDB_CONFIG.BASE_URL}/discover/${mediaType}?api_key=${TMDB_CONFIG.API_KEY}&language=en${genreParam}&page=${page}`)
  ]);

  const [arData, enData] = await Promise.all([arResponse.json(), enResponse.json()]);

  const mergedResults = enData.results.map((item: any, index: number) => {
    const arItem = arData.results[index];
    return {
      ...item,
      overview: arItem?.overview || item.overview,
      ar_overview: arItem?.overview,
      en_title: item.title || item.name,
      en_name: item.title || item.name,
      title: item.title || item.name,
      name: item.title || item.name
    };
  });

  return {
    results: mergedResults as (Movie | TVShow)[],
    total_pages: enData.total_pages,
    page: enData.page
  };
}

export async function fetchGenres(mediaType: "movie" | "tv" = "movie") {
  const lang = getCurrentLanguage();
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`
  );
  const data = await response.json();
  return data.genres as Genre[];
}

export async function fetchMovieDetails(id: number): Promise<MovieDetails> {
  const lang = getCurrentLanguage();

  if (lang === 'en') {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=en`);
    const data = await response.json();
    return { ...data, en_title: data.title, en_overview: data.overview } as MovieDetails;
  }

  const [localeData, englishData] = await Promise.all([
    fetch(`${TMDB_CONFIG.BASE_URL}/movie/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`),
    fetch(`${TMDB_CONFIG.BASE_URL}/movie/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=en`)
  ]);

  const [localeResult, englishResult] = await Promise.all([
    localeData.json(),
    englishData.json()
  ]);

  return {
    ...englishResult,
    overview: localeResult.overview || englishResult.overview,
    title: englishResult.title, // Force English title
    ...(lang === 'ar' ? {
      ar_title: localeResult.title,
      ar_overview: localeResult.overview,
      ar_tagline: localeResult.tagline,
    } : {}),
    en_title: englishResult.title,
    en_overview: englishResult.overview,
    en_tagline: englishResult.tagline,
  } as MovieDetails;
}

export async function fetchTVDetails(id: number): Promise<TVShowDetails> {
  const lang = getCurrentLanguage();

  if (lang === 'en') {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=en`);
    const data = await response.json();
    return { ...data, en_name: data.name, en_overview: data.overview } as TVShowDetails;
  }

  const [localeData, englishData] = await Promise.all([
    fetch(`${TMDB_CONFIG.BASE_URL}/tv/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`),
    fetch(`${TMDB_CONFIG.BASE_URL}/tv/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=en`)
  ]);

  const [localeResult, englishResult] = await Promise.all([
    localeData.json(),
    englishData.json()
  ]);

  return {
    ...englishResult,
    overview: localeResult.overview || englishResult.overview,
    name: englishResult.name, // Force English name
    ...(lang === 'ar' ? {
      ar_name: localeResult.name,
      ar_overview: localeResult.overview,
    } : {}),
    en_name: englishResult.name,
    en_overview: englishResult.overview,
    seasons: englishResult.seasons?.map((season: Season) => {
      const localeSeason = localeResult.seasons?.find((s: Season) => s.season_number === season.season_number);
      return {
        ...season,
        overview: localeSeason?.overview || season.overview,
      };
    }) || [],
  } as TVShowDetails;
}

export async function fetchCredits(mediaType: "movie" | "tv", id: number) {
  const lang = getCurrentLanguage();
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/${mediaType}/${id}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`
  );
  const data = await response.json();
  return data.cast as Cast[];
}

export async function fetchSeasonDetails(tvId: number, seasonNumber: number) {
  const [arResponse, enResponse] = await Promise.all([
    fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_CONFIG.API_KEY}&language=ar`),
    fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_CONFIG.API_KEY}&language=en`)
  ]);

  const [arData, enData] = await Promise.all([arResponse.json(), enResponse.json()]);

  const mergedEpisodes = enData.episodes?.map((episode: Episode, index: number) => {
    const arEpisode = arData.episodes?.find((e: Episode) => e.episode_number === episode.episode_number) || arData.episodes?.[index];
    return {
      ...episode,
      overview: arEpisode?.overview || episode.overview,
      ar_name: arEpisode?.name,
      ar_overview: arEpisode?.overview,
      en_name: episode.name,
      en_overview: episode.overview,
      name: episode.name, // Force English name
    };
  });

  return {
    episodes: mergedEpisodes as Episode[],
    name: enData.name, // English Season Name
    overview: arData.overview || enData.overview, // Arabic Overview
    poster_path: enData.poster_path, // English Poster
  };
}

export async function searchMulti(query: string, page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchVideos(id: number, type: "movie" | "tv") {
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/${type}/${id}/videos?api_key=${TMDB_CONFIG.API_KEY}`
  );
  const data = await response.json();
  return data.results || [];
}

export async function fetchPersonDetails(id: number) {
  const lang = getCurrentLanguage();
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/person/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`
  );
  return response.json();
}

export async function fetchPersonCredits(id: number) {
  const lang = getCurrentLanguage();
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/person/${id}/combined_credits?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`
  );
  const data = await response.json();
  return data.cast;
}

export async function fetchSimilar(mediaType: "movie" | "tv", id: number) {
  const url = `${TMDB_CONFIG.BASE_URL}/${mediaType}/${id}/similar?api_key=${TMDB_CONFIG.API_KEY}`;
  const data = await fetchAndMergeLocale(url);
  return data.results as (Movie | TVShow)[];
}

export async function fetchNowPlaying(page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/now_playing?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchAiringToday(page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/tv/airing_today?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchUpcoming(page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/upcoming?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchOnTheAir(page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/tv/on_the_air?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchRecommendations(mediaType: "movie" | "tv", id: number, page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/${mediaType}/${id}/recommendations?api_key=${TMDB_CONFIG.API_KEY}`;
  return fetchAndMergeLocale(url, page);
}

// Video servers configuration
export interface VideoServer {
  id: string;
  name: string;
  en_name?: string;
  fr_name?: string;
  es_name?: string;
  movieUrl?: string; // For movie servers
  tvUrl?: string;    // For movie servers if they support both
  baseUrl?: string;  // For TV servers
  quality: string;
  icon: string;
  color?: string;
  description?: string;
  useIdType?: 'tmdb' | 'imdb';
  subtitles?: string;
  vip?: boolean;
  format?: string;
  supportsSeasons?: boolean;
  allowSubtitlesParam?: boolean;
  allowTmdb?: boolean;
  allowSeasonEpisode?: boolean;
  useTmdbParam?: boolean;
  supportsParams?: boolean;
  supportsImdbParam?: boolean;
  supportsTmdbParam?: boolean;
  supportsSubLang?: boolean;
  supportsAutoPlay?: boolean;
  domains?: string[];
  note_ar?: string;
  note_en?: string;
  note_fr?: string;
  note_es?: string;
}

export const MOVIE_SERVERS: VideoServer[] = [
  {
    id: 'server_3',
    name: 'سيرفر الرئيسي',
    movieUrl: 'https://vidsrc-embed.ru/embed/movie/',
    tvUrl: 'https://vidsrc-embed.ru/embed/tv/',
    quality: 'FHD',
    icon: 'rocket',
    color: '#e74c3c',
    description: 'سيرفر احتياطي سريع',
    useIdType: 'tmdb',
    subtitles: 'ar'
  },
  {
    id: 'server_1',
    name: 'VIP',
    movieUrl: 'https://multiembed.mov/directstream.php?video_id=',
    tvUrl: 'https://multiembed.mov/directstream.php?video_id=',
    quality: 'VIP HD',
    icon: 'crown',
    color: '#9b59b6',
    description: 'سيرفر VIP سريع مع جودة متعددة وترجمة',
    useIdType: 'imdb',
    subtitles: 'ar',
    vip: true,
    allowSubtitlesParam: true,
    allowTmdb: true,
    allowSeasonEpisode: true
  },
  {
    id: 'server_2',
    name: 'سيرفر 3',
    movieUrl: 'https://multiembed.mov/directstream.php?video_id=',
    tvUrl: 'https://multiembed.mov/directstream.php?video_id=',
    quality: 'HD+',
    icon: 'film',
    description: 'سيرفر احتياطي مع ترجمة',
    color: '#1abc9c',
    useIdType: 'tmdb',
    useTmdbParam: true,
    subtitles: 'ar'
  },
  {
    id: 'server_4',
    name: 'سيرفر 4',
    movieUrl: 'https://www.nontongo.win/embed/movie/',
    tvUrl: 'https://www.nontongo.win/embed/tv/',
    quality: 'HD',
    icon: 'tv',
    color: '#c0392b',
    description: 'سيرفر احتياطي عربي',
    useIdType: 'tmdb',
    subtitles: 'ar'
  },
  {
    id: 'server_5',
    name: 'سيرفر 5',
    movieUrl: 'https://vidsrc.me/embed/movie/',
    tvUrl: 'https://vidsrc.me/embed/tv/',
    quality: 'HD',
    icon: 'star',
    color: '#16a085',
    description: 'سيرفر احتياطي بديل',
    useIdType: 'tmdb',
    subtitles: 'ar'
  },
  {
    id: 'server_6',
    name: 'سيرفر 6',
    movieUrl: 'https://moviesapi.club/movie/',
    tvUrl: 'https://moviesapi.club/tv/',
    quality: 'HD+',
    icon: 'database',
    color: '#e67e22',
    description: 'سيرفر احتياطي كبير',
    useIdType: 'tmdb',
    subtitles: 'ar'
  },
  {
    id: 'server_7',
    name: 'سيرفر 7',
    movieUrl: 'https://www.2embed.cc/embed/',
    tvUrl: 'https://www.2embed.cc/embedtv/',
    quality: 'HD',
    icon: 'sync',
    color: '#27ae60',
    description: 'سيرفر احتياطي موثوق',
    useIdType: 'tmdb',
    subtitles: 'ar'
  },
  {
    id: 'server_8',
    name: 'سيرفر 8',
    movieUrl: 'https://vidsrc.to/embed/movie/',
    tvUrl: 'https://vidsrc.to/embed/tv/',
    quality: 'HD',
    icon: 'video',
    color: '#3498db',
    description: 'سيرفر احتياطي عالي',
    useIdType: 'tmdb',
    subtitles: 'ar'
  },
  {
    id: 'server_9',
    name: 'جديد',
    movieUrl: 'https://vidsrc-embed.ru/embed/movie',
    tvUrl: 'https://vidsrc-embed.ru/embed/tv',
    quality: 'FHD',
    icon: 'globe',
    color: '#8e44ad',
    description: 'سيرفر جديد يدعم معلمات متقدمة',
    useIdType: 'tmdb',
    subtitles: 'ar',
    supportsParams: true,
    supportsImdbParam: true,
    supportsTmdbParam: true,
    supportsSubLang: true,
    supportsAutoPlay: true
  }
];

export const TV_SERVERS: VideoServer[] = [
  {
    id: 'vidsrc_embed',
    name: '🎬 سيرفر',
    baseUrl: 'https://vidsrc-embed.ru/embed/tv',
    quality: 'HD',
    icon: 'film',
    color: '#e74c3c',
    supportsSeasons: true,
    format: '{id}/{season}/{episode}'
  },
  {
    id: 'hnembed',
    name: '🎥 سيرفر 2',
    baseUrl: 'https://hnembed.cc/embed/tv',
    quality: 'HD',
    icon: 'video',
    color: '#3498db',
    supportsSeasons: true,
    format: '{id}/{season}/{episode}'
  },
  {
    id: 'autoembed',
    name: '🔄 سيرفر 3',
    baseUrl: 'https://player.autoembed.cc/embed/tv',
    quality: 'HD',
    icon: 'sync',
    color: '#8e44ad',
    supportsSeasons: true,
    format: '{id}/{season}/{episode}'
  },
  {
    id: '2embed',
    name: '🎞️ سيرفر 4',
    baseUrl: 'https://www.2embed.cc/embedtv',
    quality: 'HD',
    icon: 'play-circle',
    color: '#27ae60',
    supportsSeasons: true,
    format: '{id}/{season}/{episode}'
  },
  {
    id: 'vidsrc_to',
    name: '🌟 سيرفر 5',
    baseUrl: 'https://vidsrc.to/embed/tv',
    quality: 'HD',
    icon: 'star',
    color: '#16a085',
    supportsSeasons: true,
    format: '{id}/{season}/{episode}'
  },
  {
    id: 'vidsrc_me',
    name: '🎯 سيرفر 6',
    baseUrl: 'https://vidsrc.me/embed/tv',
    quality: 'HD',
    icon: 'tv',
    color: '#e67e22',
    supportsSeasons: true,
    format: '{id}/{season}/{episode}'
  }
];

// Get server name based on current language
export function getServerName(server: VideoServer): string {
  const lang = getCurrentLanguage();
  if (lang === 'ar') return server.name;
  if (lang === 'en' && server.en_name) return server.en_name;
  if (lang === 'fr' && server.fr_name) return server.fr_name;
  if (lang === 'es' && server.es_name) return server.es_name;
  return server.name;
}

// Combine all servers for general use
export const ALL_SERVERS = [...MOVIE_SERVERS, ...TV_SERVERS];

// Get server note based on current language
export function getServerNote(server: VideoServer): string {
  const lang = getCurrentLanguage();
  if (lang === 'ar' && (server.note_ar || server.description)) return server.note_ar || server.description || '';
  if (lang === 'en' && server.note_en) return server.note_en;
  if (lang === 'fr' && server.note_fr) return server.note_fr;
  if (lang === 'es' && server.note_es) return server.note_es;
  return server.description || '';
}

// Get video URL with proper parameters
export function getVideoUrl(
  server: VideoServer,
  id: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
  imdbId?: string,
  options?: {
    autoplay?: boolean;
    autonext?: boolean;
    subtitleLang?: string;
    subtitleUrl?: string;
  }
): string {
  let baseUrl = '';
  const finalId = server.useIdType === 'imdb' ? (imdbId || id) : id;

  if (type === "movie") {
    baseUrl = server.movieUrl || "";

    // Handle specific server types and templates
    if (server.id === 'server_1' || server.id === 'server_2') {
      const url = `${baseUrl}${finalId}`;
      return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
    }

    if (server.id === 'server_9') {
      const params = new URLSearchParams();
      params.append('tmdb', id.toString());
      if (imdbId) params.append('imdb', imdbId);
      if (options?.subtitleLang) params.append('ds_lang', options.subtitleLang);
      params.append('autoplay', '1');
      return `${baseUrl}?${params.toString()}`;
    }

    // Default: append ID to URL
    let url = "";
    if (baseUrl.endsWith('/') || baseUrl.endsWith('=')) {
      url = `${baseUrl}${finalId}`;
    } else {
      url = `${baseUrl}/${finalId}`;
    }

    return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
  } else {
    // TV Show
    if (server.baseUrl && server.format) {
      // Use the format template for TV shows (mostly for TV_SERVERS list)
      let urlTemplate = server.format
        .replace('{id}', finalId.toString())
        .replace('{season}', (season || 1).toString())
        .replace('{episode}', (episode || 1).toString());

      const finalUrl = `${server.baseUrl}/${urlTemplate}`;
      return `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}autoplay=1`;
    }

    // Traditional style (for movie servers that also support TV)
    baseUrl = server.tvUrl || "";
    if (server.id === 'server_1' || server.id === 'server_2') {
      const url = `${baseUrl}${finalId}`;
      return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
    }

    // Standard TMDB parameter style
    const params = new URLSearchParams();
    params.append('tmdb', id.toString());
    if (season !== undefined) params.append('season', season.toString());
    if (episode !== undefined) params.append('episode', episode.toString());
    params.append('autoplay', '1');

    const hasQuery = baseUrl.includes('?');
    return `${baseUrl}${hasQuery ? '&' : '?'}${params.toString()}`;
  }
}

// Get alternative domain for a server (for fallback)
export function getAlternativeDomain(server: VideoServer): string | null {
  if (!server.domains || server.domains.length <= 1) return null;
  const currentDomain = new URL(server.movieUrl || server.baseUrl || "").hostname;
  const alternative = server.domains.find(domain => domain !== currentDomain);
  return alternative || null;
}

// Get server by ID
export function getServerById(id: string): VideoServer | undefined {
  return ALL_SERVERS.find(server => server.id === id);
}

// Get available domains for all servers
export function getAllDomains(): string[] {
  const domains: string[] = [];
  ALL_SERVERS.forEach(server => {
    if (server.domains) domains.push(...server.domains);
  });
  return [...new Set(domains)]; // Remove duplicates
}

// Check if a server is available
export async function checkServerAvailability(server: VideoServer): Promise<boolean> {
  try {
    // Try to ping the domain
    const domain = server.domains[0];
    const response = await fetch(`https://${domain}/favicon.ico`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.warn(`Server ${server.name} is not available`);
    return false;
  }
}

// Get best available server (with fallback logic)
export async function getBestAvailableServer(type: "movie" | "tv"): Promise<VideoServer> {
  const servers = type === 'movie' ? MOVIE_SERVERS : TV_SERVERS;
  // Try servers in order of preference
  for (const server of servers) {
    const isAvailable = await checkServerAvailability(server);
    if (isAvailable) {
      return server;
    }
  }

  // If all fail, return the first one as default
  return servers[0];
}

// Helper to get IMDB ID from TMDB API
export async function getImdbIdFromTmdb(id: number, type: "movie" | "tv"): Promise<string | null> {
  try {
    const lang = getCurrentLanguage();
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/${type}/${id}/external_ids?api_key=${TMDB_CONFIG.API_KEY}&language=${lang}`
    );
    const data = await response.json();
    return data.imdb_id || null;
  } catch (error) {
    console.error("Failed to fetch IMDB ID:", error);
    return null;
  }
}

// Utility functions for language direction
export function getTextDirection(): "rtl" | "ltr" {
  return getCurrentLanguage() === "ar" ? "rtl" : "ltr";
}

// Format numbers based on language
export function formatNumber(num: number): string {
  const lang = getCurrentLanguage();
  if (lang === 'ar') {
    // تنسيق الأرقام باللغة العربية
    return new Intl.NumberFormat('ar-EG').format(num);
  }
  return new Intl.NumberFormat('en-US').format(num);
}

// Format date based on language
export function formatDate(dateString: string): string {
  const lang = getCurrentLanguage();
  const date = new Date(dateString);

  if (lang === 'ar') {
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Constants for UI translations
export const UI_TRANSLATIONS = {
  ar: {
    home: "الرئيسية",
    trending: "الأكثر رواجاً",
    popular: "الأكثر شعبية",
    topRated: "الأعلى تقييماً",
    nowPlaying: "تعرض الآن",
    upcoming: "قريباً",
    seeAll: "عرض الكل",
    minutes: "دقيقة",
    seasons: "مواسم",
    episodes: "حلقات",
    cast: "طاقم التمثيل",
    similar: "مشابه",
    search: "بحث",
    movies: "أفلام",
    tvShows: "مسلسلات",
    watchNow: "شاهد الآن",
    moreInfo: "المزيد",
    noResults: "لا توجد نتائج",
    loading: "جاري التحميل...",
    chooseServer: "اختر السيرفر",
    server: "السيرفر",
    quality: "الجودة",
    subtitles: "الترجمة",
    autoPlay: "تشغيل تلقائي",
    autoNext: "التشغيل التلقائي التالي",
    changeServer: "تغيير السيرفر",
    serverNote: "ملاحظة",
    availableServers: "السيرفرات المتاحة",
    loadingServer: "جاري تحميل السيرفر...",
    searchPlaceholder: "ابحث عن فيلم أو مسلسل...",
    allMovies: "جميع الأفلام",
    allTVShows: "جميع المسلسلات",
    moviesAction: "أكشن",
    moviesComedy: "كوميديا",
    moviesDrama: "دراما",
    moviesHorror: "رعب",
    moviesRomance: "رومانسي",
    moviesSciFi: "خيال علمي",
    tvAction: "أكشن",
    tvComedy: "كوميديا",
    tvDrama: "دراما",
    tvSciFi: "خيال علمي",
    tvCrime: "جريمة",
    tvFamily: "عائلي",
    quickLinks: "روابط سريعة",
    aboutUs: "من نحن",
    contactUs: "اتصل بنا",
    privacyPolicy: "سياسة الخصوصية",
    copyright: "جميع الحقوق محفوظة ©",
    disclaimer: "هذا الموقع لا يستضيف أي محتوى على سيرفراته",
    popularMovies: "أفلام شائعة",
    popularTV: "مسلسلات شائعة",
    trendingMovies: "🔥 الأفلام الشائعة",
    trendingTV: "📺 المسلسلات الشائعة",
    topRatedMovies: "⭐ أفضل الأفلام تقييماً",
    topRatedTV: "🏆 أفضل المسلسلات تقييماً",
    noDescription: "لا يوجد وصف متاح",
    filterByGenre: "تصفية حسب التصنيف",
    all: "الكل",
    loadMore: "تحميل المزيد",
    category: "تصنيف",
    searchResultsFor: "نتائج البحث عن",
    searchPlaceholderFull: "ابحث عن فيلم، مسلسل، أو ممثل...",
    resultsFound: "تم العثور على {count} نتيجة",
    searching: "جاري البحث...",
    startSearch: "ابدأ البحث",
    searchMoviesSeriesActors: "ابحث عن أفلامك ومسلسلاتك المفضلة",
    actors: "ممثلين",
    actor: "ممثل/ة",
    tryDifferentKeywords: "جرب البحث بكلمات مختلفة",
    movieNotFound: "الفيلم غير موجود",
    tvShowNotFound: "المسلسل غير موجود",
    backHome: "العودة للرئيسية",
    hoursShort: "س",
    minutesShort: "د",
    castMembers: "طاقم العمل",
    actorsLabel: "الممثلون:",
    watchMovie: "مشاهدة الفيلم",
    watchTV: "مشاهدة المسلسل",
    similarMovies: "أفلام مشابهة",
    similarTV: "مسلسلات مشابهة",
    episodesLabel: "الحلقات",
    seasonLabel: "الموسم",
    episodeLabel: "الحلقة",
    seasonsCount: "{count} مواسم",
    episodesCount: "{count} حلقة",
    episodesInSeason: "حلقات الموسم {season}",
    viewAll: "عرض الكل",
    movieGenres: "أنواع الأفلام",
    tvGenres: "أنواع المسلسلات",
    yearsShort: "سنة",
    popularity: "الشعبية",
    biography: "السيرة الذاتية",
    showLess: "عرض أقل",
    showMore: "عرض المزيد",
    works: "الأعمال",
    showingTopWorks: "يتم عرض أفضل {count} عمل من أصل {total}",
    pageNotFound: "الصفحة غير موجودة",
    notFoundText: "ربما تم نقل الصفحة التي تبحث عنها أو أنها لم تعد موجودة.",
    latestMovies: "أحدث الأفلام",
    latestSeries: "أحدث المسلسلات",
    opinion: "آراء",
    criticsChoice: "اختيارات النقاد",
    recommended: "مقترح لك",
    productionCompanies: "شركات الإنتاج العالمية",
  },
  en: {
    home: "Home",
    trending: "Trending",
    popular: "Popular",
    topRated: "Top Rated",
    nowPlaying: "Now Playing",
    upcoming: "Upcoming",
    seeAll: "See All",
    minutes: "min",
    seasons: "seasons",
    episodes: "episodes",
    cast: "Cast",
    similar: "Similar",
    search: "Search",
    movies: "Movies",
    tvShows: "TV Shows",
    watchNow: "Watch Now",
    moreInfo: "More Info",
    noResults: "No results found",
    loading: "Loading...",
    chooseServer: "Choose Server",
    server: "Server",
    quality: "Quality",
    subtitles: "Subtitles",
    autoPlay: "Auto Play",
    autoNext: "Auto Next",
    changeServer: "Change Server",
    serverNote: "Note",
    availableServers: "Available Servers",
    loadingServer: "Loading Server...",
    searchPlaceholder: "Search for a movie or TV show...",
    allMovies: "All Movies",
    allTVShows: "All TV Shows",
    moviesAction: "Action",
    moviesComedy: "Comedy",
    moviesDrama: "Drama",
    moviesHorror: "Horror",
    moviesRomance: "Romance",
    moviesSciFi: "Sci-Fi",
    tvAction: "Action & Adventure",
    tvComedy: "Comedy",
    tvDrama: "Drama",
    tvSciFi: "Sci-Fi",
    tvCrime: "Crime",
    tvFamily: "Family",
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    copyright: "All rights reserved ©",
    disclaimer: "This site does not host any content on its servers",
    popularMovies: "Popular Movies",
    popularTV: "Popular TV Shows",
    trendingMovies: "🔥 Trending Movies",
    trendingTV: "📺 Trending TV Shows",
    topRatedMovies: "⭐ Top Rated Movies",
    topRatedTV: "🏆 Top Rated TV Shows",
    noDescription: "No description available",
    filterByGenre: "Filter by Genre",
    all: "All",
    loadMore: "Load More",
    category: "Category",
    searchResultsFor: "Search results for",
    searchPlaceholderFull: "Search for a movie, TV show, or actor...",
    resultsFound: "{count} results found",
    searching: "Searching...",
    startSearch: "Start Searching",
    searchMoviesSeriesActors: "Search for your favorite movies and series",
    actors: "Actors",
    actor: "Actor",
    tryDifferentKeywords: "Try searching with different keywords",
    movieNotFound: "Movie not found",
    tvShowNotFound: "TV show not found",
    backHome: "Back to Home",
    hoursShort: "h",
    minutesShort: "m",
    castMembers: "Cast",
    actorsLabel: "Actors:",
    watchMovie: "Watch Movie",
    watchTV: "Watch TV Show",
    similarMovies: "Similar Movies",
    similarTV: "Similar TV Shows",
    episodesLabel: "Episodes",
    seasonLabel: "Season",
    episodeLabel: "Episode",
    seasonsCount: "{count} Seasons",
    episodesCount: "{count} Episodes",
    episodesInSeason: "Episodes in Season {season}",
    viewAll: "View All",
    movieGenres: "Movie Genres",
    tvGenres: "TV Genres",
    yearsShort: "y",
    popularity: "Popularity",
    biography: "Biography",
    showLess: "Show Less",
    showMore: "Show More",
    works: "Works",
    showingTopWorks: "Showing top {count} works out of {total}",
    pageNotFound: "Page Not Found",
    notFoundText: "The page you are looking for might have been moved or doesn't exist anymore.",
    latestMovies: "Latest Movies",
    latestSeries: "Latest TV Shows",
    opinion: "Opinions",
    criticsChoice: "Critics' Choice",
    recommended: "Recommended for You",
    productionCompanies: "Production Companies",
  },
  fr: {
    home: "Accueil",
    trending: "Tendances",
    popular: "Populaire",
    topRated: "Mieux notés",
    nowPlaying: "En cours",
    upcoming: "À venir",
    seeAll: "Voir tout",
    minutes: "min",
    seasons: "saisons",
    episodes: "épisodes",
    cast: "Casting",
    similar: "Similaire",
    search: "Rechercher",
    movies: "Films",
    tvShows: "Séries TV",
    watchNow: "Regarder",
    moreInfo: "Plus d'infos",
    noResults: "Aucun résultat",
    loading: "Chargement...",
    chooseServer: "Choisir le serveur",
    server: "Serveur",
    quality: "Qualité",
    subtitles: "Sous-titres",
    autoPlay: "Lecture auto",
    autoNext: "Suivant auto",
    changeServer: "Changer de serveur",
    serverNote: "Remarque",
    availableServers: "Serveurs disponibles",
    loadingServer: "Chargement du serveur...",
    searchPlaceholder: "Rechercher un film ou une série...",
    allMovies: "Tous les films",
    allTVShows: "Toutes les séries",
    moviesAction: "Action",
    moviesComedy: "Comédie",
    moviesDrama: "Drame",
    moviesHorror: "Horreur",
    moviesRomance: "Romance",
    moviesSciFi: "Science-Fiction",
    tvAction: "Action & Aventure",
    tvComedy: "Comédie",
    tvDrama: "Drame",
    tvSciFi: "Science-Fiction",
    tvCrime: "Crime",
    tvFamily: "Famille",
    quickLinks: "Liens rapides",
    aboutUs: "À propos",
    contactUs: "Contactez-nous",
    privacyPolicy: "Politique de confidentialité",
    copyright: "Tous droits réservés ©",
    disclaimer: "Ce site n'héberge aucun contenu sur ses serveurs",
    popularMovies: "Films populaires",
    popularTV: "Séries populaires",
    trendingMovies: "🔥 Films Tendances",
    trendingTV: "📺 Séries Tendances",
    topRatedMovies: "⭐ Films les mieux notés",
    topRatedTV: "🏆 Séries les mieux notées",
    noDescription: "Aucune description disponible",
    filterByGenre: "Filtrer par genre",
    all: "Tout",
    loadMore: "Charger plus",
    category: "Catégorie",
    searchResultsFor: "Résultats de recherche pour",
    searchPlaceholderFull: "Rechercher un film, une série ou un acteur...",
    resultsFound: "{count} résultats trouvés",
    searching: "Recherche en cours...",
    startSearch: "Commencer la recherche",
    searchMoviesSeriesActors: "Recherchez vos films et séries préférés",
    actors: "Acteurs",
    actor: "Acteur/trice",
    tryDifferentKeywords: "Essayez avec des mots-clés différents",
    movieNotFound: "Film non trouvé",
    tvShowNotFound: "Série non trouvée",
    backHome: "Retour à l'accueil",
    hoursShort: "h",
    minutesShort: "m",
    castMembers: "Casting",
    actorsLabel: "Acteurs :",
    watchMovie: "Regarder le film",
    watchTV: "Regarder la série",
    similarMovies: "Films similaires",
    similarTV: "Séries similaires",
    episodesLabel: "Épisodes",
    seasonLabel: "Saison",
    episodeLabel: "Épisode",
    seasonsCount: "{count} Saisons",
    episodesCount: "{count} Épisodes",
    episodesInSeason: "Épisodes de la saison {season}",
    viewAll: "Voir tout",
    movieGenres: "Genres de films",
    tvGenres: "Genres de séries",
    latestMovies: "Derniers Films",
    latestSeries: "Dernières Séries",
    opinion: "Opinions",
    criticsChoice: "Choix des Critiques",
    recommended: "Recommandé pour vous",
    productionCompanies: "Sociétés de Production",
  },
  es: {
    home: "Inicio",
    trending: "Tendencias",
    popular: "Popular",
    topRated: "Mejor valorados",
    nowPlaying: "En cartelera",
    upcoming: "Próximamente",
    seeAll: "Ver todo",
    minutes: "min",
    seasons: "temporadas",
    episodes: "episodios",
    cast: "Reparto",
    similar: "Similar",
    search: "Buscar",
    movies: "Películas",
    tvShows: "Series TV",
    watchNow: "Ver ahora",
    moreInfo: "Más info",
    noResults: "No hay resultados",
    loading: "Cargando...",
    chooseServer: "Elegir servidor",
    server: "Servidor",
    quality: "Calidad",
    subtitles: "Subtítulos",
    autoPlay: "Reproducción auto",
    autoNext: "Siguiente auto",
    changeServer: "Cambiar servidor",
    serverNote: "Nota",
    availableServers: "Servidores disponibles",
    loadingServer: "Cargando servidor...",
    searchPlaceholder: "Buscar película o serie...",
    allMovies: "Todas las películas",
    allTVShows: "Todas las series",
    moviesAction: "Acción",
    moviesComedy: "Comedia",
    moviesDrama: "Drama",
    moviesHorror: "Terror",
    moviesRomance: "Romance",
    moviesSciFi: "Ciencia Ficción",
    tvAction: "Acción y Aventura",
    tvComedy: "Comedia",
    tvDrama: "Drama",
    tvSciFi: "Ciencia Ficción",
    tvCrime: "Crimen",
    tvFamily: "Familia",
    quickLinks: "Enlaces rápidos",
    aboutUs: "Sobre nosotros",
    contactUs: "Contáctenos",
    privacyPolicy: "Política de privacidad",
    copyright: "Todos los derechos reservados ©",
    disclaimer: "Este sitio no aloja ningún contenido en sus servidores",
    popularMovies: "Películas populares",
    popularTV: "Series populares",
    trendingMovies: "🔥 Películas populares",
    trendingTV: "📺 Series populares",
    topRatedMovies: "⭐ Películas mejor valoradas",
    topRatedTV: "🏆 Series mejor valoradas",
    noDescription: "Sin descripción disponible",
    filterByGenre: "Filtrar por género",
    all: "Todo",
    loadMore: "Cargar más",
    category: "Categoría",
    searchResultsFor: "Resultados de búsqueda para",
    searchPlaceholderFull: "Buscar una película, serie o actor...",
    resultsFound: "{count} resultados encontrados",
    searching: "Buscando...",
    startSearch: "Empezar a buscar",
    searchMoviesSeriesActors: "Busca tus películas y series favoritas",
    actors: "Actores",
    actor: "Actor/riz",
    tryDifferentKeywords: "Intenta buscar con palabras diferentes",
    movieNotFound: "Película no encontrada",
    tvShowNotFound: "Serie no encontrada",
    backHome: "Volver al inicio",
    hoursShort: "h",
    minutesShort: "m",
    castMembers: "Reparto",
    actorsLabel: "Actores:",
    watchMovie: "Ver película",
    watchTV: "Ver serie",
    similarMovies: "Películas similares",
    similarTV: "Series similares",
    episodesLabel: "Episodios",
    seasonLabel: "Temporada",
    episodeLabel: "Episodio",
    seasonsCount: "{count} Temporadas",
    episodesCount: "{count} Episodios",
    episodesInSeason: "Episodios en la temporada {season}",
    viewAll: "Ver todo",
    movieGenres: "Géneros de películas",
    tvGenres: "Géneros de series",
    productionCompanies: "Productoras",
  },
};

// Get UI translation based on current language
export function t(key: keyof typeof UI_TRANSLATIONS.ar): string {
  const lang = getCurrentLanguage();
  return UI_TRANSLATIONS[lang][key] || key;
}

// Update the VideoPlayer component helper
export function generateVideoIframe(
  server: VideoServer,
  id: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
  imdbId?: string,
  options?: {
    autoplay?: boolean;
    autonext?: boolean;
    subtitleLang?: string;
    subtitleUrl?: string;
  }
): string {
  const url = getVideoUrl(server, id, type, season, episode, imdbId, options);

  return `
    <iframe 
      src="${url}"
      width="100%" 
      height="100%" 
      frameborder="0" 
      allowfullscreen
      allow="autoplay; encrypted-media"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
    ></iframe>
  `;
}
export async function fetchByCompany(mediaType: "movie" | "tv", companyId: string, page = 1) {
  const url = `${TMDB_CONFIG.BASE_URL}/discover/${mediaType}?api_key=${TMDB_CONFIG.API_KEY}&with_companies=${companyId}`;
  return fetchAndMergeLocale(url, page);
}

export async function fetchRamadan2026() {
  try {
    const response = await fetch("/ramadan_series_2026.json");
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      name: item.title_ar || item.title_en,
      overview: item.overview_ar || item.overview_en,
      first_air_date: item.date,
      vote_average: item.rating,
      poster_path: item.poster.replace(/https:\/\/image\.tmdb\.org\/t\/p\/w500/, ""),
    })) as TVShow[];
  } catch (error) {
    console.error("Failed to fetch Ramadan 2026 series:", error);
    return [];
  }
}
