// ========================================
// TMDB API CONFIGURATION
// ========================================
const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";

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
            { id: 28, name: 'أكشن' },
            { id: 12, name: 'مغامرة' },
            { id: 16, name: 'رسوم متحركة' },
            { id: 35, name: 'كوميديا' },
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
            url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=${currentPage}`;
        } else {
            // Load movies by genre
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar&with_genres=${currentGenre}&page=${currentPage}`;
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
            <p class="movie-description">${overview}</p>
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
            // Reset to normal view
            currentGenre = 'all';
            currentPage = 1;
            loadAllMovies();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchMovies(query);
        }, 500);
    });
    
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                searchMovies(query);
            }
        });
    }
    
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                searchMovies(query);
            }
        }
    });
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
