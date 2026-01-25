// ========================================
// TMDB API CONFIGURATION
// ========================================
const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";
const SEARCH_LANGUAGE = 'en'; // للبحث
const DISPLAY_LANGUAGE = 'en'; // للعرض

// ========================================
// STATE MANAGEMENT
// ========================================
let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
let savedSeries = JSON.parse(localStorage.getItem("savedSeries")) || [];

// Movies state
let currentMovieGenre = 'all';
let currentMoviePage = 1;
let totalMoviePages = 1;
let allMovies = [];

// TV state
let currentTVGenre = 'all';
let currentTVPage = 1;
let totalTVPages = 1;
let allSeries = [];

// Common state
let genres = [];
let currentColorFilter = 'black';
let searchTimeout;
let currentSuggestions = [];

// Extended filters
let visibleFilterCount = 8;
let isFiltersExpanded = false;

// Carousel
let carouselMovies = [];
let carouselSeries = [];
let carouselPosition = 0;
let currentCarouselIndex = 0;

// ========================================
// PAGE INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎬 Tomito Movies/TV - Initializing...");
    
    setupColorFilters();
    setupSearch();
    updateTheme();
    setupThemeToggle();
    setupLogoAnimation();
    setupScrollHide();
    loadGenres();
    
    // Check current page type
    const isMoviesPage = document.getElementById('moviesGrid') || window.location.pathname.includes('movies');
    const isTVPage = document.getElementById('seriesGrid') || window.location.pathname.includes('tv');
    
    if (isMoviesPage) {
        console.log("🎬 Movies Page Detected");
        loadAllMovies();
        loadCarouselMovies();
    } else if (isTVPage) {
        console.log("📺 TV Page Detected");
        loadAllSeries();
        loadCarouselSeries();
    } else {
        // Default to movies if no specific page detected
        console.log("🌐 Defaulting to Movies");
        loadAllMovies();
        loadCarouselMovies();
    }
    
    // إغلاق القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('filtersDropdown');
        const moreBtn = document.querySelector('.more-filters-btn');
        const suggestions = document.querySelector('.search-suggestions');
        const searchContainer = document.querySelector('.search-container');
        
        // Handle filters dropdown
        if (dropdown && moreBtn && 
            !dropdown.contains(e.target) && 
            !moreBtn.contains(e.target) &&
            dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            moreBtn.classList.remove('active');
            moreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> المزيد';
            isFiltersExpanded = false;
        }
        
        // Handle search suggestions
        if (suggestions && searchContainer &&
            !suggestions.contains(e.target) && 
            !searchContainer.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
});

// ========================================
// COLOR FILTERS & THEME
// ========================================
function setupColorFilters() {
    const filterButtons = document.querySelectorAll('.color-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentColorFilter = this.getAttribute('data-color');
            applyColorTheme(currentColorFilter);
            console.log(`🎨 Applied ${currentColorFilter} theme`);
        });
    });
}

function applyColorTheme(color) {
    switch(color) {
        case 'red':
            document.documentElement.style.setProperty('--primary-color', '#CF0A0A');
            document.documentElement.style.setProperty('--secondary-color', '#DC5F00');
            document.documentElement.style.setProperty('--accent-color', '#EEEEEE');
            break;
        case 'orange':
            document.documentElement.style.setProperty('--primary-color', '#DC5F00');
            document.documentElement.style.setProperty('--secondary-color', '#CF0A0A');
            document.documentElement.style.setProperty('--accent-color', '#EEEEEE');
            break;
        case 'gray':
            document.documentElement.style.setProperty('--primary-color', '#EEEEEE');
            document.documentElement.style.setProperty('--secondary-color', '#000000');
            document.documentElement.style.setProperty('--accent-color', '#DC5F00');
            break;
        default: // black
            document.documentElement.style.setProperty('--primary-color', '#000000');
            document.documentElement.style.setProperty('--secondary-color', '#CF0A0A');
            document.documentElement.style.setProperty('--accent-color', '#EEEEEE');
    }
    updateTheme();
}

function updateTheme() {
    console.log(`🎨 Theme updated to: ${currentColorFilter}`);
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const filters = ['black', 'red', 'orange', 'gray'];
            const currentIndex = filters.indexOf(currentColorFilter);
            const nextIndex = (currentIndex + 1) % filters.length;
            const nextButton = document.querySelector(`.color-filter-btn[data-color="${filters[nextIndex]}"]`);
            if (nextButton) nextButton.click();
        });
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
function setupSearch() {
    const searchInput = document.getElementById("search");
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput || !searchContainer) return;
    
    console.log("🔍 Initializing Search...");
    
    // Check page type for appropriate placeholder
    const isTVPage = document.getElementById('seriesGrid');
    if (isTVPage) {
        searchInput.placeholder = "ابحث عن مسلسلات...";
    } else {
        searchInput.placeholder = "ابحث عن أفلام...";
    }
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    searchContainer.appendChild(suggestionsContainer);
    
    // Handle input with debouncing
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            resetToDefault();
            return;
        }
        
        suggestionsContainer.innerHTML = `
            <div class="loading-suggestions">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching...</p>
            </div>
        `;
        suggestionsContainer.style.display = 'block';
        positionSuggestions(suggestionsContainer);
        
        searchTimeout = setTimeout(async () => {
            await performSearchWithSuggestions(query, suggestionsContainer, isTVPage);
        }, 300);
    });
    
    // Handle Enter key
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionsContainer.style.display = 'none';
                performFullSearch(query, isTVPage);
            }
        }
    });
    
    // Handle search button click
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionsContainer.style.display = 'none';
                performFullSearch(query, isTVPage);
            }
        });
    }
    
    // Handle focus
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim().length > 0) {
            suggestionsContainer.style.display = 'block';
        }
    });
    
    console.log("✅ Search Initialized");
}

async function performSearchWithSuggestions(query, container, isTVPage = false) {
    try {
        const encodedQuery = encodeURIComponent(query);
        
        // البحث في الأفلام والمسلسلات معاً
        const [moviesRes, tvRes] = await Promise.all([
            fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=${SEARCH_LANGUAGE}&query=${encodedQuery}&page=1`),
            fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=${SEARCH_LANGUAGE}&query=${encodedQuery}&page=1`)
        ]);
        
        const moviesData = await moviesRes.json();
        const tvData = await tvRes.json();
        
        const movies = moviesData.results || [];
        const series = tvData.results || [];
        
        // دمج النتائج
        const allResults = [
            ...movies.map(m => ({...m, media_type: 'movie'})),
            ...series.map(s => ({...s, media_type: 'tv'}))
        ];
        
        // ترتيب حسب التقييم
        allResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        
        if (allResults.length === 0) {
            container.innerHTML = `
                <div class="no-suggestions">
                    <i class="fas fa-search"></i>
                    <h3>لم يتم العثور على نتائج</h3>
                    <p>جرب كلمات بحث مختلفة</p>
                </div>
            `;
            return;
        }
        
        displayCombinedSearchSuggestions(allResults, query, container, movies.length, series.length);
        
    } catch (error) {
        console.error("❌ Search error:", error);
        container.innerHTML = `
            <div class="no-suggestions">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>خطأ في البحث</h3>
                <p>حاول مرة أخرى</p>
            </div>
        `;
    }
}

function displayCombinedSearchSuggestions(results, query, container, moviesCount, seriesCount) {
    let html = `
        <div class="suggestion-header">
            <span>نتائج البحث: "${truncateText(query, 20)}"</span>
            <div class="suggestion-counts">
                <span class="count-badge movies"><i class="fas fa-film"></i> ${moviesCount}</span>
                <span class="count-badge series"><i class="fas fa-tv"></i> ${seriesCount}</span>
            </div>
        </div>
    `;
    
    results.slice(0, 10).forEach((item, index) => {
        const isMovie = item.media_type === 'movie';
        const title = isMovie ? item.title : (item.name || item.original_name);
        const year = isMovie ? 
            (item.release_date ? new Date(item.release_date).getFullYear() : 'TBA') :
            (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'Ongoing');
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const type = isMovie ? 'movie' : 'tv';
        
        const posterUrl = item.poster_path ? 
            `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
            `https://via.placeholder.com/92x138/2a2a3a/ffffff?text=${isMovie ? '🎬' : '📺'}`;
        
        const overview = item.overview ? 
            truncateText(item.overview, 80) : 
            'لا يوجد وصف';
        
        html += `
            <div class="suggestion-item ${index === 0 ? 'active' : ''}" 
                 data-id="${item.id}" 
                 data-type="${type}"
                 onclick="selectSuggestion(${item.id}, '${title.replace(/'/g, "\\'")}', '${type}')">
                <div class="suggestion-poster">
                    <img src="${posterUrl}" alt="${title}" loading="lazy">
                    <div class="suggestion-type ${type}">
                        <i class="fas ${type === 'tv' ? 'fa-tv' : 'fa-film'}"></i>
                    </div>
                </div>
                <div class="suggestion-info">
                    <h4 class="suggestion-title">${title}</h4>
                    <div class="suggestion-details">
                        <span class="suggestion-rating">
                            <i class="fas fa-star"></i> ${rating}
                        </span>
                        <span class="suggestion-year">${year}</span>
                        <span class="suggestion-media-badge ${type}">
                            ${isMovie ? 'فيلم' : 'مسلسل'}
                        </span>
                    </div>
                    <p class="suggestion-overview">${overview}</p>
                </div>
                <div class="suggestion-action">
                    <button class="suggestion-btn view-btn" 
                            onclick="event.stopPropagation(); goToWatch(${item.id}, '${type}')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="suggestion-footer">
            <button class="view-all-results movies" onclick="performFullSearch('${query.replace(/'/g, "\\'")}', false)">
                <i class="fas fa-film"></i> كل الأفلام (${moviesCount})
            </button>
            <button class="view-all-results series" onclick="performFullSearch('${query.replace(/'/g, "\\'")}', true)">
                <i class="fas fa-tv"></i> كل المسلسلات (${seriesCount})
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    positionSuggestions(container);
    
    // Add hover effect
    const items = container.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function displaySearchSuggestions(results, query, container, isTVPage) {
    let html = `
        <div class="suggestion-header">
            <span>${isTVPage ? 'TV Series' : 'Movies'} (${results.length})</span>
            <span class="suggestion-count">${results.length}</span>
        </div>
    `;
    
    results.slice(0, 8).forEach((item, index) => {
        const title = isTVPage ? (item.name || item.original_name) : item.title;
        const year = isTVPage ? 
            (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'Ongoing') :
            (item.release_date ? new Date(item.release_date).getFullYear() : 'TBA');
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const type = isTVPage ? 'tv' : 'movie';
        
        const posterUrl = item.poster_path ? 
            `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
            `https://via.placeholder.com/92x138/2a2a3a/ffffff?text=${isTVPage ? '📺' : '🎬'}`;
        
        const overview = item.overview ? 
            truncateText(item.overview, 80) : 
            'No description available';
        
        html += `
            <div class="suggestion-item ${index === 0 ? 'active' : ''}" 
                 data-id="${item.id}" 
                 data-type="${type}"
                 onclick="selectSuggestion(${item.id}, '${title.replace(/'/g, "\\'")}', '${type}')">
                <div class="suggestion-poster">
                    <img src="${posterUrl}" alt="${title}" loading="lazy">
                    <div class="suggestion-type ${type}">
                        <i class="fas ${type === 'tv' ? 'fa-tv' : 'fa-film'}"></i>
                    </div>
                </div>
                <div class="suggestion-info">
                    <h4 class="suggestion-title">${title}</h4>
                    <div class="suggestion-details">
                        <span class="suggestion-rating">
                            <i class="fas fa-star"></i> ${rating}
                        </span>
                        <span class="suggestion-year">${year}</span>
                    </div>
                    <p class="suggestion-overview">${overview}</p>
                </div>
                <div class="suggestion-action">
                    <button class="suggestion-btn view-btn" 
                            onclick="event.stopPropagation(); goToWatch(${item.id}, '${type}')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="suggestion-footer">
            <button class="view-all-results" onclick="performFullSearch('${query.replace(/'/g, "\\'")}', ${isTVPage})">
                <i class="fas fa-external-link-alt"></i> View all ${isTVPage ? 'TV series' : 'movies'}
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    positionSuggestions(container);
    
    // Add hover effect
    const items = container.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function performFullSearch(query, isTVPage = false) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = query;
    }
    
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
    
    if (isTVPage) {
        searchTVSeries(query);
    } else {
        searchMovies(query);
    }
}

function positionSuggestions(container) {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    
    const inputRect = searchInput.getBoundingClientRect();
    container.style.position = 'absolute';
    container.style.left = `${inputRect.left + window.scrollX}px`;
    container.style.width = `${inputRect.width}px`;
    container.style.display = 'block';
    container.style.zIndex = '1000';
}

// ========================================
// MOVIES FUNCTIONS
// ========================================
async function loadAllMovies() {
    try {
        showProgress();
        console.log(`🎬 Loading movies - Page ${currentMoviePage}...`);
        
        let url;
        if (currentMovieGenre === 'all') {
            url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&page=${currentMoviePage}`;
        } else {
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&with_genres=${currentMovieGenre}&page=${currentMoviePage}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        allMovies = data.results;
        totalMoviePages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updateMoviePagination();
        
        console.log(`✅ Loaded ${allMovies.length} movies`);
        
    } catch (error) {
        console.error("❌ Error loading movies:", error);
        allMovies = [];
        displayAllMovies();
        updateMoviePagination();
    } finally {
        hideProgress();
    }
}

function displayAllMovies() {
    const container = document.getElementById("moviesGrid");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!allMovies || allMovies.length === 0) {
        container.innerHTML = '<div class="no-movies">No movies found</div>';
        return;
    }
    
    allMovies.forEach((movie, index) => {
        const card = createMovieCard(movie);
        card.style.animationDelay = `${index * 0.05}s`;
        container.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterUrl = movie.poster_path ? IMG_500 + movie.poster_path : 
                     movie.backdrop_path ? IMG_URL + movie.backdrop_path :
                     "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    const title = movie.title || "No title";
    const overview = movie.overview ? truncateText(movie.overview, 100) : "Watch this exciting movie on Tomito.";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "2024";
    const genreName = getGenreName(movie.genre_ids?.[0]);
    
    const isSaved = savedMovies.some(m => m.id === movie.id);
    const saveIcon = isSaved ? 'fas fa-heart' : 'far fa-heart';
    const saveClass = isSaved ? 'saved' : '';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
            </div>
            <div class="movie-info">
                <span class="movie-year">${releaseYear}</span>
                <span class="movie-genre">${genreName}</span>
            </div>
            
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="playMovie(${movie.id})">
                    <i class="fas fa-play"></i> Watch
                </button>
                <button class="save-btn-sm ${saveClass}" onclick="toggleSave(${movie.id}, '${title.replace(/'/g, "\\'")}', '${movie.poster_path}', ${rating}, this)">
                    <i class="${saveIcon}"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

async function searchMovies(query) {
    try {
        showProgress();
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=${SEARCH_LANGUAGE}&query=${encodeURIComponent(query)}&page=${currentMoviePage}`;
        const res = await fetch(url);
        const data = await res.json();

        allMovies = data.results;
        totalMoviePages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updateMoviePagination();
        
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-search"></i> Movies: "${truncateText(query, 20)}"`;
        }

        document.getElementById('moviesGrid').scrollIntoView({ 
            behavior: 'smooth' 
        });

        console.log(`🔍 Found ${data.results.length} movies for "${query}"`);

    } catch (error) {
        console.error("❌ Movie search error:", error);
        allMovies = [];
        displayAllMovies();
        updateMoviePagination();
    } finally {
        hideProgress();
    }
}

// ========================================
// TV SERIES FUNCTIONS
// ========================================
async function loadAllSeries() {
    try {
        showProgress();
        let url;
        
        if (currentTVGenre === 'all') {
            url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&page=${currentTVPage}`;
        } else {
            url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&with_genres=${currentTVGenre}&page=${currentTVPage}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        allSeries = data.results;
        totalTVPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllSeries();
        updateTVPagination();
        
        console.log(`✅ Loaded ${allSeries.length} TV series`);
        
    } catch (error) {
        console.error("❌ Error loading TV series:", error);
        allSeries = [];
        displayAllSeries();
        updateTVPagination();
    } finally {
        hideProgress();
    }
}

function displayAllSeries() {
    const container = document.getElementById("seriesGrid");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!allSeries || allSeries.length === 0) {
        container.innerHTML = '<div class="no-movies">No TV series found</div>';
        return;
    }
    
    allSeries.forEach((series, index) => {
        const card = createSeriesCard(series);
        card.style.animationDelay = `${index * 0.05}s`;
        container.appendChild(card);
    });
}

function createSeriesCard(series) {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterUrl = series.poster_path ? IMG_500 + series.poster_path : 
                     "https://images.unsplash.com/photo-1560972550-aba3456b5564?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    const title = series.name || "No title";
    const rating = series.vote_average ? series.vote_average.toFixed(1) : "N/A";
    const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : "Ongoing";
    
    const isSaved = savedSeries.some(s => s.id === series.id);
    const saveIcon = isSaved ? 'fas fa-heart' : 'far fa-heart';
    const saveClass = isSaved ? 'saved' : '';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
            </div>
            <div class="movie-info">
                <span class="movie-year">${releaseYear}</span>
            </div>
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="playSeries(${series.id})">
                    <i class="fas fa-play"></i> Watch
                </button>
                <button class="save-btn-sm ${saveClass}" onclick="toggleSaveSeries(${series.id}, '${title.replace(/'/g, "\\'")}', '${series.poster_path}', ${rating}, this)">
                    <i class="${saveIcon}"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

async function searchTVSeries(query) {
    try {
        showProgress();
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=${SEARCH_LANGUAGE}&query=${encodeURIComponent(query)}&page=${currentTVPage}`;
        const res = await fetch(url);
        const data = await res.json();

        allSeries = data.results;
        totalTVPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllSeries();
        updateTVPagination();
        
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-search"></i> TV Series: "${truncateText(query, 20)}"`;
        }

        const seriesGrid = document.getElementById('seriesGrid');
        if (seriesGrid) {
            seriesGrid.scrollIntoView({ 
                behavior: 'smooth' 
            });
        }

        console.log(`🔍 Found ${data.results.length} TV series for "${query}"`);

    } catch (error) {
        console.error("❌ TV search error:", error);
        allSeries = [];
        displayAllSeries();
        updateTVPagination();
    } finally {
        hideProgress();
    }
}

// ========================================
// CAROUSEL FUNCTIONS
// ========================================
async function loadCarouselMovies() {
    try {
        showProgress();
        const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        carouselMovies = data.results.slice(0, 10);
        renderCarousel('movie');
    } catch (error) {
        console.error("❌ Error loading carousel movies:", error);
        carouselMovies = getFallbackMovies();
        renderCarousel('movie');
    } finally {
        hideProgress();
    }
}

async function loadCarouselSeries() {
    try {
        showProgress();
        const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        carouselSeries = data.results.slice(0, 10);
        renderCarousel('tv');
    } catch (error) {
        console.error("❌ Error loading carousel series:", error);
        carouselSeries = getFallbackSeries();
        renderCarousel('tv');
    } finally {
        hideProgress();
    }
}

function renderCarousel(type) {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    carouselTrack.innerHTML = '';
    
    const items = type === 'movie' ? carouselMovies : carouselSeries;
    
    items.forEach(item => {
        const card = createCarouselCard(item, type);
        carouselTrack.appendChild(card);
    });
}

function createCarouselCard(item, type) {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    
    const posterUrl = item.backdrop_path ? IMG_URL + item.backdrop_path : 
                     item.poster_path ? IMG_500 + item.poster_path : 
                     type === 'movie' 
                     ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
                     : 'https://images.unsplash.com/photo-1560972550-aba3456b5564?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';
    
    const title = type === 'movie' ? item.title : item.name;
    const releaseYear = type === 'movie' 
        ? (item.release_date ? new Date(item.release_date).getFullYear() : '2024')
        : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'Ongoing');
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="carousel-overlay">
            <h3 class="carousel-card-title">${title}</h3>
            <div class="carousel-card-info">
                <span class="carousel-rating">
                    <i class="fas fa-star"></i> ${rating}/10
                </span>
                <span class="carousel-year">${releaseYear}</span>
            </div>
            <div class="carousel-card-btns">
                <button class="carousel-play-btn" onclick="${type === 'movie' ? 'playMovie' : 'playSeries'}(${item.id})">
                    <i class="fas fa-play"></i> Watch Now
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function scrollCarousel(direction) {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    const containerWidth = carouselTrack.parentElement.offsetWidth;
    const trackWidth = carouselTrack.scrollWidth;
    const maxPosition = 0;
    const minPosition = containerWidth - trackWidth;
    
    carouselPosition += direction * (containerWidth * 0.8);
    
    if (carouselPosition > maxPosition) carouselPosition = minPosition;
    if (carouselPosition < minPosition) carouselPosition = maxPosition;
    
    carouselTrack.style.transform = `translateX(${carouselPosition}px)`;
}

// ========================================
// GENRES & FILTERS
// ========================================
async function loadGenres() {
    try {
        // Load both movie and TV genres
        const movieUrl = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}`;
        const tvUrl = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}`;
        
        const [movieRes, tvRes] = await Promise.all([
            fetch(movieUrl),
            fetch(tvUrl)
        ]);
        
        const movieData = await movieRes.json();
        const tvData = await tvRes.json();
        
        // Combine and deduplicate genres
        const allGenres = [...movieData.genres, ...tvData.genres];
        genres = [...new Map(allGenres.map(genre => [genre.id, genre])).values()];
        
        setupExtendedFilters();
        console.log(`✅ Loaded ${genres.length} genres`);
    } catch (error) {
        console.error("❌ Error loading genres:", error);
        genres = [
            { id: 28, name: 'Action' },
            { id: 12, name: 'Adventure' },
            { id: 16, name: 'Animation' },
            { id: 35, name: 'Comedy' },
            { id: 80, name: 'Crime' },
            { id: 99, name: 'Documentary' },
            { id: 18, name: 'Drama' },
            { id: 10751, name: 'Family' },
            { id: 14, name: 'Fantasy' },
            { id: 36, name: 'History' },
            { id: 27, name: 'Horror' },
            { id: 10402, name: 'Music' },
            { id: 9648, name: 'Mystery' },
            { id: 10749, name: 'Romance' },
            { id: 878, name: 'Science Fiction' },
            { id: 10770, name: 'TV Movie' },
            { id: 53, name: 'Thriller' },
            { id: 10752, name: 'War' },
            { id: 37, name: 'Western' }
        ];
        setupExtendedFilters();
    }
}

function setupExtendedFilters() {
    const filtersGrid = document.getElementById('extendedFiltersGrid');
    const dropdown = document.getElementById('filtersDropdown');
    
    if (!filtersGrid || !dropdown) return;
    
    filtersGrid.innerHTML = '';
    dropdown.innerHTML = '';
    
    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'extended-filter-btn active';
    allButton.textContent = 'All';
    allButton.setAttribute('data-genre', 'all');
    allButton.onclick = () => filterByGenre('all');
    filtersGrid.appendChild(allButton);
    
    // Add visible genre buttons
    const visibleGenres = genres.slice(0, visibleFilterCount - 1);
    
    visibleGenres.forEach(genre => {
        const button = document.createElement('button');
        button.className = 'extended-filter-btn';
        button.textContent = genre.name;
        button.setAttribute('data-genre', genre.id);
        button.onclick = () => filterByGenre(genre.id);
        filtersGrid.appendChild(button);
    });
    
    // Add "More" button if needed
    if (genres.length > visibleFilterCount - 1) {
        const moreButton = document.createElement('button');
        moreButton.className = 'more-filters-btn';
        moreButton.innerHTML = '<i class="fas fa-chevron-down"></i> More';
        moreButton.onclick = toggleMoreFilters;
        filtersGrid.appendChild(moreButton);
        
        const remainingGenres = genres.slice(visibleFilterCount - 1);
        
        remainingGenres.forEach(genre => {
            const button = document.createElement('button');
            button.className = 'extended-filter-btn';
            button.textContent = genre.name;
            button.setAttribute('data-genre', genre.id);
            button.onclick = () => {
                filterByGenre(genre.id);
                dropdown.classList.remove('show');
                moreButton.classList.remove('active');
                moreButton.innerHTML = '<i class="fas fa-chevron-down"></i> More';
                isFiltersExpanded = false;
            };
            dropdown.appendChild(button);
        });
    }
}

function toggleMoreFilters() {
    const dropdown = document.getElementById('filtersDropdown');
    const moreBtn = document.querySelector('.more-filters-btn');
    
    if (!dropdown || !moreBtn) return;
    
    if (isFiltersExpanded) {
        dropdown.classList.remove('show');
        moreBtn.classList.remove('active');
        moreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> More';
    } else {
        dropdown.classList.add('show');
        moreBtn.classList.add('active');
        moreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Less';
    }
    
    isFiltersExpanded = !isFiltersExpanded;
}

function filterByGenre(genreId) {
    const buttons = document.querySelectorAll('.extended-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.extended-filter-btn[data-genre="${genreId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    } else {
        document.querySelector('.extended-filter-btn[data-genre="all"]').classList.add('active');
    }
    
    // Check current page type
    const isMoviesPage = document.getElementById('moviesGrid');
    const isTVPage = document.getElementById('seriesGrid');
    
    if (isMoviesPage) {
        currentMovieGenre = genreId;
        currentMoviePage = 1;
        loadAllMovies();
    } else if (isTVPage) {
        currentTVGenre = genreId;
        currentTVPage = 1;
        loadAllSeries();
    }
}

function getGenreName(genreId) {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : 'Movie';
}

// ========================================
// PAGINATION
// ========================================
function updateMoviePagination() {
    updatePagination('movie');
}

function updateTVPagination() {
    updatePagination('tv');
}

function updatePagination(type = 'movie') {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;
    
    const currentPage = type === 'movie' ? currentMoviePage : currentTVPage;
    const totalPages = type === 'movie' ? totalMoviePages : totalTVPages;
    
    pagination.innerHTML = "";
    
    // Previous button
    const prevButton = document.createElement("button");
    prevButton.className = "pagination-nav-btn";
    prevButton.innerHTML = '<i class="fas fa-chevron-right"></i> Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1, type);
    pagination.appendChild(prevButton);
    
    // Always show first page
    const firstPage = document.createElement("button");
    firstPage.className = `page-link ${currentPage === 1 ? 'active cursor-normal' : 'cursor-pointer'}`;
    firstPage.textContent = "1";
    if (currentPage !== 1) {
        firstPage.onclick = () => goToPage(1, type);
    }
    pagination.appendChild(firstPage);
    
    // Show ellipsis if needed
    if (currentPage > 4) {
        const ellipsis1 = document.createElement("span");
        ellipsis1.textContent = "...";
        ellipsis1.style.color = "#888";
        pagination.appendChild(ellipsis1);
    }
    
    // Show pages around current page
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === 1 || i === totalPages) continue;
        
        const pageButton = document.createElement("button");
        pageButton.className = `page-link ${i === currentPage ? 'active cursor-normal' : 'cursor-pointer'}`;
        pageButton.textContent = i;
        if (i !== currentPage) {
            pageButton.onclick = () => goToPage(i, type);
        }
        pagination.appendChild(pageButton);
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 3) {
        const ellipsis2 = document.createElement("span");
        ellipsis2.textContent = "...";
        ellipsis2.style.color = "#888";
        pagination.appendChild(ellipsis2);
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
        const lastPage = document.createElement("button");
        lastPage.className = `page-link ${currentPage === totalPages ? 'active cursor-normal' : 'cursor-pointer'}`;
        lastPage.textContent = totalPages;
        if (currentPage !== totalPages) {
            lastPage.onclick = () => goToPage(totalPages, type);
        }
        pagination.appendChild(lastPage);
    }
    
    // Next button
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-nav-btn";
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-left"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1, type);
    pagination.appendChild(nextButton);
}

function goToPage(page, type = 'movie') {
    const isMoviesPage = document.getElementById('moviesGrid');
    const isTVPage = document.getElementById('seriesGrid');
    
    if (isMoviesPage) {
        if (page < 1 || page > totalMoviePages || page === currentMoviePage) return;
        currentMoviePage = page;
        loadAllMovies();
    } else if (isTVPage) {
        if (page < 1 || page > totalTVPages || page === currentTVPage) return;
        currentTVPage = page;
        loadAllSeries();
    }
    
    // Scroll to grid
    setTimeout(() => {
        const grid = document.getElementById(isMoviesPage ? 'moviesGrid' : 'seriesGrid');
        if (grid) {
            grid.scrollIntoView({
                top: grid.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// ========================================
// SAVE FUNCTIONALITY
// ========================================
function toggleSave(id, title, posterPath, rating, btn) {
    const movie = { 
        id, 
        title, 
        poster_path: posterPath, 
        vote_average: rating,
        type: 'movie',
        saved_date: new Date().toISOString()
    };
    
    const index = savedMovies.findIndex(m => m.id === id);
    if (index === -1) {
        savedMovies.push(movie);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add("saved");
            btn.classList.add("saved-animation");
            setTimeout(() => btn.classList.remove("saved-animation"), 500);
        }
        showNotification(`Added "${title}" to favorites`);
    } else {
        savedMovies.splice(index, 1);
        if (btn) {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove("saved");
        }
        showNotification(`Removed "${title}" from favorites`);
    }
    
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
}

function toggleSaveSeries(id, title, posterPath, rating, btn) {
    const series = { 
        id, 
        title, 
        poster_path: posterPath, 
        vote_average: rating,
        type: 'tv',
        saved_date: new Date().toISOString()
    };
    
    const index = savedSeries.findIndex(s => s.id === id);
    if (index === -1) {
        savedSeries.push(series);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add("saved");
        }
        showNotification(`Added "${title}" to favorites`);
    } else {
        savedSeries.splice(index, 1);
        if (btn) {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove("saved");
        }
        showNotification(`Removed "${title}" from favorites`);
    }
    
    localStorage.setItem("savedSeries", JSON.stringify(savedSeries));
}

// ========================================
// PLAYER & NAVIGATION
// ========================================
function playMovie(id) {
    window.location.href = `watch.html?id=${id}&type=movie`;
    showNotification(`Loading movie...`);
}

function playSeries(id) {
    window.location.href = `watch-tv.html?id=${id}`;
    showNotification(`Loading TV series...`);
}

function goToWatch(id, type = "movie") {
    if (type === 'movie') {
        playMovie(id);
    } else {
        playSeries(id);
    }
}

function selectSuggestion(id, title, type) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = title;
        searchInput.focus();
    }
    
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
    
    // Show specific item
    if (type === 'movie') {
        showSpecificMovie(id);
    } else {
        showSpecificSeries(id);
    }
}

async function showSpecificMovie(id) {
    try {
        showProgress();
        const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}`;
        const res = await fetch(url);
        const movie = await res.json();
        
        allMovies = [movie];
        displayAllMovies();
        
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-film"></i> ${movie.title}`;
        }
        
        const pagination = document.getElementById("pagination");
        if (pagination) {
            pagination.style.display = 'none';
        }
        
    } catch (error) {
        console.error("❌ Error loading movie:", error);
        showNotification('Error loading movie', 'error');
    } finally {
        hideProgress();
    }
}

async function showSpecificSeries(id) {
    try {
        showProgress();
        const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}`;
        const res = await fetch(url);
        const series = await res.json();
        
        allSeries = [series];
        displayAllSeries();
        
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-tv"></i> ${series.name}`;
        }
        
        const pagination = document.getElementById("pagination");
        if (pagination) {
            pagination.style.display = 'none';
        }
        
    } catch (error) {
        console.error("❌ Error loading series:", error);
        showNotification('Error loading TV series', 'error');
    } finally {
        hideProgress();
    }
}

function showAllMovies() {
    currentMovieGenre = 'all';
    currentMoviePage = 1;
    loadAllMovies();
    document.getElementById('moviesGrid').scrollIntoView({ behavior: 'smooth' });
}

function showAllSeries() {
    currentTVGenre = 'all';
    currentTVPage = 1;
    loadAllSeries();
    document.getElementById('seriesGrid').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function resetToDefault() {
    const isMoviesPage = document.getElementById('moviesGrid');
    const isTVPage = document.getElementById('seriesGrid');
    
    if (isMoviesPage) {
        currentMovieGenre = 'all';
        currentMoviePage = 1;
        loadAllMovies();
    } else if (isTVPage) {
        currentTVGenre = 'all';
        currentTVPage = 1;
        loadAllSeries();
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function showProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) { 
        bar.style.display = "block"; 
        bar.style.transform = "scaleX(0)"; 
        setTimeout(() => { bar.style.transform = "scaleX(0.7)"; }, 10);
    }
}

function hideProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) { 
        bar.style.transform = "scaleX(1)"; 
        setTimeout(() => { bar.style.display = "none"; }, 500);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icon = type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? 'linear-gradient(45deg, #CF0A0A, #DC5F00)' : 
                     type === 'success' ? 'linear-gradient(45deg, #4CAF50, #8BC34A)' : 
                     'linear-gradient(45deg, #2196F3, #03A9F4)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========================================
// FALLBACK DATA
// ========================================
function getFallbackMovies() {
    return [
        { 
            id: 1, 
            title: "The Shawshank Redemption", 
            backdrop_path: null,
            poster_path: null,
            vote_average: 9.3, 
            release_date: "1994-09-23"
        },
        { 
            id: 2, 
            title: "The Godfather", 
            backdrop_path: null,
            poster_path: null,
            vote_average: 9.2, 
            release_date: "1972-03-24"
        }
    ];
}

function getFallbackSeries() {
    return [
        { 
            id: 1, 
            name: "Breaking Bad", 
            backdrop_path: null,
            poster_path: null,
            vote_average: 8.9, 
            first_air_date: "2008-01-20"
        },
        { 
            id: 2, 
            name: "Game of Thrones", 
            backdrop_path: null,
            poster_path: null,
            vote_average: 8.9, 
            first_air_date: "2011-04-17"
        }
    ];
}

// ========================================
// SCROLL & UI ENHANCEMENTS
// ========================================
function setupScrollHide() {
    let ticking = false;
    let lastScrollY = window.scrollY;
    let tvLastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScrollHide(lastScrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, false);
}

function handleScrollHide(scrollTop) {
    const navbar = document.getElementById('navbar');
    const colorFilters = document.getElementById('colorFilters');
    const isMobile = window.innerWidth <= 768;
    
    const scrollDelta = scrollTop - tvLastScrollTop;
    
    if (scrollTop > 100) {
        if (scrollDelta > 5) {
            navbar.classList.add('hidden');
            if (isMobile) {
                navbar.classList.add('compact');
            }
        } else if (scrollDelta < -5) {
            navbar.classList.remove('hidden');
            if (scrollTop < 200) {
                navbar.classList.remove('compact');
            }
        }
        
        colorFilters.classList.add('shifted');
    } else {
        navbar.classList.remove('hidden');
        navbar.classList.remove('compact');
        colorFilters.classList.remove('shifted');
    }
    
    tvLastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

function setupLogoAnimation() {
    const logoArea = document.querySelector('.logo--area');
    const enText = document.querySelector('.en-text');
    
    if (!logoArea || !enText) return;
    
    enText.addEventListener('mouseenter', function() {
        const spans = this.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = 'translateX(-40px) rotate(-10deg)';
            spans[0].style.opacity = '0.5';
            
            if (spans[1]) {
                spans[1].style.transform = 'translateY(-20px) scale(1.3)';
                spans[1].style.color = '#ff4444';
            }
            
            if (spans[2]) {
                spans[2].style.transform = 'translateX(40px) rotate(10deg)';
                spans[2].style.opacity = '0.5';
            }
        }
    });
    
    enText.addEventListener('mouseleave', function() {
        const spans = this.querySelectorAll('span');
        if (spans) {
            spans.forEach(span => {
                span.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
                span.style.opacity = '1';
                span.style.color = '';
            });
        }
    });
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.playMovie = playMovie;
window.playSeries = playSeries;
window.toggleSave = toggleSave;
window.toggleSaveSeries = toggleSaveSeries;
window.scrollCarousel = scrollCarousel;
window.showAllMovies = showAllMovies;
window.showAllSeries = showAllSeries;
window.goToPage = goToPage;
window.goToWatch = goToWatch;
window.selectSuggestion = selectSuggestion;
window.performFullSearch = performFullSearch;
// ========================================
// CATEGORY NAVIGATION - رابط القائمة المنسدلة
// ========================================

function setupCategoryNavigation() {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // تحديد النوع (أفلام/مسلسلات)
            const dropdown = this.closest('.dropdown');
            const isMovies = dropdown.querySelector('.nav-link').textContent.includes('أفلام');
            const type = isMovies ? 'movies' : 'series';
            
            // جمع بيانات التصنيف
            const category = this.getAttribute('data-category');
            const subcategory = this.getAttribute('data-subcategory');
            const year = this.getAttribute('data-year');
            const seriesType = this.getAttribute('data-series-type');
            const seriesView = this.getAttribute('data-series-view');
            const seriesCategory = this.getAttribute('data-series-category');
            
            // بناء رابط صفحة التصنيفات
            let url = `category.html?type=${type}`;
            
            if (category) url += `&category=${category}`;
            if (subcategory) url += `&subcategory=${subcategory}`;
            if (year) url += `&year=${year}`;
            if (seriesType) url += `&seriesType=${seriesType}`;
            if (seriesView) url += `&seriesView=${seriesView}`;
            if (seriesCategory) url += `&seriesCategory=${seriesCategory}`;
            
            console.log(`🔗 الانتقال إلى: ${url}`);
            
            // الانتقال لصفحة التصنيفات
            window.location.href = url;
        });
    });
}

// في دالة التهيئة، أضف استدعاء setupCategoryNavigation
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎬 Tomito Movies/TV - Initializing...");
    
    // الإعدادات الحالية
    setupColorFilters();
    setupSearch();
    updateTheme();
    setupThemeToggle();
    setupLogoAnimation();
    setupScrollHide();
    loadGenres();
    
    // ✅ أضف هذا السطر الجديد
    setupCategoryNavigation();
    
    // باقي الكود...
});