// // main.js - الصفحة الرئيسية للأفلام مع نظام AdBlock المتطور
// const api_key = "882e741f7283dc9ba1654d4692ec30f6";
// const base_url = "https://api.themoviedb.org/3";
// const base_img = "https://image.tmdb.org/t/p/w1280";
// const base_img_500 = "https://image.tmdb.org/t/p/w500";

// // ============================================
// // 🛡️ نظام AdBlock المتطور
// // ============================================

// const AdBlockSystem = {
//     blockedDomains: [
//         'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
//         'adservice.google.com', 'advertising.com', 'ads.yahoo.com',
//         'ads.microsoft.com', 'adnxs.com', 'adsystem.com', 'adtechus.com',
//         'outbrain.com', 'taboola.com', 'propellerads.com', 'popcash.net',
//         'popads.net', 'exoclick.com', 'adskeeper.com', 'mgid.com',
//         'revcontent.com', 'bidvertiser.com', 'adcash.com', 'clickadu.com'
//     ],

//     adKeywords: [
//         'advertisement', 'sponsored', 'ad-container', 'ad-banner',
//         'ad-slot', 'google-ad', 'adsense', 'adsbygoogle',
//         'ad-wrapper', 'ad-frame', 'ad-overlay', 'popup-ad'
//     ],

//     stats: { blocked: 0, requests: 0 },

//     init() {
//         console.log('🛡️ تفعيل نظام AdBlock...');
//         this.blockScripts();
//         this.blockIframes();
//         this.blockImages();
//         this.cleanDOM();
//         this.observeDOM();
//         this.interceptFetch();
//         this.interceptXHR();
//         console.log('✅ تم تفعيل AdBlock بنجاح');
//     },

//     blockScripts() {
//         document.querySelectorAll('script[src]').forEach(script => {
//             const src = script.getAttribute('src');
//             if (this.isAdUrl(src)) {
//                 script.remove();
//                 this.stats.blocked++;
//             }
//         });
//     },

//     blockIframes() {
//         document.querySelectorAll('iframe').forEach(iframe => {
//             const src = iframe.getAttribute('src');
//             if (!this.isVideoPlayer(src) && this.isAdUrl(src)) {
//                 iframe.remove();
//                 this.stats.blocked++;
//             }
//         });
//     },

//     blockImages() {
//         document.querySelectorAll('img').forEach(img => {
//             const src = img.getAttribute('src');
//             if (this.isAdUrl(src)) {
//                 img.remove();
//                 this.stats.blocked++;
//             }
//         });
//     },

//     cleanDOM() {
//         this.adKeywords.forEach(keyword => {
//             document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`).forEach(el => {
//                 if (!el.id || el.id !== 'video-player') {
//                     el.remove();
//                     this.stats.blocked++;
//                 }
//             });
//         });
//     },

//     observeDOM() {
//         const observer = new MutationObserver((mutations) => {
//             mutations.forEach((mutation) => {
//                 mutation.addedNodes.forEach((node) => {
//                     if (node.nodeType === 1) {
//                         if (node.tagName === 'SCRIPT' && this.isAdUrl(node.src)) {
//                             node.remove();
//                             this.stats.blocked++;
//                         } else if (node.tagName === 'IFRAME' && !this.isVideoPlayer(node.src) && this.isAdUrl(node.src)) {
//                             node.remove();
//                             this.stats.blocked++;
//                         } else {
//                             this.adKeywords.forEach(keyword => {
//                                 if (node.className?.includes(keyword)) {
//                                     node.remove();
//                                     this.stats.blocked++;
//                                 }
//                             });
//                         }
//                     }
//                 });
//             });
//         });

//         observer.observe(document.body, { childList: true, subtree: true });
//     },

//     interceptFetch() {
//         const originalFetch = window.fetch;
//         window.fetch = async (...args) => {
//             const url = args[0];
//             this.stats.requests++;
//             if (this.isAdUrl(url)) {
//                 this.stats.blocked++;
//                 return Promise.reject(new Error('Blocked by AdBlock'));
//             }
//             return originalFetch.apply(this, args);
//         };
//     },

//     interceptXHR() {
//         const originalOpen = XMLHttpRequest.prototype.open;
//         const self = this;
//         XMLHttpRequest.prototype.open = function(method, url) {
//             self.stats.requests++;
//             if (self.isAdUrl(url)) {
//                 self.stats.blocked++;
//                 return;
//             }
//             return originalOpen.apply(this, arguments);
//         };
//     },

//     isAdUrl(url) {
//         if (!url) return false;
//         const urlLower = url.toLowerCase();
//         return this.blockedDomains.some(d => urlLower.includes(d)) ||
//                this.adKeywords.some(k => urlLower.includes(k));
//     },

//     isVideoPlayer(url) {
//         if (!url) return false;
//         const allowedPlayers = ['vidsrc', '2embed', 'multiembed'];
//         return allowedPlayers.some(p => url.toLowerCase().includes(p));
//     }
// };

// // تفعيل AdBlock عند تحميل الصفحة
// document.addEventListener('DOMContentLoaded', () => {
//     AdBlockSystem.init();
//     setInterval(() => {
//         console.log(`📊 AdBlock Stats: ${AdBlockSystem.stats.blocked} محظور`);
//     }, 10000);
// });

// // ============================================
// // متغيرات التحكم
// // ============================================
// let currentPage = 1;
// let currentGenre = "";
// let currentQuery = "";
// let totalPages = 1;
// let isLoading = false;
// let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
// let bannerMovies = [];
// let currentBannerIndex = 0;
// let bannerInterval;
// let isSearching = false;

// const genreNames = {
//     "28": "أكشن", "35": "كوميديا", "18": "دراما", "27": "رعب",
//     "10749": "رومانسية", "16": "أنيمي", "878": "خيال علمي",
//     "12": "مغامرة", "53": "إثارة"
// };

// // تهيئة الصفحة
// document.addEventListener("DOMContentLoaded", function() {
//     init();
// });

// function init() {
//     updateFavoritesCount();
//     setupEventListeners();
//     getMovies();
//     setupScrollHeader();
//     showProgressBar();
//     setupAccessibility();
// }

// function updateFavoritesCount() {
//     const count = savedMovies.length;
//     const el = document.getElementById("favorites-count");
//     if (el) el.textContent = count;
// }

// function setupEventListeners() {
//     document.querySelectorAll(".nav a").forEach(link => {
//         link.addEventListener("click", function(e) {
//             e.preventDefault();
//             changeGenre(link);
//         });
//     });

//     const searchInput = document.getElementById("search");
//     if (searchInput) {
//         searchInput.addEventListener("input", function(e) {
//             if (isSearching) return;
//             isSearching = true;
//             searchInput.classList.add("searching");
            
//             setTimeout(() => {
//                 searchMovies(e.target.value.trim());
//                 isSearching = false;
//                 searchInput.classList.remove("searching");
//             }, 500);
//         });
//     }

//     const loadMoreBtn = document.getElementById("loadMore");
//     if (loadMoreBtn) {
//         loadMoreBtn.addEventListener("click", loadMoreMovies);
//     }
// }

// function changeGenre(link) {
//     document.querySelectorAll(".nav a").forEach(l => l.classList.remove("active"));
//     link.classList.add("active");

//     currentGenre = link.getAttribute("data-genre") || "";
//     currentQuery = "";
//     currentPage = 1;

//     const searchInput = document.getElementById("search");
//     if (searchInput) searchInput.value = "";

//     resetMoviesContainer();
//     getMovies();
//     scrollToMovies();
// }

// function searchMovies(query) {
//     if (query.length < 2) {
//         currentQuery = "";
//         currentGenre = "";
//         currentPage = 1;
        
//         document.querySelectorAll(".nav a").forEach(l => l.classList.remove("active"));
//         const allLink = document.querySelector(".nav a[data-genre='']");
//         if (allLink) allLink.classList.add("active");
        
//         resetMoviesContainer();
//         getMovies();
//         return;
//     }

//     currentQuery = query;
//     currentGenre = "";
//     currentPage = 1;

//     document.querySelectorAll(".nav a").forEach(l => l.classList.remove("active"));
//     resetMoviesContainer();
//     getMovies();
// }

// async function getMovies() {
//     if (isLoading) return;

//     isLoading = true;
//     showLoading();

//     try {
//         let url;
//         let params = new URLSearchParams({
//             api_key: api_key,
//             page: currentPage,
//             language: "ar",
//             include_adult: false
//         });

//         if (currentQuery) {
//             url = `${base_url}/search/movie?${params}&query=${encodeURIComponent(currentQuery)}`;
//         } else if (currentGenre) {
//             params.append("with_genres", currentGenre);
//             params.append("sort_by", "popularity.desc");
//             url = `${base_url}/discover/movie?${params}`;
//         } else {
//             url = `${base_url}/movie/popular?${params}`;
//         }

//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         const data = await response.json();
//         totalPages = data.total_pages;

//         if (currentPage === 1 && data.results.length > 0 && !currentQuery) {
//             bannerMovies = data.results.filter(m => m.backdrop_path).slice(0, 5);
//             setupBanner(bannerMovies);
//         }

//         displayMovies(data.results);
//         updateLoadMoreButton();

//     } catch (error) {
//         console.error("خطأ:", error);
//         showError("حدث خطأ في تحميل الأفلام");
//     } finally {
//         isLoading = false;
//         hideLoading();
//         hideProgressBar();
//     }
// }

// function displayMovies(movies) {
//     const container = document.getElementById("movies-container");
//     if (!movies || movies.length === 0) {
//         if (currentPage === 1) {
//             container.innerHTML = `
//                 <div class="no-results">
//                     <i class="fas fa-film"></i>
//                     <p>لم يتم العثور على أفلام</p>
//                 </div>`;
//         }
//         return;
//     }

//     const fragment = document.createDocumentFragment();
//     movies.forEach(movie => {
//         if (movie) fragment.appendChild(createMovieCard(movie));
//     });
//     container.appendChild(fragment);
// }

// function createMovieCard(movie) {
//     const card = document.createElement("div");
//     card.className = "movie-card fade-in";
//     card.setAttribute("data-id", movie.id);

//     const isSaved = savedMovies.some(m => m?.id === movie.id);
//     const posterUrl = movie.poster_path ? base_img_500 + movie.poster_path : "https://via.placeholder.com/300x450";
//     const title = movie.title || "بدون عنوان";
//     const overview = movie.overview ? movie.overview.substring(0, 120) + "..." : "لا يوجد وصف";
//     const rating = movie.vote_average?.toFixed(1) || "N/A";

//     card.innerHTML = `
//         <img src="${posterUrl}" alt="${title}" loading="lazy">
//         <div class="movie-overlay">
//             <div class="movie-header">
//                 <h3>${title}</h3>
//                 <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
//             </div>
//             <p class="movie-description">${overview}</p>
//             <div class="movie-actions">
//                 <button class="play-btn-sm" onclick="playMovie(${movie.id})">
//                     <i class="fas fa-play"></i> مشاهدة
//                 </button>
//                 <button class="save-btn-sm ${isSaved ? 'saved' : ''}" 
//                         onclick="toggleSaveMovie(${movie.id}, ${JSON.stringify(title)}, '${movie.poster_path || ''}', ${movie.vote_average || 0}, this)">
//                     <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i> ${isSaved ? 'محفوظ' : 'حفظ'}
//                 </button>
//             </div>
//         </div>
//     `;

//     return card;
// }

// function toggleSaveMovie(id, title, posterPath, rating, buttonElement) {
//     const movie = {
//         id, title, poster_path: posterPath, vote_average: rating,
//         savedAt: new Date().toISOString()
//     };

//     const index = savedMovies.findIndex(m => m?.id === id);

//     if (index === -1) {
//         savedMovies.push(movie);
//         buttonElement.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
//         buttonElement.classList.add("saved");
//         showNotification(`تم حفظ "${title}"`);
//     } else {
//         savedMovies.splice(index, 1);
//         buttonElement.innerHTML = '<i class="far fa-heart"></i> حفظ';
//         buttonElement.classList.remove("saved");
//         showNotification(`تم إزالة "${title}"`, "error");
//     }

//     localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
//     updateFavoritesCount();
// }

// function setupBanner(movies) {
//     const bannerContainer = document.getElementById("banner-container");
//     const indicatorsContainer = document.getElementById("banner-indicators");

//     if (!bannerContainer || !movies.length) return;

//     bannerContainer.innerHTML = "";
//     indicatorsContainer.innerHTML = "";

//     movies.forEach((movie, index) => {
//         if (!movie.backdrop_path) return;

//         const isSaved = savedMovies.some(m => m?.id === movie.id);
//         const title = movie.title || "بدون عنوان";
//         const overview = movie.overview?.substring(0, 200) + "..." || "لا يوجد وصف";

//         const card = document.createElement("div");
//         card.className = `banner-card ${index === 0 ? "active" : ""}`;
//         card.innerHTML = `
//             <img src="${base_img + movie.backdrop_path}" alt="${title}">
//             <div class="banner-overlay">
//                 <h2>${title}</h2>
//                 <p>${overview}</p>
//                 <div class="banner-actions">
//                     <button class="banner-play-btn" onclick="playMovie(${movie.id})">
//                         <i class="fas fa-play"></i> مشاهدة الآن
//                     </button>
//                     <button class="banner-save-btn ${isSaved ? 'saved' : ''}" 
//                             onclick="toggleSaveMovie(${movie.id}, ${JSON.stringify(title)}, '${movie.backdrop_path}', ${movie.vote_average || 0}, this)">
//                         <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i> ${isSaved ? 'محفوظ' : 'حفظ'}
//                     </button>
//                 </div>
//             </div>
//         `;
//         bannerContainer.appendChild(card);

//         const indicator = document.createElement("button");
//         indicator.className = `indicator ${index === 0 ? "active" : ""}`;
//         indicator.onclick = () => changeBannerSlide(index);
//         indicatorsContainer.appendChild(indicator);
//     });

//     setupBannerControls();
//     startBannerAutoPlay();
// }

// function setupBannerControls() {
//     const prevBtn = document.querySelector(".prev-btn");
//     const nextBtn = document.querySelector(".next-btn");

//     if (prevBtn) prevBtn.onclick = () => changeBannerSlide(currentBannerIndex - 1);
//     if (nextBtn) nextBtn.onclick = () => changeBannerSlide(currentBannerIndex + 1);
// }

// function changeBannerSlide(index) {
//     const slides = document.querySelectorAll(".banner-card");
//     const indicators = document.querySelectorAll(".indicator");

//     if (!slides.length) return;

//     if (index < 0) index = slides.length - 1;
//     if (index >= slides.length) index = 0;

//     slides[currentBannerIndex].classList.remove("active");
//     indicators[currentBannerIndex].classList.remove("active");

//     slides[index].classList.add("active");
//     indicators[index].classList.add("active");

//     currentBannerIndex = index;
//     restartBannerAutoPlay();
// }

// function startBannerAutoPlay() {
//     if (bannerInterval) clearInterval(bannerInterval);
//     if (bannerMovies.length > 1) {
//         bannerInterval = setInterval(() => changeBannerSlide(currentBannerIndex + 1), 6000);
//     }
// }

// function restartBannerAutoPlay() {
//     if (bannerInterval) clearInterval(bannerInterval);
//     startBannerAutoPlay();
// }

// function playMovie(id) {
//     showProgressBar();
//     setTimeout(() => window.location.href = "watch.html?id=" + id, 300);
// }

// function loadMoreMovies() {
//     if (isLoading || currentPage >= totalPages) return;
//     currentPage++;
//     getMovies();

//     const btn = document.getElementById("loadMore");
//     if (btn) {
//         btn.disabled = true;
//         btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
//         setTimeout(() => {
//             btn.disabled = false;
//             btn.innerHTML = '<i class="fas fa-plus-circle"></i> تحميل المزيد';
//         }, 1000);
//     }
// }

// function updateLoadMoreButton() {
//     const btn = document.getElementById("loadMore");
//     if (!btn) return;

//     if (currentPage >= totalPages) {
//         btn.style.display = "none";
//     } else {
//         btn.style.display = "inline-flex";
//     }
// }

// function showLoading() {
//     const container = document.getElementById("movies-container");
//     if (currentPage === 1 && container && !container.children.length) {
//         container.innerHTML = '<div class="loading"><p>جاري تحميل الأفلام...</p></div>';
//     }
// }

// function hideLoading() {
//     const container = document.getElementById("movies-container");
//     container?.querySelector(".loading")?.remove();
// }

// function resetMoviesContainer() {
//     const container = document.getElementById("movies-container");
//     if (container) container.innerHTML = "";
// }

// function scrollToMovies() {
//     const section = document.querySelector(".movies-section");
//     if (section) {
//         window.scrollTo({ top: section.offsetTop - 100, behavior: "smooth" });
//     }
// }

// function setupScrollHeader() {
//     const header = document.getElementById("site-header");
//     if (!header) return;

//     window.addEventListener("scroll", () => {
//         header.classList.toggle("scrolled", window.scrollY > 100);
//     });
// }

// function showNotification(message, type) {
//     document.querySelector(".notification")?.remove();

//     const notification = document.createElement("div");
//     notification.className = `notification ${type === "error" ? "error" : ""}`;
//     notification.textContent = message;

//     document.body.appendChild(notification);

//     setTimeout(() => notification.classList.add("show"), 10);
//     setTimeout(() => {
//         notification.classList.remove("show");
//         setTimeout(() => notification.remove(), 300);
//     }, 3000);
// }

// function showError(message) {
//     const container = document.getElementById("movies-container");
//     container.innerHTML = `
//         <div class="loading">
//             <p style="color: #e50914;">${message}</p>
//             <button onclick="location.reload()" style="background: #e50914; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
//                 إعادة المحاولة
//             </button>
//         </div>
//     `;
// }

// function showProgressBar() {
//     const bar = document.getElementById("progress-bar");
//     if (bar) {
//         bar.style.display = "block";
//         bar.style.transform = "scaleX(0)";
//     }
// }

// function hideProgressBar() {
//     const bar = document.getElementById("progress-bar");
//     if (bar) {
//         bar.style.transform = "scaleX(1)";
//         setTimeout(() => bar.style.display = "none", 300);
//     }
// }

// function setupAccessibility() {
//     document.addEventListener("keydown", e => {
//         if (e.ctrlKey && e.key === "f") {
//             e.preventDefault();
//             document.getElementById("search")?.focus();
//         }
//         if (e.key === "Escape") {
//             const searchInput = document.getElementById("search");
//             if (searchInput?.value) {
//                 searchInput.value = "";
//                 searchMovies("");
//             }
//         }
//     });
// }

// document.addEventListener("visibilitychange", () => {
//     if (document.hidden) {
//         if (bannerInterval) clearInterval(bannerInterval);
//     } else {
//         restartBannerAutoPlay();
//     }
// });

// window.playMovie = playMovie;
// window.toggleSaveMovie = toggleSaveMovie;
// window.changeBannerSlide = changeBannerSlide;
// window.searchMovies = searchMovies;