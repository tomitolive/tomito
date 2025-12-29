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

let bannerMovies = [];
let currentBannerIndex = 0;
let bannerInterval;
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
        console.log(`🔍 البحث عن: ${query}`);
        
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        // Hide more buttons
        document.querySelectorAll('.more-btn').forEach(btn => btn.style.display = 'none');
        
        // Show search results
        displayMovies(data.results, "new-movies", true);
        
        // Update title
        const titleEl = document.querySelector("#new-movies").parentNode.querySelector(".section-title");
        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-search"></i> نتائج البحث: "${query}"`;
        }
        
        console.log(`✅ وجدنا ${data.results.length} نتيجة`);
    } catch (error) {
        console.error("❌ خطأ في البحث:", error);
    } finally {
        hideProgress();
    }
}

// ========================================
// GENRE BASED LOADING
// ========================================

async function loadMoviesByGenre(genreId) {
    try {
        showProgress();
        console.log(`🎬 تحميل أفلام التصنيف: ${genreId}`);
        
        let url;
        
        if (!genreId || genreId === "") {
            url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ar&page=1`;
        } else {
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        const container = document.getElementById("new-movies");
        const title = document.querySelector("#new-movies").parentNode.querySelector(".section-title");
        
        // Update title
        if (genreId && genreId !== "") {
            const movieGenres = window.movieGenres || [];
            const genre = movieGenres.find(g => g.id === genreId);
            const genreName = genre ? genre.name : "غير معروف";
            title.innerHTML = `<i class="${genre?.icon || 'fas fa-film'}"></i> أفلام ${genreName}`;
        } else {
            title.innerHTML = '<i class="fas fa-sparkles"></i> أفلام جديدة';
        }
        
        // Display movies
        if (data.results.length === 0) {
            container.innerHTML = '<div class="no-movies">لا توجد أفلام في هذا التصنيف</div>';
        } else {
            displayMovies(data.results.slice(0, 10), "new-movies");
        }
        
        // Update more button
        const moreBtn = container.nextElementSibling;
        if (moreBtn && moreBtn.classList.contains('more-btn')) {
            if (genreId && genreId !== "") {
                moreBtn.innerHTML = `<i class="fas fa-plus-circle"></i> المزيد من هذا التصنيف`;
                moreBtn.onclick = () => loadMoreGenreMovies(genreId, 'new-movies');
            } else {
                moreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> المزيد من الأفلام الجديدة';
                moreBtn.onclick = () => loadMoreMovies('new-movies', 'now_playing');
            }
        }
        
        console.log(`✅ تم تحميل ${data.results.length} أفلام`);
    } catch (error) {
        console.error("❌ خطأ في تحميل أفلام التصنيف:", error);
    } finally {
        hideProgress();
    }
}

async function loadMoreGenreMovies(genreId, containerId) {
    try {
        showProgress();
        
        currentPage[containerId] = (currentPage[containerId] || 0) + 1;
        const page = currentPage[containerId];
        
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
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
// LOAD ALL SECTIONS
// ========================================

async function loadAllSections() {
    try {
        showProgress();
        console.log("📺 بدء تحميل جميع الأقسام...");
        
        await Promise.all([
            loadBanner(),
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
// BANNER SECTION
// ========================================

async function loadBanner() {
    try {
        console.log("🎬 تحميل البانر...");
        
        const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        bannerMovies = data.results.filter(m => m.backdrop_path).slice(0, 5);
        setupBanner(bannerMovies);
        
        console.log(`✅ تم تحميل ${bannerMovies.length} أفلام للبانر`);
    } catch (error) {
        console.error("❌ خطأ في تحميل البانر:", error);
    }
}

function setupBanner(movies) {
    const container = document.getElementById("banner-container");
    const indicators = document.getElementById("banner-indicators");
    
    if (!container || !indicators) return;
    
    // تنظيف الحاويات
    container.innerHTML = "";
    indicators.innerHTML = "";
    
    // إذا لم توجد أفلام
    if (!movies || movies.length === 0) {
        container.innerHTML = `
            <div class="banner-card active" style="opacity: 1; z-index: 2;">
                <img src="https://via.placeholder.com/1280x500/222/fff?text=لا+توجد+أفلام" alt="لا توجد أفلام">
                <div class="banner-overlay">
                    <h2>لا توجد أفلام متاحة</h2>
                    <p>يرجى المحاولة لاحقاً</p>
                </div>
            </div>
        `;
        return;
    }
    
    // إضافة البطاقات
    movies.forEach((movie, index) => {
        const card = document.createElement("div");
        card.className = `banner-card ${index === 0 ? "active" : ""}`;
        
        // تطبيق الـ CSS مباشرة
        card.style.position = 'absolute';
        card.style.top = '0';
        card.style.left = '0';
        card.style.width = '100%';
        card.style.height = '100%';
        card.style.opacity = index === 0 ? '1' : '0';
        card.style.zIndex = index === 0 ? '2' : '1';
        card.style.transition = 'opacity 0.5s ease';
        
        const isSaved = savedMovies.some(m => m.id === movie.id);
        const backdropUrl = movie.backdrop_path ? IMG_URL + movie.backdrop_path : 
                          "https://via.placeholder.com/1280x500/333/fff?text=No+Image";
        const title = movie.title || "بدون عنوان";
        const overview = movie.overview ? movie.overview.substring(0, 200) + "..." : "لا يوجد وصف";
        
        // تنظيف النص
        const cleanTitle = title.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const cleanPosterPath = (movie.poster_path || "").replace(/'/g, "\\'");
        
        card.innerHTML = `
            <img src="${backdropUrl}" alt="${title}" style="width:100%;height:100%;object-fit:cover;">
            <div class="banner-overlay">
                <h2>${title}</h2>
                <p>${overview}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="playMovie(${movie.id})">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                    <button class="banner-save-btn ${isSaved ? 'saved' : ''}" 
                            onclick="toggleSave(${movie.id}, '${cleanTitle}', '${cleanPosterPath}', ${movie.vote_average || 0}, this)">
                        <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i> ${isSaved ? 'محفوظ' : 'حفظ'}
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // إضافة المؤشر
        const indicator = document.createElement("button");
        indicator.className = `indicator ${index === 0 ? "active" : ""}`;
        indicator.onclick = () => changeBannerSlide(index);
        indicators.appendChild(indicator);
    });
    
    // إعداد التحكم
    setupBannerControls();
    
    // بدء التشغيل التلقائي
    if (movies.length > 1) {
        startBannerAutoPlay();
    }
    
    console.log(`✅ تم إعداد ${movies.length} بطاقة في البانر`);
}
function setupBannerControls() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    
    if (prevBtn) prevBtn.onclick = () => changeBannerSlide(currentBannerIndex - 1);
    if (nextBtn) nextBtn.onclick = () => changeBannerSlide(currentBannerIndex + 1);
}

function changeBannerSlide(index) {
    const slides = document.querySelectorAll(".banner-card");
    const indicators = document.querySelectorAll(".indicator");
    
    if (slides.length === 0) return;
    
    // حساب الفهرس الجديد
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    // 1. إخفاء البطاقة الحالية تدريجياً
    slides[currentBannerIndex].style.opacity = '0';
    slides[currentBannerIndex].style.zIndex = '1';
    slides[currentBannerIndex].classList.remove("active");
    
    // 2. إخفاء المؤشر الحالي
    indicators[currentBannerIndex].classList.remove("active");
    
    // 3. إظهار البطاقة الجديدة
    setTimeout(() => {
        slides[index].style.opacity = '1';
        slides[index].style.zIndex = '2';
        slides[index].classList.add("active");
    }, 50); // تأخير بسيط للتأثير
    
    // 4. إظهار المؤشر الجديد
    indicators[index].classList.add("active");
    
    // 5. تحديث الفهرس
    currentBannerIndex = index;
    
    // 6. إعادة تشغيل التشغيل التلقائي
    restartBannerAutoPlay();
    
    console.log(`🔄 تغيير البانر إلى: ${index + 1}/${slides.length}`);
}
function startBannerAutoPlay() {
    if (bannerInterval) clearInterval(bannerInterval);
    
    // التأكد من وجود أكثر من بطاقة
    const slides = document.querySelectorAll(".banner-card");
    if (slides.length <= 1) {
        console.log("⚠️  بطاقة واحدة فقط، تعطيل التشغيل التلقائي");
        return;
    }
    
    bannerInterval = setInterval(() => {
        console.log("⏱️  تبديل تلقائي...");
        changeBannerSlide(currentBannerIndex + 1);
    }, 6000);
    
    console.log("▶️  بدأ التشغيل التلقائي");
}

function restartBannerAutoPlay() {
    if (bannerInterval) clearInterval(bannerInterval);
    startBannerAutoPlay();
}

// ========================================
// LOAD MOVIE SECTIONS
// ========================================

async function loadNewMovies() {
    try {
        console.log("📺 تحميل أفلام جديدة...");
        
        currentPage['new-movies'] = 1;
        const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results.slice(0, 10), "new-movies");
        
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} فيلم جديد`);
    } catch (error) {
        console.error("❌ خطأ في تحميل الأفلام الجديدة:", error);
    }
}

async function loadTrendingMovies() {
    try {
        console.log("🔥 تحميل الأفلام الشائعة...");
        
        currentPage['trending-movies'] = 1;
        const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ar`;
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
        const url = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=ar&page=1`;
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
                url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            case 'trending':
                url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ar&page=${page}`;
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
    
    if (isSearch || currentPage[containerId] === 1) {
        container.innerHTML = "";
    }
    
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="no-movies">لا توجد أفلام</div>';
        return;
    }
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}

function displayMoreMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !movies || movies.length === 0) return;
    
    const moviesToAdd = movies.slice(0, 10);
    moviesToAdd.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    
    const isSaved = savedMovies.some(m => m.id === movie.id);
    const posterUrl = movie.poster_path ? IMG_500 + movie.poster_path : "https://via.placeholder.com/300x450";
    const title = movie.title || "بدون عنوان";
    const overview = movie.overview ? movie.overview.substring(0, 120) + "..." : "لا يوجد وصف";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <span class="movie-rating">
                    <i class="fas fa-star"></i> ${rating}
                </span>
            </div>
            <p class="movie-description">${overview}</p>
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="playMovie(${movie.id})">
                    <i class="fas fa-play"></i> مشاهدة
                </button>
                <button class="save-btn-sm ${isSaved ? 'saved' : ''}" 
                        onclick="toggleSave(${movie.id}, '${title}', '${movie.poster_path}', ${movie.vote_average}, this)">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i> ${isSaved ? 'محفوظ' : 'حفظ'}
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
    const newMoviesContainer = document.getElementById("new-movies");
    const title = document.querySelector("#new-movies").parentNode.querySelector(".section-title");
    
    if (savedMovies.length === 0) {
        newMoviesContainer.innerHTML = `
            <div class="no-movies">
                <i class="fas fa-bookmark" style="font-size: 40px; color: #666; margin-bottom: 15px;"></i>
                <h3>القائمة المحفوظة فارغة</h3>
                <p>احفظ أفلامك المفضلة لتشاهدها لاحقاً</p>
            </div>
        `;
        title.innerHTML = '<i class="fas fa-bookmark"></i> المحفوظات';
        return;
    }
    
    title.innerHTML = '<i class="fas fa-bookmark"></i> المحفوظات';
    displayMovies(savedMovies, "new-movies");
    
    // Hide more buttons
    document.querySelectorAll('.more-btn').forEach(btn => {
        if (!btn.textContent.includes('عودة')) {
            btn.style.display = 'none';
        }
    });
    
    // Add back button
    const moreBtn = newMoviesContainer.nextElementSibling;
    if (moreBtn && moreBtn.classList.contains('more-btn')) {
        moreBtn.innerHTML = '<i class="fas fa-arrow-left"></i> العودة للأفلام الجديدة';
        moreBtn.onclick = () => {
            loadNewMovies();
            title.innerHTML = '<i class="fas fa-sparkles"></i> أفلام جديدة';
            
            document.querySelectorAll('.more-btn').forEach(btn => {
                btn.style.display = 'block';
                if (btn === moreBtn) {
                    btn.innerHTML = '<i class="fas fa-plus-circle"></i> المزيد من الأفلام الجديدة';
                    btn.onclick = () => loadMoreMovies('new-movies', 'now_playing');
                }
            });
        };
    }
}

function updateWatchlistCounter() {
    const watchlistCount = document.getElementById("watchlistCount");
    if (watchlistCount) {
        if (savedMovies.length > 0) {
            watchlistCount.textContent = savedMovies.length;
            watchlistCount.classList.add("show");
        } else {
            watchlistCount.classList.remove("show");
        }
    }
}

function toggleSave(id, title, posterPath, rating, btn) {
    const movie = { id, title, poster_path: posterPath, vote_average: rating };
    const index = savedMovies.findIndex(m => m.id === id);
    
    if (index === -1) {
        savedMovies.push(movie);
        btn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        btn.classList.add("saved");
        console.log(`❤️ تم حفظ الفيلم: ${title}`);
    } else {
        savedMovies.splice(index, 1);
        btn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        btn.classList.remove("saved");
        console.log(`💔 تم حذف الفيلم من المحفوظات: ${title}`);
    }
    
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
    updateWatchlistCounter();
}

// ========================================
// PLAYER
// ========================================

function playMovie(id) {
    showProgress();
    setTimeout(() => {
        window.location.href = "watch.html?id=" + id;
    }, 300);
}

// ========================================
// PROGRESS BAR
// ========================================

function showProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) {
        bar.style.display = "block";
        bar.style.transform = "scaleX(0)";
    }
}

function hideProgress() {
    const bar = document.getElementById("progress-bar");
    if (bar) {
        bar.style.transform = "scaleX(1)";
        setTimeout(() => {
            bar.style.display = "none";
        }, 300);
    }
}

// ========================================
// PAGE VISIBILITY
// ========================================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (bannerInterval) clearInterval(bannerInterval);
    } else {
        restartBannerAutoPlay();
    }
});

// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.playMovie = playMovie;
window.toggleSave = toggleSave;
window.changeBannerSlide = changeBannerSlide;
window.loadMoreMovies = loadMoreMovies;
window.loadMoreGenreMovies = loadMoreGenreMovies;
window.showWatchlist = showWatchlist;
window.loadMoviesByGenre = loadMoviesByGenre;
window.closeMobileAd = () => {
    const mobileAd = document.getElementById('mobile-ad');
    if (mobileAd) mobileAd.style.display = 'none';
};// ========================================
// BANNER FIX FUNCTION
// ========================================

function fixBanner() {
    console.log("🔧 إصلاح البانر...");
    
    const cards = document.querySelectorAll('.banner-card');
    console.log(`🔍 عدد البطاقات: ${cards.length}`);
    
    if (cards.length > 0) {
        // تطبيق الـ CSS الصحيح مباشرة
        cards.forEach((card, index) => {
            card.style.position = 'absolute';
            card.style.top = '0';
            card.style.left = '0';
            card.style.width = '100%';
            card.style.height = '100%';
            card.style.opacity = index === currentBannerIndex ? '1' : '0';
            card.style.zIndex = index === currentBannerIndex ? '2' : '1';
            card.style.transition = 'opacity 0.5s ease';
        });
        
        console.log("✅ تم إصلاح البانر");
    }
}

// استدعاء الإصلاح بعد تحميل الصفحة
setTimeout(fixBanner, 1500);

// وأيضاً عند تغيير الشريحة
const originalChangeBannerSlide = window.changeBannerSlide;
window.changeBannerSlide = function(index) {
    originalChangeBannerSlide(index);
    setTimeout(fixBanner, 100);
};