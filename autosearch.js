// // ========================================
// // AUTO-SEARCH SYSTEM FOR MOVIES & TV SERIES (FIXED)
// // ========================================

// // ✅ Safe TMDB Config
// if (!window.TMDB) {
//     console.error("❌ TMDB config not found. Make sure api.js is loaded BEFORE autosearch.js");
// }

// const API_KEY  = window.TMDB?.API_KEY;
// const BASE_URL = window.TMDB?.BASE_URL;
// const IMG_URL  = window.TMDB?.IMG_URL;
// const IMG_500  = window.TMDB?.IMG_500;
// const IMG_92   = window.TMDB?.IMG_92 || "https://image.tmdb.org/t/p/w92";

// // ========================================
// // GLOBAL VARIABLES
// // ========================================
// let searchSuggestions = [];
// let searchTimeout;
// let currentSearchQuery = '';
// let currentPageType = '';
// let isSearchingAll = false; // للبحث في كلا النوعين

// // ========================================
// // INITIALIZATION
// // ========================================
// document.addEventListener("DOMContentLoaded", () => {
//     // اكتشاف نوع الصفحة بناءً على وجود العناصر
//     detectPageType();
    
//     if (!API_KEY || !BASE_URL) {
//         console.error("❌ TMDB API config missing");
//         return;
//     }

//     initializeAutosearch();
//     setupSearchListeners();
    
//     console.log(`✅ AutoSearch initialized for: ${currentPageType}`);
// });

// // ========================================
// // DETECT PAGE TYPE
// // ========================================
// function detectPageType() {
//     // محاولة اكتشاف من الصفحة الحالية
//     const currentPath = window.location.pathname;
//     const pageTitle = document.title.toLowerCase();
    
//     // تحقق من وجود عناصر محددة في الصفحة
//     const moviesGrid = document.getElementById("moviesGrid");
//     const seriesGrid = document.getElementById("seriesGrid");
    
//     // لوغيك الكشف
//     if (moviesGrid && !seriesGrid) {
//         currentPageType = 'movie';
//     } else if (seriesGrid && !moviesGrid) {
//         currentPageType = 'tv';
//     } else if (currentPath.includes('tv') || currentPath.includes('series') || 
//                pageTitle.includes('مسلسل') || pageTitle.includes('سلسلة') || 
//                pageTitle.includes('tv')) {
//         currentPageType = 'tv';
//     } else if (currentPath.includes('movie') || currentPath.includes('film') || 
//                pageTitle.includes('فيلم') || pageTitle.includes('أفلام') || 
//                pageTitle.includes('movie')) {
//         currentPageType = 'movie';
//     } else {
//         // إذا لم يتم التعرف، نبحث في كلا النوعين
//         currentPageType = 'all';
//         isSearchingAll = true;
//         console.log("⚠️ Page type not detected, searching in ALL types");
//     }
// }

// // ========================================
// // INITIALIZE AUTO-SEARCH
// // ========================================
// function initializeAutosearch() {
//     const searchInput = document.getElementById("search");
//     if (!searchInput) {
//         console.error("❌ Search input not found with id='search'");
//         return;
//     }

//     // إنشاء حاوية للاقتراحات
//     let container = document.getElementById("search-suggestions");
//     if (!container) {
//         container = document.createElement("div");
//         container.id = "search-suggestions";
//         container.className = "search-suggestions";
        
//         // إضافة الحاوية بعد حقل البحث
//         searchInput.parentNode.appendChild(container);
//     }

//     // ضبط placeholder بناءً على نوع البحث
//     updateSearchPlaceholder();
// }

// // ========================================
// // UPDATE SEARCH PLACEHOLDER
// // ========================================
// function updateSearchPlaceholder() {
//     const searchInput = document.getElementById("search");
//     if (!searchInput) return;
    
//     switch(currentPageType) {
//         case 'movie':
//             searchInput.placeholder = "🔍 ابحث عن أفلام...";
//             break;
//         case 'tv':
//             searchInput.placeholder = "🔍 ابحث عن مسلسلات...";
//             break;
//         default:
//             searchInput.placeholder = "🔍 ابحث عن أفلام أو مسلسلات...";
//             break;
//     }
// }

// // ========================================
// // SEARCH LISTENERS
// // ========================================
// function setupSearchListeners() {
//     const searchInput = document.getElementById("search");
//     if (!searchInput) return;

//     // البحث أثناء الكتابة
//     searchInput.addEventListener("input", e => {
//         clearTimeout(searchTimeout);
//         const query = e.target.value.trim();
//         currentSearchQuery = query;

//         if (!query) {
//             hideSuggestions();
//             resetToDefaultView();
//             return;
//         }

//         searchTimeout = setTimeout(() => {
//             if (isSearchingAll) {
//                 // البحث في كلا النوعين
//                 performMultiTypeSearch(query);
//             } else {
//                 // البحث في نوع واحد فقط
//                 query.length < 3 
//                     ? fetchQuickSuggestions(query) 
//                     : performAutosuggestSearch(query);
//             }
//         }, 300);
//     });

//     // التنقل بالكيبورد
//     searchInput.addEventListener("keydown", handleKeyboardNavigation);
    
//     // إغلاق الاقتراحات عند النقر خارجها
//     document.addEventListener('click', (e) => {
//         const suggestions = document.getElementById('search-suggestions');
//         const searchContainer = document.querySelector('.search-container') || searchInput.closest('.search-box')?.parentElement;
        
//         if (suggestions && searchContainer && !searchContainer.contains(e.target)) {
//             hideSuggestions();
//         }
//     });
// }

// // ========================================
// // MULTI-TYPE SEARCH
// // ========================================
// async function performMultiTypeSearch(query) {
//     try {
//         showProgress();
        
//         // البحث في الأفلام والمسلسلات معاً
//         const [moviesRes, tvRes] = await Promise.all([
//             fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}`),
//             fetch(`${BASEURL}/search/tv?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}`)
//         ]);
        
//         const moviesData = await moviesRes.json();
//         const tvData = await tvRes.json();
        
//         // دمج النتائج وترتيبها حسب الشعبية
//         let allResults = [];
        
//         // إضافة الأفلام
//         if (moviesData.results) {
//             allResults.push(...moviesData.results.map(item => ({
//                 ...item,
//                 type: 'movie',
//                 displayTitle: item.title,
//                 displayDate: item.release_date,
//                 icon: '🎬'
//             })));
//         }
        
//         // إضافة المسلسلات
//         if (tvData.results) {
//             allResults.push(...tvData.results.map(item => ({
//                 ...item,
//                 type: 'tv',
//                 displayTitle: item.name,
//                 displayDate: item.first_air_date,
//                 icon: '📺'
//             })));
//         }
        
//         // ترتيب حسب الشعبية (التصويت)
//         allResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        
//         searchSuggestions = allResults.slice(0, 10);
        
//         if (searchSuggestions.length > 0) {
//             displayMultiTypeSuggestions(searchSuggestions, query);
//         } else {
//             showNoResults(query);
//         }
        
//     } catch (err) {
//         console.error("Error in multi-type search:", err);
//         showNoResults(query);
//     } finally {
//         hideProgress();
//     }
// }

// // ========================================
// // DISPLAY MULTI-TYPE SUGGESTIONS
// // ========================================
// function displayMultiTypeSuggestions(items, query) {
//     const container = document.getElementById("search-suggestions");
//     const searchInput = document.getElementById("search");
    
//     if (!container || !searchInput) return;

//     // تحديد موقع العنصر
//     const inputRect = searchInput.getBoundingClientRect();
//     container.style.width = Math.min(inputRect.width, 500) + 'px';
//     container.style.top = (inputRect.bottom + 5) + 'px';
//     container.style.left = inputRect.left + 'px';

//     // إنشاء الهيدر
//     container.innerHTML = `
//         <div class="suggestion-header">
//             <span>نتائج البحث: "${query}"</span>
//             <span class="suggestion-count">${items.length} نتيجة</span>
//         </div>
//         <div class="suggestion-tabs">
//             <button class="tab-btn active" onclick="filterSuggestions('all')">الكل</button>
//             <button class="tab-btn" onclick="filterSuggestions('movie')">أفلام</button>
//             <button class="tab-btn" onclick="filterSuggestions('tv')">مسلسلات</button>
//         </div>
//         <div class="suggestions-list" id="suggestionsList">
//             ${items.map(item => createSuggestionItemHTML(item)).join("")}
//         </div>
//     `;

//     showSuggestions();
// }

// // ========================================
// // CREATE SUGGESTION ITEM HTML
// // ========================================
// function createSuggestionItemHTML(item) {
//     const type = item.type || currentPageType;
//     const titleText = item.displayTitle || item.title || item.name || 'بدون عنوان';
//     const year = item.displayDate ? item.displayDate.split('-')[0] : 
//                  item.release_date ? item.release_date.split('-')[0] : 
//                  item.first_air_date ? item.first_air_date.split('-')[0] : 'N/A';
//     const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
//     const poster = item.poster_path ? IMG_92 + item.poster_path : 'placeholder.jpg';
//     const icon = item.icon || (type === 'movie' ? '🎬' : '📺');
    
//     return `
//     <div class="suggestion-item" data-type="${type}" onclick="viewItem(${item.id}, '${type}')">
//         <div class="suggestion-poster">
//             <img src="${poster}" alt="${titleText}" onerror="this.src='placeholder.jpg'">
//             <div class="suggestion-type ${type}">
//                 ${icon}
//             </div>
//         </div>
//         <div class="suggestion-info">
//             <div class="suggestion-title">${titleText}</div>
//             <div class="suggestion-details">
//                 <span class="suggestion-rating">
//                     <i class="fas fa-star"></i> ${rating}
//                 </span>
//                 <span class="suggestion-year">${year}</span>
//                 <span class="suggestion-type-badge ${type}">
//                     ${type === 'movie' ? 'فيلم' : 'مسلسل'}
//                 </span>
//             </div>
//             <p class="suggestion-overview">
//                 ${item.overview ? item.overview.substring(0, 80) + '...' : 'لا يوجد وصف متاح'}
//             </p>
//         </div>
//         <div class="suggestion-action">
//             <button class="suggestion-btn view-btn" onclick="event.stopPropagation(); viewItem(${item.id}, '${type}')">
//                 <i class="fas fa-eye"></i>
//             </button>
//             <button class="suggestion-btn save-btn" onclick="event.stopPropagation(); saveItem(${item.id}, '${type}')">
//                 <i class="fas fa-bookmark"></i>
//             </button>
//         </div>
//     </div>
//     `;
// }

// // ========================================
// // FILTER SUGGESTIONS
// // ========================================
// function filterSuggestions(filterType) {
//     const tabBtns = document.querySelectorAll('.tab-btn');
//     tabBtns.forEach(btn => btn.classList.remove('active'));
//     event.target.classList.add('active');
    
//     const suggestionsList = document.getElementById('suggestionsList');
//     const allItems = document.querySelectorAll('.suggestion-item');
    
//     allItems.forEach(item => {
//         if (filterType === 'all' || item.dataset.type === filterType) {
//             item.style.display = 'flex';
//         } else {
//             item.style.display = 'none';
//         }
//     });
// }

// // ========================================
// // DISPLAY SUGGESTIONS (FOR SINGLE TYPE)
// // ========================================
// function displaySuggestions(items, title) {
//     const container = document.getElementById("search-suggestions");
//     const searchInput = document.getElementById("search");
    
//     if (!container || !searchInput) return;

//     const inputRect = searchInput.getBoundingClientRect();
//     container.style.width = Math.min(inputRect.width, 500) + 'px';
//     container.style.top = (inputRect.bottom + 5) + 'px';
//     container.style.left = inputRect.left + 'px';

//     container.innerHTML = `
//         <div class="suggestion-header">
//             ${title}
//             <span class="suggestion-count">${items.length} نتيجة</span>
//         </div>
//         <div class="suggestions-list">
//             ${items.map(item => createSuggestionItemHTML(item)).join("")}
//         </div>
//     `;

//     showSuggestions();
// }

// // ========================================
// // SINGLE TYPE SEARCH
// // ========================================
// async function performAutosuggestSearch(query) {
//     try {
//         showProgress();

//         const endpoint = currentPageType === 'movie' ? "/search/movie" : "/search/tv";
//         const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}`;
        
//         const res = await fetch(url);
//         const data = await res.json();

//         searchSuggestions = data.results?.slice(0, 10) || [];

//         if (searchSuggestions.length > 0) {
//             displaySuggestions(searchSuggestions, `نتائج البحث: "${query}"`);
//         } else {
//             showNoResults(query);
//         }

//     } catch (err) {
//         console.error("Error performing search:", err);
//         showNoResults(query);
//     } finally {
//         hideProgress();
//     }
// }

// // ========================================
// // QUICK SUGGESTIONS
// // ========================================
// async function fetchQuickSuggestions(query) {
//     try {
//         showProgress();

//         const endpoint = currentPageType === 'movie' ? "/search/movie" : "/search/tv";
//         const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}`;
        
//         const res = await fetch(url);
//         const data = await res.json();

//         searchSuggestions = data.results?.slice(0, 5) || [];

//         if (searchSuggestions.length > 0) {
//             displaySuggestions(searchSuggestions, `نتائج لـ "${query}"`);
//         } else {
//             showNoResults();
//         }

//     } catch (err) {
//         console.error("Error fetching suggestions:", err);
//         showNoResults();
//     } finally {
//         hideProgress();
//     }
// }

// // ========================================
// // HELPERS
// // ========================================
// function showSuggestions() {
//     const container = document.getElementById("search-suggestions");
//     if (container) {
//         container.style.display = "block";
//         container.style.opacity = "1";
//     }
// }

// function hideSuggestions() {
//     const container = document.getElementById("search-suggestions");
//     if (container) {
//         container.style.opacity = "0";
//         setTimeout(() => {
//             container.style.display = "none";
//         }, 300);
//     }
// }

// function showNoResults(query = '') {
//     const container = document.getElementById("search-suggestions");
//     const searchInput = document.getElementById("search");
    
//     if (!container || !searchInput) return;

//     const inputRect = searchInput.getBoundingClientRect();
//     container.style.width = Math.min(inputRect.width, 400) + 'px';
//     container.style.top = (inputRect.bottom + 5) + 'px';
//     container.style.left = inputRect.left + 'px';

//     container.innerHTML = `
//         <div class="no-results">
//             <i class="fas fa-search"></i>
//             <h3>لا توجد نتائج</h3>
//             <p>لم نعثر على أي ${isSearchingAll ? 'أفلام أو مسلسلات' : (currentPageType === 'movie' ? 'أفلام' : 'مسلسلات')} تطابق "${query}"</p>
//             <p class="suggestion-tip">💡 حاول استخدام كلمات مختلفة أو تحقق من الإملاء</p>
//         </div>
//     `;

//     showSuggestions();
// }

// function resetToDefaultView() {
//     // إعادة تحميل المحتوى الافتراضي للصفحة
//     if (currentPageType === 'movie' && typeof loadAllMovies === "function") {
//         loadAllMovies();
//     } else if (currentPageType === 'tv' && typeof loadAllSeries === "function") {
//         loadAllSeries();
//     } else if (isSearchingAll) {
//         // إذا كنا في الصفحة الرئيسية، إعادة تحميل المحتوى الشائع
//         if (typeof loadTrendingContent === "function") {
//             loadTrendingContent();
//         }
//     }
// }

// function handleKeyboardNavigation(e) {
//     const suggestions = document.getElementById("search-suggestions");
//     const items = suggestions?.querySelectorAll('.suggestion-item');
    
//     if (!items || items.length === 0) return;
    
//     const currentActive = suggestions.querySelector('.suggestion-item.active');
//     let currentIndex = currentActive ? Array.from(items).indexOf(currentActive) : -1;
    
//     switch(e.key) {
//         case "Escape":
//             hideSuggestions();
//             document.getElementById("search").blur();
//             break;
            
//         case "ArrowDown":
//             e.preventDefault();
//             if (currentIndex < items.length - 1) {
//                 if (currentActive) currentActive.classList.remove('active');
//                 items[currentIndex + 1].classList.add('active');
//                 items[currentIndex + 1].focus();
//             }
//             break;
            
//         case "ArrowUp":
//             e.preventDefault();
//             if (currentIndex > 0) {
//                 if (currentActive) currentActive.classList.remove('active');
//                 items[currentIndex - 1].classList.add('active');
//                 items[currentIndex - 1].focus();
//             }
//             break;
            
//         case "Enter":
//             if (currentActive) {
//                 currentActive.click();
//             }
//             break;
//     }
// }

// // ========================================
// // PROGRESS BAR
// // ========================================
// function showProgress() {
//     const bar = document.getElementById("progress-bar") || createProgressBar();
//     bar.style.display = "block";
//     bar.style.transform = "scaleX(0.3)";
// }

// function hideProgress() {
//     const bar = document.getElementById("progress-bar");
//     if (bar) {
//         bar.style.transform = "scaleX(1)";
//         setTimeout(() => {
//             bar.style.display = "none";
//         }, 300);
//     }
// }

// function createProgressBar() {
//     const bar = document.createElement("div");
//     bar.id = "progress-bar";
//     bar.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 3px;
//         background: linear-gradient(90deg, #CF0A0A, #DC5F00);
//         transform-origin: 0 0;
//         transform: scaleX(0);
//         transition: transform 0.3s ease;
//         z-index: 9999;
//         display: none;
//     `;
//     document.body.appendChild(bar);
//     return bar;
// }

// // ========================================
// // GLOBAL EXPORTS
// // ========================================
// window.viewItem = function(id, type) {
//     console.log(`Viewing ${type} with ID: ${id}`);
//     hideSuggestions();
    
//     // توجيه إلى صفحة التفاصيل المناسبة
//     setTimeout(() => {
//         window.location.href = type === "movie"
//             ? `movie-details.html?id=${id}`
//             : `tv-details.html?id=${id}`;
//     }, 300);
// };

// window.saveItem = function(id, type) {
//     const btn = event?.target?.closest('.save-btn');
//     if (!btn) return;
    
//     btn.classList.toggle('saved');
//     btn.innerHTML = btn.classList.contains('saved') 
//         ? '<i class="fas fa-bookmark"></i>'
//         : '<i class="far fa-bookmark"></i>';
    
//     // تخزين في localStorage
//     const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
//     const itemIndex = savedItems.findIndex(item => item.id === id && item.type === type);
    
//     if (itemIndex === -1) {
//         savedItems.push({ 
//             id, 
//             type, 
//             date: new Date().toISOString(),
//             title: event.target.closest('.suggestion-item').querySelector('.suggestion-title').textContent
//         });
//         showToast('تم الإضافة إلى المفضلة ✓');
//     } else {
//         savedItems.splice(itemIndex, 1);
//         showToast('تم الحذف من المفضلة ✗');
//     }
    
//     localStorage.setItem('savedItems', JSON.stringify(savedItems));
// };

// function showToast(message) {
//     const toast = document.createElement('div');
//     toast.className = 'toast';
//     toast.textContent = message;
//     toast.style.cssText = `
//         position: fixed;
//         top: 20px;
//         right: 20px;
//         background: linear-gradient(45deg, #CF0A0A, #DC5F00);
//         color: white;
//         padding: 15px 25px;
//         border-radius: 10px;
//         z-index: 9999;
//         animation: slideIn 0.3s ease;
//         font-weight: 600;
//         box-shadow: 0 5px 15px rgba(0,0,0,0.3);
//         max-width: 300px;
//     `;
    
//     document.body.appendChild(toast);
    
//     setTimeout(() => {
//         toast.style.animation = 'slideOut 0.3s ease';
//         setTimeout(() => toast.remove(), 300);
//     }, 3000);
// }

// // إضافة CSS إضافي
// const additionalStyles = document.createElement('style');
// additionalStyles.textContent = `
//     /* تبويبات التصفية */
//     .suggestion-tabs {
//         display: flex;
//         padding: 10px 20px;
//         gap: 10px;
//         border-bottom: 1px solid rgba(255,255,255,0.1);
//         background: rgba(0,0,0,0.1);
//     }
    
//     .tab-btn {
//         background: rgba(255,255,255,0.1);
//         border: 1px solid rgba(255,255,255,0.2);
//         color: #EEE;
//         padding: 5px 15px;
//         border-radius: 20px;
//         cursor: pointer;
//         font-size: 0.85rem;
//         transition: all 0.3s;
//     }
    
//     .tab-btn:hover {
//         background: rgba(207, 10, 10, 0.2);
//     }
    
//     .tab-btn.active {
//         background: linear-gradient(45deg, #CF0A0A, #DC5F00);
//         border-color: transparent;
//     }
    
//     /* بطاقة نوع المحتوى */
//     .suggestion-type-badge {
//         font-size: 0.75rem;
//         padding: 3px 8px;
//         border-radius: 10px;
//         font-weight: 600;
//     }
    
//     .suggestion-type-badge.movie {
//         background: rgba(33, 150, 243, 0.2);
//         color: #2196F3;
//     }
    
//     .suggestion-type-badge.tv {
//         background: rgba(76, 175, 80, 0.2);
//         color: #4CAF50;
//     }
    
//     /* تأثير التركيز للكيبورد */
//     .suggestion-item:focus {
//         outline: 2px solid #CF0A0A;
//         outline-offset: 2px;
//     }
// `;
// document.head.appendChild(additionalStyles);

// console.log("✅ AutoSearch system ready for all page types");