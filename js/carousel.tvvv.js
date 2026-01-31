// ===========================================
// الإعدادات الأساسية
// ===========================================
const CONFIG = {
    API_KEY: "882e741f7283dc9ba1654d4692ec30f6",
    BASE_URL: "https://api.themoviedb.org/3",
    BASE_IMG: "https://image.tmdb.org/t/p"
};

// ===========================================
// المتغيرات العامة
// ===========================================
let swiperTrending = null;
let swiperMovies = null;
let swiperSeries = null;

// ===========================================
// تهيئة جميع الكاروسيلات
// ===========================================
async function initAllCarousels() {
    console.log('🎬 بدء تحميل جميع الكاروسيلات...');
    
    // تحميل البيانات بالتوازي
    await Promise.all([
        fetchTrending(),
        fetchMovies(),
        fetchSeries()
    ]);
    
    console.log('✅ تم تحميل جميع الكاروسيلات بنجاح');
}

// ===========================================
// 1. الكاروسيل الأول: Trending (كل المحتوى)
// ===========================================
async function fetchTrending() {
    try {
        const response = await fetch(
            `${CONFIG.BASE_URL}/trending/all/day?api_key=${CONFIG.API_KEY}&language=ar&page=1`
        );
        const data = await response.json();
        
        displayTrending(data.results);
        initTrendingSwiper();
        
        console.log(`✅ تم تحميل ${data.results.length} عنصر تريند`);
    } catch (error) {
        console.error('خطأ في جلب التريند:', error);
    }
}

function displayTrending(items) {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.slice(0, 20).forEach(item => {
        const isMovie = item.media_type === 'movie';
        const title = isMovie ? item.title : item.name;
        const year = isMovie 
            ? (item.release_date ? item.release_date.split('-')[0] : '--')
            : (item.first_air_date ? item.first_air_date.split('-')[0] : '--');
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '--';
        const posterPath = item.poster_path 
            ? `${CONFIG.BASE_IMG}/w500${item.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.onclick = () => {
            if (isMovie) {
                window.location.href = `watch-movie.html?id=${item.id}`;
            } else {
                window.location.href = `watch-tv.html?id=${item.id}`;
            }
        };
        
        slide.innerHTML = `
            <img src="${posterPath}" alt="${title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/fff?text=لا+توجد+صورة'">
            <div class="series-info">
                <div class="series-title">${title}</div>
                <div class="series-meta">
                    <span>${year}</span>
                    <span class="series-rating">
                        ⭐ ${rating}
                    </span>
                    <span class="media-badge">${isMovie ? 'فيلم' : 'مسلسل'}</span>
                </div>
            </div>
        `;
        
        container.appendChild(slide);
    });
}

function initTrendingSwiper() {
    if (swiperTrending) {
        swiperTrending.destroy(true, true);
    }
    
    swiperTrending = new Swiper('.swiper-trending', {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: true,
        loop: true,
        spaceBetween: 10,
        grabCursor: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 600,
        breakpoints: {
            600: { slidesPerView: 2, spaceBetween: 15 },
            900: { slidesPerView: 3, centeredSlides: false },
            1200: { slidesPerView: 4 },
            1500: { slidesPerView: 5 }
        },
        navigation: {
            nextEl: '.trending-right',
            prevEl: '.trending-left',
        }
    });
}

// ===========================================
// 2. الكاروسيل الثاني: الأفلام فقط
// ===========================================
async function fetchMovies() {
    try {
        const response = await fetch(
            `${CONFIG.BASE_URL}/movie/now_playing?api_key=${CONFIG.API_KEY}&language=ar&page=1`
        );
        const data = await response.json();
        
        displayMovies(data.results);
        initMoviesSwiper();
        
        console.log(`✅ تم تحميل ${data.results.length} فيلم`);
    } catch (error) {
        console.error('خطأ في جلب الأفلام:', error);
    }
}

function displayMovies(movies) {
    const container = document.getElementById('movies-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    movies.slice(0, 15).forEach(movie => {
        const title = movie.title || movie.original_title || 'بدون عنوان';
        const year = movie.release_date ? movie.release_date.split('-')[0] : '--';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '--';
        const posterPath = movie.poster_path 
            ? `${CONFIG.BASE_IMG}/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.onclick = () => {
            window.location.href = `watch-movie.html?id=${movie.id}`;
        };
        
        slide.innerHTML = `
            <img src="${posterPath}" alt="${title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/fff?text=لا+توجد+صورة'">
            <div class="series-info">
                <div class="series-title">${title}</div>
                <div class="series-meta">
                    <span>${year}</span>
                    <span class="series-rating">
                        ⭐ ${rating}
                    </span>
                </div>
            </div>
        `;
        
        container.appendChild(slide);
    });
}

function initMoviesSwiper() {
    if (swiperMovies) {
        swiperMovies.destroy(true, true);
    }
    
    swiperMovies = new Swiper('.swiper-movies', {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: true,
        loop: true,
        spaceBetween: 10,
        grabCursor: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 600,
        breakpoints: {
            600: { slidesPerView: 2, spaceBetween: 15 },
            900: { slidesPerView: 3, centeredSlides: false },
            1200: { slidesPerView: 4 },
            1500: { slidesPerView: 5 }
        },
        navigation: {
            nextEl: '.movies-right',
            prevEl: '.movies-left',
        }
    });
}

// ===========================================
// 3. الكاروسيل الثالث: المسلسلات فقط
// ===========================================
async function fetchSeries() {
    try {
        const response = await fetch(
            `${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=ar&page=1`
        );
        const data = await response.json();
        
        displaySeries(data.results);
        initSeriesSwiper();
        
        console.log(`✅ تم تحميل ${data.results.length} مسلسل`);
    } catch (error) {
        console.error('خطأ في جلب المسلسلات:', error);
    }
}

function displaySeries(seriesList) {
    const container = document.getElementById('series-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    seriesList.slice(0, 15).forEach(series => {
        const title = series.name || series.original_name || 'بدون عنوان';
        const year = series.first_air_date ? series.first_air_date.split('-')[0] : '--';
        const rating = series.vote_average ? series.vote_average.toFixed(1) : '--';
        const posterPath = series.poster_path 
            ? `${CONFIG.BASE_IMG}/w500${series.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.onclick = () => {
            window.location.href = `watch-tv.html?id=${series.id}`;
        };
        
        slide.innerHTML = `
            <img src="${posterPath}" alt="${title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/fff?text=لا+توجد+صورة'">
            <div class="series-info">
                <div class="series-title">${title}</div>
                <div class="series-meta">
                    <span>${year}</span>
                    <span class="series-rating">
                        ⭐ ${rating}
                    </span>
                </div>
            </div>
        `;
        
        container.appendChild(slide);
    });
}

function initSeriesSwiper() {
    if (swiperSeries) {
        swiperSeries.destroy(true, true);
    }
    
    swiperSeries = new Swiper('.swiper-series', {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: true,
        loop: true,
        spaceBetween: 10,
        grabCursor: true,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 600,
        breakpoints: {
            600: { slidesPerView: 2, spaceBetween: 15 },
            900: { slidesPerView: 3, centeredSlides: false },
            1200: { slidesPerView: 4 },
            1500: { slidesPerView: 5 }
        },
        navigation: {
            nextEl: '.series-right',
            prevEl: '.series-left',
        }
    });
}

// ===========================================
// بدء التشغيل عند تحميل الصفحة
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // انتظر قليلا حتى يتم تحميل كل شيء
    setTimeout(() => {
        initAllCarousels();
    }, 500);
});

// ===========================================
// دعم إعادة التهيئة عند تغيير حجم النافذة
// ===========================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (swiperTrending) swiperTrending.update();
        if (swiperMovies) swiperMovies.update();
        if (swiperSeries) swiperSeries.update();
    }, 250);
});