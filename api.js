// ========================================
// TMDB API CONFIGURATION
// ========================================
const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";
const LANGUAGE = 'en'; // English only

// State Management
let searchTimeout;
let currentSuggestions = [];

// ========================================
// STATE MANAGEMENT
// ========================================
let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
let currentGenre = 'all';
let currentPage = 1;
let totalPages = 1;
let allMovies = [];
let genres = [];
let currentColorFilter = 'black';

// Extended filters management
let visibleFilterCount = 8;
let isFiltersExpanded = false;

// ========================================
// PAGE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎬 Tomito Movies - Initializing...");
    setupColorFilters();
    setupSearch();
    updateTheme();
    setupThemeToggle();
    loadGenres();
    loadAllMovies();
    
    // إغلاق القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('filtersDropdown');
        const moreBtn = document.querySelector('.more-filters-btn');
        
        if (dropdown && moreBtn && 
            !dropdown.contains(e.target) && 
            !moreBtn.contains(e.target) &&
            dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            moreBtn.classList.remove('active');
            moreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> المزيد';
            isFiltersExpanded = false;
        }
    });
});

// ========================================
// COLOR FILTERS FUNCTIONALITY
// ========================================
function setupColorFilters() {
    const filterButtons = document.querySelectorAll('.color-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current filter
            currentColorFilter = this.getAttribute('data-color');
            
            // Apply color theme
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
    
    // Update CSS variables in real-time
    updateTheme();
}

function updateTheme() {
    console.log(`🎨 Theme updated to: ${currentColorFilter}`);
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Cycle through color filters
            const filters = ['black', 'red', 'orange', 'gray'];
            const currentIndex = filters.indexOf(currentColorFilter);
            const nextIndex = (currentIndex + 1) % filters.length;
            
            // Simulate click on the next filter button
            const nextFilter = filters[nextIndex];
            const nextButton = document.querySelector(`.color-filter-btn[data-color="${nextFilter}"]`);
            if (nextButton) {
                nextButton.click();
            }
        });
    }
}

// ========================================
// LOAD GENRES
// ========================================
async function loadGenres() {
    try {
        const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ar`;
        const res = await fetch(url);
        const data = await res.json();
        
        genres = data.genres;
        setupExtendedFilters();
        
        console.log(`✅ Loaded ${genres.length} genres`);
    } catch (error) {
        console.error("❌ Error loading genres:", error);
        // Fallback genres
        genres = [
            // { id: 28, name: 'أكشن' },
            // { id: 12, name: 'مغامرة' },
            // { id: 16, name: 'رسوم متحركة' },
            // { id: 35, name: 'كوميديا' },
            { id: 80, name: 'جريمة' },
            { id: 99, name: 'وثائقي' },
            { id: 18, name: 'دراما' },
            { id: 10751, name: 'عائلي' },
            { id: 14, name: 'فانتازيا' },
            { id: 36, name: 'تاريخي' },
            { id: 27, name: 'رعب' },
            { id: 10402, name: 'موسيقى' },
            { id: 9648, name: 'غموض' },
            { id: 10749, name: 'رومانسي' },
            { id: 878, name: 'خيال علمي' },
            { id: 10770, name: 'فيلم تلفزيوني' },
            { id: 53, name: 'إثارة' },
            { id: 10752, name: 'حربي' },
            { id: 37, name: 'غربي' }
        ];
        setupExtendedFilters();
    }
}

// ========================================
// SETUP EXTENDED FILTERS WITH "MORE" BUTTON
// ========================================
function setupExtendedFilters() {
    const filtersGrid = document.getElementById('extendedFiltersGrid');
    const dropdown = document.getElementById('filtersDropdown');
    
    if (!filtersGrid || !dropdown) return;
    
    filtersGrid.innerHTML = '';
    dropdown.innerHTML = '';
    
    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'extended-filter-btn active';
    allButton.textContent = 'الكل';
    allButton.setAttribute('data-genre', 'all');
    allButton.onclick = () => filterByGenre('all');
    filtersGrid.appendChild(allButton);
    
    // Add visible genre buttons (limited number)
    const visibleGenres = genres.slice(0, visibleFilterCount - 1);
    
    visibleGenres.forEach(genre => {
        const button = document.createElement('button');
        button.className = 'extended-filter-btn';
        button.textContent = genre.name;
        button.setAttribute('data-genre', genre.id);
        button.onclick = () => filterByGenre(genre.id);
        filtersGrid.appendChild(button);
    });
    
    // إذا كان هناك أكثر من عدد الفلاتر المرئية، أضف زر "المزيد"
    if (genres.length > visibleFilterCount - 1) {
        const moreButton = document.createElement('button');
        moreButton.className = 'more-filters-btn';
        moreButton.innerHTML = '<i class="fas fa-chevron-down"></i> المزيد';
        moreButton.onclick = toggleMoreFilters;
        filtersGrid.appendChild(moreButton);
        
        // إضافة الفلاتر المتبقية للقائمة المنسدلة
        const remainingGenres = genres.slice(visibleFilterCount - 1);
        
        remainingGenres.forEach(genre => {
            const button = document.createElement('button');
            button.className = 'extended-filter-btn';
            button.textContent = genre.name;
            button.setAttribute('data-genre', genre.id);
            button.onclick = () => {
                filterByGenre(genre.id);
                // إغلاق القائمة المنسدلة بعد الاختيار
                dropdown.classList.remove('show');
                moreButton.classList.remove('active');
                moreButton.innerHTML = '<i class="fas fa-chevron-down"></i> المزيد';
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
        moreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> المزيد';
    } else {
        dropdown.classList.add('show');
        moreBtn.classList.add('active');
        moreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> أقل';
    }
    
    isFiltersExpanded = !isFiltersExpanded;
}

function filterByGenre(genreId) {
    // Update active button in visible filters
    const buttons = document.querySelectorAll('.extended-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the clicked button
    const activeBtn = document.querySelector(`.extended-filter-btn[data-genre="${genreId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    } else {
        // If button is in dropdown, activate "All" button instead
        document.querySelector('.extended-filter-btn[data-genre="all"]').classList.add('active');
    }
    
    // Also check dropdown buttons
    const dropdownButtons = document.querySelectorAll('#filtersDropdown .extended-filter-btn');
    dropdownButtons.forEach(btn => btn.classList.remove('active'));
    
    const dropdownActiveBtn = document.querySelector(`#filtersDropdown .extended-filter-btn[data-genre="${genreId}"]`);
    if (dropdownActiveBtn) {
        dropdownActiveBtn.classList.add('active');
    }
    
    currentGenre = genreId;
    currentPage = 1;
    loadAllMovies();
}

// ========================================
// LOAD ALL MOVIES
// ========================================
async function loadAllMovies() {
    try {
        showProgress();
        console.log(`🎬 Loading ${currentGenre === 'all' ? 'all' : 'genre'} movies - Page ${currentPage}...`);
        
        let url;
        
        if (currentGenre === 'all') {
            // Load popular movies by default
            url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en&page=${currentPage}`;
        } else {
            // Load movies by genre
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en&with_genres=${currentGenre}&page=${currentPage}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        allMovies = data.results;
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updatePagination();
        
        console.log(`✅ Loaded ${allMovies.length} movies`);
        
    } catch (error) {
        console.error("❌ Error loading movies:", error);
        allMovies = [];
        displayAllMovies();
        updatePagination();
    } finally {
        hideProgress();
    }
}

function displayAllMovies() {
    const container = document.getElementById("moviesGrid");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!allMovies || allMovies.length === 0) {
        container.innerHTML = '<div class="no-movies">لم يتم العثور على أفلام</div>';
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
    const title = movie.title || "فيلم بدون عنوان";
    const overview = movie.overview ? movie.overview.substring(0, 100) + "..." : "شاهد هذا الفيلم المثير على توميتو.";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "غير معروف";
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
                    <i class="fas fa-play"></i> شاهد
                </button>
               
            </div>
        </div>
    `;
    return card;
}

function getGenreName(genreId) {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : 'فيلم';
}

// ========================================
// INFINITE PAGINATION
// ========================================
function updatePagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;
    
    pagination.innerHTML = "";
    
    // Previous button
    const prevButton = document.createElement("button");
    prevButton.className = "pagination-nav-btn";
    prevButton.innerHTML = '<i class="fas fa-chevron-right"></i> السابق';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1);
    pagination.appendChild(prevButton);
    
    // Always show first page
    const firstPage = document.createElement("button");
    firstPage.className = `page-link ${currentPage === 1 ? 'active cursor-normal' : 'cursor-pointer'}`;
    firstPage.textContent = "1";
    if (currentPage !== 1) {
        firstPage.onclick = () => goToPage(1);
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
        if (i === 1 || i === totalPages) continue; // Skip first and last as they're handled separately
        
        const pageButton = document.createElement("button");
        pageButton.className = `page-link ${i === currentPage ? 'active cursor-normal' : 'cursor-pointer'}`;
        pageButton.textContent = i;
        if (i !== currentPage) {
            pageButton.onclick = () => goToPage(i);
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
            lastPage.onclick = () => goToPage(totalPages);
        }
        pagination.appendChild(lastPage);
    }
    
    // Next button
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-nav-btn";
    nextButton.innerHTML = 'التالي <i class="fas fa-chevron-left"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1);
    pagination.appendChild(nextButton);
}

function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    loadAllMovies();
    
    // Scroll to movies grid
    window.scrollTo({
        top: document.getElementById('moviesGrid').offsetTop - 100,
        behavior: 'smooth'
    });
}

// ========================================
// SEARCH FUNCTIONALITY - MOVIES ONLY (ENGLISH)
// ========================================
function setupMovieSearch() {
    const searchInput = document.getElementById("search");
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput || !searchContainer) return;
    
    // Set English placeholder for movies
    searchInput.placeholder = "Search movies...";
    
    // Create suggestions container for movies
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.id = 'movieSuggestions';
    searchContainer.appendChild(suggestionsContainer);
    
    // Handle input with debouncing
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        // Hide suggestions if query is empty
        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            resetToDefaultMovies();
            return;
        }
        
        // Show loading state
        showMovieLoading(suggestionsContainer);
        
        searchTimeout = setTimeout(async () => {
            await searchMoviesAutoSuggest(query, suggestionsContainer);
        }, 300);
    });
    
    // Handle Enter key
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionsContainer.style.display = 'none';
                performMovieSearch(query);
            }
        }
    });
    
    // Handle keyboard navigation for movies
    setupMovieKeyboardNavigation(searchInput, suggestionsContainer);
    
    // Handle focus
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim().length > 0) {
            suggestionsContainer.style.display = 'block';
        }
    });
    
    // Handle search button click
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionsContainer.style.display = 'none';
                performMovieSearch(query);
            }
        });
    }
    
    // Hide suggestions when clicking outside
    setupClickOutsideHandler(searchContainer, suggestionsContainer);
}

// ========================================
// MOVIES AUTO-SUGGEST SEARCH
// ========================================
async function searchMoviesAutoSuggest(query, container) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodedQuery}&page=1`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const movies = data.results || [];
        
        if (movies.length === 0) {
            showNoMovieResults(container, query);
            return;
        }
        
        // Display movie suggestions
        displayMovieSuggestions(movies.slice(0, 8), query, container);
        
    } catch (error) {
        console.error("❌ Movie auto-suggest error:", error);
        showSearchError(container, 'movies');
    }
}

// ========================================
// DISPLAY MOVIE SUGGESTIONS
// ========================================
function displayMovieSuggestions(movies, query, container) {
    let html = `
        <div class="suggestion-header">
            <span>Movies (${movies.length})</span>
            <span class="suggestion-count">${movies.length}</span>
        </div>
    `;
    
    movies.forEach(movie => {
        const title = movie.title || 'No title';
        const year = movie.release_date ? 
            new Date(movie.release_date).getFullYear() : 
            'TBA';
        const rating = movie.vote_average ? 
            movie.vote_average.toFixed(1) : 'N/A';
        
        const posterUrl = movie.poster_path ? 
            `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 
            `https://via.placeholder.com/92x138/2a2a3a/ffffff?text=🎬`;
        
        const overview = movie.overview ? 
            truncateText(movie.overview, 70) : 
            'No description available';
        
        html += `
            <div class="suggestion-item" 
                 data-id="${movie.id}" 
                 data-title="${title.replace(/"/g, '&quot;')}"
                 onclick="selectMovieSuggestion(${movie.id}, '${title.replace(/'/g, "\\'")}')">
                <div class="suggestion-poster">
                    <img src="${posterUrl}" alt="${title}" loading="lazy">
                    <div class="suggestion-type">
                        <i class="fas fa-film"></i>
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
                            onclick="event.stopPropagation(); goToWatch(${movie.id}, 'movie')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="suggestion-footer">
            <button class="view-all-results" onclick="performMovieSearch('${query.replace(/'/g, "\\'")}')">
                <i class="fas fa-external-link-alt"></i> View all movies
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    positionSuggestions(container);
    setupSuggestionHover(container);
}

// ========================================
// MOVIES MAIN SEARCH FUNCTION
// ========================================
async function performMovieSearch(query) {
    if (!query || query.trim().length === 0) return;
    
    try {
        showProgress();
        
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodedQuery}&page=${currentPage}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        allMovies = data.results || [];
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updatePagination();
        
        // Update UI
        updateSearchResultsUI(query, 'movies');
        
        console.log(`✅ Found ${allMovies.length} movies for "${query}"`);
        
    } catch (error) {
        console.error("❌ Movie search error:", error);
        handleSearchError('movies');
    } finally {
        hideProgress();
    }
}

// ========================================
// TV SERIES PAGE SEARCH FUNCTIONALITY
// ========================================
function setupTVSearch() {
    const searchInput = document.getElementById("search");
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput || !searchContainer) return;
    
    // Set English placeholder for TV
    searchInput.placeholder = "Search TV series...";
    
    // Create suggestions container for TV
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.id = 'tvSuggestions';
    searchContainer.appendChild(suggestionsContainer);
    
    // Handle input with debouncing
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        // Hide suggestions if query is empty
        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            resetToDefaultTV();
            return;
        }
        
        // Show loading state
        showTVLoading(suggestionsContainer);
        
        searchTimeout = setTimeout(async () => {
            await searchTVAutoSuggest(query, suggestionsContainer);
        }, 300);
    });
    
    // Handle Enter key
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionsContainer.style.display = 'none';
                performTVSearch(query);
            }
        }
    });
    
    // Handle keyboard navigation for TV
    setupTVKeyboardNavigation(searchInput, suggestionsContainer);
    
    // Handle focus
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim().length > 0) {
            suggestionsContainer.style.display = 'block';
        }
    });
    
    // Handle search button click
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                suggestionsContainer.style.display = 'none';
                performTVSearch(query);
            }
        });
    }
    
    // Hide suggestions when clicking outside
    setupClickOutsideHandler(searchContainer, suggestionsContainer);
}

// ========================================
// TV AUTO-SUGGEST SEARCH
// ========================================
async function searchTVAutoSuggest(query, container) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodedQuery}&page=1`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const series = data.results || [];
        
        if (series.length === 0) {
            showNoTVResults(container, query);
            return;
        }
        
        // Display TV suggestions
        displayTVSuggestions(series.slice(0, 8), query, container);
        
    } catch (error) {
        console.error("❌ TV auto-suggest error:", error);
        showSearchError(container, 'tv');
    }
}

// ========================================
// DISPLAY TV SUGGESTIONS
// ========================================
function displayTVSuggestions(series, query, container) {
    let html = `
        <div class="suggestion-header">
            <span>TV Series (${series.length})</span>
            <span class="suggestion-count">${series.length}</span>
        </div>
    `;
    
    series.forEach(show => {
        const title = show.name || 'No title';
        const year = show.first_air_date ? 
            new Date(show.first_air_date).getFullYear() : 
            'Ongoing';
        const rating = show.vote_average ? 
            show.vote_average.toFixed(1) : 'N/A';
        
        const posterUrl = show.poster_path ? 
            `https://image.tmdb.org/t/p/w92${show.poster_path}` : 
            `https://via.placeholder.com/92x138/2a2a3a/ffffff?text=📺`;
        
        const overview = show.overview ? 
            truncateText(show.overview, 70) : 
            'No description available';
        
        html += `
            <div class="suggestion-item" 
                 data-id="${show.id}" 
                 data-title="${title.replace(/"/g, '&quot;')}"
                 onclick="selectTVSuggestion(${show.id}, '${title.replace(/'/g, "\\'")}')">
                <div class="suggestion-poster">
                    <img src="${posterUrl}" alt="${title}" loading="lazy">
                    <div class="suggestion-type">
                        <i class="fas fa-tv"></i>
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
                            onclick="event.stopPropagation(); goToWatchTV(${show.id})">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="suggestion-footer">
            <button class="view-all-results" onclick="performTVSearch('${query.replace(/'/g, "\\'")}')">
                <i class="fas fa-external-link-alt"></i> View all series
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    positionSuggestions(container);
    setupSuggestionHover(container);
}

// ========================================
// TV MAIN SEARCH FUNCTION
// ========================================
async function performTVSearch(query) {
    if (!query || query.trim().length === 0) return;
    
    try {
        showProgress();
        
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodedQuery}&page=${currentPage}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        allSeries = data.results || [];
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllSeries();
        updatePagination();
        
        // Update UI
        updateSearchResultsUI(query, 'tv');
        
        console.log(`✅ Found ${allSeries.length} TV series for "${query}"`);
        
    } catch (error) {
        console.error("❌ TV search error:", error);
        handleSearchError('tv');
    } finally {
        hideProgress();
    }
}

// ========================================
// HELPER FUNCTIONS - REUSABLE
// ========================================
function showMovieLoading(container) {
    container.innerHTML = `
        <div class="loading-suggestions">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching movies...</p>
        </div>
    `;
    container.style.display = 'block';
}

function showTVLoading(container) {
    container.innerHTML = `
        <div class="loading-suggestions">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching TV series...</p>
        </div>
    `;
    container.style.display = 'block';
}

function showNoMovieResults(container, query) {
    container.innerHTML = `
        <div class="no-suggestions">
            <i class="fas fa-film"></i>
            <h3>No movies found</h3>
            <p>No results for "${query}"</p>
        </div>
    `;
}

function showNoTVResults(container, query) {
    container.innerHTML = `
        <div class="no-suggestions">
            <i class="fas fa-tv"></i>
            <h3>No TV series found</h3>
            <p>No results for "${query}"</p>
        </div>
    `;
}

function showSearchError(container, type) {
    container.innerHTML = `
        <div class="no-suggestions">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Search error</h3>
            <p>Failed to search ${type}</p>
        </div>
    `;
}

function resetToDefaultMovies() {
    currentGenre = 'all';
    currentPage = 1;
    loadAllMovies();
}

function resetToDefaultTV() {
    currentGenre = 'all';
    currentPage = 1;
    loadAllSeries();
}

function positionSuggestions(container) {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    
    const inputRect = searchInput.getBoundingClientRect();
    container.style.top = `${inputRect.bottom + window.scrollY}px`;
    container.style.left = `${inputRect.left + window.scrollX}px`;
    container.style.width = `${inputRect.width}px`;
    container.style.display = 'block';
}

function setupSuggestionHover(container) {
    const items = container.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function setupClickOutsideHandler(container, suggestionsContainer) {
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

function setupMovieKeyboardNavigation(searchInput, suggestionsContainer) {
    searchInput.addEventListener("keydown", (e) => {
        if (!suggestionsContainer.style.display || suggestionsContainer.style.display === 'none') return;
        
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
        let currentIndex = activeItem ? 
            Array.from(items).indexOf(activeItem) : -1;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[currentIndex + 1].classList.add('active');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[currentIndex - 1].classList.add('active');
                }
                break;
                
            case 'Enter':
                if (activeItem) {
                    e.preventDefault();
                    const id = activeItem.dataset.id;
                    goToWatch(id, 'movie');
                }
                break;
                
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
        }
    });
}

function setupTVKeyboardNavigation(searchInput, suggestionsContainer) {
    searchInput.addEventListener("keydown", (e) => {
        if (!suggestionsContainer.style.display || suggestionsContainer.style.display === 'none') return;
        
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
        let currentIndex = activeItem ? 
            Array.from(items).indexOf(activeItem) : -1;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[currentIndex + 1].classList.add('active');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[currentIndex - 1].classList.add('active');
                }
                break;
                
            case 'Enter':
                if (activeItem) {
                    e.preventDefault();
                    const id = activeItem.dataset.id;
                    goToWatchTV(id);
                }
                break;
                
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
        }
    });
}

function updateSearchResultsUI(query, type) {
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        const icon = type === 'movies' ? 'film' : 'tv';
        sectionTitle.innerHTML = `<i class="fas fa-${icon}"></i> ${type === 'movies' ? 'Movies' : 'TV Series'}: "${truncateText(query, 20)}"`;
    }
    
    // Scroll to results
    setTimeout(() => {
        const gridId = type === 'movies' ? 'moviesGrid' : 'seriesGrid';
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 100);
}

function handleSearchError(type) {
    showNotification(`Error searching ${type}, please try again`, 'error');
    if (type === 'movies') {
        allMovies = [];
        displayAllMovies();
    } else {
        allSeries = [];
        displayAllSeries();
    }
    updatePagination();
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// ========================================
// SUGGESTION SELECTION FUNCTIONS
// ========================================
function selectMovieSuggestion(id, title) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = title;
        searchInput.focus();
    }
    
    hideSuggestions('movie');
    showSpecificMovie(id);
}

function selectTVSuggestion(id, title) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = title;
        searchInput.focus();
    }
    
    hideSuggestions('tv');
    showSpecificTV(id);
}

function hideSuggestions(type) {
    const containerId = type === 'movie' ? 'movieSuggestions' : 'tvSuggestions';
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'none';
    }
}

// ========================================
// INITIALIZATION FOR DIFFERENT PAGES
// ========================================
// For Movies Page:
document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on movies page
    const moviesGrid = document.getElementById('moviesGrid');
    if (moviesGrid) {
        setupMovieSearch(); // Movies page
        setupColorFilters();
        loadGenres();
        loadAllMovies();
    }
});

// For TV Page:
document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on TV page
    const seriesGrid = document.getElementById('seriesGrid');
    if (seriesGrid) {
        setupTVSearch(); // TV page
        setupColorFilters();
        loadGenres();
        loadAllSeries();
        loadCarouselSeries();
    }
});

// ========================================
// SEARCH MOVIES WITH SUGGESTIONS - MOVIES ONLY
// ========================================
async function searchMoviesWithSuggestions(query, container) {
    try {
        const encodedQuery = encodeURIComponent(query);
        // Search MOVIES ONLY with English language
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en&query=${encodedQuery}&page=1`;
        
        console.log("🔍 Searching movies:", url);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const movies = data.results || [];
        
        if (movies.length === 0) {
            container.innerHTML = `
                <div class="no-suggestions">
                    <i class="fas fa-film"></i>
                    <h3>No movies found</h3>
                    <p>Try different movie title</p>
                </div>
            `;
            return;
        }
        
        // Get detailed information for each movie
        const detailedMovies = await Promise.all(
            movies.slice(0, 8).map(async (movie) => {
                try {
                    // Get movie details for genres
                    const detailsUrl = `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en`;
                    const detailsRes = await fetch(detailsUrl);
                    
                    if (detailsRes.ok) {
                        const details = await detailsRes.json();
                        return {
                            ...movie,
                            genres: details.genres || [],
                            runtime: details.runtime,
                            status: details.status
                        };
                    }
                    return movie;
                } catch (error) {
                    console.error(`Error fetching details for movie ${movie.id}:`, error);
                    return movie;
                }
            })
        );
        
        // Display movie suggestions with complete info
        displayMovieSuggestions(detailedMovies, query, container);
        
    } catch (error) {
        console.error("❌ Movie search error:", error);
        container.innerHTML = `
            <div class="no-suggestions">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Search error</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// ========================================
// DISPLAY MOVIE SUGGESTIONS WITH COMPLETE INFO
// ========================================
function displayMovieSuggestions(movies, query, container) {
    let html = `
        <div class="suggestion-header">
            <span>Movies (${movies.length})</span>
            <span class="suggestion-count">${movies.length}</span>
        </div>
    `;
    
    movies.forEach(movie => {
        const title = movie.title || movie.original_title || 'No title';
        const year = movie.release_date ? 
            new Date(movie.release_date).getFullYear() : 
            'TBA';
        const rating = movie.vote_average ? 
            movie.vote_average.toFixed(1) : 'N/A';
        
        // Get first 2 genres
        const genres = movie.genres ? 
            movie.genres.slice(0, 2).map(g => g.name).join(', ') : 
            'Movie';
        
        // Runtime in hours and minutes
        const runtime = movie.runtime ? 
            `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 
            '';
        
        const posterUrl = movie.poster_path ? 
            `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 
            `https://via.placeholder.com/92x138/2a2a3a/ffffff?text=🎬`;
        
        const overview = movie.overview ? 
            truncateText(movie.overview, 70) : 
            'No description available';
        
        const isSaved = savedMovies.some(m => m.id === movie.id);
        
        html += `
            <div class="suggestion-item movie-item" 
                 data-id="${movie.id}" 
                 data-title="${title.replace(/"/g, '&quot;')}"
                 onclick="selectMovieSuggestion(${movie.id}, '${title.replace(/'/g, "\\'")}')">
                <div class="suggestion-poster">
                    <img src="${posterUrl}" alt="${title}" loading="lazy">
                    <div class="suggestion-type movie">
                        <i class="fas fa-film"></i>
                    </div>
                </div>
                <div class="suggestion-info">
                    <h4 class="suggestion-title">${title}</h4>
                    <div class="suggestion-details">
                        <span class="suggestion-rating">
                            <i class="fas fa-star"></i> ${rating}
                        </span>
                        <span class="suggestion-year">${year}</span>
                        ${genres ? `<span class="suggestion-genre">${genres}</span>` : ''}
                        ${runtime ? `<span class="suggestion-runtime">${runtime}</span>` : ''}
                    </div>
                    <p class="suggestion-overview">${overview}</p>
                </div>
                <div class="suggestion-action">
                    <button class="suggestion-btn view-btn" 
                            onclick="event.stopPropagation(); goToWatch(${movie.id}, 'movie')">
                        <i class="fas fa-play"></i>
                    </button>
                    
                </div>
            </div>
        `;
    });
    
    // Add view all results button
    html += `
        <div class="suggestion-footer">
            <button class="view-all-results" onclick="performMovieSearch('${query.replace(/'/g, "\\'")}')">
                <i class="fas fa-external-link-alt"></i> View all movies
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Position the container
    const searchInput = document.getElementById("search");
    if (searchInput) {
        const inputRect = searchInput.getBoundingClientRect();
        container.style.top = `${inputRect.bottom + window.scrollY}px`;
        container.style.left = `${inputRect.left + window.scrollX}px`;
        container.style.width = `${inputRect.width}px`;
    }
    
    // Add hover effect
    const items = container.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// ========================================
// PERFORM MOVIE SEARCH (MAIN SEARCH)
// ========================================
async function performMovieSearch(query) {
    if (!query || query.trim().length === 0) return;
    
    try {
        showProgress();
        
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en&query=${encodedQuery}&page=${currentPage}`;
        
        console.log("🔍 Full movie search:", url);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        allMovies = data.results || [];
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        // Display movies
        displayAllMovies();
        updatePagination();
        
        // Update section title
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-search"></i> Movies: "${truncateText(query, 20)}"`;
        }
        
        // Scroll to results
        setTimeout(() => {
            const moviesGrid = document.getElementById('moviesGrid');
            if (moviesGrid) {
                moviesGrid.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
        
        console.log(`✅ Found ${allMovies.length} movies for "${query}"`);
        
    } catch (error) {
        console.error("❌ Movie search error:", error);
        showNotification('Error searching movies, please try again', 'error');
        allMovies = [];
        displayAllMovies();
        updatePagination();
    } finally {
        hideProgress();
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function selectMovieSuggestion(id, title) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = title;
        searchInput.focus();
    }
    
    // Hide suggestions
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
    
    // Show this specific movie
    showSpecificMovie(id);
}

async function showSpecificMovie(id) {
    try {
        showProgress();
        
        // Get movie details
        const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const movie = await res.json();
        
        // Show single movie in grid
        allMovies = [movie];
        displayAllMovies();
        
        // Update section title
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-film"></i> ${movie.title}`;
        }
        
        // Hide pagination
        const pagination = document.getElementById("pagination");
        if (pagination) {
            pagination.style.display = 'none';
        }
        
        console.log(`✅ Displaying movie: ${movie.title}`);
        
    } catch (error) {
        console.error("❌ Error loading movie:", error);
        showNotification('Error loading movie', 'error');
    } finally {
        hideProgress();
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// ========================================
// UPDATE THE ORIGINAL searchMovies FUNCTION
// ========================================
// Replace your old searchMovies function with this:
async function searchMovies(query) {
    // This is now an alias for performMovieSearch
    return performMovieSearch(query);
}

// ========================================
// ADD CSS STYLES FOR MOVIE SUGGESTIONS
// ========================================
// Add this CSS to your stylesheet:
/*
.suggestion-item.movie-item .suggestion-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
}

.suggestion-genre, .suggestion-runtime {
    background: rgba(0, 123, 255, 0.2);
    color: #4DA8DA;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
}

.suggestion-runtime {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
}

.suggestion-type.movie {
    background: linear-gradient(45deg, #2196F3, #03A9F4);
}
*/
async function searchMoviesWithSuggestions(query, container) {
    try {
        const encodedQuery = encodeURIComponent(query);
        // Use language=en for English results
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=en&query=${encodedQuery}&page=1`;
        
        console.log("🔍 Search URL (English):", url);
        
        const res = await fetch(url);
        const data = await res.json();
        
        currentSuggestions = data.results || [];
        
        if (currentSuggestions.length === 0) {
            container.innerHTML = `
                <div class="no-suggestions">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try different keywords</p>
                </div>
            `;
            return;
        }
        
        // Display suggestions in English
        const suggestionsHTML = `
            <div class="suggestion-header">
                <span>Results (${currentSuggestions.length})</span>
                <span class="suggestion-count">${currentSuggestions.length}</span>
            </div>
            ${currentSuggestions.slice(0, 8).map(item => {
                const isMovie = item.media_type === 'movie';
                const title = isMovie ? item.title : item.name;
                const year = isMovie ? 
                    (item.release_date ? new Date(item.release_date).getFullYear() : '') : 
                    (item.first_air_date ? new Date(item.first_air_date).getFullYear() : '');
                
                const poster = item.poster_path ? 
                    `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=92&q=80';
                
                const isSaved = savedMovies.some(m => m.id === item.id);
                
                return `
                    <div class="suggestion-item" 
                         data-id="${item.id}" 
                         data-type="${isMovie ? 'movie' : 'tv'}"
                         onclick="goToWatch(${item.id}, '${isMovie ? 'movie' : 'tv'}')">
                        <div class="suggestion-poster">
                            <img src="${poster}" alt="${title}">
                            <div class="suggestion-type ${isMovie ? 'movie' : 'tv'}">
                                <i class="fas ${isMovie ? 'fa-film' : 'fa-tv'}"></i>
                            </div>
                        </div>
                        <div class="suggestion-info">
                            <h4 class="suggestion-title">${title}</h4>
                            <div class="suggestion-details">
                                <span class="suggestion-rating">
                                    <i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                                </span>
                                ${year ? `<span class="suggestion-year">${year}</span>` : ''}
                            </div>
                            <p class="suggestion-overview">${item.overview ? item.overview.substring(0, 80) + '...' : 'No description available'}</p>
                        </div>
                        <div class="suggestion-action">
                        
                        </div>
                    </div>
                `;
            }).join('')}
            <div class="suggestion-footer">
                <button class="view-all-results" onclick="performFullSearch('${query.replace(/'/g, "\\'")}')">
                    <i class="fas fa-external-link-alt"></i> View all results
                </button>
            </div>
        `;
        
        container.innerHTML = suggestionsHTML;
        
        // Add hover effect
        const items = container.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
    } catch (error) {
        console.error("❌ Search suggestions error:", error);
        container.innerHTML = `
            <div class="no-suggestions">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Search error</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// ========================================
// PERFORM FULL SEARCH - ENGLISH
// ========================================
function performFullSearch(query) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = query;
    }
    
    // Hide suggestions
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
    
    // Perform full search
    searchMovies(query);
}

// ========================================
// SEARCH MOVIES FUNCTION - ENGLISH
// ========================================
async function searchMovies(query) {
    try {
        showProgress();
        
        const encodedQuery = encodeURIComponent(query);
        // Use language=en for English search
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en&query=${encodedQuery}&page=${currentPage}`;
        
        console.log("🔍 Full search (English):", url);
        
        const res = await fetch(url);
        const data = await res.json();

        allMovies = data.results || [];
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updatePagination();

        // Update section title in English
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<i class="fas fa-search"></i> Results: "${query}"`;
        }

        // Scroll to results
        document.getElementById('moviesGrid').scrollIntoView({ 
            behavior: 'smooth' 
        });

    } catch (error) {
        console.error("❌ Search error:", error);
        allMovies = [];
        displayAllMovies();
        updatePagination();
    } finally {
        hideProgress();
    }
}

async function searchMoviesWithSuggestions(query, container) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=ar&query=${encodedQuery}&page=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        currentSuggestions = data.results || [];
        
        if (currentSuggestions.length === 0) {
            container.innerHTML = `
                <div class="no-suggestions">
                    <i class="fas fa-search"></i>
                    <h3>لم يتم العثور على نتائج</h3>
                    <p>حاول استخدام كلمات بحث مختلفة</p>
                </div>
            `;
            return;
        }
        
        // Display suggestions
        const suggestionsHTML = `
            <div class="suggestion-header">
                <span>النتائج (${currentSuggestions.length})</span>
                <span class="suggestion-count">${currentSuggestions.length}</span>
            </div>
            ${currentSuggestions.slice(0, 8).map(item => {
                const isMovie = item.media_type === 'movie';
                const title = isMovie ? item.title : item.name;
                const year = isMovie ? 
                    (item.release_date ? new Date(item.release_date).getFullYear() : '') : 
                    (item.first_air_date ? new Date(item.first_air_date).getFullYear() : '');
                
                const poster = item.poster_path ? 
                    `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=92&q=80';
                
                const isSaved = savedMovies.some(m => m.id === item.id);
                
                return `
                    <div class="suggestion-item" 
                         data-id="${item.id}" 
                         data-type="${isMovie ? 'movie' : 'tv'}"
                         onclick="goToWatch(${item.id}, '${isMovie ? 'movie' : 'tv'}')">
                        <div class="suggestion-poster">
                            <img src="${poster}" alt="${title}">
                            <div class="suggestion-type ${isMovie ? 'movie' : 'tv'}">
                                <i class="fas ${isMovie ? 'fa-film' : 'fa-tv'}"></i>
                            </div>
                        </div>
                        <div class="suggestion-info">
                            <h4 class="suggestion-title">${title}</h4>
                            <div class="suggestion-details">
                                <span class="suggestion-rating">
                                    <i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                                </span>
                                ${year ? `<span class="suggestion-year">${year}</span>` : ''}
                            </div>
                            <p class="suggestion-overview">${item.overview ? item.overview.substring(0, 80) + '...' : ''}</p>
                        </div>
                        <div class="suggestion-action">
                           
                        </div>
                    </div>
                `;
            }).join('')}
            <div class="suggestion-footer">
                <button class="view-all-results" onclick="performFullSearch('${query.replace(/'/g, "\\'")}')">
                    <i class="fas fa-external-link-alt"></i> عرض جميع النتائج
                </button>
            </div>
        `;
        
        container.innerHTML = suggestionsHTML;
        
        // Add hover effect
        const items = container.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
    } catch (error) {
        console.error("❌ Search suggestions error:", error);
        container.innerHTML = `
            <div class="no-suggestions">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>خطأ في البحث</h3>
                <p>حاول مرة أخرى لاحقاً</p>
            </div>
        `;
    }
}

function performFullSearch(query) {
    const searchInput = document.getElementById("search");
    searchInput.value = query;
    
    // Hide suggestions
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
    
    // Perform full search
    searchMovies(query);
}

async function searchMovies(query) {
    try {
        showProgress();
        
        const encodedQuery = encodeURIComponent(query);
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en&query=${encodedQuery}&page=${currentPage}`;
        
        const res = await fetch(url);
        const data = await res.json();

        allMovies = data.results || [];
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updatePagination();

        // Scroll to results
        document.getElementById('moviesGrid').scrollIntoView({ 
            behavior: 'smooth' 
        });

    } catch (error) {
        console.error("❌ Search error:", error);
        allMovies = [];
        displayAllMovies();
        updatePagination();
    } finally {
        hideProgress();
    }
}

async function searchMovies(query) {
    try {
        showProgress();
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}&page=${currentPage}`;
        const res = await fetch(url);
        const data = await res.json();

        allMovies = data.results;
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllMovies();
        updatePagination();

        console.log(`🔍 Found ${data.results.length} results for "${query}"`);

    } catch (error) {
        console.error("❌ Search error:", error);
        allMovies = [];
        displayAllMovies();
        updatePagination();
    } finally {
        hideProgress();
    }
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
        console.log(`❤️ Saved: ${title}`);
    } else {
        savedMovies.splice(index, 1);
        if (btn) {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove("saved");
        }
        console.log(`💔 Removed: ${title}`);
    }
    
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
    
    showNotification(index === -1 ? `تمت إضافة "${title}" إلى المفضلة` : `تمت إزالة "${title}" من المفضلة`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas ${message.includes('إضافة') ? 'fa-heart' : 'fa-times'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #CF0A0A, #DC5F00);
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
    
    const style = document.createElement('style');
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
// PLAYER FUNCTIONALITY
// ========================================
// PLAYER FUNCTIONALITY
// ========================================
function playMovie(id) {
    // الانتقال إلى صفحة المشاهدة مع معرف الفيلم
    window.location.href = `watch.html?id=${id}&type=movie`;
    
    // يمكنك إظهار رسالة تحميل
    showNotification(`جاري تحميل الفيلم...`);
}

// أو إذا كان لديك زر التشغيل في الكاروسيل
function playCurrentMovie() {
    // احصل على معرف الفيلم الحالي في الكاروسيل
    const currentId = carouselMovies[currentCarouselIndex]?.id;
    if (currentId) {
        window.location.href = `watch.html?id=${currentId}&type=movie`;
    }
}

function showAllMovies() {
    currentGenre = 'all';
    currentPage = 1;
    loadAllMovies();
    
    // Scroll to all movies section
    document.getElementById('moviesGrid').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// PROGRESS BAR
// ========================================
function showProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) { 
        bar.style.display = "block"; 
        bar.style.transform = "scaleX(0)"; 
        setTimeout(() => {
            bar.style.transform = "scaleX(0.7)";
        }, 10);
    }
}

function hideProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) { 
        bar.style.transform = "scaleX(1)"; 
        setTimeout(() => { 
            bar.style.display = "none"; 
        }, 500);
    }
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================
window.playMovie = playMovie;
window.toggleSave = toggleSave;
window.showAllMovies = showAllMovies;
window.goToPage = goToPage;
// ========================================
// CAROUSEL HELPER FUNCTIONS
// ========================================
function getGenreName(genreId) {
    if (!genres || genres.length === 0) return 'فيلم';
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : 'فيلم';
}

function showProgress() {
    // موجودة بالفعل في api.js
}

function hideProgress() {
    // موجودة بالفعل في api.js
}

function showNotification(message) {
    // موجودة بالفعل في api.js
}function goToWatch(id, type = "movie") {
    window.location.href = `watch.html?id=${id}&type=${type}`;
}

let moreBtn = document.querySelector('.more-filters-btn');
let dropdown = document.getElementById('filtersDropdown');

moreBtn.addEventListener('click', () => {
  dropdown.classList.toggle('show');
});
