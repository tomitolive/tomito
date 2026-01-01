// ========================================
// TMDB API CONFIGURATION FOR TV SERIES
// ========================================

const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";

// ========================================
// STATE MANAGEMENT
// ========================================

let bannerSeries = [];
let currentBannerIndex = 0;
let bannerInterval;
let savedSeries = JSON.parse(localStorage.getItem("savedSeries")) || [];
let currentPage = {
    'new-series': 1,
    'trending-series': 1,
    'top-series': 1,
    'upcoming-series': 1
};

// TV Genres
const TV_GENRES = [
    { id: "", name: "الكل", icon: "fas fa-tv" },
    { id: "10759", name: "أكشن ومغامرة", icon: "fas fa-fire" },
    { id: "35", name: "كوميديا", icon: "fas fa-laugh" },
    { id: "18", name: "دراما", icon: "fas fa-theater-masks" },
    { id: "10765", name: "خيال علمي", icon: "fas fa-robot" },
    { id: "9648", name: "غموض", icon: "fas fa-user-secret" },
    { id: "10762", name: "أطفال", icon: "fas fa-child" },
    { id: "10766", name: "دراما", icon: "fas fa-heart" },
    { id: "80", name: "جريمة", icon: "fas fa-user-secret" },
    { id: "99", name: "وثائقي", icon: "fas fa-camera" },
    { id: "10763", name: "أخبار", icon: "fas fa-newspaper" },
    { id: "10764", name: "واقعي", icon: "fas fa-video" },
    { id: "10767", name: "توك شو", icon: "fas fa-microphone" },
    { id: "10768", name: "حرب وسياسة", icon: "fas fa-flag" },
    { id: "10751", name: "عائلي", icon: "fas fa-home" },
    { id: "10749", name: "رومانسي", icon: "fas fa-heart" }
];

// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("📺 تهيئة صفحة المسلسلات...");
    initTVPage();
});

function initTVPage() {
    console.log("⚙️ بدء تحميل صفحة المسلسلات");
    setupSearch();
    updateWatchlistCounter();
    loadAllSeries();
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
            loadAllSeries();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchSeries(query);
        }, 500);
    });
}

async function searchSeries(query) {
    try {
        showProgress();
        console.log(`🔍 البحث عن مسلسل: ${query}`);
        
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        // إخفاء أزرار "المزيد"
        document.querySelectorAll('.more-btn').forEach(btn => btn.style.display = 'none');
        
        // عرض نتائج البحث
        displaySeries(data.results, "new-series", true);
        
        // تحديث العنوان
        const titleEl = document.querySelector("#new-series").parentNode.querySelector(".section-title");
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

async function loadSeriesByGenre(genreId) {
    try {
        showProgress();
        console.log(`📺 تحميل مسلسلات التصنيف: ${genreId}`);
        
        let url;
        
        if (!genreId || genreId === "") {
            url = `${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=ar&page=1`;
        } else {
            url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        const container = document.getElementById("new-series");
        const title = document.querySelector("#new-series").parentNode.querySelector(".section-title");
        
        // تحديث العنوان
        if (genreId && genreId !== "") {
            const genre = TV_GENRES.find(g => g.id === genreId);
            const genreName = genre ? genre.name : "غير معروف";
            title.innerHTML = `<i class="${genre?.icon || 'fas fa-tv'}"></i> مسلسلات ${genreName}`;
        } else {
            title.innerHTML = '<i class="fas fa-sparkles"></i> مسلسلات جديدة';
        }
        
        // عرض المسلسلات
        if (data.results.length === 0) {
            container.innerHTML = '<div class="no-movies">لا توجد مسلسلات في هذا التصنيف</div>';
        } else {
            displaySeries(data.results.slice(0, 10), "new-series");
        }
        
        // تحديث زر "المزيد"
        const moreBtn = container.nextElementSibling;
        if (moreBtn && moreBtn.classList.contains('more-btn')) {
            if (genreId && genreId !== "") {
                moreBtn.innerHTML = `<i class="fas fa-plus-circle"></i> المزيد من هذا التصنيف`;
                moreBtn.onclick = () => loadMoreGenreSeries(genreId, 'new-series');
            } else {
                moreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> المزيد من المسلسلات الجديدة';
                moreBtn.onclick = () => loadMoreSeries('new-series', 'airing_today');
            }
        }
        
        console.log(`✅ تم تحميل ${data.results.length} مسلسل`);
    } catch (error) {
        console.error("❌ خطأ في تحميل مسلسلات التصنيف:", error);
    } finally {
        hideProgress();
    }
}

async function loadMoreGenreSeries(genreId, containerId) {
    try {
        showProgress();
        
        currentPage[containerId] = (currentPage[containerId] || 0) + 1;
        const page = currentPage[containerId];
        
        const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results.length > 0) {
            displayMoreSeries(data.results, containerId);
            console.log(`✅ تم تحميل ${data.results.length} مسلسل إضافي`);
        } else {
            const btn = document.querySelector(`#${containerId} + .more-btn`);
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> لا توجد مسلسلات أكثر';
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

async function loadAllSeries() {
    try {
        showProgress();
        console.log("📺 بدء تحميل جميع أقسام المسلسلات...");
        
        await Promise.all([
            loadBannerSeries(),
            loadNewSeries(),
            loadTrendingSeries(),
            loadTopRatedSeries(),
            loadUpcomingSeries()
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

async function loadBannerSeries() {
    try {
        console.log("🎬 تحميل بانر المسلسلات...");
        
        const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        bannerSeries = data.results.filter(s => s.backdrop_path).slice(0, 5);
        setupBannerSeries(bannerSeries);
        
        console.log(`✅ تم تحميل ${bannerSeries.length} مسلسل للبانر`);
    } catch (error) {
        console.error("❌ خطأ في تحميل البانر:", error);
    }
}
function setupBannerSeries(series) {
    const container = document.getElementById("banner-container");
    const indicators = document.getElementById("banner-indicators");
    
    if (!container || !indicators) return;
    
    // تفريغ الحاويات أولاً
    container.innerHTML = "";
    indicators.innerHTML = "";
    
    // التأكد من وجود مسلسلات
    if (!series || series.length === 0) {
        console.error("❌ لا توجد مسلسلات لعرضها في البانر");
        // عرض صورة افتراضية
        container.innerHTML = `
            <div class="banner-card active">
                <img src="https://via.placeholder.com/1280x500/333/fff?text=No+Banner+Available" alt="لا توجد صور">
                <div class="banner-overlay">
                    <h2>لا توجد مسلسلات حالياً</h2>
                    <p>جاري تحميل المسلسلات، يرجى الانتظار...</p>
                </div>
            </div>
        `;
        return;
    }
    
    series.forEach((show, index) => {
        const card = document.createElement("div");
        card.className = `banner-card ${index === 0 ? "active" : ""}`;
        
        const isSaved = savedSeries.some(s => s.id === show.id);
        const backdropUrl = show.backdrop_path ? IMG_URL + show.backdrop_path : 
                          "https://via.placeholder.com/1280x500/333/fff?text=No+Image";
        const title = show.name || "بدون عنوان";
        const overview = show.overview ? show.overview.substring(0, 200) + "..." : "لا يوجد وصف";
        
        // تنظيف النص من علامات التنصيص
        const cleanTitle = title.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const cleanPosterPath = (show.poster_path || "").replace(/'/g, "\\'");
        
        card.innerHTML = `
            <img src="${backdropUrl}" alt="${title}" loading="lazy" class="banner-img">
            <div class="banner-overlay">
                <h2>${title}</h2>
                <p>${overview}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="playSeries(${show.id})">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                   
                </div>
            </div>
        `;
            
        container.appendChild(card);
        
        const indicator = document.createElement("button");
        indicator.className = `indicator ${index === 0 ? "active" : ""}`;
        indicator.setAttribute("aria-label", `الشريحة ${index + 1}`);
        indicator.onclick = () => changeBannerSlide(index);
        indicators.appendChild(indicator);
    });
    
    // إعداد عناصر التحكم
    setupBannerControls();
    
    // بدء التشغيل التلقائي
    startBannerAutoPlay();
    
    console.log(`✅ تم إعداد ${series.length} بانر`);
}
function setupBannerControls() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    
    if (prevBtn) {
        prevBtn.onclick = () => changeBannerSlide(currentBannerIndex - 1);
    }
    
    if (nextBtn) {
        nextBtn.onclick = () => changeBannerSlide(currentBannerIndex + 1);
    }
    
    console.log("🎮 تم إعداد عناصر تحكم البانر");
}
function changeBannerSlide(index) {
    const slides = document.querySelectorAll(".banner-card");
    const indicators = document.querySelectorAll(".indicator");
    
    if (slides.length === 0) return;
    
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    // إزالة النشط من الشريحة الحالية
    slides[currentBannerIndex].classList.remove("active");
    slides[currentBannerIndex].classList.add("fading-out");
    
    // إزالة النشط من المؤشر الحالي
    indicators[currentBannerIndex].classList.remove("active");
    
    // إضافة النشط للشريحة الجديدة
    slides[index].classList.remove("fading-out");
    slides[index].classList.add("active");
    
    // إضافة النشط للمؤشر الجديد
    indicators[index].classList.add("active");
    
    currentBannerIndex = index;
    restartBannerAutoPlay();
    
    console.log(`🔄 تغيير البانر إلى الشريحة: ${index + 1}`);
}

function startBannerAutoPlay() {
    if (bannerInterval) clearInterval(bannerInterval);
    if (bannerSeries.length > 1) {
        bannerInterval = setInterval(() => {
            changeBannerSlide(currentBannerIndex + 1);
        }, 6000);
    }
}

function restartBannerAutoPlay() {
    if (bannerInterval) clearInterval(bannerInterval);
    startBannerAutoPlay();
}

// ========================================
// LOAD TV SERIES SECTIONS
// ========================================

async function loadNewSeries() {
    try {
        console.log("📺 تحميل مسلسلات جديدة...");
        
        currentPage['new-series'] = 1;
        const url = `${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        displaySeries(data.results.slice(0, 10), "new-series");
        
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} مسلسل جديد`);
    } catch (error) {
        console.error("❌ خطأ في تحميل المسلسلات الجديدة:", error);
    }
}

async function loadTrendingSeries() {
    try {
        console.log("🔥 تحميل المسلسلات الشائعة...");
        
        currentPage['trending-series'] = 1;
        const url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=ar`;
        const res = await fetch(url);
        const data = await res.json();
        displaySeries(data.results.slice(0, 10), "trending-series");
        
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} مسلسل شائع`);
    } catch (error) {
        console.error("❌ خطأ في تحميل المسلسلات الشائعة:", error);
    }
}

async function loadTopRatedSeries() {
    try {
        console.log("⭐ تحميل أعلى التقييمات...");
        
        currentPage['top-series'] = 1;
        const url = `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        displaySeries(data.results.slice(0, 10), "top-series");
        
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} مسلسل من أعلى التقييمات`);
    } catch (error) {
        console.error("❌ خطأ في تحميل أعلى التقييمات:", error);
    }
}

async function loadUpcomingSeries() {
    try {
        console.log("📅 تحميل المسلسلات القادمة...");
        
        currentPage['upcoming-series'] = 1;
        const url = `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        displaySeries(data.results.slice(0, 10), "upcoming-series");
        
        console.log(`✅ تم تحميل ${Math.min(10, data.results.length)} مسلسل قادم`);
    } catch (error) {
        console.error("❌ خطأ في تحميل المسلسلات القادمة:", error);
    }
}

// ========================================
// LOAD MORE SERIES
// ========================================

async function loadMoreSeries(containerId, type) {
    try {
        showProgress();
        
        currentPage[containerId]++;
        const page = currentPage[containerId];
        
        let url;
        
        switch(type) {
            case 'airing_today':
                url = `${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            case 'trending':
                url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            case 'top_rated':
                url = `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            case 'on_the_air':
                url = `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=ar&page=${page}`;
                break;
            default:
                url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar&page=${page}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results.length > 0) {
            displayMoreSeries(data.results, containerId);
            console.log(`✅ تم تحميل ${data.results.length} مسلسل إضافي`);
        } else {
            const btn = document.querySelector(`#${containerId} + .more-btn`);
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> لا توجد مسلسلات أكثر';
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
// DISPLAY SERIES
// ========================================

function displaySeries(series, containerId, isSearch = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (isSearch || currentPage[containerId] === 1) {
        container.innerHTML = "";
    }
    
    if (!series || series.length === 0) {
        container.innerHTML = '<div class="no-movies">لا توجد مسلسلات</div>';
        return;
    }
    
    series.forEach(show => {
        const card = createSeriesCard(show);
        container.appendChild(card);
    });
}

function displayMoreSeries(series, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !series || series.length === 0) return;
    
    const seriesToAdd = series.slice(0, 10);
    seriesToAdd.forEach(show => {
        const card = createSeriesCard(show);
        container.appendChild(card);
    });
}

function createSeriesCard(show) {
    const card = document.createElement("div");
    card.className = "series-card";
    
    const isSaved = savedSeries.some(s => s.id === show.id);
    const posterUrl = show.poster_path ? IMG_500 + show.poster_path : "https://via.placeholder.com/300x450";
    const title = show.name || "بدون عنوان";
    const overview = show.overview ? show.overview.substring(0, 120) + "..." : "لا يوجد وصف";
    const rating = show.vote_average ? show.vote_average.toFixed(1) : "N/A";
    const seasons = show.seasons ? show.seasons.length : 0;
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        ${seasons > 0 ? `<span class="season-badge">${seasons} ${seasons === 1 ? 'موسم' : 'مواسم'}</span>` : ''}
        <div class="series-overlay">
            <div class="series-header">
                <h3>${title}</h3>
                <span class="series-rating">
                    <i class="fas fa-star"></i> ${rating}
                </span>
            </div>
            <p class="series-description">${overview}</p>
            <div class="series-actions">
                <button class="series-play-btn" onclick="playSeries(${show.id})">
                    <i class="fas fa-play"></i> مشاهدة
                </button>
               
            </div>
        </div>
    `;
    
    return card;
}

//          
// WATCHLIST FUNCTIONS FOR SERIES
// ========================================

function showWatchlist() {
    const newSeriesContainer = document.getElementById("new-series");
    const title = document.querySelector("#new-series").parentNode.querySelector(".section-title");
    
    if (savedSeries.length === 0) {
        newSeriesContainer.innerHTML = `
            <div class="no-movies">
                <i class="fas fa-bookmark" style="font-size: 40px; color: #666; margin-bottom: 15px;"></i>
                <h3>القائمة المحفوظة فارغة</h3>
                <p>احفظ مسلسلاتك المفضلة لتشاهدها لاحقاً</p>
            </div>
        `;
        title.innerHTML = '<i class="fas fa-bookmark"></i> المحفوظات';
        return;
    }
    
    title.innerHTML = '<i class="fas fa-bookmark"></i> المحفوظات';
    displaySeries(savedSeries, "new-series");
    
    // إخفاء أزرار "المزيد"
    document.querySelectorAll('.more-btn').forEach(btn => {
        if (!btn.textContent.includes('عودة')) {
            btn.style.display = 'none';
        }
    });
    
    // إضافة زر العودة
    const moreBtn = newSeriesContainer.nextElementSibling;
    if (moreBtn && moreBtn.classList.contains('more-btn')) {
        moreBtn.innerHTML = '<i class="fas fa-arrow-left"></i> العودة للمسلسلات الجديدة';
        moreBtn.onclick = () => {
            loadNewSeries();
            title.innerHTML = '<i class="fas fa-sparkles"></i> مسلسلات جديدة';
            
            document.querySelectorAll('.more-btn').forEach(btn => {
                btn.style.display = 'block';
                if (btn === moreBtn) {
                    btn.innerHTML = '<i class="fas fa-plus-circle"></i> المزيد من المسلسلات الجديدة';
                    btn.onclick = () => loadMoreSeries('new-series', 'airing_today');
                }
            });
        };
    }
}

function updateWatchlistCounter() {
    const watchlistCount = document.getElementById("watchlistCount");
    if (watchlistCount) {
        if (savedSeries.length > 0) {
            watchlistCount.textContent = savedSeries.length;
            watchlistCount.classList.add("show");
        } else {
            watchlistCount.classList.remove("show");
        }
    }
}

function toggleSaveSeries(id, title, posterPath, rating, btn) {
    const series = { id, name: title, poster_path: posterPath, vote_average: rating };
    const index = savedSeries.findIndex(s => s.id === id);
    
    if (index === -1) {
        savedSeries.push(series);
        btn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        btn.classList.add("saved");
        console.log(`❤️ تم حفظ المسلسل: ${title}`);
    } else {
        savedSeries.splice(index, 1);
        btn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        btn.classList.remove("saved");
        console.log(`💔 تم حذف المسلسل من المحفوظات: ${title}`);
    }
    
    localStorage.setItem("savedSeries", JSON.stringify(savedSeries));
    updateWatchlistCounter();
}

// ========================================
// PLAYER
// ========================================

function playSeries(id) {
    showProgress();
    setTimeout(() => {
        window.location.href = "watch-tv.html?id=" + id;
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

window.playSeries = playSeries;
window.toggleSaveSeries = toggleSaveSeries;
window.changeBannerSlide = changeBannerSlide;
window.loadMoreSeries = loadMoreSeries;
window.loadMoreGenreSeries = loadMoreGenreSeries;
window.showWatchlist = showWatchlist;
window.loadSeriesByGenre = loadSeriesByGenre;
window.loadAllSeries = loadAllSeries;
// اختبار البانر بعد تحميل الصفحة
window.addEventListener('load', function() {
    console.log("📋 اختبار البانر...");
    
    // اختبار إذا كان البانر موجود
    const bannerCards = document.querySelectorAll('.banner-card');
    console.log(`عدد بطاقات البانر: ${bannerCards.length}`);
    
    // اختبار إذا كانت هناك بطاقة نشطة
    const activeCard = document.querySelector('.banner-card.active');
    console.log(`البطاقة النشطة: ${activeCard ? 'موجودة' : 'غير موجودة'}`);
    
    // اختبار الصور
    bannerCards.forEach((card, index) => {
        const img = card.querySelector('img');
        console.log(`البطاقة ${index + 1}: ${img ? 'لها صورة' : 'بدون صورة'}`);
    });
});