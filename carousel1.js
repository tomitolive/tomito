// ========================================
// MOVIES BANNER CAROUSEL ONLY
// ========================================

const MOVIE_BANNER_API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const MOVIE_BANNER_BASE_URL = "https://api.themoviedb.org/3";
const MOVIE_BANNER_IMG_URL = "https://image.tmdb.org/t/p/w1280";

let bannerMovies = [];
let currentBannerIndex = 0;
let bannerInterval = null;
let isChanging = false;

// ========================================
// تهيئة بانر الأفلام
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🎬 تهيئة بانر الأفلام...");
    initMovieBanner();
});

async function initMovieBanner() {
    try {
        await loadMovieBannerData();
        createMovieBannerSlides();
        setupMovieBannerButtons();
        applyMovieBannerStyles();
        startMovieBannerAutoPlay();
    } catch (error) {
        console.error("❌ خطأ في بانر الأفلام:", error);
        showMovieBannerError();
    }
}

// ========================================
// تحميل بيانات الأفلام
// ========================================

async function loadMovieBannerData() {
    try {
        console.log("📥 تحميل أفلام البانر...");
        const url = `${MOVIE_BANNER_BASE_URL}/movie/popular?api_key=${MOVIE_BANNER_API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        const movies = data.results.filter(f => f.backdrop_path).slice(0, 5);
        if (movies.length === 0) throw new Error("لا توجد أفلام متاحة");
        
        bannerMovies = movies.map(f => ({
            id: f.id,
            title: f.title || "No Title",
            overview: f.overview || "لا يوجد وصف متاح",
            backdrop_path: f.backdrop_path,
            original_language: f.original_language,
            vote_average: f.vote_average
        }));

        console.log(`✅ تم تحميل ${bannerMovies.length} فيلم`);
    } catch (error) {
        console.error("❌ فشل تحميل بانر الأفلام:", error);
        showMovieBannerError();
    }
}

// ========================================
// إنشاء شرائح البانر
// ========================================

function createMovieBannerSlides() {
    const container = document.getElementById("banner-container");
    const indicators = document.getElementById("banner-indicators");
    
    if (!container || !indicators) return;
    container.innerHTML = "";
    indicators.innerHTML = "";
    if (bannerMovies.length === 0) {
        showMovieBannerError();
        return;
    }

    bannerMovies.forEach((movie, i) => {
        const card = document.createElement("div");
        card.className = `banner-card ${i === 0 ? "active" : ""}`;
        
        const img = movie.backdrop_path 
            ? `${MOVIE_BANNER_IMG_URL}${movie.backdrop_path}`
            : "https://via.placeholder.com/1280x500/333/fff?text=No+Image";
        
        const desc = getMovieShortDescription(movie.overview);
        const rating = movie.vote_average ? 
            `<div class="banner-rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}/10</div>` : "";
        
        card.innerHTML = `
            <img src="${img}" alt="${movie.title}" loading="lazy">
            <div class="banner-overlay">
                ${rating}
                <h2>${movie.title}</h2>
                <p>${desc}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="handleMovieBannerPlay(${movie.id})">
                        <i class="fas fa-play"></i> مشاهدة الآن
                 
            </div>
        `;
        
        container.appendChild(card);

        const dot = document.createElement("button");
        dot.className = `indicator ${i === 0 ? "active" : ""}`;
        dot.onclick = () => goToMovieBannerSlide(i);
        indicators.appendChild(dot);
    });
}

// ========================================
// تقصير الوصف
// ========================================

function getMovieShortDescription(text) {
    if (!text || text === "لا يوجد وصف متاح") return "لا يوجد وصف";
    const w = window.innerWidth;
    let max = w <= 480 ? 80 : w <= 768 ? 120 : 200;
    return text.length > max ? text.substring(0, max) + "..." : text;
}

// ========================================
// إعداد الأزرار
// ========================================

function setupMovieBannerButtons() {
    const prev = document.querySelector(".prev-btn");
    const next = document.querySelector(".next-btn");
    if (prev) prev.onclick = e => { e.preventDefault(); goToMovieBannerSlide(currentBannerIndex - 1); };
    if (next) next.onclick = e => { e.preventDefault(); goToMovieBannerSlide(currentBannerIndex + 1); };
}

// ========================================
// تطبيق الأنماط
// ========================================

function applyMovieBannerStyles() {
    setTimeout(() => {
        const cards = document.querySelectorAll('.banner-card');
        cards.forEach((card, i) => {
            card.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: ${i === 0 ? '1' : '0'};
                visibility: ${i === 0 ? 'visible' : 'hidden'};
                z-index: ${i === 0 ? '2' : '1'};
                transition: opacity 0.8s ease;
            `;
            const img = card.querySelector('img');
            if (img) img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        });
        console.log("✅ تم تطبيق أنماط البانر");
    }, 100);
}

// ========================================
// التنقل بين الشرائح
// ========================================

function goToMovieBannerSlide(index) {
    if (isChanging) return;
    const cards = document.querySelectorAll('.banner-card');
    const dots = document.querySelectorAll('.indicator');
    if (!cards.length) return;

    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    if (index === currentBannerIndex) return;

    isChanging = true;
    const oldCard = cards[currentBannerIndex];
    const newCard = cards[index];
    const oldDot = dots[currentBannerIndex];
    const newDot = dots[index];

    oldCard.style.opacity = '0';
    oldCard.style.zIndex = '1';
    oldCard.classList.remove('active');
    if (oldDot) oldDot.classList.remove('active');

    setTimeout(() => {
        newCard.style.visibility = 'visible';
        newCard.style.opacity = '1';
        newCard.style.zIndex = '2';
        newCard.classList.add('active');
        if (newDot) newDot.classList.add('active');

        setTimeout(() => { oldCard.style.visibility = 'hidden'; isChanging = false; }, 100);
    }, 50);

    currentBannerIndex = index;
    restartMovieBannerAutoPlay();
    console.log(`🔄 شريحة ${index + 1}/${cards.length}`);
}

// ========================================
// التشغيل التلقائي
// ========================================

function startMovieBannerAutoPlay() {
    stopMovieBannerAutoPlay();
    const cards = document.querySelectorAll('.banner-card');
    if (cards.length <= 1) return;
    bannerInterval = setInterval(() => {
        if (!isChanging && !document.hidden) goToMovieBannerSlide(currentBannerIndex + 1);
    }, 6000);
    console.log("▶️ بدأ التشغيل التلقائي");
}

function stopMovieBannerAutoPlay() {
    if (bannerInterval) { clearInterval(bannerInterval); bannerInterval = null; }
}

function restartMovieBannerAutoPlay() {
    stopMovieBannerAutoPlay();
    startMovieBannerAutoPlay();
}

// ========================================
// إيقاف عند إخفاء الصفحة
// ========================================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopMovieBannerAutoPlay();
    else restartMovieBannerAutoPlay();
});

// ========================================
// إعادة تطبيق عند تغيير الحجم
// ========================================

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const cards = document.querySelectorAll('.banner-card');
        cards.forEach((card, index) => {
            const descElement = card.querySelector('.banner-overlay p');
            if (descElement && bannerMovies[index]) {
                descElement.textContent = getMovieShortDescription(bannerMovies[index].overview);
            }
        });
        applyMovieBannerStyles();
    }, 300);
});

// ========================================
// معالجة الأخطاء
// ========================================

function showMovieBannerError() {
    const container = document.getElementById("banner-container");
    if (!container) return;
    container.innerHTML = `
        <div class="banner-card active" style="position:relative;width:100%;height:100%;">
            <img src="https://via.placeholder.com/1280x500/222/fff?text=Error" 
                 alt="Error" style="width:100%;height:100%;object-fit:cover;">
            <div class="banner-overlay">
                <h2>عذراً، حدث خطأ</h2>
                <p>لم نتمكن من تحميل الأفلام</p>
                <button class="banner-play-btn" onclick="location.reload()">
                    <i class="fas fa-sync"></i> تحديث
                </button>
            </div>
        </div>
    `;
}

// ========================================
// تشغيل الفيلم
// ========================================

function handleMovieBannerPlay(id) {
    console.log(`▶️ فيلم: ${id}`);
    window.location.href = `watch-movie.html?id=${id}`;
}

// ========================================
// حفظ في قائمة المشاهدة
// ========================================

function saveToWatchlist(id, type = 'movie') {
    try {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        const exists = watchlist.some(item => item.id === id && item.type === type);
        if (!exists) {
            watchlist.push({ id, type, addedAt: new Date().toISOString() });
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            const btn = event.target.closest('.banner-save-btn');
            if (btn) { btn.innerHTML = '<i class="fas fa-bookmark"></i> محفوظ'; btn.classList.add('saved'); }
            console.log(`✅ تم حفظ ${type} ${id} في القائمة`);
        } else {
            watchlist = watchlist.filter(item => !(item.id === id && item.type === type));
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            const btn = event.target.closest('.banner-save-btn');
            if (btn) { btn.innerHTML = '<i class="far fa-bookmark"></i> حفظ'; btn.classList.remove('saved'); }
            console.log(`🗑️ تم إزالة ${type} ${id} من القائمة`);
        }
    } catch (error) {
        console.error("❌ خطأ في حفظ القائمة:", error);
    }
}

// ========================================
// تصدير للاستخدام الخارجي
// ========================================

window.handleMovieBannerPlay = handleMovieBannerPlay;
window.goToMovieBannerSlide = goToMovieBannerSlide;
window.saveToWatchlist = saveToWatchlist;
