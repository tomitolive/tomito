// ========================================
// BANNER CAROUSEL ONLY
// ========================================

const BANNER_API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BANNER_BASE_URL = "https://api.themoviedb.org/3";
const BANNER_IMG_URL = "https://image.tmdb.org/t/p/w1280";

let bannerMovies = [];
let currentBannerIndex = 0;
let bannerInterval = null;
let isChanging = false;

// ========================================
// تهيئة البانر
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🎬 تهيئة البانر...");
    initBannerCarousel();
});

async function initBannerCarousel() {
    try {
        await loadBannerData();
        createBannerSlides();
        setupBannerButtons();
        applyBannerStyles();
        startBannerAutoPlay();
    } catch (error) {
        console.error("❌ خطأ في البانر:", error);
        showBannerError();
    }
}

// ========================================
// تحميل بيانات الأفلام
// ========================================

async function loadBannerData() {
    try {
        console.log("📥 تحميل أفلام البانر...");
        
        // جلب الأفلام بالإنجليزية
        const url = `${BANNER_BASE_URL}/movie/popular?api_key=${BANNER_API_KEY}&language=en-US&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        // أخذ 5 أفلام فقط
        const movies = data.results.filter(m => m.backdrop_path).slice(0, 5);
        
        // تحميل الوصف العربي
        bannerMovies = await Promise.all(
            movies.map(async (movie) => {
                try {
                    const arUrl = `${BANNER_BASE_URL}/movie/${movie.id}?api_key=${BANNER_API_KEY}&language=ar`;
                    const arRes = await fetch(arUrl);
                    const arData = await arRes.json();
                    
                    return {
                        id: movie.id,
                        title: movie.title,
                        overview: arData.overview || movie.overview,
                        backdrop_path: movie.backdrop_path
                    };
                } catch (err) {
                    return {
                        id: movie.id,
                        title: movie.title,
                        overview: movie.overview,
                        backdrop_path: movie.backdrop_path
                    };
                }
            })
        );
        
        console.log(`✅ تم تحميل ${bannerMovies.length} فيلم`);
    } catch (error) {
        console.error("❌ فشل تحميل البانر:", error);
        throw error;
    }
}

// ========================================
// إنشاء الشرائح
// ========================================

function createBannerSlides() {
    const container = document.getElementById("banner-container");
    const indicators = document.getElementById("banner-indicators");
    
    if (!container || !indicators) {
        console.error("❌ عناصر البانر غير موجودة");
        return;
    }
    
    container.innerHTML = "";
    indicators.innerHTML = "";
    
    if (bannerMovies.length === 0) {
        showBannerError();
        return;
    }
    
    bannerMovies.forEach((movie, i) => {
        // إنشاء البطاقة
        const card = document.createElement("div");
        card.className = `banner-card ${i === 0 ? "active" : ""}`;
        
        const img = movie.backdrop_path 
            ? `${BANNER_IMG_URL}${movie.backdrop_path}`
            : "https://via.placeholder.com/1280x500/333/fff?text=No+Image";
        
        const title = movie.title || "No Title";
        const desc = getShortDescription(movie.overview);
        
        card.innerHTML = `
            <img src="${img}" alt="${title}" loading="lazy">
            <div class="banner-overlay">
                <h2>${title}</h2>
                <p>${desc}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="handleBannerPlay(${movie.id})">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // إنشاء المؤشر
        const dot = document.createElement("button");
        dot.className = `indicator ${i === 0 ? "active" : ""}`;
        dot.onclick = () => goToBannerSlide(i);
        indicators.appendChild(dot);
    });
    
    console.log(`✅ تم إنشاء ${bannerMovies.length} شريحة`);
}

// ========================================
// تقصير الوصف
// ========================================

function getShortDescription(text) {
    if (!text) return "لا يوجد وصف";
    
    const w = window.innerWidth;
    const max = w <= 480 ? 60 : w <= 768 ? 100 : 200;
    
    return text.length > max ? text.substring(0, max) + "..." : text;
}

// ========================================
// إعداد الأزرار
// ========================================

function setupBannerButtons() {
    const prev = document.querySelector(".prev-btn");
    const next = document.querySelector(".next-btn");
    
    if (prev) {
        prev.onclick = (e) => {
            e.preventDefault();
            goToBannerSlide(currentBannerIndex - 1);
        };
    }
    
    if (next) {
        next.onclick = (e) => {
            e.preventDefault();
            goToBannerSlide(currentBannerIndex + 1);
        };
    }
}

// ========================================
// تطبيق الأنماط
// ========================================

function applyBannerStyles() {
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
            if (img) {
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            }
        });
        
        console.log("✅ تم تطبيق الأنماط");
    }, 100);
}

// ========================================
// التنقل بين الشرائح
// ========================================

function goToBannerSlide(index) {
    if (isChanging) return;
    
    const cards = document.querySelectorAll('.banner-card');
    const dots = document.querySelectorAll('.indicator');
    
    if (!cards.length) return;
    
    // تصحيح الفهرس
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    if (index === currentBannerIndex) return;
    
    isChanging = true;
    
    const oldCard = cards[currentBannerIndex];
    const newCard = cards[index];
    const oldDot = dots[currentBannerIndex];
    const newDot = dots[index];
    
    // إخفاء القديم
    oldCard.style.opacity = '0';
    oldCard.style.zIndex = '1';
    oldCard.classList.remove('active');
    if (oldDot) oldDot.classList.remove('active');
    
    // إظهار الجديد
    setTimeout(() => {
        newCard.style.visibility = 'visible';
        newCard.style.opacity = '1';
        newCard.style.zIndex = '2';
        newCard.classList.add('active');
        if (newDot) newDot.classList.add('active');
        
        setTimeout(() => {
            oldCard.style.visibility = 'hidden';
            isChanging = false;
        }, 100);
    }, 50);
    
    currentBannerIndex = index;
    restartBannerAutoPlay();
    
    console.log(`🔄 شريحة ${index + 1}/${cards.length}`);
}

// ========================================
// التشغيل التلقائي
// ========================================

function startBannerAutoPlay() {
    stopBannerAutoPlay();
    
    const cards = document.querySelectorAll('.banner-card');
    if (cards.length <= 1) return;
    
    bannerInterval = setInterval(() => {
        if (!isChanging && !document.hidden) {
            goToBannerSlide(currentBannerIndex + 1);
        }
    }, 6000);
    
    console.log("▶️ بدأ التشغيل التلقائي");
}

function stopBannerAutoPlay() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

function restartBannerAutoPlay() {
    stopBannerAutoPlay();
    startBannerAutoPlay();
}

// ========================================
// إيقاف عند إخفاء الصفحة
// ========================================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopBannerAutoPlay();
    } else {
        restartBannerAutoPlay();
    }
});

// ========================================
// إعادة تطبيق عند تغيير الحجم
// ========================================

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        applyBannerStyles();
    }, 300);
});

// ========================================
// معالجة الأخطاء
// ========================================

function showBannerError() {
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

function handleBannerPlay(id) {
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

window.handleBannerPlay = handleBannerPlay;
window.goToBannerSlide = goToBannerSlide;