// ===========================================
// الإعدادات الأساسية
// ===========================================
const CONFIG = {
    API_KEY: "882e741f7283dc9ba1654d4692ec30f6",
    BASE_URL: "https://api.themoviedb.org/3",
    BASE_IMG: "https://image.tmdb.org/t/p"
};

// ===========================================
// متغير Swiper العام
// ===========================================
let swiperInstance = null;
let currentPage = 3;
let isLoadingMore = false;
let allSeriesData = [];



async function fetchPopularSeries() {
    try {
        showLoading(true);
        allSeriesData = [];

        // تحميل الصفحة الأولى مباشرة
        const response = await fetch(`${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=en-SA&page=1`);
        const data = await response.json();
        allSeriesData.push(...data.results);

        // عرض المسلسلات مباشرة
        displaySeries(allSeriesData);
        initSwiper();

        // تحميل الصفحات الأخرى في الخلفية
        const pages = [2, 3];
        for (const page of pages) {
            fetch(`${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=en-SA&page=${page}`)
                .then(res => res.json())
                .then(data => {
                    allSeriesData.push(...data.results);
                    addSeriesToSwiper(data.results);
                })
                .catch(err => console.log('خطأ في تحميل صفحة إضافية:', err));
        }

        console.log(`✅ بدأت تحميل المسلسلات`);

    } catch (error) {
        console.error('خطأ في جلب المسلسلات:', error);
        alert('حدث خطأ في تحميل المسلسلات');
    } finally {
        showLoading(false);
    }
}


// ===========================================
// دالة جلب المزيد من المسلسلات
// ===========================================
async function loadMoreSeries() {
    if (isLoadingMore) return;
    
    isLoadingMore = true;
    currentPage++;
    
    try {
        console.log(`📥 جلب صفحة ${currentPage}...`);
        
        const response = await fetch(
            `${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=en-SA&page=${currentPage}`
        );
        
        if (!response.ok) {
            throw new Error('فشل تحميل المزيد من المسلسلات');
        }
        
        const data = await response.json();
        const newSeries = data.results;
        
        if (newSeries.length > 0) {
            allSeriesData.push(...newSeries);
            addSeriesToSwiper(newSeries);
            console.log(`✅ تم إضافة ${newSeries.length} مسلسل جديد - الإجمالي: ${allSeriesData.length}`);
        }
        
    } catch (error) {
        console.error('خطأ في جلب المزيد:', error);
    } finally {
        isLoadingMore = false;
    }
}

// ===========================================
// دالة عرض المسلسلات في Swiper
// ===========================================
function displaySeries(seriesList) {
    const container = document.getElementById('series-container');
    
    if (!container) {
        console.error('لم يتم العثور على الحاوية');
        return;
    }
    
    container.innerHTML = '';
    
    seriesList.forEach(series => {
        createSeriesSlide(series, container);
    });
}

// ===========================================
// دالة إنشاء شريحة مسلسل
// ===========================================
function createSeriesSlide(series, container) {
    const posterPath = series.poster_path 
        ? `${CONFIG.BASE_IMG}/w500${series.poster_path}`
        : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
    
    const rating = series.vote_average ? series.vote_average.toFixed(1) : '--';
    const year = series.first_air_date ? series.first_air_date.split('-')[0] : '--';
    
    // استخدام الاسم العربي أو الإنجليزي كاحتياطي
    const seriesName = series.name || series.original_name || 'بدون عنوان';
    
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.setAttribute('data-series-id', series.id);
    slide.onclick = () => openSeriesPage(series.id);
    
    slide.innerHTML = `
        <img src="${posterPath}" alt="${seriesName}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/fff?text=لا+توجد+صورة'">
        <div class="series-info">
            <div class="series-title">${seriesName}</div>
            <div class="series-meta">
                <span>${year}</span>
                <span class="series-rating">
                    ⭐ ${rating}
                </span>
            </div>
        </div>
    `;
    
    container.appendChild(slide);
}

// ===========================================
// دالة إضافة مسلسلات جديدة للـ Swiper
// ===========================================
function addSeriesToSwiper(newSeries) {
    const container = document.getElementById('series-container');
    
    if (!container || !swiperInstance) return;
    
    newSeries.forEach(series => {
        createSeriesSlide(series, container);
    });
    
    swiperInstance.update();
}

// ===========================================
// دالة فتح صفحة المسلسل
// ===========================================
function openSeriesPage(seriesId) {
    console.log('🎬 فتح صفحة المسلسل:', seriesId);
    window.location.href = `watch-tv.html?id=${seriesId}`;
}

// ===========================================
// دالة تهيئة Swiper
// ===========================================
function initSwiper() {
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
    }
    
    swiperInstance = new Swiper(".swiper-container", {
        slidesPerView: 2,
        slidesPerGroup: 1,
        centeredSlides: true,
        loop: true,
        spaceBetween: 0,
        grabCursor: true,
        touchEventsTarget: 'container',
        simulateTouch: true,
        allowTouchMove: true,
        touchRatio: 1,
        touchAngle: 45,
        longSwipes: true,
        longSwipesRatio: 0.5,
        longSwipesMs: 300,
        followFinger: true,
        freeMode: false,
        freeModeSticky: false,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        speed: 800,
        mousewheel: {
            enabled: false
        },
       breakpoints: {
    600: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 0, centeredSlides: true },
    900: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 0, centeredSlides: false },
    1200: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 0, centeredSlides: false },
    1500: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 0, centeredSlides: false },
    1800: { slidesPerView: 6, slidesPerGroup: 6, spaceBetween: 0, centeredSlides: false }
}

    });
    
    setupCustomArrows();
    
    const swiperContainer = document.querySelector('.swiper-container');
    if (swiperContainer) {
        swiperContainer.addEventListener('mouseenter', () => {
            if (swiperInstance && swiperInstance.autoplay) {
                swiperInstance.autoplay.stop();
            }
        });
        
        swiperContainer.addEventListener('mouseleave', () => {
            if (swiperInstance && swiperInstance.autoplay) {
                swiperInstance.autoplay.start();
            }
        });
    }
    
    console.log('✅ Swiper تم تهيئته بنجاح');
}

// ===========================================
// دالة ربط الأزرار المخصصة
// ===========================================
function setupCustomArrows() {
    const arrowRight = document.querySelector('.Arrow--Right');
    const arrowLeft = document.querySelector('.Arrow--Left');

    if (!swiperInstance) return;

    if (arrowRight) {
        arrowRight.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            swiperInstance.slideNext();

            if (swiperInstance.isEnd) {
                console.log('📍 وصلت للنهاية - جلب المزيد...');
                await loadMoreSeries();
            }
        });
    }

    if (arrowLeft) {
        arrowLeft.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            swiperInstance.slidePrev();
        });
    }

    swiperInstance.on('reachEnd', async () => {
        console.log('📍 وصلت للنهاية أثناء السحب - جلب المزيد...');
        await loadMoreSeries();
    });

    console.log('✅ الأزرار المخصصة تم ربطها بنجاح');
}

// ===========================================
// دالة إظهار/إخفاء شاشة التحميل
// ===========================================
function showLoading(show) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = show ? 'flex' : 'none';
    }
}

// ===========================================
// دالة التهيئة الرئيسية
// ===========================================
async function init() {
    console.log('🎬 بدء تحميل المسلسلات...');
    
    const series = await fetchPopularSeries();
    
    if (series.length > 0) {
        displaySeries(series);
        
        setTimeout(() => {
            initSwiper();
        }, 100);
        
        console.log(`✅ تم تحميل ${series.length} مسلسل بنجاح`);
    } else {
        console.error('❌ لم يتم العثور على مسلسلات');
    }
}

// ===========================================
// بدء التشغيل عند تحميل الصفحة
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    init();
});