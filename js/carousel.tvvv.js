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

// بيانات Infinite Scroll
const infiniteData = {
    trending: {
        page: 1,
        totalPages: 1,
        isLoading: false,
        hasMore: true
    },
    movies: {
        page: 1,
        totalPages: 1,
        isLoading: false,
        hasMore: true
    },
    series: {
        page: 1,
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
    
    // تحميل البيانات بالتوازي
    await Promise.all([
        fetchTrending(),
        fetchMovies(),
        fetchSeries()
    ]);
    
    console.log('✅ تم تحميل جميع الكاروسيلات بنجاح');
}

// ===========================================
// 1. الكاروسيل الأول: Trending (كل المحتوى) مع Infinite Scroll
// ===========================================
async function fetchTrending() {
    try {
        const data = infiniteData.trending;
        if (data.isLoading) return;
        
        data.isLoading = true;
        
        const response = await fetch(
            `${CONFIG.BASE_URL}/trending/all/day?api_key=${CONFIG.API_KEY}&language=en&page=${data.page}`
        );
        const result = await response.json();
        
        // حفظ العدد الإجمالي للصفحات
        data.totalPages = result.total_pages;
        data.hasMore = data.page < result.total_pages;
        
        displayTrending(result.results, data.page === 1);
        
        if (data.page === 1) {
            initTrendingSwiper();
        }
        
        console.log(`✅ تم تحميل صفحة ${data.page} من التريند (${result.results.length} عنصر)`);
        
        // زيادة رقم الصفحة للتحميل التالي
        data.page++;
        data.isLoading = false;
        
    } catch (error) {
        console.error('خطأ في جلب التريند:', error);
        infiniteData.trending.isLoading = false;
    }
}

function displayTrending(items, isFirstLoad = false) {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    // إذا كان التحميل الأول، امسح المحتوى
    if (isFirstLoad) {
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
                window.location.href = `watch.html?id=${item.id}`;
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
    
    // تحديث السوايبر بعد إضافة عناصر جديدة
    if (swiperTrending && !isFirstLoad) {
        setTimeout(() => {
            swiperTrending.update();
            updateNavigationButtons('trending');
        }, 100);
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
                spaceBetween: 15,
                centeredSlides: false 
            },
            900: { 
                slidesPerView: 3, 
                centeredSlides: false 
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
    
    // إضافة Infinite Scroll
    setupInfiniteScroll(swiperTrending, 'trending');
}

// ===========================================
// 2. الكاروسيل الثاني: الأفلام فقط مع Infinite Scroll
// ===========================================
async function fetchMovies() {
    try {
        const data = infiniteData.movies;
        if (data.isLoading) return;
        
        data.isLoading = true;
        
        const response = await fetch(
            `${CONFIG.BASE_URL}/movie/now_playing?api_key=${CONFIG.API_KEY}&language=en&page=${data.page}`
        );
        const result = await response.json();
        
        data.totalPages = result.total_pages;
        data.hasMore = data.page < result.total_pages;
        
        displayMovies(result.results, data.page === 1);
        
        if (data.page === 1) {
            initMoviesSwiper();
        }
        
        console.log(`✅ تم تحميل صفحة ${data.page} من الأفلام (${result.results.length} عنصر)`);
        
        data.page++;
        data.isLoading = false;
        
    } catch (error) {
        console.error('خطأ في جلب الأفلام:', error);
        infiniteData.movies.isLoading = false;
    }
}

function displayMovies(movies, isFirstLoad = false) {
    const container = document.getElementById('movies-container');
    if (!container) return;
    
    if (isFirstLoad) {
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
            window.location.href = `watch.html?id=${movie.id}`;
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
    
    if (swiperMovies && !isFirstLoad) {
        setTimeout(() => {
            swiperMovies.update();
            updateNavigationButtons('movies');
        }, 100);
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
                spaceBetween: 15,
                centeredSlides: false 
            },
            900: { 
                slidesPerView: 3, 
                centeredSlides: false 
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
    
    setupInfiniteScroll(swiperMovies, 'movies');
}

// ===========================================
// 3. الكاروسيل الثالث: المسلسلات فقط مع Infinite Scroll
// ===========================================
async function fetchSeries() {
    try {
        const data = infiniteData.series;
        if (data.isLoading) return;
        
        data.isLoading = true;
        
        const response = await fetch(
            `${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=en&page=${data.page}`

        );
        const result = await response.json();
        
        data.totalPages = result.total_pages;
        data.hasMore = data.page < result.total_pages;
        
        displaySeries(result.results, data.page === 1);
        
        if (data.page === 1) {
            initSeriesSwiper();
        }
        
        console.log(`✅ تم تحميل صفحة ${data.page} من المسلسلات (${result.results.length} عنصر)`);
        
        data.page++;
        data.isLoading = false;
        
    } catch (error) {
        console.error('خطأ في جلب المسلسلات:', error);
        infiniteData.series.isLoading = false;
    }
}

function displaySeries(seriesList, isFirstLoad = false) {
    const container = document.getElementById('series-container');
    if (!container) return;
    
    if (isFirstLoad) {
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
    
    if (swiperSeries && !isFirstLoad) {
        setTimeout(() => {
            swiperSeries.update();
            updateNavigationButtons('series');
        }, 100);
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
                spaceBetween: 15,
                centeredSlides: false 
            },
            900: { 
                slidesPerView: 3, 
                centeredSlides: false 
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
    
    setupInfiniteScroll(swiperSeries, 'series');
}

// ===========================================
// إعداد Infinite Scroll
// ===========================================
function setupInfiniteScroll(swiper, type) {
    // إضافة حدث عند الوصول للنهاية
    swiper.on('reachEnd', async function() {
        const data = infiniteData[type];
        
        // إذا كان هناك المزيد ولم يكن جاري التحميل
        if (data.hasMore && !data.isLoading) {
            console.log(`🔄 الوصول لنهاية ${type}، جاري تحميل المزيد...`);
            
            // إضافة مؤشر تحميل
            addLoadingIndicator(type);
            
            // تحميل المزيد من البيانات
            switch(type) {
                case 'trending':
                    await fetchTrending();
                    break;
                case 'movies':
                    await fetchMovies();
                    break;
                case 'series':
                    await fetchSeries();
                    break;
            }
            
            // إزالة مؤشر التحميل
            removeLoadingIndicator(type);
        }
    });
    
    // تحديث أزرار التنقل
    updateNavigationButtons(type);
    
    // تحديث عند التمرير
    swiper.on('slideChange', function() {
        updateNavigationButtons(type);
    });
}

// ===========================================
// دوال مساعدة
// ===========================================
function addLoadingIndicator(type) {
    const container = document.getElementById(`${type}-container`);
    if (!container) return;
    
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    loader.id = `${type}-loader`;
    loader.innerHTML = '<div class="loader"></div>';
    loader.style.cssText = `
        width: 100%;
        text-align: center;
        padding: 20px;
        color: white;
    `;
    
    container.appendChild(loader);
}

function removeLoadingIndicator(type) {
    const loader = document.getElementById(`${type}-loader`);
    if (loader) {
        loader.remove();
    }
}

function updateNavigationButtons(type) {
    const swiper = getSwiper(type);
    const data = infiniteData[type];
    
    if (!swiper) return;
    
    const nextBtn = document.querySelector(`.${type}-right`);
    const prevBtn = document.querySelector(`.${type}-left`);
    
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

function getSwiper(type) {
    switch(type) {
        case 'trending': return swiperTrending;
        case 'movies': return swiperMovies;
        case 'series': return swiperSeries;
        default: return null;
    }
}

// ===========================================
// دعم إعادة التهيئة عند تغيير حجم النافذة
// ===========================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (swiperTrending) {
            swiperTrending.update();
            updateNavigationButtons('trending');
        }
        if (swiperMovies) {
            swiperMovies.update();
            updateNavigationButtons('movies');
        }
        if (swiperSeries) {
            swiperSeries.update();
            updateNavigationButtons('series');
        }
    }, 250);
});

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
// تحميل عند التمرير (Backup)
// ===========================================
window.addEventListener('scroll', () => {
    // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
});