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
let currentPage = {
    'new-movies': 1,
    'trending-movies': 1,
    'latest-movies': 1,
    'upcoming-movies': 1
};

// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 تهيئة الصفحة...");
    initPage();
});

function initPage() {
    console.log("⚙️ بدء تحميل الصفحة الرئيسية");
    setupSearch();
    updateWatchlistCounter();
    loadAllSections();
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
            loadAllSections();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchMovies(query);
        }, 500);
    });
}
async function searchMovies(query) {
    try {
        showProgress();
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`;
        const res = await fetch(url);
        const data = await res.json();

        const moviesWithArabicOverview = await Promise.all(
            data.results.map(movie => fetchMovieWithArabicOverview(movie))
        );

        displayMovies(moviesWithArabicOverview, "new-movies", true);
        const titleEl = document.querySelector("#new-movies").parentNode.querySelector(".section-title");
        if (titleEl) titleEl.innerHTML = `<i class="fas fa-search"></i> نتائج البحث: "${query}"`;

    } catch (error) {
        console.error("❌ خطأ في البحث:", error);
    } finally {
        hideProgress();
    }
}


// ========================================
// LOAD ALL SECTIONS
// ========================================

async function loadAllSections() {
    try {
        showProgress();
        console.log("📺 بدء تحميل جميع الأقسام...");
        
        await Promise.all([
            loadNewMovies(),
            loadTrendingMovies(),
            loadLatestMovies(),
            loadUpcomingMovies()
        ]);
        
        console.log("✅ تم تحميل جميع الأقسام بنجاح");
    } catch (error) {
        console.error("❌ خطأ في تحميل الأقسام:", error);
    } finally {
        hideProgress();
    }
}

// ========================================
// LOAD MOVIE SECTIONS
// ========================================
async function loadNewMovies() {
    try {
        currentPage['new-movies'] = 1;
        const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;
        const res = await fetch(url);
        const data = await res.json();

        // جلب الوصف العربي لكل فيلم
        const moviesWithArabicOverview = await Promise.all(
            data.results.slice(0, 10).map(movie => fetchMovieWithArabicOverview(movie))
        );

        displayMovies(moviesWithArabicOverview, "new-movies");
    } catch (error) {
        console.error("❌ خطأ في تحميل الأفلام الجديدة:", error);
    }
}

async function loadTrendingMovies() {
    try {
        console.log("🔥 تحميل الأفلام الشائعة...");
        currentPage['trending-movies'] = 1;
        const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en`;
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results.slice(0, 10), "trending-movies");
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} فيلم شائع`);
    } catch (error) {
        console.error("❌ خطأ في تحميل الأفلام الشائعة:", error);
    }
}

async function loadLatestMovies() {
    try {
        console.log("⭐ تحميل أحدث الأفلام...");
        currentPage['latest-movies'] = 1;
        const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results.slice(0, 10), "latest-movies");
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} فيلم من أحدث الأفلام`);
    } catch (error) {
        console.error("❌ خطأ في تحميل أحدث الأفلام:", error);
    }
}

async function loadUpcomingMovies() {
    try {
        console.log("📅 تحميل الأفلام القادمة...");
        currentPage['upcoming-movies'] = 1;
        const url = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results.slice(0, 10), "upcoming-movies");
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} فيلم قادم`);
    } catch (error) {
        console.error("❌ خطأ في تحميل الأفلام القادمة:", error);
    }
}

// ========================================
// LOAD MORE MOVIES
// ========================================

async function loadMoreMovies(containerId, type) {
    try {
        showProgress();
        currentPage[containerId]++;
        const page = currentPage[containerId];
        
        let url;
        switch(type) {
            case 'now_playing':
                url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en&page=${page}`;
                break;
            case 'trending':
                url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en&page=${page}`;
                break;
            case 'popular':
                url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            case 'upcoming':
                url = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            default:
                url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=${page}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.results.length > 0) {
            displayMoreMovies(data.results, containerId);
            console.log(`✅ تم تحميل ${data.results.length} أفلام إضافية`);
        } else {
            const btn = document.querySelector(`#${containerId} + .more-btn`);
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> لا توجد أفلام أكثر';
                btn.disabled = true;
            }
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل المزيد:", error);
    } finally {
        hideProgress();
    }
}

// ========================================
// DISPLAY MOVIES
// ========================================

function displayMovies(movies, containerId, isSearch = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (isSearch || currentPage[containerId] === 1) container.innerHTML = "";
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="no-movies">لا توجد أفلام</div>';
        return;
    }
    
    movies.forEach(movie => container.appendChild(createMovieCard(movie)));
}

function displayMoreMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !movies || movies.length === 0) return;
    movies.slice(0, 10).forEach(movie => container.appendChild(createMovieCard(movie)));
}

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterUrl = movie.poster_path ? IMG_500 + movie.poster_path : "https://via.placeholder.com/300x450";
    const title = movie.title || "بدون عنوان";
    const overview = movie.overview || "لا يوجد وصف";  // ديما عربي
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
            </div>
            <p class="movie-description">${overview}</p>
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="playMovie(${movie.id})">
                    <i class="fas fa-play"></i> مشاهدة
                </button>
            </div>
        </div>
    `;
    return card;
}


// ========================================
// WATCHLIST FUNCTIONS
// ========================================

function showWatchlist() {
    const container = document.getElementById("new-movies");
    const title = document.querySelector("#new-movies").parentNode.querySelector(".section-title");
    
    if (savedMovies.length === 0) {
        container.innerHTML = `<div class="no-movies"><h3>القائمة المحفوظة فارغة</h3></div>`;
        title.innerHTML = '<i class="fas fa-bookmark"></i> المحفوظات';
        return;
    }
    
    title.innerHTML = '<i class="fas fa-bookmark"></i> المحفوظات';
    displayMovies(savedMovies, "new-movies");
}

function updateWatchlistCounter() {
    const watchlistCount = document.getElementById("watchlistCount");
    if (!watchlistCount) return;
    if (savedMovies.length > 0) {
        watchlistCount.textContent = savedMovies.length;
        watchlistCount.classList.add("show");
    } else {
        watchlistCount.classList.remove("show");
    }
}

function toggleSave(id, title, posterPath, rating, btn) {
    const movie = { id, title, poster_path: posterPath, vote_average: rating };
    const index = savedMovies.findIndex(m => m.id === id);
    if (index === -1) {
        savedMovies.push(movie);
        btn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        btn.classList.add("saved");
    } else {
        savedMovies.splice(index, 1);
        btn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        btn.classList.remove("saved");
    }
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
    updateWatchlistCounter();
}

// ========================================
// PLAYER
// ========================================

function playMovie(id) {
    showProgress();
    setTimeout(() => { window.location.href = "watch.html?id=" + id; }, 300);
}

// ========================================
// PROGRESS BAR
// ========================================

function showProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) { bar.style.display = "block"; bar.style.transform = "scaleX(0)"; }
}

function hideProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) { bar.style.transform = "scaleX(1)"; setTimeout(() => { bar.style.display = "none"; }, 300); }
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.playMovie = playMovie;
window.toggleSave = toggleSave;
window.loadMoreMovies = loadMoreMovies;
window.showWatchlist = showWatchlist;
async function fetchMovieWithArabicOverview(movie) {
    const englishTitle = movie.title || movie.original_title || "No Title";
    let arabicOverview = "لا يوجد وصف";

    try {
        const arabicRes = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=ar`);
        const arabicData = await arabicRes.json();
        if (arabicData.overview) arabicOverview = arabicData.overview;
    } catch (error) {
        console.error(`❌ خطأ جلب الوصف العربي للفيلم ${englishTitle}:`, error);
    }

    return {
        ...movie,
        title: englishTitle,      // العنوان يبقى بالإنجليزية
        overview: arabicOverview  // الوصف بالعربية
    };
}
