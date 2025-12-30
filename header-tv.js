// ========================================
// HEADER FUNCTIONALITY FOR TV PAGE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const dropdownToggle = document.getElementById('dropdownToggle');
    const genreNav = document.getElementById('genre-nav');
    const navBackdrop = document.getElementById('navBackdrop');
    const genreStrip = document.getElementById('genre-strip');
    const moreGenresBtn = document.getElementById('moreGenresBtn');
    
    // حالة القائمة
    let isNavOpen = false;
    
    // ===== DROPDOWN TOGGLE =====
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function() {
            isNavOpen = !isNavOpen;
            
            if (isNavOpen) {
                genreNav.classList.add('open');
                navBackdrop.classList.add('active');
                dropdownToggle.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                closeNav();
            }
        });
    }
    
    // ===== CLOSE NAV ON BACKDROP CLICK =====
    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeNav);
    }
    
    // ===== CLOSE NAV FUNCTION =====
    function closeNav() {
        isNavOpen = false;
        genreNav.classList.remove('open');
        navBackdrop.classList.remove('active');
        dropdownToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // ===== GENRE BUTTONS =====
    if (genreStrip) {
        const genreBtns = genreStrip.querySelectorAll('.genre-btn');
        
        genreBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // إزالة النشط من جميع الأزرار
                genreBtns.forEach(b => b.classList.remove('active'));
                
                // إضافة النشط للزر المحدد
                this.classList.add('active');
                
                // تحميل المسلسلات حسب التصنيف
                const genreId = this.dataset.genre;
                loadSeriesByGenre(genreId);
                
                // إغلاق القائمة إذا كانت مفتوحة (للموبايل)
                closeNav();
            });
        });
    }
    
    // ===== MORE GENRES BUTTON =====
    if (moreGenresBtn) {
        moreGenresBtn.addEventListener('click', function() {
            showGenresModal();
        });
    }
    
    // ===== GENRES MODAL =====
    function showGenresModal() {
        // إنشاء الـ Modal
        const modal = document.createElement('div');
        modal.className = 'genres-modal';
        
        let genresHTML = '';
        TV_GENRES.forEach(genre => {
            if (genre.id !== "") { // تخطي "الكل"
                genresHTML += `
                    <button class="genre-modal-btn" data-genre="${genre.id}" onclick="loadSeriesByGenre('${genre.id}'); closeModal()">
                        <i class="${genre.icon}"></i>
                        <span>${genre.name}</span>
                    </button>
                `;
            }
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-filter"></i> جميع التصنيفات</h3>
                    <button class="close-modal" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${genresHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة الـ CSS إذا لم يكن موجوداً
        if (!document.querySelector('style[data-genres-modal]')) {
            const style = document.createElement('style');
            style.dataset.genresModal = true;
            style.textContent = `
                .genres-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .genres-modal .modal-content {
                    background: #1a1a1a;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 80vh;
                    overflow: hidden;
                    border: 2px solid #333;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                }
                
                .genres-modal .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: #222;
                    border-bottom: 1px solid #333;
                }
                
                .genres-modal .modal-header h3 {
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .genres-modal .close-modal {
                    background: none;
                    border: none;
                    color: #ccc;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.3s;
                }
                
                .genres-modal .close-modal:hover {
                    color: #E50914;
                }
                
                .genres-modal .modal-body {
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 10px;
                    overflow-y: auto;
                    max-height: calc(80vh - 80px);
                }
                
                .genre-modal-btn {
                    padding: 15px;
                    background: #222;
                    border: 2px solid transparent;
                    border-radius: 10px;
                    color: #ccc;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    font-family: inherit;
                    font-size: 14px;
                }
                
                .genre-modal-btn:hover {
                    background: #333;
                    color: #fff;
                    border-color: #444;
                }
                
                .genre-modal-btn i {
                    font-size: 20px;
                }
            `;
            document.head.appendChild(style);
        }
        
        window.closeModal = function() {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        };
        
        // إغلاق بالضغط على Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
        
        // إغلاق بالضغط خارج الـ Modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // ===== SCROLL EFFECT =====
    window.addEventListener('scroll', function() {
        const header = document.getElementById('site-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    console.log("✅ تم تحميل header-tv.js بنجاح");
});

// إضافة المتغيرات للـ window إذا كانت غير موجودة
if (!window.TV_GENRES) {
    window.TV_GENRES = [
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
}