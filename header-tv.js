// header-tv.js - كود الهيدر للمسلسلات

console.log("📺 تحميل كود هيدر المسلسلات...");

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ تهيئة هيدر المسلسلات...");
    setupHeader();
    setupScrollEffects();
});

function setupHeader() {
    console.log("🔘 تهيئة هيدر المسلسلات...");
    
    setupGenreButtons();
    setupMoreGenresButton();
    setupMobileMenu();
    setupPageNavigation();
    setupNavLinks();
    
    console.log("✅ هيدر المسلسلات جاهز!");
}

function setupScrollEffects() {
    const header = document.getElementById('site-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // إضافة/إزالة كلاس التمرير
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // إخفاء/إظهار الهيدر عند التمرير
        if (currentScroll > lastScroll && currentScroll > 100) {
            // التمرير لأسفل - إخفاء الهيدر
            header.style.transform = 'translateY(-100%)';
        } else {
            // التمرير لأعلى - إظهار الهيدر
            header.style.transform = 'translateY(0)';
        }
        
        // تحديث مؤشر التقدم
        updateProgressBar();
        
        lastScroll = currentScroll;
    });
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    progressBar.style.transform = `scaleX(${scrolled / 100})`;
    
    if (scrolled > 0) {
        progressBar.style.display = 'block';
    } else {
        progressBar.style.display = 'none';
    }
}

function setupGenreButtons() {
    const genreButtons = document.querySelectorAll('.genre-btn');
    console.log(`🔘 وجدت ${genreButtons.length} أزرار تصنيف في الشريط`);
    
    genreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            genreButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const genreId = this.getAttribute('data-genre');
            console.log(`🎯 تم النقر على زر الشريط: ${this.textContent.trim()} (${genreId})`);
            
            if (typeof window.loadSeriesByGenre === 'function') {
                window.loadSeriesByGenre(genreId);
            }
        });
    });
}

function setupMoreGenresButton() {
    const moreBtn = document.getElementById('moreGenresBtn');
    
    if (moreBtn) {
        moreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("📂 فتح جميع تصنيفات المسلسلات...");
            showAllGenresModal();
        });
    }
}

function showAllGenresModal() {
    if (document.getElementById('seriesGenresModal')) {
        return;
    }
    
    console.log("📊 فتح مودال جميع تصنيفات المسلسلات");
    
    const modalHTML = `
        <div class="genres-modal" id="seriesGenresModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-layer-group"></i> جميع تصنيفات المسلسلات</h3>
                    <button class="close-modal" onclick="closeSeriesGenresModal()">×</button>
                </div>
                <div class="modal-body" id="allSeriesGenresList"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const allGenresList = document.getElementById('allSeriesGenresList');
    allGenresList.innerHTML = '';
    
    const TV_GENRES = [
        { id: "", name: "الكل", icon: "fas fa-tv" },
        { id: "10759", name: "أكشن ومغامرة", icon: "fas fa-fire" },
        { id: "35", name: "كوميديا", icon: "fas fa-laugh" },
        { id: "18", name: "دراما", icon: "fas fa-theater-masks" },
        { id: "10765", name: "خيال علمي", icon: "fas fa-robot" },
        { id: "9648", name: "غموض", icon: "fas fa-user-secret" },
        { id: "10762", name: "أطفال", icon: "fas fa-child" },
        { id: "10766", name: "دراما", icon: "fas fa-heart" },
        { id: "80", name: "جريمة", icon: "fas fa-user-secret" },
        { id: "99", name: "وثائقي", icon: "fas fa-camera" },
        { id: "10763", name: "أخبار", icon: "fas fa-newspaper" },
        { id: "10764", name: "واقعي", icon: "fas fa-video" },
        { id: "10767", name: "توك شو", icon: "fas fa-microphone" },
        { id: "10768", name: "حرب وسياسة", icon: "fas fa-flag" },
        { id: "10751", name: "عائلي", icon: "fas fa-home" },
        { id: "10749", name: "رومانسي", icon: "fas fa-heart" }
    ];
    
    TV_GENRES.forEach(genre => {
        const genreBtn = document.createElement('button');
        genreBtn.className = 'genre-modal-btn';
        genreBtn.innerHTML = `
            <i class="${genre.icon}"></i>
            <span>${genre.name}</span>
        `;
        genreBtn.onclick = () => {
            selectSeriesGenreFromModal(genre.id);
        };
        allGenresList.appendChild(genreBtn);
    });
    
    document.querySelector('#seriesGenresModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSeriesGenresModal();
        }
    });
}

function selectSeriesGenreFromModal(genreId) {
    console.log(`✅ اختيار تصنيف مسلسلات من القائمة: ${genreId}`);
    closeSeriesGenresModal();
    
    const genreButtons = document.querySelectorAll('.genre-btn');
    genreButtons.forEach(btn => btn.classList.remove('active'));
    
    const matchingButton = Array.from(genreButtons).find(btn => 
        btn.getAttribute('data-genre') === genreId
    );
    
    if (matchingButton) {
        matchingButton.classList.add('active');
    } else {
        const allButton = document.querySelector('.genre-btn[data-genre=""]');
        if (allButton) {
            allButton.classList.add('active');
        }
    }
    
    if (typeof window.loadSeriesByGenre === 'function') {
        window.loadSeriesByGenre(genreId);
    }
}

function closeSeriesGenresModal() {
    const modal = document.getElementById('seriesGenresModal');
    if (modal) {
        modal.remove();
        console.log("📊 إغلاق مودال تصنيفات المسلسلات");
    }
}

function setupMobileMenu() {
    const menuBtn = document.getElementById('dropdownToggle');
    const mobileMenu = document.getElementById('genre-nav');
    const backdrop = document.getElementById('navBackdrop');
    
    if (menuBtn && mobileMenu && backdrop) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('open');
            backdrop.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            menuBtn.classList.toggle('active', isOpen);
            console.log(`📱 ${isOpen ? 'فتح' : 'إغلاق'} القائمة`);
        });
        
        backdrop.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
            menuBtn.classList.remove('active');
            console.log('📱 إغلاق القائمة (خلفية)');
        });
        
        mobileMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A') {
                setTimeout(() => {
                    mobileMenu.classList.remove('open');
                    backdrop.classList.remove('active');
                    document.body.style.overflow = '';
                    menuBtn.classList.remove('active');
                }, 300);
            }
        });
        
        // إغلاق عند الضغط على ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
                menuBtn.classList.remove('active');
            }
        });
    }
}

function setupPageNavigation() {
    console.log("🔄 إعداد التنقل بين الصفحات...");
    
    const pageSwitchBtn = document.querySelector('.page-switch-btn');
    if (pageSwitchBtn) {
        pageSwitchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            console.log(`🎯 زر الانتقال: ${href}`);
            
            showPageTransition();
            
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    }
    
    const genreNav = document.getElementById('genre-nav');
    if (genreNav) {
        genreNav.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.hasAttribute('href')) {
                const href = link.getAttribute('href');
                
                if (href === "index.html" || href === "tv.html") {
                    e.preventDefault();
                    console.log(`🔗 رابط تنقل: ${href}`);
                    
                    showPageTransition();
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            }
        });
    }
}

function setupNavLinks() {
    const genreNav = document.getElementById('genre-nav');
    if (!genreNav) return;
    
    const currentPage = window.location.pathname.includes('tv.html') ? 'tv' : 'film';
    
    genreNav.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        
        // إزالة النشط من جميع الروابط أولاً
        link.classList.remove('active');
        
        // تحديد الرابط النشط
        if (currentPage === 'tv' && href === "#" && link.dataset.section === "all") {
            link.classList.add('active');
        } else if (currentPage === 'film' && href === "index.html") {
            link.classList.add('active');
        }
    });
}

function showPageTransition() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.display = 'block';
        progressBar.style.transform = 'scaleX(0)';
        setTimeout(() => {
            progressBar.style.transform = 'scaleX(1)';
        }, 10);
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0a0a0a;
        z-index: 9999;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 500);
}

// إضافة أنيميشن إذا لم يكن موجوداً
if (!document.getElementById('page-transition-style')) {
    const style = document.createElement('style');
    style.id = 'page-transition-style';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* أنيميشن للزر النشط */
        .page-switch-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .page-switch-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// الدوال العامة
window.showAllGenresModal = showAllGenresModal;
window.closeSeriesGenresModal = closeSeriesGenresModal;
window.selectSeriesGenreFromModal = selectSeriesGenreFromModal;

console.log("✅ header-tv.js تم تحميله بنجاح!");// ========================================
// HEADER FUNCTIONALITY FOR TV PAGE
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("📺 تهيئة الهيدر لصفحة المسلسلات...");
    setupHeader();
    setupGenresModal();
});

function setupHeader() {
    console.log("⚙️ إعداد شريط التنقل للمسلسلات");
    
    // عناصر DOM
    const dropdownToggle = document.getElementById("dropdownToggle");
    const genreNav = document.getElementById("genre-nav");
    const navBackdrop = document.getElementById("navBackdrop");
    const genreStrip = document.getElementById("genre-strip");
    const moreGenresBtn = document.getElementById("moreGenresBtn");
    
    if (!dropdownToggle || !genreNav) return;
    
    // فتح/إغلاق القائمة المنسدلة
    dropdownToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        genreNav.classList.toggle("open");
        navBackdrop.classList.toggle("active");
        dropdownToggle.classList.toggle("active");
    });
    
    // إغلاق القائمة عند النقر على الخلفية
    navBackdrop.addEventListener("click", () => {
        genreNav.classList.remove("open");
        navBackdrop.classList.remove("active");
        dropdownToggle.classList.remove("active");
    });
    
    // إغلاق القائمة عند النقر على رابط
    genreNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            genreNav.classList.remove("open");
            navBackdrop.classList.remove("active");
            dropdownToggle.classList.remove("active");
        });
    });
    
    // إغلاق القائمة عند التمرير
    window.addEventListener("scroll", () => {
        genreNav.classList.remove("open");
        navBackdrop.classList.remove("active");
        dropdownToggle.classList.remove("active");
    });
    
    // إعداد تصنيفات الشريط
    if (genreStrip) {
        genreStrip.querySelectorAll(".genre-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                // إزالة النشط من جميع الأزرار
                genreStrip.querySelectorAll(".genre-btn").forEach(b => {
                    b.classList.remove("active");
                });
                
                // إضافة النشط للزر المحدد
                btn.classList.add("active");
                
                // تحميل المسلسلات حسب التصنيف
                const genreId = btn.getAttribute("data-genre");
                loadSeriesByGenre(genreId);
            });
        });
    }
    
    console.log("✅ تم إعداد الهيدر بنجاح");
}

// ========================================
// MODAL FOR MORE GENRES
// ========================================

function setupGenresModal() {
    const moreGenresBtn = document.getElementById("moreGenresBtn");
    if (!moreGenresBtn) return;
    
    moreGenresBtn.addEventListener("click", showGenresModal);
    
    console.log("✅ تم إعداد زر المزيد من التصنيفات");
}

function showGenresModal() {
    // إنشاء العناصر الأساسية للمودال
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "genres-modal";
    modalOverlay.id = "genresModal";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    
    // رأس المودال
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.innerHTML = `
        <h3><i class="fas fa-tags"></i> جميع التصنيفات</h3>
        <button class="close-modal" id="closeGenresModal">&times;</button>
    `;
    
    // جسم المودال
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    
    // إضافة جميع التصنيفات
    TV_GENRES.forEach(genre => {
        const genreBtn = document.createElement("button");
        genreBtn.className = "genre-modal-btn";
        genreBtn.innerHTML = `
            <i class="${genre.icon}"></i>
            <span>${genre.name}</span>
        `;
        
        genreBtn.addEventListener("click", () => {
            // إغلاق المودال
            closeGenresModal();
            
            // تحديث زر التصنيف النشط
            updateActiveGenreBtn(genre.id);
            
            // تحميل المسلسلات حسب التصنيف
            loadSeriesByGenre(genre.id);
        });
        
        modalBody.appendChild(genreBtn);
    });
    
    // تجميع المودال
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    
    // إضافة المودال إلى الصفحة
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = "hidden"; // منع التمرير في الخلفية
    
    // إضافة حدث الإغلاق
    const closeBtn = document.getElementById("closeGenresModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeGenresModal);
    }
    
    // إغلاق عند النقر خارج المودال
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeGenresModal();
        }
    });
    
    // إغلاق بمفتاح ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeGenresModal();
        }
    });
    
    console.log("📁 عرض مودال التصنيفات");
}

function closeGenresModal() {
    const modal = document.getElementById("genresModal");
    if (modal) {
        modal.remove();
        document.body.style.overflow = "auto";
    }
}

function updateActiveGenreBtn(genreId) {
    const genreStrip = document.getElementById("genre-strip");
    if (!genreStrip) return;
    
    // إزالة النشط من جميع الأزرار
    genreStrip.querySelectorAll(".genre-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // البحث عن الزر المناسب
    const targetBtn = genreStrip.querySelector(`.genre-btn[data-genre="${genreId}"]`);
    if (targetBtn) {
        targetBtn.classList.add("active");
    } else {
        // إذا لم يكن الزر موجوداً، اجعل زر "الكل" نشطاً
        const allBtn = genreStrip.querySelector(`.genre-btn[data-genre=""]`);
        if (allBtn) allBtn.classList.add("active");
    }
}