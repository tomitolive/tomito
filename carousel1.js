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
        
        // جلب الأفلام الشعبية
        const url = `${MOVIE_BANNER_BASE_URL}/movie/popular?api_key=${MOVIE_BANNER_API_KEY}&language=en&page=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        // أخذ 10 أفلام فقط عندهم backdrop
        const movies = data.results
            .filter(movie => movie.backdrop_path)
            .slice(0, 10);
        
        if (movies.length === 0) {
            throw new Error("لا توجد أفلام متاحة");
        }
        
        // تحميل الوصف العربي لكل فيلم
        bannerMovies = await Promise.all(
            movies.map(async (movie) => {
                try {
                    // جلب التفاصيل بالعربية للوصف فقط
                    const arUrl = `${MOVIE_BANNER_BASE_URL}/movie/${movie.id}?api_key=${MOVIE_BANNER_API_KEY}&language=ar`;
                    const arRes = await fetch(arUrl);
                    
                    let arabicOverview = movie.overview; // Default to English
                    
                    if (arRes.ok) {
                        const arData = await arRes.json();
                        arabicOverview = arData.overview || movie.overview;
                    }
                    
                    return {
                        id: movie.id,
                        title: movie.original_title || movie.title, // ENGLISH TITLE ONLY
                        overview: arabicOverview, // ARABIC DESCRIPTION
                        backdrop_path: movie.backdrop_path,
                        vote_average: movie.vote_average,
                        release_date: movie.release_date
                    };
                } catch (err) {
                    console.error(`❌ خطأ في تحميل التفاصيل لـ ${movie.id}:`, err);
                    return {
                        id: movie.id,
                        title: movie.title, // ENGLISH TITLE
                        overview: movie.overview || "لا يوجد وصف متاح", // ARABIC OR ENGLISH DESCRIPTION
                        backdrop_path: movie.backdrop_path,
                        vote_average: movie.vote_average,
                        release_date: movie.release_date
                    };
                }
            })
        );
        
        console.log(`✅ تم تحميل ${bannerMovies.length} فيلم`);
        console.log("📋 بيانات الأفلام:", bannerMovies);
    } catch (error) {
        console.error("❌ فشل تحميل بانر الأفلام:", error);
        throw error;
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
        // إنشاء البطاقة
        const card = document.createElement("div");
        card.className = `banner-card ${i === 0 ? "active" : ""}`;
        
        const img = movie.backdrop_path 
            ? `${MOVIE_BANNER_IMG_URL}${movie.backdrop_path}`
            : "https://via.placeholder.com/1280x500/333/fff?text=No+Image";
        
        const title = movie.title || "No Title";
        const desc = getMovieShortDescription(movie.overview);
        
        // إضافة تقييم إذا كان متوفرًا
        const rating = movie.vote_average ? 
            `<div class="banner-rating">
                <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
             </div>` : "";
        
        // إضافة سنة الإصدار إذا كانت متوفرة
        const year = movie.release_date ? 
            `<div class="banner-year">
                <i class="far fa-calendar"></i> ${movie.release_date.substring(0,4)}
             </div>` : "";
        
        card.innerHTML = `
            <img src="${img}" alt="${movie.title}" loading="lazy">
            <div class="banner-overlay">
                <div class="banner-meta">
                    ${rating}
                    ${year}
                </div>
                <h2 class="banner-title">${title}</h2>
                <p class="banner-description">${desc}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="handleMovieBannerPlay(${movie.id})">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);

        const dot = document.createElement("button");
        dot.className = `indicator ${i === 0 ? "active" : ""}`;
        dot.onclick = () => goToMovieBannerSlide(i);
        indicators.appendChild(dot);
    });
    
    console.log(`✅ تم إنشاء ${bannerMovies.length} شريحة`);
}

// ========================================
// تقصير الوصف
// ========================================

function getMovieShortDescription(text) {
    if (!text || text === "لا يوجد وصف متاح") return "لا يوجد وصف";
    
    // تنظيف النص
    let cleanedText = text.trim();
    
    // الحد الأقصى للأحرف حسب حجم الشاشة
    const w = window.innerWidth;
    let max = 200; // الافتراضي لسطح المكتب
    
    if (w <= 480) {
        max = 80; // للهواتف
    } else if (w <= 768) {
        max = 120; // للأجهزة اللوحية
    }
    
    // التحقق من اللغة العربية
    const isArabic = /[\u0600-\u06FF]/.test(cleanedText);
    
    // تقصير النص مع الحفاظ على الكلمات الكاملة
    if (cleanedText.length > max) {
        // للعربية: البحث عن أقرب مسافة للقطع
        if (isArabic) {
            let lastSpace = cleanedText.lastIndexOf(' ', max);
            if (lastSpace === -1 || lastSpace < max - 30) {
                lastSpace = max;
            }
            return cleanedText.substring(0, lastSpace) + "...";
        } else {
            // للإنجليزية: البحث عن أقرب مسافة
            let lastSpace = cleanedText.lastIndexOf(' ', max);
            if (lastSpace === -1 || lastSpace < max - 30) {
                lastSpace = max;
            }
            return cleanedText.substring(0, lastSpace) + "...";
        }
    }
    
    return cleanedText;
}

// ========================================
// إعداد الأزرار
// ========================================

function setupMovieBannerButtons() {
    const prev = document.querySelector(".prev-btn");
    const next = document.querySelector(".next-btn");
    
    if (prev) {
        prev.onclick = (e) => {
            e.preventDefault();
            goToMovieBannerSlide(currentBannerIndex - 1);
        };
    }
    
    if (next) {
        next.onclick = (e) => {
            e.preventDefault();
            goToMovieBannerSlide(currentBannerIndex + 1);
        };
    }
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
        if (!isChanging && !document.hidden) {
            goToMovieBannerSlide(currentBannerIndex + 1);
        }
    }, 6000);
    console.log("▶️ بدأ التشغيل التلقائي");
}

function stopMovieBannerAutoPlay() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

function restartMovieBannerAutoPlay() {
    stopMovieBannerAutoPlay();
    startMovieBannerAutoPlay();
}

// ========================================
// إيقاف عند إخفاء الصفحة
// ========================================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopMovieBannerAutoPlay();
    } else {
        restartMovieBannerAutoPlay();
    }
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
            const descElement = card.querySelector('.banner-description');
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
    
    if (typeof playMovie === 'function') {
        playMovie(id);
    } else {
        window.location.href = `watch.html?id=${id}`;
    }
}

// ========================================
// تصدير للاستخدام الخارجي
// ========================================

window.handleMovieBannerPlay = handleMovieBannerPlay;
window.goToMovieBannerSlide = goToMovieBannerSlide;
