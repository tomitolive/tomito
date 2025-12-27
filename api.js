// main.js - النسخة المحسنة مع جميع المزايا
const api_key = "882e741f7283dc9ba1654d4692ec30f6";
const base_url = "https://api.themoviedb.org/3";
const base_img = "https://image.tmdb.org/t/p/w1280";
const base_img_500 = "https://image.tmdb.org/t/p/w500";

// متغيرات التحكم
let currentPage = 1;
let currentGenre = "";
let currentQuery = "";
let totalPages = 1;
let isLoading = false;
let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
let bannerMovies = [];
let currentBannerIndex = 0;
let bannerInterval;
let isSearching = false;

// مصفوفة أسماء الأنواع للتحويل
const genreNames = {
    "28": "أكشن",
    "35": "كوميديا",
    "18": "دراما",
    "27": "رعب",
    "10749": "رومانسية",
    "16": "أنيمي",
    "878": "خيال علمي",
    "12": "مغامرة",
    "53": "إثارة"
};

// 1) تهيئة الصفحة
document.addEventListener("DOMContentLoaded", function() {
    init();
});

function init() {
    updateFavoritesCount();
    setupEventListeners();
    getMovies();
    setupScrollHeader();
    showProgressBar();
    
    // إضافة تأثيرات الوصول
    setupAccessibility();
}

// 2) تحديث عداد المفضلة
function updateFavoritesCount() {
    const count = savedMovies.length;
    const favoritesCountElement = document.getElementById("favorites-count");
    if (favoritesCountElement) {
        favoritesCountElement.textContent = count;
    }
}

// 3) إعداد مستمعي الأحداث
function setupEventListeners() {
    // قائمة التصنيفات
    const navLinks = document.querySelectorAll(".nav a");
    navLinks.forEach(function(link) {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            changeGenre(link);
        });
    });

    // البحث
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", function(e) {
            if (isSearching) return;
            isSearching = true;
            searchInput.classList.add("searching");
            
            setTimeout(() => {
                searchMovies(e.target.value.trim());
                isSearching = false;
                searchInput.classList.remove("searching");
            }, 500);
        });
    }

    // زر تحميل المزيد
    const loadMoreBtn = document.getElementById("loadMore");
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", loadMoreMovies);
    }
}

// 4) تغيير التصنيف
function changeGenre(link) {
    document.querySelectorAll(".nav a").forEach(function(l) {
        l.classList.remove("active");
    });
    link.classList.add("active");

    currentGenre = link.getAttribute("data-genre") || "";
    currentQuery = "";
    currentPage = 1;

    const searchInput = document.getElementById("search");
    if (searchInput) searchInput.value = "";

    resetMoviesContainer();
    getMovies();
    scrollToMovies();
}

// 5) البحث عن أفلام
function searchMovies(query) {
    if (query.length < 2) {
        // إذا كان البحث قصيرًا، استرجع الأفلام الشائعة
        currentQuery = "";
        currentGenre = "";
        currentPage = 1;
        
        document.querySelectorAll(".nav a").forEach(function(l) {
            l.classList.remove("active");
        });
        
        const allLink = document.querySelector(".nav a[data-genre='']");
        if (allLink) allLink.classList.add("active");
        
        resetMoviesContainer();
        getMovies();
        return;
    }

    currentQuery = query;
    currentGenre = "";
    currentPage = 1;

    document.querySelectorAll(".nav a").forEach(function(l) {
        l.classList.remove("active");
    });

    resetMoviesContainer();
    getMovies();
}

// 6) جلب الأفلام من API
async function getMovies() {
    if (isLoading) return;

    isLoading = true;
    showLoading();

    try {
        let url;
        let params = new URLSearchParams({
            api_key: api_key,
            page: currentPage,
            language: "ar",
            include_adult: false
        });

        if (currentQuery) {
            url = `${base_url}/search/movie?${params}&query=${encodeURIComponent(currentQuery)}`;
        } else if (currentGenre) {
            params.append("with_genres", currentGenre);
            params.append("sort_by", "popularity.desc");
            url = `${base_url}/discover/movie?${params}`;
        } else {
            url = `${base_url}/movie/popular?${params}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        totalPages = data.total_pages;

        console.log(`تم تحميل ${data.results.length} فيلم`);

        // إعداد البانر فقط في الصفحة الأولى والبحث الفارغ
        if (currentPage === 1 && data.results.length > 0 && !currentQuery) {
            bannerMovies = data.results
                .filter(movie => movie.backdrop_path)
                .slice(0, 5);
            setupBanner(bannerMovies);
        }

        // عرض الأفلام
        displayMovies(data.results);

        // تحديث زر تحميل المزيد
        updateLoadMoreButton();

    } catch (error) {
        console.error("خطأ في تحميل الأفلام:", error);
        showError("حدث خطأ في تحميل الأفلام. حاول مرة أخرى.");
    } finally {
        isLoading = false;
        hideLoading();
        hideProgressBar();
    }
}

// 7) عرض الأفلام
function displayMovies(movies) {
    const moviesContainer = document.getElementById("movies-container");

    if (!movies || movies.length === 0) {
        if (currentPage === 1) {
            moviesContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-film"></i>
                    <p>⚠️ لم يتم العثور على أفلام</p>
                    ${currentQuery ? `<p style="margin-top: 10px; color: var(--text-gray);">ابحث عن شيء آخر</p>` : ''}
                </div>`;
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    movies.forEach(function(movie) {
        if (!movie) return;

        const card = createMovieCard(movie);
        fragment.appendChild(card);
    });

    moviesContainer.appendChild(fragment);
}

// 8) إنشاء كرت فيلم
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card fade-in";
    card.setAttribute("data-id", movie.id);

    const isSaved = savedMovies.some(m => m && m.id === movie.id);
    const posterUrl = movie.poster_path ? 
        base_img_500 + movie.poster_path :
        "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image";
    
    const title = movie.title || "بدون عنوان";
    const overview = movie.overview ? 
        movie.overview.substring(0, 120) + "..." : 
        "لا يوجد وصف متوفر";
    
    const rating = movie.vote_average ? 
        movie.vote_average.toFixed(1) : "N/A";

    card.innerHTML = `
        <img src="${posterUrl}" 
             alt="${title}" 
             loading="lazy" 
             class="img-loading" 
             onload="this.classList.remove('img-loading')" 
             onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image'; this.classList.remove('img-loading')">
        
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <span class="movie-rating">
                    <i class="fas fa-star"></i> ${rating}
                </span>
            </div>
            
            <p class="movie-description">
                ${overview}
            </p>
            
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="playMovie(${movie.id})" aria-label="مشاهدة ${title}">
                    <i class="fas fa-play"></i> مشاهدة
                </button>
                <button class="save-btn-sm ${isSaved ? 'saved' : ''}" 
                        onclick="toggleSaveMovie(${movie.id}, ${JSON.stringify(title)}, '${movie.poster_path || ''}', ${movie.vote_average || 0}, this)"
                        aria-label="${isSaved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i> ${isSaved ? 'محفوظ' : 'حفظ'}
                </button>
            </div>
        </div>
    `;

    return card;
}

// 9) حفظ/إلغاء حفظ الفيلم
function toggleSaveMovie(id, title, posterPath, rating, buttonElement) {
    const movie = {
        id: id,
        title: title,
        poster_path: posterPath,
        vote_average: rating,
        savedAt: new Date().toISOString()
    };

    const index = savedMovies.findIndex(m => m && m.id === id);

    if (index === -1) {
        savedMovies.push(movie);
        buttonElement.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        buttonElement.classList.add("saved");
        showNotification(`تم حفظ "${title}" في المفضلة`);
    } else {
        savedMovies.splice(index, 1);
        buttonElement.innerHTML = '<i class="far fa-heart"></i> حفظ';
        buttonElement.classList.remove("saved");
        showNotification(`تم إزالة "${title}" من المفضلة`, "error");
    }

    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
    updateFavoritesCount();
}

// 10) إعداد البانر
function setupBanner(movies) {
    const bannerContainer = document.getElementById("banner-container");
    const indicatorsContainer = document.getElementById("banner-indicators");

    if (!bannerContainer || !movies.length) return;

    bannerContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    movies.forEach(function(movie, index) {
        if (!movie.backdrop_path) return;

        const isSaved = savedMovies.some(m => m && m.id === movie.id);
        const title = movie.title || "بدون عنوان";
        const overview = movie.overview ? 
            movie.overview.substring(0, 200) + "..." : 
            "لا يوجد وصف";

        const card = document.createElement("div");
        card.className = `banner-card ${index === 0 ? "active" : ""}`;
        card.setAttribute("data-index", index);
        card.setAttribute("role", "tabpanel");
        card.setAttribute("aria-label", `شريحة ${index + 1}: ${title}`);

        card.innerHTML = `
            <img src="${base_img + movie.backdrop_path}" 
                 alt="${title}" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/1200x500/1a1a1a/ffffff?text=No+Banner'">
            
            <div class="banner-overlay">
                <h2>${title}</h2>
                <p>${overview}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="playMovie(${movie.id})" aria-label="مشاهدة ${title}">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                    <button class="banner-save-btn ${isSaved ? 'saved' : ''}" 
                            onclick="toggleSaveMovie(${movie.id}, ${JSON.stringify(title)}, '${movie.backdrop_path}', ${movie.vote_average || 0}, this)"
                            aria-label="${isSaved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
                        <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i> ${isSaved ? 'محفوظ' : 'حفظ'}
                    </button>
                </div>
            </div>
        `;

        bannerContainer.appendChild(card);

        // إنشاء مؤشر
        const indicator = document.createElement("button");
        indicator.className = `indicator ${index === 0 ? "active" : ""}`;
        indicator.setAttribute("data-index", index);
        indicator.setAttribute("aria-label", `انتقل إلى شريحة ${index + 1}`);
        indicator.setAttribute("role", "tab");
        indicator.addEventListener("click", () => {
            changeBannerSlide(index);
        });
        indicatorsContainer.appendChild(indicator);
    });

    // إعداد التحكم في البانر
    setupBannerControls();
    startBannerAutoPlay();
}

// 11) التحكم في البانر
function setupBannerControls() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (prevBtn) {
        prevBtn.onclick = function() {
            changeBannerSlide(currentBannerIndex - 1);
        };
        prevBtn.setAttribute("aria-label", "الشريحة السابقة");
    }

    if (nextBtn) {
        nextBtn.onclick = function() {
            changeBannerSlide(currentBannerIndex + 1);
        };
        nextBtn.setAttribute("aria-label", "الشريحة التالية");
    }
}

// 12) تغيير شريحة البانر
function changeBannerSlide(index) {
    const slides = document.querySelectorAll(".banner-card");
    const indicators = document.querySelectorAll(".indicator");

    if (slides.length === 0) return;

    // تصحيح الفهرس
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // إخفاء الشريحة الحالية
    slides[currentBannerIndex].classList.remove("active");
    indicators[currentBannerIndex].classList.remove("active");
    slides[currentBannerIndex].setAttribute("aria-hidden", "true");
    indicators[currentBannerIndex].setAttribute("aria-selected", "false");

    // إظهار الشريحة الجديدة
    slides[index].classList.add("active");
    indicators[index].classList.add("active");
    slides[index].setAttribute("aria-hidden", "false");
    indicators[index].setAttribute("aria-selected", "true");

    currentBannerIndex = index;

    // إعادة تشغيل المؤقت
    restartBannerAutoPlay();
}

// 13) التشغيل التلقائي للبانر
function startBannerAutoPlay() {
    if (bannerInterval) clearInterval(bannerInterval);

    if (bannerMovies.length > 1) {
        bannerInterval = setInterval(() => {
            changeBannerSlide(currentBannerIndex + 1);
        }, 6000);
    }
}

function restartBannerAutoPlay() {
    if (bannerInterval) clearInterval(bannerInterval);
    startBannerAutoPlay();
}

// 14) مشاهدة الفيلم
function playMovie(id) {
    showProgressBar();
    function updatePoster(movie) {
        const posterImg = document.getElementById("movie-poster");
        if (posterImg && movie.poster_path) {
            posterImg.src = base_img_500 + movie.poster_path;
            posterImg.alt = movie.title;
        }
    }
    
    setTimeout(() => {
        window.location.href = "watch.html?id=" + id;
    }, 300);
}

// 15) تحميل المزيد من الأفلام
function loadMoreMovies() {
    if (isLoading || currentPage >= totalPages) return;

    currentPage++;
    getMovies();

    const loadMoreBtn = document.getElementById("loadMore");
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';

        setTimeout(() => {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> تحميل المزيد';
        }, 1000);
    }
}

// 16) تحديث زر تحميل المزيد
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById("loadMore");
    if (!loadMoreBtn) return;

    if (currentPage >= totalPages) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-flex";
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> تحميل المزيد';
    }
}

// 17) إظهار رسالة التحميل
function showLoading() {
    const moviesContainer = document.getElementById("movies-container");
    if (currentPage === 1 && moviesContainer.children.length === 0) {
        moviesContainer.innerHTML = '<div class="loading"><p>جاري تحميل الأفلام...</p></div>';
    }
}

function hideLoading() {
    const moviesContainer = document.getElementById("movies-container");
    const loading = moviesContainer.querySelector(".loading");
    if (loading) {
        loading.remove();
    }
}

// 18) إعادة تعيين حاوية الأفلام
function resetMoviesContainer() {
    const moviesContainer = document.getElementById("movies-container");
    moviesContainer.innerHTML = "";
}

// 19) التمرير إلى قسم الأفلام
function scrollToMovies() {
    const moviesSection = document.querySelector(".movies-section");
    if (moviesSection) {
        window.scrollTo({
            top: moviesSection.offsetTop - 100,
            behavior: "smooth"
        });
    }
}

// 20) إعداد الهيدر المتحرك
function setupScrollHeader() {
    const siteHeader = document.getElementById("site-header");
    if (!siteHeader) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
            siteHeader.classList.add("scrolled");
        } else {
            siteHeader.classList.remove("scrolled");
        }
    });
}

// 21) عرض الإشعارات
function showNotification(message, type) {
    // إزالة أي إشعارات سابقة
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type === "error" ? "error" : ""}`;
    notification.textContent = message;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive");

    document.body.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 22) عرض الخطأ
function showError(message) {
    const moviesContainer = document.getElementById("movies-container");
    moviesContainer.innerHTML = `
        <div class="loading" style="grid-column: 1/-1;">
            <p style="color: #e50914;">${message}</p>
            <button onclick="location.reload()"
                    style="background: #e50914; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin-top: 15px; cursor: pointer;">
                إعادة المحاولة
            </button>
        </div>
    `;
}

// 23) التحكم في شريط التقدم
function showProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        progressBar.style.display = "block";
        progressBar.style.transform = "scaleX(0)";
        progressBar.style.transition = "transform 0.3s ease";
    }
}

function hideProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        progressBar.style.transform = "scaleX(1)";
        setTimeout(() => {
            progressBar.style.display = "none";
        }, 300);
    }
}

// 24) إعداد الوصول
function setupAccessibility() {
    // إضافة اختصارات لوحة المفاتيح
    document.addEventListener("keydown", (e) => {
        // Ctrl + F للبحث
        if (e.ctrlKey && e.key === "f") {
            e.preventDefault();
            const searchInput = document.getElementById("search");
            if (searchInput) searchInput.focus();
        }
        
        // Esc لإلغاء البحث
        if (e.key === "Escape") {
            const searchInput = document.getElementById("search");
            if (searchInput && searchInput.value) {
                searchInput.value = "";
                searchMovies("");
            }
        }
    });
}

// تصدير الدوال للاستخدام في الـ HTML
window.playMovie = playMovie;
window.toggleSaveMovie = toggleSaveMovie;
window.changeBannerSlide = changeBannerSlide;
window.searchMovies = searchMovies;

// تحسينات إضافية للـ SEO والأداء
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // إيقاف البانر عند ترك الصفحة
        if (bannerInterval) clearInterval(bannerInterval);
    } else {
        // استئناف البانر عند العودة
        restartBannerAutoPlay();
    }
});

// تحسين تحميل الصور
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    // مراقبة الصور
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    });
}// التحكم في القائمة المنسدلة
// التحكم في القائمة المنسدلة - نسخة محسنة
const dropdownToggle = document.getElementById('dropdownToggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');

if (dropdownToggle) {
    // النقر على زر القائمة
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // تبديل حالة القائمة
        nav.classList.toggle('open');
        dropdownToggle.classList.toggle('active');
        
        // تأثير اهتزاز خفيف
        if (nav.classList.contains('open')) {
            dropdownToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                dropdownToggle.style.transform = 'scale(1)';
            }, 150);
        }
    });
}

// النقر على رابط في القائمة
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // إغلاق القائمة بنعومة
        nav.style.transition = 'all 0.3s ease';
        nav.classList.remove('open');
        dropdownToggle.classList.remove('active');
        
        // إزالة التأثير بعد الإغلاق
        setTimeout(() => {
            nav.style.transition = '';
        }, 300);
    });
});

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && 
        !nav.contains(e.target) && 
        !dropdownToggle.contains(e.target)) {
        
        nav.style.transition = 'all 0.3s ease';
        nav.classList.remove('open');
        dropdownToggle.classList.remove('active');
        
        setTimeout(() => {
            nav.style.transition = '';
        }, 300);
    }
});

// إغلاق القائمة عند التمرير
let scrollTimer;
window.addEventListener('scroll', () => {
    if (nav.classList.contains('open')) {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            nav.style.transition = 'all 0.2s ease';
            nav.classList.remove('open');
            dropdownToggle.classList.remove('active');
            
            setTimeout(() => {
                nav.style.transition = '';
            }, 200);
        }, 100);
    }
});

// إغلاق القائمة عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        dropdownToggle.classList.remove('active');
    }
});
