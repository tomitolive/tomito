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
        
        // جلب المسلسلات الشعبية
        const arUrl = `${TV_BANNER_BASE_URL}/tv/${show.id}?api_key=${TV_BANNER_API_KEY}&language=ar`;

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
                    // جلب التفاصيل بالعربية للوصف فقط
                    const arUrl = `${TV_BANNER_BASE_URL}/tv/${show.id}?api_key=${TV_BANNER_API_KEY}&language=ar`;
                    const arRes = await fetch(arUrl);
                    
                    let arabicOverview = show.overview; // Default to English
                    
                    if (arRes.ok) {
                        const arData = await arRes.json();
                        arabicOverview = arData.overview || show.overview;
                    }
                    
                    return {
                        id: show.id,
                        name: show.original_name || show.name, // ENGLISH TITLE ONLY

                        overview: arabicOverview, // ARABIC DESCRIPTION
                        backdrop_path: show.backdrop_path,
                        vote_average: show.vote_average,
                        first_air_date: show.first_air_date
                    };
                } catch (err) {
                    console.error(`❌ خطأ في تحميل التفاصيل لـ ${show.id}:`, err);
                    return {
                        id: show.id,
                        name: show.name, // ENGLISH TITLE
                        overview: show.overview || "لا يوجد وصف متاح", // ARABIC OR ENGLISH DESCRIPTION
                        backdrop_path: show.backdrop_path,
                        vote_average: show.vote_average,
                        first_air_date: show.first_air_date
                    };
                }
            })
        );
        
        console.log(`✅ تم تحميل ${bannerSeries.length} مسلسل`);
        console.log("📋 بيانات المسلسلات:", bannerSeries);
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
        
        // إضافة تقييم إذا كان متوفرًا
        const rating = show.vote_average ? 
            `<div class="banner-rating">
                <i class="fas fa-star"></i> ${show.vote_average.toFixed(1)}
             </div>` : "";
        
        // إضافة سنة الإصدار إذا كانت متوفرة
        const year = show.first_air_date ? 
            `<div class="banner-year">
                <i class="far fa-calendar"></i> ${show.first_air_date.substring(0,4)}
             </div>` : "";
        
        card.innerHTML = `
            <img src="${img}" alt="${title}" loading="lazy">
            <div class="banner-overlay">
                <div class="banner-meta">
                    ${rating}
                    ${year}
                </div>
                <h2 class="banner-title">${title}</h2>
                <p class="banner-description">${desc}</p>
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
            // ابحث عن أقرب مسافة قبل الحد الأقصى
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
        // تحديث الوصف عند تغيير حجم الشاشة
        const cards = document.querySelectorAll('.banner-card');
        cards.forEach((card, index) => {
            const descElement = card.querySelector('.banner-description');
            if (descElement && bannerSeries[index]) {
                descElement.textContent = getTVShortDescription(bannerSeries[index].overview);
            }
        });
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
// حفظ في قائمة المشاهدة (دالة مساعدة)
// ========================================

function saveToWatchlist(id, type = 'tv') {
    try {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        
        // التحقق من وجود العنصر بالفعل
        const exists = watchlist.some(item => item.id === id && item.type === type);
        
        if (!exists) {
            watchlist.push({ id, type, addedAt: new Date().toISOString() });
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            
            // تحديث الزر
            const btn = event.target.closest('.banner-save-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-bookmark"></i> محفوظ';
                btn.classList.add('saved');
            }
            
            console.log(`✅ تم حفظ ${type} ${id} في القائمة`);
        } else {
            // إزالة من القائمة
            watchlist = watchlist.filter(item => !(item.id === id && item.type === type));
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            
            // تحديث الزر
            const btn = event.target.closest('.banner-save-btn');
            if (btn) {
                btn.innerHTML = '<i class="far fa-bookmark"></i> حفظ';
                btn.classList.remove('saved');
            }
            
            console.log(`🗑️ تم إزالة ${type} ${id} من القائمة`);
        }
    } catch (error) {
        console.error("❌ خطأ في حفظ القائمة:", error);
    }
}

// ========================================
// تصدير للاستخدام الخارجي
// ========================================

window.handleTVBannerPlay = handleTVBannerPlay;
window.goToTVBannerSlide = goToTVBannerSlide;
window.saveToWatchlist = saveToWatchlist;