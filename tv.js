// ========================================
// TV PAGE - COMPLETE WORKING CODE
// ========================================

// API Configuration
const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";

// State Management
let savedSeries = JSON.parse(localStorage.getItem("savedSeries")) || [];
let currentGenre = 'all';
let currentPage = 1;
let totalPages = 1;
let allSeries = [];
let carouselSeries = [];
let genres = [];
let currentColorFilter = 'black';

// Scroll management
let tvLastScrollTop = 0; // Changed name to avoid conflict
let carouselPosition = 0;
const CAROUSEL_CARD_WIDTH = 280 + 24;

// Extended filters
let visibleFilterCount = 8;
let isFiltersExpanded = false;

// ========================================
// PAGE INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("📺 Tomito TV - Initializing...");
    setupColorFilters();
    setupSearch();
    setupThemeToggle();
    setupLogoAnimation();
    setupScrollHide();
    loadGenres();
    loadCarouselSeries();
    loadAllSeries();
    
    // Close dropdown when clicking outside
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
// SCROLL HIDE FUNCTIONALITY (TV VERSION)
// ========================================
function setupScrollHide() {
    let ticking = false;
    let lastScrollY = window.scrollY;
    
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

// ========================================
// LOGO ANIMATION
// ========================================
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
// COLOR FILTERS
// ========================================
function setupColorFilters() {
    const filterButtons = document.querySelectorAll('.color-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentColorFilter = this.getAttribute('data-color');
            applyColorTheme(currentColorFilter);
        });
    });
}

function applyColorTheme(color) {
    switch(color) {
        case 'red':
            document.documentElement.style.setProperty('--primary-color', '#CF0A0A');
            break;
        case 'orange':
            document.documentElement.style.setProperty('--primary-color', '#DC5F00');
            break;
        case 'gray':
            document.documentElement.style.setProperty('--primary-color', '#EEEEEE');
            break;
        default:
            document.documentElement.style.setProperty('--primary-color', '#000000');
    }
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
// LOAD GENRES
// ========================================
async function loadGenres() {
    try {
        const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=ar`;
        const res = await fetch(url);
        const data = await res.json();
        genres = data.genres;
        setupExtendedFilters();
    } catch (error) {
        console.error("❌ Error loading TV genres:", error);
        genres = [
            { id: 10759, name: 'أكشن ومغامرة' },
            { id: 35, name: 'كوميديا' },
            { id: 18, name: 'دراما' },
            { id: 10765, name: 'خيال علمي' },
            { id: 9648, name: 'غموض' },
            { id: 10762, name: 'أطفال' },
            { id: 80, name: 'جريمة' },
            { id: 99, name: 'وثائقي' }
        ];extended-filters-container
        setupExtendedFilters();
    }
}

// ========================================
// SETUP EXTENDED FILTERS
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
    
    // Add visible genres
    genres.slice(0, visibleFilterCount - 1).forEach(genre => {
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
        moreButton.innerHTML = '<i class="fas fa-chevron-down"></i> المزيد';
        moreButton.onclick = toggleMoreFilters;
        filtersGrid.appendChild(moreButton);
        
        genres.slice(visibleFilterCount - 1).forEach(genre => {
            const button = document.createElement('button');
            button.className = 'extended-filter-btn';
            button.textContent = genre.name;
            button.setAttribute('data-genre', genre.id);
            button.onclick = () => {
                filterByGenre(genre.id);
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
    const buttons = document.querySelectorAll('.extended-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.extended-filter-btn[data-genre="${genreId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    } else {
        document.querySelector('.extended-filter-btn[data-genre="all"]').classList.add('active');
    }
    
    currentGenre = genreId;
    currentPage = 1;
    loadAllSeries();
}

// ========================================
// LOAD CAROUSEL SERIES
// ========================================
async function loadCarouselSeries() {
    try {
        showProgress();
        const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        carouselSeries = data.results.slice(0, 10);
        renderCarousel();
    } catch (error) {
        console.error("❌ Error loading carousel series:", error);
        carouselSeries = getFallbackSeries();
        renderCarousel();
    } finally {
        hideProgress();
    }
}

function renderCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    carouselTrack.innerHTML = '';
    
    carouselSeries.forEach(series => {
        const card = createCarouselCard(series);
        carouselTrack.appendChild(card);
    });
}

function createCarouselCard(series) {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    
    const posterUrl = series.backdrop_path ? IMG_URL + series.backdrop_path : 
                     series.poster_path ? IMG_500 + series.poster_path : 
                     'https://images.unsplash.com/photo-1560972550-aba3456b5564?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';
    const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'مستمر';
    const rating = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${series.name}" loading="lazy">
        <div class="carousel-overlay">
            <h3 class="carousel-card-title">${series.name}</h3>
            <div class="carousel-card-info">
                <span class="carousel-rating">
                    <i class="fas fa-star"></i> ${rating}/10
                </span>
                <span class="carousel-year">${releaseYear}</span>
            </div>
            <div class="carousel-card-btns">
                <button class="carousel-play-btn" onclick="playSeries(${series.id})">
                    <i class="fas fa-play"></i> شاهد الآن
                </button>
                <button class="carousel-save-btn" onclick="toggleSave(${series.id}, '${series.name.replace(/'/g, "\\'")}', '${series.poster_path}', ${series.vote_average}, this)">
                    <i class="far fa-heart"></i>
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
// LOAD ALL SERIES
// ========================================
async function loadAllSeries() {
    try {
        showProgress();
        let url;
        
        if (currentGenre === 'all') {
            url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar&page=${currentPage}`;
        } else {
            url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar&with_genres=${currentGenre}&page=${currentPage}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        allSeries = data.results;
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllSeries();
        updatePagination();
    } catch (error) {
        console.error("❌ Error loading series:", error);
        allSeries = [];
        displayAllSeries();
        updatePagination();
    } finally {
        hideProgress();
    }
}

function displayAllSeries() {
    const container = document.getElementById("seriesGrid");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!allSeries || allSeries.length === 0) {
        container.innerHTML = '<div class="no-movies">لم يتم العثور على مسلسلات</div>';
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
    const title = series.name || "مسلسل بدون عنوان";
    const rating = series.vote_average ? series.vote_average.toFixed(1) : "غير معروف";
    const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : "مستمر";
    
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
                    <i class="fas fa-play"></i> شاهد
                </button>
               
            </div>
        </div>
    `;
    return card;
}

// ========================================
// PAGINATION
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
    
    // First page
    const firstPage = document.createElement("button");
    firstPage.className = `page-link ${currentPage === 1 ? 'active cursor-normal' : 'cursor-pointer'}`;
    firstPage.textContent = "1";
    if (currentPage !== 1) firstPage.onclick = () => goToPage(1);
    pagination.appendChild(firstPage);
    
    // Pages around current
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === 1 || i === totalPages) continue;
        
        const pageButton = document.createElement("button");
        pageButton.className = `page-link ${i === currentPage ? 'active cursor-normal' : 'cursor-pointer'}`;
        pageButton.textContent = i;
        if (i !== currentPage) pageButton.onclick = () => goToPage(i);
        pagination.appendChild(pageButton);
    }
    
    // Last page
    if (totalPages > 1) {
        const lastPage = document.createElement("button");
        lastPage.className = `page-link ${currentPage === totalPages ? 'active cursor-normal' : 'cursor-pointer'}`;
        lastPage.textContent = totalPages;
        if (currentPage !== totalPages) lastPage.onclick = () => goToPage(totalPages);
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
    loadAllSeries();
    
    window.scrollTo({
        top: document.getElementById('seriesGrid').offsetTop - 100,
        behavior: 'smooth'
    });
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
function setupSearch() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            currentGenre = 'all';
            currentPage = 1;
            loadAllSeries();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchSeries(query);
        }, 500);
    });
    
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length >= 2) searchSeries(query);
        });
    }
    
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length >= 2) searchSeries(query);
        }
    });
}

async function searchSeries(query) {
    try {
        showProgress();
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}&page=${currentPage}`;
        const res = await fetch(url);
        const data = await res.json();

        allSeries = data.results;
        totalPages = data.total_pages > 500 ? 500 : data.total_pages;
        
        displayAllSeries();
        updatePagination();
    } catch (error) {
        console.error("❌ Search error:", error);
        allSeries = [];
        displayAllSeries();
        updatePagination();
    } finally {
        hideProgress();
    }
}

// ========================================
// SAVE FUNCTIONALITY
// ========================================
function toggleSave(id, title, posterPath, rating, btn) {
    const series = { 
        id, 
        title, 
        poster_path: posterPath, 
        vote_average: rating,
        saved_date: new Date().toISOString()
    };
    
    const index = savedSeries.findIndex(s => s.id === id);
    if (index === -1) {
        savedSeries.push(series);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add("saved");
        }
    } else {
        savedSeries.splice(index, 1);
        if (btn) {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove("saved");
        }
    }
    
    localStorage.setItem("savedSeries", JSON.stringify(savedSeries));
    
    showNotification(index === -1 ? `تمت إضافة "${title}" إلى المفضلة` : `تمت إزالة "${title}" من المفضلة`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `<span>${message}</span>`;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #CF0A0A, #DC5F00);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
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
function playSeries(id) {
    goToWatchTV(id);
}

function showAllSeries() {
    currentGenre = 'all';
    currentPage = 1;
    loadAllSeries();
    
    document.getElementById('seriesGrid').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// PROGRESS BAR
// ========================================
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

// ========================================
// UTILITY FUNCTIONS
// ========================================
function getFallbackSeries() {
    return [
        { 
            id: 1, 
            name: "لعبة الحبار", 
            backdrop_path: null,
            poster_path: null,
            vote_average: 8.2, 
            first_air_date: "2021-09-17"
        },
        { 
            id: 2, 
            name: "صراع العروش", 
            backdrop_path: null,
            poster_path: null,
            vote_average: 8.4, 
            first_air_date: "2011-04-17"
        }
    ];
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================
window.playSeries = playSeries;
window.toggleSave = toggleSave;
window.scrollCarousel = scrollCarousel;
window.showAllSeries = showAllSeries;
window.goToPage = goToPage;// ========================================
// AUTOSUGGEST SEARCH - NEW FEATURE
// ========================================

let searchSuggestions = [];
let searchTimeout;
let currentSearchQuery = '';

function setupAutosuggestSearch() {
    const searchInput = document.getElementById("search");
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'search-suggestions';
    suggestionsContainer.className = 'search-suggestions';
    searchInput.parentNode.appendChild(suggestionsContainer);

    // Handle input with autosuggest
    searchInput.addEventListener("input", async (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        currentSearchQuery = query;

        if (query.length === 0) {
            hideSuggestions();
            return;
        }

        if (query.length === 1) {
            // Show loading for single character
            showLoadingSuggestions();
            searchTimeout = setTimeout(() => {
                fetchSuggestionsByFirstLetter(query);
            }, 300);
        } else if (query.length >= 2) {
            // Normal search for 2+ characters
            searchTimeout = setTimeout(() => {
                performAutosuggestSearch(query);
            }, 500);
        }
    });

    // Handle focus
    searchInput.addEventListener("focus", () => {
        if (currentSearchQuery.length > 0 && searchSuggestions.length > 0) {
            showSuggestions();
        }
    });

    // Handle click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });

    // Handle key navigation
    searchInput.addEventListener("keydown", (e) => {
        const suggestions = document.querySelectorAll('.suggestion-item');
        const activeSuggestion = document.querySelector('.suggestion-item.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateSuggestions('down', suggestions, activeSuggestion);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSuggestions('up', suggestions, activeSuggestion);
        } else if (e.key === 'Enter' && activeSuggestion) {
            e.preventDefault();
            selectSuggestion(activeSuggestion);
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
}

async function fetchSuggestionsByFirstLetter(letter) {
    try {
        showProgress();
        
        // Search for series starting with this letter
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=ar&query=${letter}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        // Also get popular series for fallback
        const popularUrl = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar&page=1`;
        const popularRes = await fetch(popularUrl);
        const popularData = await popularRes.json();
        
        // Combine and filter by first letter
        const allSeries = [...data.results, ...popularData.results];
        const filteredSeries = allSeries.filter(series => {
            const title = series.name || series.original_name || '';
            return title.toLowerCase().startsWith(letter.toLowerCase());
        });
        
        // Remove duplicates
        const uniqueSeries = [...new Map(filteredSeries.map(item => [item.id, item])).values()];
        
        searchSuggestions = uniqueSeries.slice(0, 10); // Limit to 10 suggestions
        displaySuggestions(searchSuggestions, `مسلسلات تبدأ بـ "${letter}"`);
        
    } catch (error) {
        console.error("❌ Error fetching suggestions:", error);
        hideSuggestions();
    } finally {
        hideProgress();
    }
}

async function performAutosuggestSearch(query) {
    try {
        showProgress();
        
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        searchSuggestions = data.results.slice(0, 8); // Limit to 8 suggestions
        displaySuggestions(searchSuggestions, `نتائج لـ "${query}"`);
        
    } catch (error) {
        console.error("❌ Error in autosuggest search:", error);
        hideSuggestions();
    } finally {
        hideProgress();
    }
}

function displaySuggestions(suggestions, title = 'نتائج البحث') {
    const container = document.getElementById('search-suggestions');
    if (!container) return;
    
    if (!suggestions || suggestions.length === 0) {
        container.innerHTML = `
            <div class="suggestion-header">
                <span>${title}</span>
            </div>
            <div class="no-suggestions">
                <i class="fas fa-search"></i>
                <span>لا توجد نتائج</span>
            </div>
        `;
        showSuggestions();
        return;
    }
    
    let html = `
        <div class="suggestion-header">
            <span>${title}</span>
            <span class="suggestion-count">${suggestions.length} نتيجة</span>
        </div>
    `;
    
    suggestions.forEach((series, index) => {
        const posterUrl = series.poster_path ? 
            `https://image.tmdb.org/t/p/w92${series.poster_path}` : 
            'https://via.placeholder.com/92x138/333/fff?text=No+Image';
        
        const rating = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';
        const year = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'مستمر';
        
        html += `
            <div class="suggestion-item" data-id="${series.id}" data-title="${series.name}">
                <div class="suggestion-poster">
                    <img src="${posterUrl}" alt="${series.name}" loading="lazy">
                </div>
                <div class="suggestion-info">
                    <h4 class="suggestion-title">${series.name}</h4>
                    <div class="suggestion-details">
                        <span class="suggestion-rating">
                            <i class="fas fa-star"></i> ${rating}
                        </span>
                        <span class="suggestion-year">${year}</span>
                    </div>
                </div>
                <div class="suggestion-action">
                    <button class="suggestion-btn" onclick="selectSuggestionById(${series.id}, '${series.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    showSuggestions();
    
    // Add hover events
    const suggestionItems = container.querySelectorAll('.suggestion-item');
    suggestionItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            suggestionItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
        
        item.addEventListener('click', () => {
            selectSuggestion(item);
        });
    });
}

function showLoadingSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (!container) return;
    
    container.innerHTML = `
        <div class="suggestion-header">
            <span>جاري البحث...</span>
        </div>
        <div class="loading-suggestions">
            <i class="fas fa-spinner fa-spin"></i>
            <span>جاري تحميل الاقتراحات</span>
        </div>
    `;
    showSuggestions();
}

function showSuggestions() {
    const container = document.getElementById('search-suggestions');
    const searchInput = document.getElementById("search");
    
    if (!container || !searchInput) return;
    
    container.style.display = 'block';
    
    // Position below search input
    const inputRect = searchInput.getBoundingClientRect();
    container.style.top = `${inputRect.bottom + window.scrollY}px`;
    container.style.left = `${inputRect.left + window.scrollX}px`;
    container.style.width = `${inputRect.width}px`;
}

function hideSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container) {
        container.style.display = 'none';
    }
}

function navigateSuggestions(direction, suggestions, activeSuggestion) {
    if (suggestions.length === 0) return;
    
    let nextIndex = 0;
    
    if (activeSuggestion) {
        const currentIndex = Array.from(suggestions).indexOf(activeSuggestion);
        if (direction === 'down') {
            nextIndex = (currentIndex + 1) % suggestions.length;
        } else {
            nextIndex = (currentIndex - 1 + suggestions.length) % suggestions.length;
        }
    }
    
    suggestions.forEach(s => s.classList.remove('active'));
    suggestions[nextIndex].classList.add('active');
    
    // Scroll into view
    suggestions[nextIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
    });
}

function selectSuggestion(suggestionElement) {
    const id = suggestionElement.dataset.id;
    const title = suggestionElement.dataset.title;
    
    // Fill search input with selected title
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = title;
        searchInput.focus();
    }
    
    // Perform search for this specific series
    searchSeries(title);
    hideSuggestions();
}

function selectSuggestionById(id, title) {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.value = title;
    }
    
    // Show this specific series
    showSeriesById(id);
    hideSuggestions();
}

async function showSeriesById(id) {
    try {
        showProgress();
        
        const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=ar`;
        const res = await fetch(url);
        const series = await res.json();
        
        // Show single series
        allSeries = [series];
        displayAllSeries();
        
        // Update title
        const titleEl = document.querySelector(".section-title");
        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-search"></i> ${series.name}`;
        }
        
        // Hide pagination
        const pagination = document.getElementById("pagination");
        if (pagination) {
            pagination.style.display = 'none';
        }
        
        console.log(`✅ Loaded series: ${series.name}`);
    } catch (error) {
        console.error("❌ Error loading series by ID:", error);
    } finally {
        hideProgress();
    }
}

// ========================================
// UPDATE INITIALIZATION FUNCTION
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("📺 Tomito TV - Initializing...");
    setupColorFilters();
    setupSearch();
    setupAutosuggestSearch(); // NEW: Add autosuggest
    setupThemeToggle();
    setupLogoAnimation();
    setupScrollHide();
    loadGenres();
    loadCarouselSeries();
    loadAllSeries();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('filtersDropdown');
        const moreBtn = document.querySelector('.more-filters-btn');
        const suggestions = document.getElementById('search-suggestions');
        const searchInput = document.getElementById("search");
        
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
        if (suggestions && searchInput &&
            !suggestions.contains(e.target) && 
            !searchInput.contains(e.target)) {
            hideSuggestions();
        }
    });
});function goToWatchTV(id) {
    window.location.href = `watch-tv.html?id=${id}`;
}
