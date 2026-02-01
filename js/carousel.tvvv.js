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

// بيانات التحميل التلقائي
const carouselData = {
    trending: {
        currentPage: 1,
        totalPages: 1,
        isLoading: false,
        hasMore: true
    },
    movies: {
        currentPage: 1,
        totalPages: 1,
        isLoading: false,
        hasMore: true
    },
    series: {
        currentPage: 1,
        totalPages: 1,
        isLoading: false,
        hasMore: true
    }
};

// ===========================================
// تهيئة جميع الكاروسيلات
// ===========================================
async function initAllCarousels() {
    console.log('🎬 بدء تحميل جميع الكاروسيلات...');
    
    // تحميل البيانات الأولية
    await Promise.all([
        fetchTrending(true),
        fetchMovies(true),
        fetchSeries(true)
    ]);
    
    console.log('✅ تم تحميل جميع الكاروسيلات بنجاح');
}

// ===========================================
// 1. الكاروسيل الأول: Trending (كل المحتوى) مع Infinite Scroll
// ===========================================
async function fetchTrending(isInitial = false) {
    if (carouselData.trending.isLoading || !carouselData.trending.hasMore) return;
    
    carouselData.trending.isLoading = true;
    
    try {
        const response = await fetch(
            `${CONFIG.BASE_URL}/trending/all/day?api_key=${CONFIG.API_KEY}&language=ar&page=${carouselData.trending.currentPage}`
        );
        const data = await response.json();
        
        carouselData.trending.totalPages = data.total_pages;
        carouselData.trending.hasMore = carouselData.trending.currentPage < data.total_pages;
        
        displayTrending(data.results, isInitial);
        
        if (isInitial) {
            initTrendingSwiper();
        }
        
        console.log(`✅ تم تحميل صفحة ${carouselData.trending.currentPage} من التريند`);
        
        // زيادة رقم الصفحة للتحميل التالي
        carouselData.trending.currentPage++;
        
    } catch (error) {
        console.error('خطأ في جلب التريند:', error);
    } finally {
        carouselData.trending.isLoading = false;
    }
}

function displayTrending(items, isInitial = false) {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    // إذا كان تحميل أولي، امسح المحتوى القديم
    if (isInitial) {
        container.innerHTML = '';
    }
    
    items.forEach(item => {
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
    
    // إذا لم يكن تحميل أولي، قم بتحديث السوايبر
    if (!isInitial && swiperTrending) {
        swiperTrending.update();
    }
}

function initTrendingSwiper() {
    if (swiperTrending) {
        swiperTrending.destroy(true, true);
    }
    
    swiperTrending = new Swiper('.swiper-trending', {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: false,
        loop: false,
        spaceBetween: 15,
        grabCursor: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 600,
        breakpoints: {
            600: { 
                slidesPerView: 2, 
                spaceBetween: 15
            },
            900: { 
                slidesPerView: 3
            },
            1200: { 
                slidesPerView: 4 
            },
            1500: { 
                slidesPerView: 5 
            }
        },
        navigation: {
            nextEl: '.trending-right',
            prevEl: '.trending-left',
        }
    });
    
    // إضافة حدث للتحميل التلقائي عند الوصول للنهاية
    setupInfiniteScroll(swiperTrending, 'trending');
}

// ===========================================
// 2. الكاروسيل الثاني: الأفلام فقط مع Infinite Scroll
// ===========================================
async function fetchMovies(isInitial = false) {
    if (carouselData.movies.isLoading || !carouselData.movies.hasMore) return;
    
    carouselData.movies.isLoading = true;
    
    try {
        const response = await fetch(
            `${CONFIG.BASE_URL}/movie/now_playing?api_key=${CONFIG.API_KEY}&language=ar&page=${carouselData.movies.currentPage}`
        );
        const data = await response.json();
        
        carouselData.movies.totalPages = data.total_pages;
        carouselData.movies.hasMore = carouselData.movies.currentPage < data.total_pages;
        
        displayMovies(data.results, isInitial);
        
        if (isInitial) {
            initMoviesSwiper();
        }
        
        console.log(`✅ تم تحميل صفحة ${carouselData.movies.currentPage} من الأفلام`);
        
        carouselData.movies.currentPage++;
        
    } catch (error) {
        console.error('خطأ في جلب الأفلام:', error);
    } finally {
        carouselData.movies.isLoading = false;
    }
}

function displayMovies(movies, isInitial = false) {
    const container = document.getElementById('movies-container');
    if (!container) return;
    
    if (isInitial) {
        container.innerHTML = '';
    }
    
    movies.forEach(movie => {
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
    
    if (!isInitial && swiperMovies) {
        swiperMovies.update();
    }
}

function initMoviesSwiper() {
    if (swiperMovies) {
        swiperMovies.destroy(true, true);
    }
    
    swiperMovies = new Swiper('.swiper-movies', {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: false,
        loop: false,
        spaceBetween: 15,
        grabCursor: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 600,
        breakpoints: {
            600: { 
                slidesPerView: 2, 
                spaceBetween: 15
            },
            900: { 
                slidesPerView: 3
            },
            1200: { 
                slidesPerView: 4 
            },
            1500: { 
                slidesPerView: 5 
            }
        },
        navigation: {
            nextEl: '.movies-right',
            prevEl: '.movies-left',
        }
    });
    
    // إضافة حدث للتحميل التلقائي
    setupInfiniteScroll(swiperMovies, 'movies');
}

// ===========================================
// 3. الكاروسيل الثالث: المسلسلات فقط مع Infinite Scroll
// ===========================================
async function fetchSeries(isInitial = false) {
    if (carouselData.series.isLoading || !carouselData.series.hasMore) return;
    
    carouselData.series.isLoading = true;
    
    try {
        const response = await fetch(
            `${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=ar&page=${carouselData.series.currentPage}`
        );
        const data = await response.json();
        
        carouselData.series.totalPages = data.total_pages;
        carouselData.series.hasMore = carouselData.series.currentPage < data.total_pages;
        
        displaySeries(data.results, isInitial);
        
        if (isInitial) {
            initSeriesSwiper();
        }
        
        console.log(`✅ تم تحميل صفحة ${carouselData.series.currentPage} من المسلسلات`);
        
        carouselData.series.currentPage++;
        
    } catch (error) {
        console.error('خطأ في جلب المسلسلات:', error);
    } finally {
        carouselData.series.isLoading = false;
    }
}

function displaySeries(seriesList, isInitial = false) {
    const container = document.getElementById('series-container');
    if (!container) return;
    
    if (isInitial) {
        container.innerHTML = '';
    }
    
    seriesList.forEach(series => {
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
    
    if (!isInitial && swiperSeries) {
        swiperSeries.update();
    }
}

function initSeriesSwiper() {
    if (swiperSeries) {
        swiperSeries.destroy(true, true);
    }
    
    swiperSeries = new Swiper('.swiper-series', {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: false,
        loop: false,
        spaceBetween: 15,
        grabCursor: true,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 600,
        breakpoints: {
            600: { 
                slidesPerView: 2, 
                spaceBetween: 15
            },
            900: { 
                slidesPerView: 3
            },
            1200: { 
                slidesPerView: 4 
            },
            1500: { 
                slidesPerView: 5 
            }
        },
        navigation: {
            nextEl: '.series-right',
            prevEl: '.series-left',
        }
    });
    
    // إضافة حدث للتحميل التلقائي
    setupInfiniteScroll(swiperSeries, 'series');
}

// ===========================================
// دالة لإعداد Infinite Scroll للكاروسيل
// ===========================================
function setupInfiniteScroll(swiper, carouselType) {
    // إضافة علامة تحميل في نهاية الكاروسيل
    const container = swiper.el.querySelector('.swiper-wrapper');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.cssText = `
        display: none;
        width: 100%;
        text-align: center;
        padding: 20px;
        color: #fff;
        font-size: 14px;
    `;
    loadingIndicator.innerHTML = 'جاري تحميل المزيد...';
    container.parentNode.appendChild(loadingIndicator);
    
    // إضافة حدث عند الوصول لآخر شريحة
    swiper.on('reachEnd', async function() {
        // تحقق إذا كان هناك المزيد للتحميل
        const data = carouselData[carouselType];
        
        if (data.isLoading || !data.hasMore) return;
        
        // إظهار مؤشر التحميل
        loadingIndicator.style.display = 'block';
        
        // تحميل المزيد من البيانات
        switch(carouselType) {
            case 'trending':
                await fetchTrending(false);
                break;
            case 'movies':
                await fetchMovies(false);
                break;
            case 'series':
                await fetchSeries(false);
                break;
        }
        
        // إخفاء مؤشر التحميل
        loadingIndicator.style.display = 'none';
        
        // تحديث حالة الأزرار
        updateNavigationButtons(swiper, carouselType);
    });
    
    // تحديث حالة أزرار التنقل
    updateNavigationButtons(swiper, carouselType);
    
    // تحديث حالة الأزرار عند التمرير
    swiper.on('slideChange', function() {
        updateNavigationButtons(swiper, carouselType);
    });
}

// ===========================================
// دالة لتحديث حالة أزرار التنقل
// ===========================================
function updateNavigationButtons(swiper, carouselType) {
    const data = carouselData[carouselType];
    
    let nextBtn, prevBtn;
    
    switch(carouselType) {
        case 'trending':
            nextBtn = document.querySelector('.trending-right');
            prevBtn = document.querySelector('.trending-left');
            break;
        case 'movies':
            nextBtn = document.querySelector('.movies-right');
            prevBtn = document.querySelector('.movies-left');
            break;
        case 'series':
            nextBtn = document.querySelector('.series-right');
            prevBtn = document.querySelector('.series-left');
            break;
    }
    
    if (!nextBtn || !prevBtn) return;
    
    // تحديث زر السابق
    if (swiper.isBeginning) {
        prevBtn.style.opacity = '0.3';
        prevBtn.style.cursor = 'not-allowed';
        prevBtn.style.pointerEvents = 'none';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
        prevBtn.style.pointerEvents = 'all';
    }
    
    // تحديث زر التالي
    if (swiper.isEnd && !data.hasMore) {
        nextBtn.style.opacity = '0.3';
        nextBtn.style.cursor = 'not-allowed';
        nextBtn.style.pointerEvents = 'none';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
        nextBtn.style.pointerEvents = 'all';
    }
}

// ===========================================
// دالة لتحميل المزيد يدوياً (زر تحميل المزيد)
// ===========================================
function loadMore(carouselType) {
    switch(carouselType) {
        case 'trending':
            fetchTrending(false);
            break;
        case 'movies':
            fetchMovies(false);
            break;
        case 'series':
            fetchSeries(false);
            break;
    }
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
        if (swiperTrending) {
            swiperTrending.update();
            updateNavigationButtons(swiperTrending, 'trending');
        }
        if (swiperMovies) {
            swiperMovies.update();
            updateNavigationButtons(swiperMovies, 'movies');
        }
        if (swiperSeries) {
            swiperSeries.update();
            updateNavigationButtons(swiperSeries, 'series');
        }
    }, 250);
});