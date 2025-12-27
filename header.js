// بيانات التصنيفات
const movieGenres = [
    { id: "", name: "الكل", icon: "fas fa-film" },
    { id: "28", name: "أكشن", icon: "fas fa-fire" },
    { id: "35", name: "كوميديا", icon: "fas fa-laugh" },
    { id: "18", name: "دراما", icon: "fas fa-theater-masks" },
    { id: "27", name: "رعب", icon: "fas fa-ghost" },
    { id: "10749", name: "رومانسية", icon: "fas fa-heart" },
    { id: "16", name: "أنيمي", icon: "fas fa-dragon" },
    { id: "878", name: "خيال علمي", icon: "fas fa-robot" },
    { id: "12", name: "مغامرة", icon: "fas fa-mountain" },
    { id: "53", name: "إثارة", icon: "fas fa-user-secret" }
];

// تهيئة الهيدر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    setupHeaderScroll();
});

// دالة لتهيئة الهيدر
function initHeader() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    
    // 1. تحميل التصنيفات في الشريط
    loadGenres();
    
    // 2. إعداد القائمة المنسدلة للجوال
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileNav();
        });
    }
    
    // 3. إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!dropdownToggle?.contains(e.target) && !genreNav?.contains(e.target)) {
            closeMobileNav();
        }
    });
    
    // 4. إغلاق القائمة عند النقر على رابط
    if (genreNav) {
        genreNav.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && window.innerWidth <= 992) {
                setTimeout(closeMobileNav, 300);
            }
        });
    }
    
    // 5. إغلاق القائمة عند تغيير حجم النافذة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            closeMobileNav();
        }
    });
    
    // 6. إغلاق القائمة عند التمرير
    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 992 && genreNav?.classList.contains('open')) {
            closeMobileNav();
        }
    });
}

// دالة لتحميل التصنيفات في الشريط
function loadGenres() {
    const genreNav = document.getElementById('genre-nav');
    if (!genreNav) return;
    
    // تفريغ الشريط أولاً
    genreNav.innerHTML = '';
    
    // إضافة كل تصنيف
    movieGenres.forEach(genre => {
        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('data-genre', genre.id);
        link.innerHTML = `<i class="${genre.icon}"></i> ${genre.name}`;
        
        // تعيين التصنيف الأول كنشط
        if (genre.id === "") {
            link.classList.add('active');
        }
        
        // إضافة حدث النقر
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleGenreClick(this);
        });
        
        genreNav.appendChild(link);
    });
}

// دالة للتعامل مع النقر على التصنيف
function handleGenreClick(clickedLink) {
    const allLinks = document.querySelectorAll('#genre-nav a');
    
    // إزالة النشط من جميع الروابط
    allLinks.forEach(link => link.classList.remove('active'));
    
    // إضافة النشط للرابط المختار
    clickedLink.classList.add('active');
    
    // الحصول على بيانات التصنيف
    const genreId = clickedLink.getAttribute('data-genre');
    const genreName = clickedLink.textContent.trim();
    
    console.log(`تم اختيار التصنيف: ${genreName} (ID: ${genreId})`);
    
    // هنا يمكنك إضافة كود لتحميل الأفلام حسب التصنيف
    // مثلاً: loadMoviesByGenre(genreId);
}

// دالة لتبديل حالة القائمة المنسدلة على الجوال
function toggleMobileNav() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    
    if (!genreNav || !dropdownToggle) return;
    
    const isOpen = genreNav.classList.contains('open');
    
    if (isOpen) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}

// دالة لفتح القائمة المنسدلة
function openMobileNav() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    
    genreNav?.classList.add('open');
    dropdownToggle?.classList.add('active');
    navBackdrop?.classList.add('active');
    
    // منع التمرير عند فتح القائمة
    document.body.style.overflow = 'hidden';
}

// دالة لإغلاق القائمة المنسدلة
function closeMobileNav() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    
    genreNav?.classList.remove('open');
    dropdownToggle?.classList.remove('active');
    navBackdrop?.classList.remove('active');
    
    // إعادة التمرير
    document.body.style.overflow = '';
}

// دالة لجعل الهيدر يتفاعل مع التمرير
function setupHeaderScroll() {
    const siteHeader = document.getElementById('site-header');
    
    if (!siteHeader) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    });
}

// دالة للحصول على التصنيف النشط حالياً
function getActiveGenre() {
    const activeLink = document.querySelector('#genre-nav a.active');
    if (activeLink) {
        return {
            id: activeLink.getAttribute('data-genre'),
            name: activeLink.textContent.trim()
        };
    }
    return { id: "", name: "الكل" };
}

// دالة لتعيين تصنيف معين كنشط
function setActiveGenre(genreId) {
    const genreLinks = document.querySelectorAll('#genre-nav a');
    genreLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-genre') === genreId.toString()) {
            link.classList.add('active');
        }
    });
}

// جعل الدوال متاحة عالمياً لاستخدامها من ملفات أخرى
window.TomitoHeader = {
    getActiveGenre,
    setActiveGenre,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav
};