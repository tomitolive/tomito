// header.js - كود الهيدر والتجاوب للأفلام (مصحح)

console.log("🎬 تحميل كود الهيدر...");

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ تهيئة الهيدر...");
    setupHeader();
    
    // تهيئة البحث
    setupSearch();
});

// ========================================
// HEADER SETUP
// ========================================

function setupHeader() {
    console.log("🔘 تهيئة أزرار التصنيفات في الهيدر...");
    
    // 1. أزرار التصنيفات
    setupGenreButtons();
    
    // 2. زر "المزيد"
    setupMoreGenresButton();
    
    // 3. تفعيل تأثيرات الهيدر
    setupHeaderEffects();
    
    console.log("✅ الهيدر جاهز!");
}

// ========================================
// GENRE BUTTONS - مصحح
// ========================================

function setupGenreButtons() {
    const genreButtons = document.querySelectorAll('.genre-btn:not(#moreGenresBtn)');
    console.log(`🔘 وجدت ${genreButtons.length} أزرار تصنيف`);
    
    genreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة النشط من جميع أزرار التصنيف
            document.querySelectorAll('.genre-btn:not(#moreGenresBtn)').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة النشط للزر المختار
            this.classList.add('active');
            
            // الحصول على التصنيف
            const genreId = this.getAttribute('data-genre') || "";
            const genreName = this.textContent.trim();
            
            console.log(`🎯 تم النقر على: ${genreName} (ID: ${genreId})`);
            
            // إظهار رسالة التحميل
            const container = document.getElementById("new-movies");
            if (container) {
                container.innerHTML = `
                    <div class="loading" style="grid-column: 1 / -1; padding: 60px; text-align: center;">
                        <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                        <p style="color: #999;">جاري تحميل أفلام ${genreId ? genreName : 'الكل'}...</p>
                    </div>
                `;
            }
            
            // تحميل الأفلام حسب التصنيف
            if (typeof window.loadMoviesByGenre === 'function') {
                window.loadMoviesByGenre(genreId);
            } else {
                console.error("❌ دالة loadMoviesByGenre غير موجودة!");
                // تحميل يدوي
                loadMoviesManually(genreId);
            }
        });
    });
}

// ========================================
// دالة تحميل يدوية (بديل)
// ========================================

async function loadMoviesManually(genreId) {
    const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
    const BASE_URL = "https://api.themoviedb.org/3";
    
    try {
        let url;
        if (!genreId || genreId === "") {
            url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ar&page=1`;
        } else {
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        // عرض الأفلام في قسم الأفلام الجديدة
        const container = document.getElementById("new-movies");
        if (container) {
            container.innerHTML = "";
            
            if (data.results && data.results.length > 0) {
                data.results.slice(0, 10).forEach(movie => {
                    const card = createMovieCard(movie);
                    container.appendChild(card);
                });
                
                // تحديث العنوان
                const sectionTitle = container.parentElement.querySelector('.section-title');
                if (sectionTitle) {
                    const genreNames = {
                        "28": "أكشن",
                        "35": "كوميديا", 
                        "18": "دراما",
                        "27": "رعب",
                        "10749": "رومانسية"
                    };
                    
                    const genreName = genreNames[genreId] || genreId;
                    sectionTitle.innerHTML = `<i class="fas fa-film"></i> أفلام ${genreName}`;
                }
            }
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل الأفلام:", error);
    }
}

// ========================================
// إنشاء كرت فيلم (بديل)
// ========================================

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    
    const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";
    
    const title = movie.title || "بدون عنوان";
    const overview = movie.overview ? movie.overview.substring(0, 120) + "..." : "لا يوجد وصف";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="movie-overlay">
            <div class="movie-header">
                <h3>${title}</h3>
                <span class="movie-rating">
                    <i class="fas fa-star"></i> ${rating}
                </span>
            </div>
            <p class="movie-description">${overview}</p>
            <div class="movie-actions">
                <button class="play-btn-sm" onclick="playMovie(${movie.id})">
                    <i class="fas fa-play"></i> مشاهدة
                </button>
              
            </div>
        </div>
    `;
    
    return card;
}

// ========================================
// MORE GENRES BUTTON
// ========================================

function setupMoreGenresButton() {
    const moreBtn = document.getElementById('moreGenresBtn');
    
    if (moreBtn) {
        moreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("📂 فتح جميع التصنيفات...");
            showAllGenresModal();
        });
    }
}

// ========================================
// ALL GENRES MODAL
// ========================================

function showAllGenresModal() {
    // منع التكرار
    if (document.getElementById('genresModal')) {
        return;
    }
    
    console.log("📊 فتح مودال جميع التصنيفات");
    
    const modalHTML = `
        <div class="genres-modal" id="genresModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-layer-group"></i> جميع تصنيفات الأفلام</h3>
                    <button class="close-modal" onclick="closeGenresModal()">×</button>
                </div>
                <div class="modal-body" id="allGenresList"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // إضافة التصنيفات
    const allGenresList = document.getElementById('allGenresList');
    allGenresList.innerHTML = '';
    
    const allGenres = [
        { id: "", name: "الكل", icon: "fas fa-film", color: "#3498db" },
        { id: "28", name: "أكشن", icon: "fas fa-fire", color: "#e74c3c" },
        { id: "35", name: "كوميديا", icon: "fas fa-laugh", color: "#f1c40f" },
        { id: "18", name: "دراما", icon: "fas fa-theater-masks", color: "#e67e22" },
        { id: "27", name: "رعب", icon: "fas fa-ghost", color: "#9b59b6" },
        { id: "10749", name: "رومانسية", icon: "fas fa-heart", color: "#e91e63" },
        { id: "16", name: "أنيمي", icon: "fas fa-dragon", color: "#1abc9c" },
        { id: "878", name: "خيال علمي", icon: "fas fa-robot", color: "#16a085" },
        { id: "12", name: "مغامرة", icon: "fas fa-mountain", color: "#d35400" },
        { id: "53", name: "إثارة", icon: "fas fa-user-secret", color: "#34495e" },
        { id: "80", name: "جريمة", icon: "fas fa-user-secret", color: "#2c3e50" },
        { id: "99", name: "وثائقي", icon: "fas fa-camera", color: "#7f8c8d" },
        { id: "36", name: "تاريخ", icon: "fas fa-landmark", color: "#8e44ad" },
        { id: "10402", name: "موسيقى", icon: "fas fa-music", color: "#2980b9" },
        { id: "14", name: "خيال", icon: "fas fa-hat-wizard", color: "#27ae60" },
        { id: "10751", name: "عائلي", icon: "fas fa-home", color: "#c0392b" },
        { id: "10752", name: "حربي", icon: "fas fa-fighter-jet", color: "#f39c12" },
        { id: "37", name: "غربي", icon: "fas fa-hat-cowboy", color: "#95a5a6" }
    ];
    
    allGenres.forEach(genre => {
        const genreBtn = document.createElement('button');
        genreBtn.className = 'genre-modal-btn';
        genreBtn.style.setProperty('--genre-color', genre.color);
        genreBtn.innerHTML = `
            <i class="${genre.icon}"></i>
            <span>${genre.name}</span>
        `;
        genreBtn.onclick = () => {
            selectGenreFromModal(genre.id, genre.name);
        };
        allGenresList.appendChild(genreBtn);
    });
    
    // إضافة CSS للمودال إذا لم يكن موجوداً
    if (!document.getElementById('genres-modal-style')) {
        const style = document.createElement('style');
        style.id = 'genres-modal-style';
        style.textContent = `
            .genres-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.95);
                backdrop-filter: blur(5px);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content {
                background: linear-gradient(135deg, #141414 0%, #1a1a1a 100%);
                border-radius: 20px;
                max-width: 700px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                border: 2px solid var(--genre-color, #E50914);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }
            
            .modal-header {
                padding: 25px;
                background: linear-gradient(90deg, var(--genre-color, #E50914) 0%, #B81D24 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 24px;
                margin: 0;
                font-weight: 600;
            }
            
            .close-modal {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-modal:hover {
                background: rgba(255,255,255,0.3);
                transform: rotate(90deg);
            }
            
            .modal-body {
                padding: 25px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 15px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .modal-body::-webkit-scrollbar {
                width: 8px;
            }
            
            .modal-body::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
            }
            
            .modal-body::-webkit-scrollbar-thumb {
                background: var(--genre-color, #E50914);
                border-radius: 4px;
            }
            
            .genre-modal-btn {
                background: #222;
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 20px 10px;
                color: #ddd;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                font-size: 15px;
                font-weight: 500;
                min-height: 120px;
                justify-content: center;
            }
            
            .genre-modal-btn:hover {
                background: #2c2c2c;
                border-color: var(--genre-color, #E50914);
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            }
            
            .genre-modal-btn i {
                font-size: 32px;
                color: var(--genre-color, #E50914);
            }
            
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                
                .genre-modal-btn {
                    padding: 15px 8px;
                    min-height: 100px;
                    font-size: 14px;
                }
                
                .genre-modal-btn i {
                    font-size: 28px;
                }
            }
            
            @media (max-width: 480px) {
                .modal-body {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // إغلاق عند النقر خارج المودال
    document.querySelector('#genresModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeGenresModal();
        }
    });
    
    // إغلاق عند الضغط على ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGenresModal();
        }
    });
}

// ========================================
// SELECT GENRE FROM MODAL
// ========================================

function selectGenreFromModal(genreId, genreName) {
    console.log(`✅ اختيار تصنيف من القائمة: ${genreName} (${genreId})`);
    closeGenresModal();
    
    // تحديث الأزرار في الشريط العلوي
    const genreButtons = document.querySelectorAll('.genre-btn:not(#moreGenresBtn)');
    genreButtons.forEach(btn => btn.classList.remove('active'));
    
    // جعل الزر المطابق نشط إن وجد
    const matchingButton = Array.from(genreButtons).find(btn => 
        btn.getAttribute('data-genre') === genreId
    );
    
    if (matchingButton) {
        matchingButton.classList.add('active');
        
        // إظهار رسالة التحميل
        const container = document.getElementById("new-movies");
        if (container) {
            container.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1; padding: 60px; text-align: center;">
                    <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                    <p style="color: #999;">جاري تحميل أفلام ${genreName}...</p>
                </div>
            `;
        }
        
        // تحميل الأفلام
        if (typeof window.loadMoviesByGenre === 'function') {
            window.loadMoviesByGenre(genreId);
        } else {
            loadMoviesManually(genreId);
        }
    } else {
        // إذا لم يكن في الشريط، نجعل أول زر (الكل) نشط
        const allButton = document.querySelector('.genre-btn[data-genre=""]');
        if (allButton) {
            allButton.classList.add('active');
            if (typeof window.loadMoviesByGenre === 'function') {
                window.loadMoviesByGenre("");
            }
        }
    }
}

// ========================================
// CLOSE GENRES MODAL
// ========================================

function closeGenresModal() {
    const modal = document.getElementById('genresModal');
    if (modal) {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            modal.remove();
            console.log("📊 إغلاق مودال التصنيفات");
        }, 300);
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function setupSearch() {
    const searchInput = document.getElementById("search");
    if (!searchInput) {
        console.warn("⚠️ حقل البحث غير موجود");
        return;
    }
    
    console.log("🔍 تهيئة البحث...");
    
    let searchTimeout;
    
    searchInput.addEventListener("input", function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            console.log("🔍 البحث فارغ - تحميل الأقسام");
            if (typeof window.loadAllSections === 'function') {
                window.loadAllSections();
            }
            return;
        }
        
        searchTimeout = setTimeout(function() {
            if (typeof window.searchMovies === 'function') {
                window.searchMovies(query);
            } else {
                console.warn("⚠️ دالة searchMovies غير موجودة");
            }
        }, 500);
    });
    
    console.log("✅ البحث جاهز");
}

// ========================================
// HEADER EFFECTS
// ========================================

function setupHeaderEffects() {
    const header = document.querySelector('.site-header');
    
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // إخفاء/إظهار الهيدر عند التمرير
            if (currentScroll > 100) {
                header.style.transform = currentScroll > lastScroll 
                    ? 'translateY(-100%)' 
                    : 'translateY(0)';
                header.style.transition = 'transform 0.3s ease';
            }
            
            // إضافة تأثير الظل عند التمرير
            if (currentScroll > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
        });
    }
}

// ========================================
// FUNCTIONS FOR BUTTONS
// ========================================

function playMovie(id) {
    console.log(`▶️ تشغيل الفيلم: ${id}`);
    window.location.href = `watch.html?id=${id}`;
}

function toggleSave(id, title, posterPath, rating, btn) {
    console.log(`❤️ حفظ الفيلم: ${title}`);
    
    // تغيير حالة الزر
    if (btn.innerHTML.includes('far fa-heart')) {
        btn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        btn.classList.add("saved");
    } else {
        btn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        btn.classList.remove("saved");
    }
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.showAllGenresModal = showAllGenresModal;
window.closeGenresModal = closeGenresModal;
window.selectGenreFromModal = selectGenreFromModal;
window.playMovie = playMovie;
window.toggleSave = toggleSave;

console.log("✅ header.js تم تحميله بنجاح!");



// في ملف header.js أو script.js
document.addEventListener('DOMContentLoaded', function() {
    // البحث
    const searchForm = document.querySelector('.search-container');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = this.querySelector('.search-input').value;
            if (searchTerm.trim()) {
                window.location.href = `https://shah4u.day/search?s=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
    
    // بقية الكود يبقى كما هو...
});