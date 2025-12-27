// tv.js - صفحة المسلسلات (مصحح 100% + شرح كامل)
// ========================================
// 🔧 الإصلاح: أسماء متغيرات فريدة لصفحة المسلسلات
// ========================================
const API_KEY_TV_PAGE = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL_TV_PAGE = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL_TV_PAGE = "https://image.tmdb.org/t/p/w1280";
const IMAGE_BASE_URL_500_TV_PAGE = "https://image.tmdb.org/t/p/w500";

// ========================================
// 🛡️ نظام AdBlock المحسّن لصفحة المسلسلات
// ========================================
const TVPageAdBlock = {
    blockedDomains: [
        'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
        'adservice.google.com', 'advertising.com', 'ads.yahoo.com',
        'ads.microsoft.com', 'adnxs.com', 'adsystem.com'
    ],
    
    adKeywords: [
        'advertisement', 'sponsored', 'ad-container', 'ad-banner',
        'ad-slot', 'google-ad', 'adsense', 'adsbygoogle'
    ],
    
    stats: { blocked: 0, requests: 0 },

    init() {
        console.log('🛡️ تفعيل AdBlock...');
        this.blockExistingAds();
        this.watchForNewAds();
        this.protectFetchAPI();
        console.log('✅ تم تفعيل AdBlock');
    },

    blockExistingAds() {
        document.querySelectorAll('script[src], iframe, img').forEach(el => {
            const src = el.getAttribute('src');
            if (src && this.isAdUrl(src) && !this.isVideoPlayer(src)) {
                el.remove();
                this.stats.blocked++;
            }
        });
    },

    watchForNewAds() {
        new MutationObserver(mutations => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const src = node.src || node.getAttribute?.('src');
                        if (src && this.isAdUrl(src) && !this.isVideoPlayer(src)) {
                            node.remove();
                            this.stats.blocked++;
                        }
                    }
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    },

    // 🔧 الإصلاح الرئيسي: fetch بطريقة صحيحة
    protectFetchAPI() {
        const originalFetch = window.fetch.bind(window); // ربط fetch بـ window
        const self = this;
        
        window.fetch = function(url, ...args) {
            self.stats.requests++;
            
            if (self.isAdUrl(url)) {
                self.stats.blocked++;
                console.log('🚫 حظر:', url);
                return Promise.reject(new Error('Blocked'));
            }
            
            // استخدام originalFetch المربوط بـ window
            return originalFetch(url, ...args);
        };
    },

    isAdUrl(url) {
        if (!url || typeof url !== 'string') return false;
        const lower = url.toLowerCase();
        return this.blockedDomains.some(d => lower.includes(d)) ||
               this.adKeywords.some(k => lower.includes(k));
    },

    isVideoPlayer(url) {
        if (!url || typeof url !== 'string') return false;
        return ['vidsrc', '2embed', 'multiembed'].some(p => url.toLowerCase().includes(p));
    }
};

// تفعيل AdBlock
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TVPageAdBlock.init());
} else {
    TVPageAdBlock.init();
}

// ========================================
// 📺 متغيرات صفحة المسلسلات (أسماء فريدة)
// ========================================
let tvPageCurrentPage = 1;
let tvPageCurrentGenre = "";
let tvPageCurrentQuery = "";
let tvPageTotalPages = 1;
let tvPageIsLoading = false;
let tvPageSavedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
let tvPageBannerShows = [];
let tvPageCurrentBannerIndex = 0;
let tvPageBannerInterval;
let tvPageIsSearching = false;

const tvPageGenreNames = {
    "10759": "أكشن ومغامرة",
    "16": "رسوم متحركة",
    "35": "كوميديا",
    "80": "جريمة",
    "99": "وثائقي",
    "18": "دراما",
    "10751": "عائلي"
};

// ========================================
// 🎬 تهيئة الصفحة
// ========================================
document.addEventListener("DOMContentLoaded", function() {
    console.log('🎬 بدء تحميل صفحة المسلسلات');
    tvPageInit();
});

function tvPageInit() {
    tvPageUpdateFavoritesCount();
    tvPageSetupEventListeners();
    tvPageSetupScrollHeader();
    tvPageShowProgressBar();
    tvPageSetupAccessibility();
    tvPageGetTVShows();
}

// ========================================
// 📊 عداد المفضلة
// ========================================
function tvPageUpdateFavoritesCount() {
    const count = tvPageSavedMovies.filter(item => item?.type === 'tv').length;
    const el = document.getElementById("favorites-count");
    if (el) el.textContent = count;
}

// ========================================
// 🎯 إعداد المستمعين
// ========================================
function tvPageSetupEventListeners() {
    // روابط التصنيفات
    document.querySelectorAll(".nav a").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            // رابط الأفلام
            if (link.classList.contains('nav-switch')) {
                window.location.href = 'index.html';
                return;
            }
            
            tvPageChangeGenre(link);
        });
    });

    // البحث
    const searchInput = document.getElementById("search");
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", function(e) {
            clearTimeout(searchTimeout);
            if (tvPageIsSearching) return;
            
            const value = e.target.value.trim();
            searchTimeout = setTimeout(() => {
                tvPageIsSearching = true;
                searchInput.classList.add("searching");
                tvPageSearchTVShows(value);
                setTimeout(() => {
                    tvPageIsSearching = false;
                    searchInput.classList.remove("searching");
                }, 500);
            }, 300);
        });
    }

    // زر تحميل المزيد
    const loadMoreBtn = document.getElementById("loadMore");
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", tvPageLoadMore);
    }
}

// ========================================
// 📂 تغيير التصنيف
// ========================================
function tvPageChangeGenre(link) {
    const genreId = link.getAttribute("data-genre") || "";
    
    document.querySelectorAll(".nav a:not(.nav-switch)").forEach(l => {
        l.classList.remove("active");
    });
    link.classList.add("active");

    tvPageCurrentGenre = genreId;
    tvPageCurrentQuery = "";
    tvPageCurrentPage = 1;

    const searchInput = document.getElementById("search");
    if (searchInput) searchInput.value = "";

    tvPageResetContainer();
    tvPageGetTVShows();
    tvPageScrollToShows();
}

// ========================================
// 🔍 البحث
// ========================================
function tvPageSearchTVShows(query) {
    if (query.length < 2) {
        tvPageCurrentQuery = "";
        tvPageCurrentGenre = "";
        tvPageCurrentPage = 1;
        
        document.querySelectorAll(".nav a:not(.nav-switch)").forEach(l => {
            l.classList.remove("active");
        });
        
        const allLink = document.querySelector(".nav a[data-genre='']");
        if (allLink) allLink.classList.add("active");
        
        tvPageResetContainer();
        tvPageGetTVShows();
        return;
    }

    tvPageCurrentQuery = query;
    tvPageCurrentGenre = "";
    tvPageCurrentPage = 1;

    document.querySelectorAll(".nav a:not(.nav-switch)").forEach(l => {
        l.classList.remove("active");
    });

    tvPageResetContainer();
    tvPageGetTVShows();
}

// ========================================
// 📡 جلب المسلسلات من API
// ========================================
async function tvPageGetTVShows() {
    if (tvPageIsLoading) return;

    tvPageIsLoading = true;
    tvPageShowLoading();

    try {
        let url;
        const params = new URLSearchParams({
            api_key: API_KEY_TV_PAGE,
            page: tvPageCurrentPage,
            language: "ar",
            include_adult: "false"
        });

        if (tvPageCurrentQuery) {
            params.append("query", tvPageCurrentQuery);
            url = `${BASE_URL_TV_PAGE}/search/tv?${params}`;
        } else if (tvPageCurrentGenre) {
            params.append("with_genres", tvPageCurrentGenre);
            params.append("sort_by", "popularity.desc");
            url = `${BASE_URL_TV_PAGE}/discover/tv?${params}`;
        } else {
            url = `${BASE_URL_TV_PAGE}/tv/popular?${params}`;
        }

        console.log('📡 جلب المسلسلات من:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        tvPageTotalPages = data.total_pages || 1;

        console.log(`✅ تم تحميل ${data.results?.length || 0} مسلسل`);

        // البانر للصفحة الأولى فقط
        if (tvPageCurrentPage === 1 && !tvPageCurrentQuery) {
            tvPageBannerShows = (data.results || [])
                .filter(tv => tv.backdrop_path)
                .slice(0, 5);
            
            if (tvPageBannerShows.length > 0) {
                tvPageSetupBanner(tvPageBannerShows);
            }
        }

        tvPageDisplayTVShows(data.results || []);
        tvPageUpdateLoadMoreButton();

    } catch (error) {
        console.error("❌ خطأ:", error);
        tvPageShowError("حدث خطأ في تحميل المسلسلات");
    } finally {
        tvPageIsLoading = false;
        tvPageHideLoading();
        tvPageHideProgressBar();
    }
}

// ========================================
// 📺 عرض المسلسلات
// ========================================
function tvPageDisplayTVShows(tvShows) {
    const container = document.getElementById("movies-container");
    if (!container) return;

    if (!tvShows || tvShows.length === 0) {
        if (tvPageCurrentPage === 1) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-tv" style="font-size: 80px; color: #e74c3c;"></i>
                    <p>لم يتم العثور على مسلسلات</p>
                </div>
            `;
        }
        return;
    }

    const fragment = document.createDocumentFragment();
    tvShows.forEach(tv => {
        if (tv?.id) fragment.appendChild(tvPageCreateCard(tv));
    });
    container.appendChild(fragment);
}

// ========================================
// 🎴 إنشاء كرت مسلسل
// ========================================
function tvPageCreateCard(tv) {
    const card = document.createElement("div");
    card.className = "movie-card fade-in";
    card.setAttribute("data-id", tv.id);
    
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.play-btn-sm, .save-btn-sm')) {
            tvPageWatchShow(tv.id);
        }
    });

    const isSaved = tvPageSavedMovies.some(m => m?.id === tv.id && m.type === 'tv');
    const posterUrl = tv.poster_path ? 
        IMAGE_BASE_URL_500_TV_PAGE + tv.poster_path : 
        "https://via.placeholder.com/300x450";
    
    const title = tv.name || "بدون عنوان";
    const overview = tv.overview ? 
        tv.overview.substring(0, 120) + "..." : 
        "لا يوجد وصف";
    
    const rating = tv.vote_average?.toFixed(1) || "N/A";
    const year = tv.first_air_date?.split('-')[0] || "";

    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <div style="display: flex; gap: 10px;">
                    ${year ? `<span style="color: #999;">${year}</span>` : ''}
                    <span class="movie-rating">
                        <i class="fas fa-star"></i> ${rating}
                    </span>
                </div>
            </div>
            <p class="movie-description">${overview}</p>
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="tvPageWatchShow(${tv.id}, event)">
                    <i class="fas fa-play"></i> مشاهدة
                </button>
                <button class="save-btn-sm ${isSaved ? 'saved' : ''}" 
                        onclick="tvPageToggleSave(${tv.id}, '${title.replace(/'/g, "\\'")}', '${tv.poster_path || ''}', ${tv.vote_average || 0}, event)">
                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                    ${isSaved ? 'محفوظ' : 'حفظ'}
                </button>
            </div>
        </div>
    `;

    return card;
}

// ========================================
// ▶️ مشاهدة المسلسل
// ========================================
function tvPageWatchShow(id, event = null) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    tvPageShowProgressBar();
    setTimeout(() => {
        window.location.href = `watch-tv.html?id=${id}`;
    }, 300);
}

// ========================================
// ❤️ حفظ/إلغاء حفظ
// ========================================
function tvPageToggleSave(id, title, posterPath, rating, event = null) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const tvShow = {
        id, 
        title, 
        poster_path: posterPath, 
        vote_average: rating,
        type: 'tv', 
        savedAt: new Date().toISOString()
    };

    const index = tvPageSavedMovies.findIndex(m => m?.id === id);
    const btn = event?.currentTarget;

    if (index === -1) {
        tvPageSavedMovies.push(tvShow);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            btn.classList.add("saved");
        }
        tvPageShowNotification(`✅ تم حفظ "${title}"`);
    } else {
        tvPageSavedMovies.splice(index, 1);
        if (btn) {
            btn.innerHTML = '<i class="far fa-heart"></i> حفظ';
            btn.classList.remove("saved");
        }
        tvPageShowNotification(`❌ تم إزالة "${title}"`);
    }

    localStorage.setItem("savedMovies", JSON.stringify(tvPageSavedMovies));
    tvPageUpdateFavoritesCount();
}

// ========================================
// 🎨 البانر
// ========================================
function tvPageSetupBanner(tvShows) {
    const bannerContainer = document.getElementById("banner-container");
    const indicatorsContainer = document.getElementById("banner-indicators");

    if (!bannerContainer || !tvShows?.length) return;

    bannerContainer.innerHTML = "";
    if (indicatorsContainer) indicatorsContainer.innerHTML = "";

    tvShows.forEach((tv, index) => {
        if (!tv.backdrop_path) return;

        const isSaved = tvPageSavedMovies.some(m => m?.id === tv.id && m.type === 'tv');
        const title = tv.name || "بدون عنوان";
        const overview = tv.overview?.substring(0, 200) + "..." || "لا يوجد وصف";

        const card = document.createElement("div");
        card.className = `banner-card ${index === 0 ? "active" : ""}`;
        card.innerHTML = `
            <img src="${IMAGE_BASE_URL_TV_PAGE + tv.backdrop_path}" alt="${title}">
            <div class="banner-overlay">
                <h2>${title}</h2>
                <p>${overview}</p>
                <div class="banner-actions">
                    <button class="banner-play-btn" onclick="tvPageWatchShow(${tv.id}, event)">
                        <i class="fas fa-play"></i> مشاهدة الآن
                    </button>
                    <button class="banner-save-btn ${isSaved ? 'saved' : ''}" 
                            onclick="tvPageToggleSave(${tv.id}, '${title.replace(/'/g, "\\'")}', '${tv.backdrop_path}', ${tv.vote_average || 0}, event)">
                        <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                        ${isSaved ? 'محفوظ' : 'حفظ'}
                    </button>
                </div>
            </div>
        `;
        bannerContainer.appendChild(card);

        if (indicatorsContainer) {
            const indicator = document.createElement("button");
            indicator.className = `indicator ${index === 0 ? "active" : ""}`;
            indicator.onclick = () => tvPageChangeBannerSlide(index);
            indicatorsContainer.appendChild(indicator);
        }
    });

    tvPageSetupBannerControls();
    tvPageStartBannerAutoPlay();
}

function tvPageSetupBannerControls() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (prevBtn) {
        prevBtn.onclick = e => {
            e.stopPropagation();
            tvPageChangeBannerSlide(tvPageCurrentBannerIndex - 1);
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = e => {
            e.stopPropagation();
            tvPageChangeBannerSlide(tvPageCurrentBannerIndex + 1);
        };
    }
}

function tvPageChangeBannerSlide(index) {
    const slides = document.querySelectorAll(".banner-card");
    const indicators = document.querySelectorAll(".indicator");

    if (!slides.length) return;

    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides[tvPageCurrentBannerIndex].classList.remove("active");
    indicators[tvPageCurrentBannerIndex]?.classList.remove("active");

    slides[index].classList.add("active");
    indicators[index]?.classList.add("active");

    tvPageCurrentBannerIndex = index;
    tvPageRestartBannerAutoPlay();
}

function tvPageStartBannerAutoPlay() {
    if (tvPageBannerInterval) clearInterval(tvPageBannerInterval);
    
    if (tvPageBannerShows.length > 1) {
        tvPageBannerInterval = setInterval(() => {
            tvPageChangeBannerSlide(tvPageCurrentBannerIndex + 1);
        }, 6000);
    }
}

function tvPageRestartBannerAutoPlay() {
    if (tvPageBannerInterval) clearInterval(tvPageBannerInterval);
    tvPageStartBannerAutoPlay();
}

// ========================================
// 📥 تحميل المزيد
// ========================================
function tvPageLoadMore() {
    if (tvPageIsLoading || tvPageCurrentPage >= tvPageTotalPages) return;
    
    tvPageCurrentPage++;
    tvPageGetTVShows();

    const btn = document.getElementById("loadMore");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    }
}

function tvPageUpdateLoadMoreButton() {
    const btn = document.getElementById("loadMore");
    if (!btn) return;

    if (tvPageCurrentPage >= tvPageTotalPages) {
        btn.style.display = "none";
    } else {
        btn.style.display = "inline-flex";
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus-circle"></i> تحميل المزيد';
    }
}

// ========================================
// 🎨 واجهة المستخدم - أدوات
// ========================================
function tvPageShowLoading() {
    const container = document.getElementById("movies-container");
    if (tvPageCurrentPage === 1 && container && !container.children.length) {
        container.innerHTML = '<div class="loading"><p>جاري التحميل...</p></div>';
    }
}

function tvPageHideLoading() {
    const container = document.getElementById("movies-container");
    container?.querySelector(".loading")?.remove();
}

function tvPageResetContainer() {
    const container = document.getElementById("movies-container");
    if (container) container.innerHTML = "";
}

function tvPageScrollToShows() {
    const section = document.querySelector(".movies-section");
    if (section) {
        window.scrollTo({ 
            top: section.offsetTop - 100, 
            behavior: "smooth" 
        });
    }
}

function tvPageSetupScrollHeader() {
    const header = document.getElementById("site-header");
    if (!header) return;
    
    window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 100);
    });
}

function tvPageShowNotification(message) {
    document.querySelector(".notification")?.remove();

    const notif = document.createElement("div");
    notif.className = "notification show";
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: rgba(231, 76, 60, 0.95);
        color: white; padding: 15px 30px;
        border-radius: 8px; z-index: 10000;
    `;

    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function tvPageShowError(message) {
    const container = document.getElementById("movies-container");
    if (container && tvPageCurrentPage === 1) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle" style="font-size: 60px; color: #e74c3c;"></i>
                <p style="color: #e74c3c;">${message}</p>
                <button onclick="location.reload()" 
                        style="background: #e74c3c; color: white; border: none; 
                               padding: 12px 30px; border-radius: 8px; cursor: pointer;">
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
}

function tvPageShowProgressBar() {
    const bar = document.getElementById("progress-bar");
    if (bar) {
        bar.style.display = "block";
        bar.style.transform = "scaleX(0)";
    }
}

function tvPageHideProgressBar() {
    const bar = document.getElementById("progress-bar");
    if (bar) {
        bar.style.transform = "scaleX(1)";
        setTimeout(() => bar.style.display = "none", 300);
    }
}

function tvPageSetupAccessibility() {
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "f") {
            e.preventDefault();
            document.getElementById("search")?.focus();
        }
        
        if (e.key === "Escape") {
            const searchInput = document.getElementById("search");
            if (searchInput?.value) {
                searchInput.value = "";
                tvPageSearchTVShows("");
            }
        }
    });
}

// ========================================
// 🌍 تصدير الدوال للـ HTML
// ========================================
window.tvPageWatchShow = tvPageWatchShow;
window.tvPageToggleSave = tvPageToggleSave;
window.tvPageChangeBannerSlide = tvPageChangeBannerSlide;

console.log('✅ تم تحميل tv.js بنجاح');