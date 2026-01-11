// ========================================
// CAROUSEL FUNCTIONALITY - 20 MOVIES
// ========================================

let carouselMovies = [];
let carouselPosition = 0;
let currentCarouselIndex = 0;

// تحميل الأفلام المميزة للكاروسيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        loadCarouselMovies();
    }, 100);
});

// ========================================
// تحميل 20 فيلم للكاروسيل
// ========================================
async function loadCarouselMovies() {
    try {
        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) {
            console.log('❌ عنصر carouselTrack غير موجود');
            return;
        }

        carouselTrack.innerHTML = '<div class="loading">جاري التحميل...</div>';

        // جلب صفحتين من API للحصول على 20 فيلم
        const page1 = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=1`);
        const page2 = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ar&page=2`);
        
        const data1 = await page1.json();
        const data2 = await page2.json();

        // دمج النتائج وأخذ أول 20 فيلم
        carouselMovies = [...data1.results, ...data2.results].slice(0, 20);

        if (carouselMovies.length === 0) {
            carouselTrack.innerHTML = '<div class="loading">لا توجد أفلام متاحة</div>';
            return;
        }

        // عرض الأفلام في الكاروسيل
        displayCarouselMovies();
        updateCarouselButtons();
        
        console.log(`✅ تم تحميل ${carouselMovies.length} فيلم في الكاروسيل`);

    } catch (error) {
        console.error('❌ خطأ في تحميل أفلام الكاروسيل:', error);
        const carouselTrack = document.getElementById('carouselTrack');
        if (carouselTrack) {
            carouselTrack.innerHTML = '<div class="loading">حدث خطأ في تحميل الأفلام</div>';
        }
    }
}

// ========================================
// عرض الأفلام في الكاروسيل
// ========================================
function displayCarouselMovies() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;

    carouselTrack.innerHTML = carouselMovies.map(movie => createCarouselCard(movie)).join('');
}

// ========================================
// إنشاء بطاقة فيلم للكاروسيل
// ========================================
function createCarouselCard(movie) {
    const posterPath = movie.poster_path 
        ? `${IMG_500}${movie.poster_path}` 
        : movie.backdrop_path 
        ? `${IMG_URL}${movie.backdrop_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'غير محدد';
    const title = movie.title || 'فيلم بدون عنوان';
    const overview = movie.overview ? movie.overview.substring(0, 120) + '...' : 'شاهد هذا الفيلم المثير على توميتو.';
    
    // التحقق من وجود savedMovies
    const isSaved = typeof savedMovies !== 'undefined' && savedMovies.some(m => m.id === movie.id);
    const saveIcon = isSaved ? 'fas fa-heart' : 'far fa-heart';
    const saveClass = isSaved ? 'saved' : '';
    
    return `
        <div class="carousel-card">
            <div class="carousel-card-image">
                <img src="${posterPath}" alt="${title}" loading="lazy">
                <div class="carousel-card-overlay">
                    <div class="carousel-card-info">
                        <h3 class="carousel-card-title">${title}</h3>
                        <div class="carousel-card-meta">
                            <span class="carousel-rating">
                                <i class="fas fa-star"></i> ${rating}
                            </span>
                            <span class="carousel-year">${year}</span>
                        </div>
                        <p class="carousel-card-description">${overview}</p>
                        <div class="carousel-card-actions">
                            <button class="carousel-play-btn" onclick="playMovie(${movie.id})">
                                <i class="fas fa-play"></i> شاهد الآن
                            </button>
                            <button class="carousel-save-btn ${saveClass}" onclick="toggleSave(${movie.id}, '${title.replace(/'/g, "\\'")}', '${movie.poster_path}', ${movie.vote_average || 7}, this)">
                                <i class="${saveIcon}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// التنقل في الكاروسيل - الطريقة الصحيحة
// ========================================
function scrollCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    if (!track || !carouselMovies.length) return;

    // عدد البطاقات المرئية (حسب عرض الشاشة)
    const containerWidth = track.parentElement.offsetWidth;
    const cardWidth = 280; // عرض البطاقة
    const gap = 20; // المسافة بين البطاقات
    const visibleCards = Math.floor(containerWidth / (cardWidth + gap));
    
    // التحريك حسب عدد البطاقات المرئية
    const scrollCards = Math.max(1, Math.floor(visibleCards * 0.8));
    
    // تحديث الفهرس
    currentCarouselIndex += direction * scrollCards;
    
    // الحد الأقصى
    const maxIndex = Math.max(0, carouselMovies.length - visibleCards);
    
    // منع الخروج عن الحدود
    if (currentCarouselIndex < 0) {
        currentCarouselIndex = 0;
    } else if (currentCarouselIndex > maxIndex) {
        currentCarouselIndex = maxIndex;
    }
    
    // حساب المسافة
    const moveDistance = currentCarouselIndex * (cardWidth + gap);
    
    // تطبيق الحركة
    track.style.transform = `translateX(-${moveDistance}px)`;
    
    // تحديث الأزرار
    updateCarouselButtons();
    
    console.log(`🎬 Index: ${currentCarouselIndex}, Move: ${moveDistance}px`);
}

// ========================================
// تحديث حالة الأزرار
// ========================================
function updateCarouselButtons() {
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!prevBtn || !nextBtn) return;
    
    const containerWidth = document.querySelector('.carousel-container')?.offsetWidth || 1000;
    const cardWidth = 280;
    const gap = 20;
    const visibleCards = Math.floor(containerWidth / (cardWidth + gap));
    const maxIndex = Math.max(0, carouselMovies.length - visibleCards);
    
    // تعطيل/تفعيل الأزرار
    prevBtn.disabled = currentCarouselIndex === 0;
    nextBtn.disabled = currentCarouselIndex >= maxIndex;
}

// ========================================
// إعادة ضبط عند تغيير حجم الشاشة
// ========================================
window.addEventListener('resize', () => {
    if (carouselMovies.length > 0) {
        currentCarouselIndex = 0;
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.style.transform = 'translateX(0)';
        }
        updateCarouselButtons();
    }
});

// ========================================
// جعل الدوال عامة
// ========================================
window.scrollCarousel = scrollCarousel;
window.loadCarouselMovies = loadCarouselMovies;