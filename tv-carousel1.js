// ========================================
// ENHANCED TV SERIES CAROUSEL
// ========================================

// الحالة
let currentSeriesSlide = 0;
let seriesSlides = [];
let seriesAutoPlayInterval = null;
let isSeriesAutoPlay = true;
let isSeriesFullscreen = false;

// إعدادات الكاروسيل
const seriesCarouselConfig = {
    autoPlay: true,
    autoPlayDelay: 8000, // 8 ثواني
    totalSlides: 6,
    animationSpeed: 600
};

// تهيئة كاروسيل المسلسلات
async function initSeriesCarousel() {
    console.log("🎬 جاري تحميل كاروسيل المسلسلات المحسن...");
    
    try {
        // جلب المسلسلات الرائجة
        const response = await fetch(
            `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=ar&page=1`
        );
        
        if (!response.ok) throw new Error('فشل تحميل بيانات المسلسلات');
        
        const data = await response.json();
        
        // استخدام أول 6 مسلسلات أو أقل
        seriesSlides = data.results.slice(0, seriesCarouselConfig.totalSlides);
        
        // إذا كانت المسلسلات أقل، نستخدم بيانات افتراضية
        if (seriesSlides.length < 3) {
            seriesSlides = seriesSlides.concat(getFallbackSeries().slice(0, seriesCarouselConfig.totalSlides - seriesSlides.length));
        }
        
        // تحديث الواجهة
        updateSeriesSlidesCount();
        updateSeriesCarousel();
        setupSeriesIndicators();
        
        // بدء التشغيل التلقائي
        if (seriesCarouselConfig.autoPlay) {
            startSeriesAutoPlay();
        }
        
        // إضافة مستمعات الأحداث
        setupSeriesEventListeners();
        
        console.log(`✅ تم تحميل ${seriesSlides.length} مسلسل بنجاح`);
        
    } catch (error) {
        console.error("❌ خطأ في تحميل كاروسيل المسلسلات:", error);
        
        // استخدام بيانات افتراضية في حالة الخطأ
        seriesSlides = getFallbackSeries();
        updateSeriesSlidesCount();
        updateSeriesCarousel();
        setupSeriesIndicators();
    }
}

// بيانات افتراضية للمسلسلات
function getFallbackSeries() {
    return [
        {
            id: 1,
            name: "أفضل المسلسلات على توميتو",
            backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
            poster_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
            overview: "استمتع بأفضل المسلسلات العربية والعالمية بجودة عالية. منصة توميتو تقدم لك أحدث الحلقات.",
            vote_average: 8.5,
            first_air_date: "2024-01-01",
            episode_run_time: [45],
            number_of_seasons: 3,
            genres: [{ name: 'دراما' }, { name: 'رومانسي' }],
            isSeries: true
        },
        {
            id: 2,
            name: "مسلسلات حصرية",
            backdrop_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
            poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
            overview: "أحدث المسلسلات العربية والعالمية. حلقات جديدة أسبوعياً. لا تفوت متعة المشاهدة.",
            vote_average: 8.2,
            first_air_date: "2024-01-01",
            episode_run_time: [45],
            number_of_seasons: 2,
            genres: [{ name: 'دراما' }, { name: 'رومانسي' }],
            isSeries: true
        },
        {
            id: 3,
            name: "مسلسلات أكشن",
            backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
            poster_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
            overview: "أقوى مسلسلات الأكشن والمغامرات. مشاهد مذهلة وإثارة لا تنتهي.",
            vote_average: 7.9,
            first_air_date: "2023-01-01",
            episode_run_time: [50],
            number_of_seasons: 4,
            genres: [{ name: 'أكشن' }, { name: 'مغامرة' }],
            isSeries: true
        },
        {
            id: 4,
            name: "كوميديا ومرح",
            backdrop_path: "/8x21O7LcVz3qzmHtgHltur2NtQr.jpg",
            poster_path: "/8x21O7LcVz3qzmHtgHltur2NtQr.jpg",
            overview: "أطرف المسلسلات الكوميدية. اضحك من قلبك مع أفضل الأعمال الفكاهية.",
            vote_average: 7.5,
            first_air_date: "2024-01-01",
            episode_run_time: [30],
            number_of_seasons: 1,
            genres: [{ name: 'كوميديا' }, { name: 'عائلي' }],
            isSeries: true
        },
        {
            id: 5,
            name: "رعب وإثارة",
            backdrop_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
            poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
            overview: "أكثر المسلسلات رعباً وإثارة. تشويق ورهبة لا مثيل لها.",
            vote_average: 7.8,
            first_air_date: "2024-01-01",
            episode_run_time: [60],
            number_of_seasons: 2,
            genres: [{ name: 'رعب' }, { name: 'إثارة' }],
            isSeries: true
        },
        {
            id: 6,
            name: "خيال علمي",
            backdrop_path: "/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
            poster_path: "/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
            overview: "عالم من الخيال والإبداع. استكشف المستقبل مع أفضل مسلسلات الخيال العلمي.",
            vote_average: 8.1,
            first_air_date: "2023-01-01",
            episode_run_time: [55],
            number_of_seasons: 5,
            genres: [{ name: 'خيال علمي' }, { name: 'مغامرة' }],
            isSeries: true
        }
    ];
}

// تحديث كاروسيل المسلسلات
function updateSeriesCarousel() {
    if (!seriesSlides || seriesSlides.length === 0) return;
    
    const series = seriesSlides[currentSeriesSlide];
    
    // تحديث الخلفية
    updateSeriesBackground(series);
    
    // تحديث المعلومات
    updateSeriesInfo(series);
    
    // تحديث المؤشرات
    updateSeriesActiveIndicator();
    
    // تحديث العداد
    updateSeriesSlideCounter();
}

// تحديث الخلفية
function updateSeriesBackground(series) {
    const backdrop = document.getElementById('seriesCarouselBackdrop');
    if (!backdrop) return;
    
    const backdropUrl = series.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${series.backdrop_path}`
        : `https://image.tmdb.org/t/p/original${series.poster_path}`;
    
    backdrop.style.backgroundImage = `url('${backdropUrl}')`;
    backdrop.style.opacity = '0';
    
    // تأثير التلاشي
    setTimeout(() => {
        backdrop.style.opacity = '1';
    }, 50);
}

// تحديث معلومات المسلسل
function updateSeriesInfo(series) {
    // العنوان
    const titleElement = document.getElementById('seriesCarouselTitle');
    if (titleElement) {
        titleElement.textContent = series.name || 'مسلسل بدون عنوان';
    }
    
    // التقييم
    const ratingElement = document.getElementById('seriesCarouselRating');
    if (ratingElement) {
        ratingElement.textContent = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';
    }
    
    // السنة
    const yearElement = document.getElementById('seriesCarouselYear');
    if (yearElement && series.first_air_date) {
        yearElement.textContent = new Date(series.first_air_date).getFullYear();
    }
    
    // المدة
    const durationElement = document.getElementById('seriesCarouselDuration');
    if (durationElement && series.episode_run_time && series.episode_run_time.length > 0) {
        durationElement.textContent = `${series.episode_run_time[0]} دقيقة للحلقة`;
    }
    
    // عدد المواسم
    const seasonsElement = document.getElementById('seriesCarouselSeasons');
    if (seasonsElement && series.number_of_seasons) {
        seasonsElement.textContent = `${series.number_of_seasons} مواسم`;
    }
    
    // الوصف
    const descElement = document.getElementById('seriesCarouselDescription');
    if (descElement) {
        const description = series.overview || 'وصف المسلسل غير متوفر حالياً.';
        descElement.textContent = description.length > 200 
            ? description.substring(0, 200) + '...' 
            : description;
    }
    
    // التصنيفات
    const genresElement = document.getElementById('seriesCarouselGenres');
    if (genresElement) {
        const genres = series.genres || [{ name: 'مسلسل' }];
        genresElement.innerHTML = genres
            .slice(0, 3)
            .map(genre => `<span class="genre-tag">${genre.name}</span>`)
            .join('');
    }
    
    // البوستر
    const posterElement = document.getElementById('seriesCarouselPoster');
    if (posterElement && series.poster_path) {
        posterElement.src = `https://image.tmdb.org/t/p/w500${series.poster_path}`;
        posterElement.alt = series.name || 'صورة المسلسل';
    
        posterElement.onclick = () => {
            window.location.href = `watch-tv.html?id=${series.id}`;
        };
    }
}

// تحديث عدد الشرائح
function updateSeriesSlidesCount() {
    const totalElement = document.getElementById('seriesTotalSlides');
    if (totalElement) {
        totalElement.textContent = seriesSlides.length;
    }
}

// تحديث العداد
function updateSeriesSlideCounter() {
    const currentElement = document.getElementById('seriesCurrentSlide');
    if (currentElement) {
        currentElement.textContent = currentSeriesSlide + 1;
    }
}

// إعداد المؤشرات
function setupSeriesIndicators() {
    const container = document.getElementById('seriesCarouselIndicators');
    if (!container) return;
    
    container.innerHTML = '';
    
    seriesSlides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === currentSeriesSlide ? 'active' : ''}`;
        indicator.onclick = () => goToSeriesSlide(index);
        container.appendChild(indicator);
    });
}

// تحديث المؤشر النشط
function updateSeriesActiveIndicator() {
    const indicators = document.querySelectorAll('#seriesCarouselIndicators .indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSeriesSlide);
    });
}

// الانتقال لشريحة معينة
function goToSeriesSlide(index) {
    if (index < 0 || index >= seriesSlides.length || index === currentSeriesSlide) return;
    
    currentSeriesSlide = index;
    updateSeriesCarousel();
    resetSeriesAutoPlay();
}

// الشريحة التالية
function nextSeriesSlide() {
    currentSeriesSlide = (currentSeriesSlide + 1) % seriesSlides.length;
    updateSeriesCarousel();
    resetSeriesAutoPlay();
}

// الشريحة السابقة
function prevSeriesSlide() {
    currentSeriesSlide = (currentSeriesSlide - 1 + seriesSlides.length) % seriesSlides.length;
    updateSeriesCarousel();
    resetSeriesAutoPlay();
}

// التشغيل التلقائي
function startSeriesAutoPlay() {
    if (seriesAutoPlayInterval) clearInterval(seriesAutoPlayInterval);
    
    seriesAutoPlayInterval = setInterval(() => {
        nextSeriesSlide();
    }, seriesCarouselConfig.autoPlayDelay);
    
    isSeriesAutoPlay = true;
    updateSeriesPauseButton();
}

// إيقاف التشغيل التلقائي
function pauseSeriesAutoPlay() {
    if (seriesAutoPlayInterval) {
        clearInterval(seriesAutoPlayInterval);
        seriesAutoPlayInterval = null;
        isSeriesAutoPlay = false;
    } else {
        startSeriesAutoPlay();
        isSeriesAutoPlay = true;
    }
    
    updateSeriesPauseButton();
}

// إعادة التشغيل التلقائي
function resetSeriesAutoPlay() {
    if (isSeriesAutoPlay) {
        pauseSeriesAutoPlay();
        startSeriesAutoPlay();
    }
}

// تحديث زر الإيقاف
function updateSeriesPauseButton() {
    const pauseBtn = document.getElementById('seriesPauseBtn');
    if (!pauseBtn) return;
    
    const icon = pauseBtn.querySelector('i');
    if (icon) {
        icon.className = isSeriesAutoPlay ? 'fas fa-pause' : 'fas fa-play';
    }
}

// ملء الشاشة
function toggleSeriesFullscreen() {
    const carousel = document.querySelector('.series-carousel-container');
    
    if (!document.fullscreenElement) {
        if (carousel.requestFullscreen) {
            carousel.requestFullscreen();
        } else if (carousel.webkitRequestFullscreen) {
            carousel.webkitRequestFullscreen();
        } else if (carousel.msRequestFullscreen) {
            carousel.msRequestFullscreen();
        }
        isSeriesFullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isSeriesFullscreen = false;
    }
}
function playCurrentSeries() {
    if (!seriesSlides || seriesSlides.length === 0) return;

    const series = seriesSlides[currentSeriesSlide];
    if (!series || !series.id) return;

    window.location.href = `watch-tv.html?id=${series.id}`;
}

// عرض التفاصيل
function showSeriesDetails() {
    if (!seriesSlides || seriesSlides.length === 0) return;
    
    const series = seriesSlides[currentSeriesSlide];
    
    // يمكنك فتح صفحة تفاصيل أو عرض نافذة منبثقة
    window.location.href = `series.html?id=${series.id}`;
}

// إضافة/إزالة من المفضلة
function toggleSeriesFavorite() {
    if (!seriesSlides || seriesSlides.length === 0) return;
    
    const series = seriesSlides[currentSeriesSlide];
    const isFavorite = checkIfSeriesFavorite(series.id);
    
    if (isFavorite) {
        removeFromSeriesFavorites(series.id);
        showNotification(`💔 تمت إزالة "${series.name}" من المفضلة`);
    } else {
        addToSeriesFavorites(series);
        showNotification(`❤️ تمت إضافة "${series.name}" إلى المفضلة`);
    }
    
    updateSeriesFavoriteButton();
}

// التحقق من المفضلة
function checkIfSeriesFavorite(seriesId) {
    const favorites = JSON.parse(localStorage.getItem('seriesFavorites')) || [];
    return favorites.some(fav => fav.id === seriesId);
}

// إضافة للمفضلة
function addToSeriesFavorites(series) {
    const favorites = JSON.parse(localStorage.getItem('seriesFavorites')) || [];
    
    // تجنب التكرار
    if (!favorites.some(fav => fav.id === series.id)) {
        favorites.push({
            id: series.id,
            name: series.name,
            poster_path: series.poster_path,
            vote_average: series.vote_average,
            addedAt: new Date().toISOString()
        });
        
        localStorage.setItem('seriesFavorites', JSON.stringify(favorites));
    }
}

// إزالة من المفضلة
function removeFromSeriesFavorites(seriesId) {
    let favorites = JSON.parse(localStorage.getItem('seriesFavorites')) || [];
    favorites = favorites.filter(fav => fav.id !== seriesId);
    localStorage.setItem('seriesFavorites', JSON.stringify(favorites));
}

// تحديث زر المفضلة
function updateSeriesFavoriteButton() {
    if (!seriesSlides || seriesSlides.length === 0) return;
    
    const series = seriesSlides[currentSeriesSlide];
    const isFavorite = checkIfSeriesFavorite(series.id);
    const button = document.querySelector('.series-favorite-button i');
    
    if (button) {
        button.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    }
}

// حفظ في سجل المشاهدة
function saveToSeriesWatchHistory(series) {
    let history = JSON.parse(localStorage.getItem('seriesWatchHistory')) || [];
    
    history.unshift({
        id: series.id,
        name: series.name,
        poster_path: series.poster_path,
        watchedAt: new Date().toISOString()
    });
    
    // حفظ آخر 50 مشاهدة فقط
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('seriesWatchHistory', JSON.stringify(history));
}

// إعداد مستمعات الأحداث
function setupSeriesEventListeners() {
    // مستمعات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        const seriesCarousel = document.querySelector('.series-carousel-container');
        if (!seriesCarousel || !seriesCarousel.contains(document.activeElement)) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                prevSeriesSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextSeriesSlide();
                break;
            case ' ':
            case 'Spacebar':
                e.preventDefault();
                pauseSeriesAutoPlay();
                break;
            case 'Escape':
                if (isSeriesFullscreen) {
                    toggleSeriesFullscreen();
                }
                break;
        }
    });
    
    // مستمعات اللمس
    const carousel = document.querySelector('.series-carousel-main');
    if (carousel) {
        let startX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    nextSeriesSlide(); // سحب لليسار = التالي
                } else {
                    prevSeriesSlide(); // سحب لليمين = السابق
                }
            }
        }, { passive: true });
    }
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تحميل كاروسيل المسلسلات
    setTimeout(() => {
        initSeriesCarousel();
    }, 1500);
});

// جعل الوظائف متاحة عالمياً
window.nextSeriesSlide = nextSeriesSlide;
window.prevSeriesSlide = prevSeriesSlide;
window.pauseSeriesAutoPlay = pauseSeriesAutoPlay;
window.toggleSeriesFullscreen = toggleSeriesFullscreen;
window.playCurrentSeries = playCurrentSeries;
window.showSeriesDetails = showSeriesDetails;
window.toggleSeriesFavorite = toggleSeriesFavorite;
window.goToSeriesSlide = goToSeriesSlide;