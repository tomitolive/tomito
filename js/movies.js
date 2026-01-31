// ===========================================
// CONFIG
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

let trendingPage = 1;
let moviesPage = 1;
let seriesPage = 1;

let isLoadingTrending = false;
let isLoadingMovies = false;
let isLoadingSeries = false;

let tvLastScrollTop = 0;

// ===========================================
// جلب Trending All (أفلام + مسلسلات)
// ===========================================
async function fetchTrending() {
    try {
        console.log("🔥 جلب Trending...");
        showLoading(true);

        const url = `${CONFIG.BASE_URL}/trending/all/day?api_key=${CONFIG.API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        const filtered = data.results.filter(i => i.media_type !== "person");
        
        console.log(`✅ Trending: ${filtered.length} عنصر`);
        displayItems(filtered, "trending-container", "trending");
        
        setTimeout(() => initSwiper("trending"), 200);

    } catch (e) {
        console.error("❌ خطأ في Trending:", e);
    } finally {
        showLoading(false);
    }
}

// ===========================================
// جلب أفلام فقط
// ===========================================
async function fetchMovies() {
    try {
        console.log("🎬 جلب الأفلام...");

        const url = `${CONFIG.BASE_URL}/movie/popular?api_key=${CONFIG.API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        console.log(`✅ Movies: ${data.results.length} فيلم`);
        displayItems(data.results, "movies-container", "movie");
        
        setTimeout(() => initSwiper("movies"), 200);

    } catch (e) {
        console.error("❌ خطأ في الأفلام:", e);
    }
}

// ===========================================
// جلب مسلسلات فقط
// ===========================================
async function fetchSeries() {
    try {
        console.log("📺 جلب المسلسلات...");

        const url = `${CONFIG.BASE_URL}/tv/popular?api_key=${CONFIG.API_KEY}&language=ar&page=1`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        console.log(`✅ Series: ${data.results.length} مسلسل`);
        displayItems(data.results, "series-container", "tv");
        
        setTimeout(() => initSwiper("series"), 200);

    } catch (e) {
        console.error("❌ خطأ في المسلسلات:", e);
    }
}

// ===========================================
// عرض العناصر
// ===========================================
function displayItems(list, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ لم يتم العثور على #${containerId}`);
        return;
    }

    container.innerHTML = "";
    
    list.forEach(item => {
        // تحديد media_type إذا كان trending
        const mediaType = type === "trending" ? item.media_type : type;
        createSlide(item, container, mediaType);
    });
    
    console.log(`✅ ${containerId}: ${container.children.length} شريحة`);
}

// ===========================================
// إنشاء شريحة
// ===========================================
function createSlide(item, container, mediaType) {
    const img = item.poster_path
        ? `${CONFIG.BASE_IMG}/w500${item.poster_path}`
        : "https://via.placeholder.com/300x450/111/fff?text=No+Image";

    const title = item.title || item.name || "بدون عنوان";
    const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "--";
    const rating = item.vote_average?.toFixed(1) || "--";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.onclick = () => openDetailsPage(item.id, mediaType);

    slide.innerHTML = `
        <img src="${img}" loading="lazy" alt="${title}">
        <div class="series-info">
            <div class="series-title">${title}</div>
            <div class="series-meta">
                <span>${year}</span>
                <span>⭐ ${rating}</span>
            </div>
        </div>
    `;

    container.appendChild(slide);
}

// ===========================================
// فتح صفحة التفاصيل
// ===========================================
function openDetailsPage(id, type) {
    const url = type === "movie"
        ? `watch.html?id=${id}`
        : `watch-tv.html?id=${id}`;
    
    console.log(`🎬 فتح: ${url}`);
    window.location.href = url;
}

// ===========================================
// تهيئة Swiper
// ===========================================
function initSwiper(type) {
    if (typeof Swiper === "undefined") {
        console.error("❌ Swiper library غير محملة!");
        return;
    }

    const swiperConfig = {
        slidesPerView: 2,
        spaceBetween: 10,
        speed: 700,
        centeredSlides: true,
        loop: false,
        grabCursor: true,
        autoplay: { 
            delay: 4000, 
            disableOnInteraction: false 
        },
        breakpoints: {
            600: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
            1500: { slidesPerView: 5 },
            1800: { slidesPerView: 6 }
        }
    };

    if (type === "trending") {
        const container = document.querySelector(".swiper-trending");
        if (!container || container.querySelectorAll(".swiper-slide").length === 0) {
            console.error("❌ Trending container فارغ");
            return;
        }
        
        if (swiperTrending) swiperTrending.destroy(true, true);
        swiperTrending = new Swiper(".swiper-trending", swiperConfig);
        setupArrows(".swiper-trending", swiperTrending);
        console.log("✅ Swiper Trending جاهز");
    }
    
    else if (type === "movies") {
        const container = document.querySelector(".swiper-movies");
        if (!container || container.querySelectorAll(".swiper-slide").length === 0) {
            console.error("❌ Movies container فارغ");
            return;
        }
        
        if (swiperMovies) swiperMovies.destroy(true, true);
        swiperMovies = new Swiper(".swiper-movies", swiperConfig);
        setupArrows(".swiper-movies", swiperMovies);
        console.log("✅ Swiper Movies جاهز");
    }
    
    else if (type === "series") {
        const container = document.querySelector(".swiper-series");
        if (!container || container.querySelectorAll(".swiper-slide").length === 0) {
            console.error("❌ Series container فارغ");
            return;
        }
        
        if (swiperSeries) swiperSeries.destroy(true, true);
        swiperSeries = new Swiper(".swiper-series", swiperConfig);
        setupArrows(".swiper-series", swiperSeries);
        console.log("✅ Swiper Series جاهز");
    }
}

// ===========================================
// أزرار الأسهم
// ===========================================
function setupArrows(containerClass, swiperInstance) {
    const rightArrow = document.querySelector(`${containerClass} .Arrow--Right`);
    const leftArrow = document.querySelector(`${containerClass} .Arrow--Left`);

    if (rightArrow) {
        rightArrow.addEventListener("click", () => {
            if (swiperInstance) swiperInstance.slideNext();
        });
    }

    if (leftArrow) {
        leftArrow.addEventListener("click", () => {
            if (swiperInstance) swiperInstance.slidePrev();
        });
    }
}

// ===========================================
// شاشة التحميل
// ===========================================
function showLoading(show) {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
        loadingScreen.style.display = show ? "flex" : "none";
    }
}

// ===========================================
// إخفاء Header عند Scroll
// ===========================================
function handleScrollHide() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const header = document.getElementById("header");
    if (!header) return;

    if (scrollTop > tvLastScrollTop && scrollTop > 100) {
        header.classList.add("hidden");
    } else {
        header.classList.remove("hidden");
    }

    tvLastScrollTop = scrollTop;
}

window.addEventListener("scroll", handleScrollHide);

// ===========================================
// البدء عند فتح الصفحة
// ===========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 الصفحة جاهزة - تحميل 3 كاروسيلات");
    
    // تحميل كل الكاروسيلات
    fetchTrending();
    fetchMovies();
    fetchSeries();
});