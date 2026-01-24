// ========================================
// ENHANCED CAROUSEL - FULLSCREEN BACKGROUND
// ========================================

// الحالة
let currentSlide = 0;
let slides = [];
let autoPlayInterval = null;
let isAutoPlay = true;
let isFullscreen = false;

// إعدادات الكاروسيل
const carouselConfig = {
    autoPlay: true,
    autoPlayDelay: 8000, // 8 ثواني
    totalSlides: 6,
    animationSpeed: 600
};

// تهيئة الكاروسيل
async function initEnhancedCarousel() {
    console.log("🎬 جاري تحميل الكاروسيل المحسن...");
    
    try {
        // جلب الأفلام الرائجة
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en
            &sort_by=popularity.desc
            &vote_count.gte=5000
            &vote_average.gte=7`
          );
          
        
        if (!response.ok) throw new Error('فشل تحميل البيانات');
        
        const data = await response.json();
        
        // استخدام أول 6 أفلام أو أقل
        slides = data.results.slice(0, carouselConfig.totalSlides);
        
        // إذا كانت الأفلام أقل، نستخدم بيانات افتراضية
        if (slides.length < 3) {
            slides = slides.concat(getFallbackMovies().slice(0, carouselConfig.totalSlides - slides.length));
        }
        
        // تحديث الواجهة
        updateSlidesCount();
        updateCarousel();
        setupIndicators();
        
        // بدء التشغيل التلقائي
        if (carouselConfig.autoPlay) {
            startAutoPlay();
        }
        
        // إضافة مستمعات الأحداث
        setupEventListeners();
        
        console.log(`✅ تم تحميل ${slides.length} شريحة بنجاح`);
        
    } catch (error) {
        console.error("❌ خطأ في تحميل الكاروسيل:", error);
        
        // استخدام بيانات افتراضية في حالة الخطأ
        slides = getFallbackMovies();
        updateSlidesCount();
        updateCarousel();
        setupIndicators();
    }
}

// بيانات افتراضية للطوارئ
function getFallbackMovies() {
    return [
        {
            id: 1,
            title: "أفضل الأفلام على توميتو",
            backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
            poster_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
            overview: "استمتع بأفضل الأفلام العربية والعالمية بجودة عالية ومشاهدة مجانية. منصة توميتو تقدم لك أحدث الإصدارات.",
            vote_average: 8.5,
            release_date: "2024-01-01",
            runtime: 120,
            genres: [{ name: 'أكشن' }, { name: 'مغامرة' }, { name: 'دراما' }]
        },
        {
            id: 2,
            title: "مسلسلات حصرية",
            backdrop_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
            poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
            overview: "أحدث المسلسلات العربية والعالمية. حلقات جديدة أسبوعياً. لا تفوت متعة المشاهدة.",
            vote_average: 8.2,
            release_date: "2024-01-01",
            runtime: 45,
            genres: [{ name: 'دراما' }, { name: 'رومانسي' }]
        },
        {
            id: 3,
            title: "أفلام أكشن",
            backdrop_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
            poster_path: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
            overview: "أقوى أفلام الأكشن والمغامرات. مشاهد مذهلة وإثارة لا تنتهي. تشويق من البداية للنهاية.",
            vote_average: 7.9,
            release_date: "2024-01-01",
            runtime: 135,
            genres: [{ name: 'أكشن' }, { name: 'مغامرة' }]
        },
        {
            id: 4,
            title: "كوميديا ومرح",
            backdrop_path: "/8x21O7LcVz3qzmHtgHltur2NtQr.jpg",
            poster_path: "/8x21O7LcVz3qzmHtgHltur2NtQr.jpg",
            overview: "أطرف الأفلام والمسلسلات الكوميدية. اضحك من قلبك مع أفضل الأعمال الفكاهية.",
            vote_average: 7.5,
            release_date: "2024-01-01",
            runtime: 95,
            genres: [{ name: 'كوميديا' }, { name: 'عائلي' }]
        },
        {
            id: 5,
            title: "رعب وإثارة",
            backdrop_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
            poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
            overview: "أكثر الأفلام رعباً وإثارة. تشويق ورهبة لا مثيل لها. هل تجرؤ على المشاهدة؟",
            vote_average: 7.8,
            release_date: "2024-01-01",
            runtime: 110,
            genres: [{ name: 'رعب' }, { name: 'إثارة' }]
        },
        {
            id: 6,
            title: "خيال علمي",
            backdrop_path: "/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
            poster_path: "/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
            overview: "عالم من الخيال والإبداع. استكشف المستقبل مع أفضل أفلام الخيال العلمي.",
            vote_average: 8.1,
            release_date: "2024-01-01",
            runtime: 150,
            genres: [{ name: 'خيال علمي' }, { name: 'مغامرة' }]
        }
    ];
}

// تحديث الكاروسيل
function updateCarousel() {
    if (!slides || slides.length === 0) return;
    
    const slide = slides[currentSlide];
    
    // تحديث الخلفية
    updateBackground(slide);
    
    // تحديث المعلومات
    updateSlideInfo(slide);
    
    // تحديث المؤشرات
    updateActiveIndicator();
    
    // تحديث العداد
    updateSlideCounter();
}

// تحديث الخلفية
function updateBackground(slide) {
    const backdrop = document.getElementById('carouselBackdrop');
    if (!backdrop) return;
    
    const backdropUrl = slide.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${slide.backdrop_path}`
        : `https://image.tmdb.org/t/p/original${slide.poster_path}`;
    
    backdrop.style.backgroundImage = `url('${backdropUrl}')`;
    backdrop.style.opacity = '0';
    
    // تأثير التلاشي
    setTimeout(() => {
        backdrop.style.opacity = '1';
    }, 50);
}

// تحديث معلومات الشريحة
function updateSlideInfo(slide) {
    // العنوان
    const titleElement = document.getElementById('carouselTitle');
    if (titleElement) {
        titleElement.textContent = slide.title || 'فيلم بدون عنوان';
    }
    
    // التقييم
    const ratingElement = document.getElementById('carouselRating');
    if (ratingElement) {
        ratingElement.textContent = slide.vote_average ? slide.vote_average.toFixed(1) : 'N/A';
    }
    
    // السنة
    const yearElement = document.getElementById('carouselYear');
    if (yearElement && slide.release_date) {
        yearElement.textContent = new Date(slide.release_date).getFullYear();
    }
    
    // المدة
    const durationElement = document.getElementById('carouselDuration');
    if (durationElement && slide.runtime) {
        durationElement.textContent = `${slide.runtime} دقيقة`;
    }
    
    // الوصف
    const descElement = document.getElementById('carouselDescription');
    if (descElement) {
        const description = slide.overview || 'وصف الفيلم غير متوفر حالياً.';
        descElement.textContent = description.length > 200 
            ? description.substring(0, 200) + '...' 
            : description;
    }
    
    // التصنيفات
    const genresElement = document.getElementById('carouselGenres');
    if (genresElement) {
        const genres = slide.genres || [{ name: 'فيلم' }];
        genresElement.innerHTML = genres
            .slice(0, 3)
            .map(genre => `<span class="genre-tag">${genre.name}</span>`)
            .join('');
    }
    
    // البوستر
    const posterElement = document.getElementById('carouselPoster');
    if (posterElement && slide.poster_path) {
        posterElement.src = `https://image.tmdb.org/t/p/w500${slide.poster_path}`;
        posterElement.alt = slide.title || 'صورة الفيلم';
    }
}

// تحديث عدد الشرائح
function updateSlidesCount() {
    const totalElement = document.getElementById('totalSlides');
    if (totalElement) {
        totalElement.textContent = slides.length;
    }
}

// تحديث العداد
function updateSlideCounter() {
    const currentElement = document.getElementById('currentSlide');
    if (currentElement) {
        currentElement.textContent = currentSlide + 1;
    }
}

// إعداد المؤشرات
function setupIndicators() {
    const container = document.getElementById('carouselIndicators');
    if (!container) return;
    
    container.innerHTML = '';
    
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === currentSlide ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(index);
        container.appendChild(indicator);
    });
}

// تحديث المؤشر النشط
function updateActiveIndicator() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// الانتقال لشريحة معينة
function goToSlide(index) {
    if (index < 0 || index >= slides.length || index === currentSlide) return;
    
    currentSlide = index;
    updateCarousel();
    resetAutoPlay();
}

// الشريحة التالية
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
    resetAutoPlay();
}

// الشريحة السابقة
function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
    resetAutoPlay();
}

// التشغيل التلقائي
function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, carouselConfig.autoPlayDelay);
    
    isAutoPlay = true;
    updatePauseButton();
}

// إيقاف التشغيل التلقائي
function pauseAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        isAutoPlay = false;
    } else {
        startAutoPlay();
        isAutoPlay = true;
    }
    
    updatePauseButton();
}

// إعادة التشغيل التلقائي
function resetAutoPlay() {
    if (isAutoPlay) {
        pauseAutoPlay();
        startAutoPlay();
    }
}

// تحديث زر الإيقاف
function updatePauseButton() {
    const pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;
    
    const icon = pauseBtn.querySelector('i');
    if (icon) {
        icon.className = isAutoPlay ? 'fas fa-pause' : 'fas fa-play';
    }
}

// ملء الشاشة
function toggleFullscreen() {
    const carousel = document.querySelector('.carousel-container');
    
    if (!document.fullscreenElement) {
        if (carousel.requestFullscreen) {
            carousel.requestFullscreen();
        } else if (carousel.webkitRequestFullscreen) {
            carousel.webkitRequestFullscreen();
        } else if (carousel.msRequestFullscreen) {
            carousel.msRequestFullscreen();
        }
        isFullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
    }
}

// مشاهدة الفيلم الحالي
function playCurrentMovie() {
    const movie = slides[currentSlide];
    if (!movie) return;

    goToWatch(movie.id, movie.media_type || "movie");
}


// عرض التفاصيل
function showMovieDetails() {
    if (!slides || slides.length === 0) return;
    
    const movie = slides[currentSlide];
    
    // يمكنك فتح صفحة تفاصيل أو عرض نافذة منبثقة
    window.location.href = `movie.html?id=${movie.id}`;
}

// إضافة/إزالة من المفضلة
function toggleFavorite() {
    if (!slides || slides.length === 0) return;
    
    const movie = slides[currentSlide];
    const isFavorite = checkIfFavorite(movie.id);
    
    if (isFavorite) {
        removeFromFavorites(movie.id);
        showNotification(`💔 تمت إزالة "${movie.title}" من المفضلة`);
    } else {
        addToFavorites(movie);
        showNotification(`❤️ تمت إضافة "${movie.title}" إلى المفضلة`);
    }
    
    updateFavoriteButton();
}

// التحقق من المفضلة
function checkIfFavorite(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.id === movieId);
}

// إضافة للمفضلة
function addToFavorites(movie) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // تجنب التكرار
    if (!favorites.some(fav => fav.id === movie.id)) {
        favorites.push({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            addedAt: new Date().toISOString()
        });
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

// إزالة من المفضلة
function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// تحديث زر المفضلة
function updateFavoriteButton() {
    if (!slides || slides.length === 0) return;
    
    const movie = slides[currentSlide];
    const isFavorite = checkIfFavorite(movie.id);
    const button = document.querySelector('.favorite-button i');
    
    if (button) {
        button.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    }
}

// حفظ في سجل المشاهدة
function saveToWatchHistory(movie) {
    let history = JSON.parse(localStorage.getItem('watchHistory')) || [];
    
    history.unshift({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        watchedAt: new Date().toISOString()
    });
    
    // حفظ آخر 50 مشاهدة فقط
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('watchHistory', JSON.stringify(history));
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
    // مستمعات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.carousel-container')) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                prevSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextSlide();
                break;
            case ' ':
            case 'Spacebar':
                e.preventDefault();
                pauseAutoPlay();
                break;
            case 'Escape':
                if (isFullscreen) {
                    toggleFullscreen();
                }
                break;
        }
    });
    
    // مستمعات اللمس
    const carousel = document.querySelector('.carousel-main');
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
                    nextSlide(); // سحب لليسار = التالي
                } else {
                    prevSlide(); // سحب لليمين = السابق
                }
            }
        }, { passive: true });
    }
    
    // مستمع تغيير حجم الشاشة
    window.addEventListener('resize', () => {
        // إعادة حساب الأبعاد إذا لزم
        updateCarousel();
    });
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initEnhancedCarousel();
    }, 1000);
});

// جعل الوظائف متاحة عالمياً
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.pauseAutoPlay = pauseAutoPlay;
window.toggleFullscreen = toggleFullscreen;
window.playCurrentMovie = playCurrentMovie;
window.showMovieDetails = showMovieDetails;
window.toggleFavorite = toggleFavorite;
window.goToSlide = goToSlide;document.getElementById("carouselPoster").onclick = () => {
    const movie = slides[currentSlide];
    goToWatch(movie.id, movie.media_type || "movie");
};


