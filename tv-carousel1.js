// ========================================
// TV SERIES BANNER CAROUSEL ONLY
// ========================================

const TV_BANNER_API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const TV_BANNER_BASE_URL = "https://api.themoviedb.org/3";
const TV_BANNER_IMG_URL = "https://image.tmdb.org/t/p/w1280";

let bannerSeries = [];
let currentBannerIndex = 0;
let bannerInterval = null;
let isChanging = false;

// ========================================
// تهيئة بانر المسلسلات
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("📺 تهيئة بانر المسلسلات...");
    initTVBanner();
});

async function initTVBanner() {
    try {
        await loadTVBannerData();
        createTVBannerSlides();
        setupTVBannerButtons();
        applyTVBannerStyles();
        startTVBannerAutoPlay();
    } catch (error) {
        console.error("❌ خطأ في بانر المسلسلات:", error);
        showTVBannerError();
    }
}

// ========================================
// تحميل بيانات المسلسلات
// ========================================

async function loadTVBannerData() {
    try {
        console.log("📥 تحميل مسلسلات البانر...");
        
        // جلب المسلسلات الشعبية بالإنجليزية
        const url = `${TV_BANNER_BASE_URL}/tv/popular?api_key=${TV_BANNER_API_KEY}&language=en-US&page=1`;
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // أخذ 5 مسلسلات فقط عندهم backdrop
        const series = data.results
            .filter(show => show.backdrop_path)
            .slice(0, 5);
        
        if (series.length === 0) {
            throw new Error("لا توجد مسلسلات متاحة");
        }
        
        // تحميل الوصف العربي لكل مسلسل
        bannerSeries = await Promise.all(
            series.map(async (show) => {
                try {
                    const arUrl = `${TV_BANNER_BASE_URL}/tv/${show.id}?api_key=${TV_BANNER_API_KEY}&language=ar`;
                    const arRes = await fetch(arUrl);
                    const arData = await arRes.json();
                    
                    return {
                        id: show.id,
                        name: show.name,
                        overview: arData.overview || show.overview,
                        backdrop_path: show.backdrop_path
                    };
                } catch (err) {
                    return {
                        id: show.id,
                        name: show.name,
                        overview: show.overview,
                        backdrop_path: show.backdrop_path
                    };
                }
            })
        );
        
        console.log(`✅ تم تحميل ${bannerSeries.length} مسلسل`);
    } catch (error) {
        console.error("❌ فشل تحميل بانر المسلسلات:", error);
        throw error;
    }
}

// ========================================
// إنشاء شرائح البانر
// ========================================

function createTVBannerSlides() {
    const container = document.getElementById("banner-container");
    const indicators = document.getElementById("banner-indicators");
    
    if (!container || !indicators) {
        console.error("❌ عناصر البانر غير موجودة");
        return;
    }
    
    container.innerHTML = "";
    indicators.innerHTML = "";
    
    if (bannerSeries.length === 0) {
        showTVBannerError();
        return;
    }
    
    bannerSeries.forEach((show, i) => {
        // إنشاء البطاقة
        const card = document.createElement("div");
        card.className = `banner-card ${i === 0 ? "active" : ""}`;
        
        const img = show.backdrop_path 
            ? `${TV_BANNER_IMG_URL}${show.backdrop_path}`
            : "https://via.placeholder.com/1280x500/333/fff?text=No+Image";
        
        const title = show.name || "No Title";
        const desc = getTVShortDescription(show.overview);
        
        card.innerHTML = `
            <img src="${img}" alt="${title}" loading="lazy">
            <div class="banner-overlay">
                <h2>${title}</h2>
                <p>${desc}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="handleTVBannerPlay(${show.id})">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // إنشاء المؤشر
        const dot = document.createElement("button");
        dot.className = `indicator ${i === 0 ? "active" : ""}`;
        dot.onclick = () => goToTVBannerSlide(i);
        indicators.appendChild(dot);
    });
    
    console.log(`✅ تم إنشاء ${bannerSeries.length} شريحة`);
}

// ========================================
// تقصير الوصف
// ========================================

function getTVShortDescription(text) {
    if (!text) return "لا يوجد وصف";
    
    const w = window.innerWidth;
    const max = w <= 480 ? 60 : w <= 768 ? 100 : 200;
    
    return text.length > max ? text.substring(0, max) + "..." : text;
}

// ========================================
// إعداد الأزرار
// ========================================

function setupTVBannerButtons() {
    const prev = document.querySelector(".prev-btn");
    const next = document.querySelector(".next-btn");
    
    if (prev) {
        prev.onclick = (e) => {
            e.preventDefault();
            goToTVBannerSlide(currentBannerIndex - 1);
        };
    }
    
    if (next) {
        next.onclick = (e) => {
            e.preventDefault();
            goToTVBannerSlide(currentBannerIndex + 1);
        };
    }
}

// ========================================
// تطبيق الأنماط
// ========================================

function applyTVBannerStyles() {
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

function goToTVBannerSlide(index) {
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
    restartTVBannerAutoPlay();
    
    console.log(`🔄 شريحة ${index + 1}/${cards.length}`);
}

// ========================================
// التشغيل التلقائي
// ========================================

function startTVBannerAutoPlay() {
    stopTVBannerAutoPlay();
    
    const cards = document.querySelectorAll('.banner-card');
    if (cards.length <= 1) return;
    
    bannerInterval = setInterval(() => {
        if (!isChanging && !document.hidden) {
            goToTVBannerSlide(currentBannerIndex + 1);
        }
    }, 6000);
    
    console.log("▶️ بدأ التشغيل التلقائي");
}

function stopTVBannerAutoPlay() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

function restartTVBannerAutoPlay() {
    stopTVBannerAutoPlay();
    startTVBannerAutoPlay();
}

// ========================================
// إيقاف عند إخفاء الصفحة
// ========================================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopTVBannerAutoPlay();
    } else {
        restartTVBannerAutoPlay();
    }
});

// ========================================
// إعادة تطبيق عند تغيير الحجم
// ========================================

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        applyTVBannerStyles();
    }, 300);
});

// ========================================
// معالجة الأخطاء
// ========================================

function showTVBannerError() {
    const container = document.getElementById("banner-container");
    if (!container) return;
    
    container.innerHTML = `
        <div class="banner-card active" style="position:relative;width:100%;height:100%;">
            <img src="https://via.placeholder.com/1280x500/222/fff?text=Error" 
                 alt="Error" style="width:100%;height:100%;object-fit:cover;">
            <div class="banner-overlay">
                <h2>عذراً، حدث خطأ</h2>
                <p>لم نتمكن من تحميل المسلسلات</p>
                <button class="banner-play-btn" onclick="location.reload()">
                    <i class="fas fa-sync"></i> تحديث
                </button>
            </div>
        </div>
    `;
}

// ========================================
// تشغيل المسلسل
// ========================================

function handleTVBannerPlay(id) {
    console.log(`▶️ مسلسل: ${id}`);
    
    if (typeof playSeries === 'function') {
        playSeries(id);
    } else {
        window.location.href = `watch-tv.html?id=${id}`;
    }
}

// ========================================
// تصدير للاستخدام الخارجي
// ========================================

window.handleTVBannerPlay = handleTVBannerPlay;
window.goToTVBannerSlide = goToTVBannerSlide;