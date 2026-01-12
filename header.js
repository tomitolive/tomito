// ========================================
// IMPROVED SCROLL HIDE FUNCTIONALITY FOR MOBILE
// ========================================
let lastScrollTop = 0;

document.addEventListener("DOMContentLoaded", () => {
    setupScrollHide();
});

function setupScrollHide() {
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScrollHide(lastScrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, false);
}

function handleScrollHide(scrollTop) {
    const navbar = document.getElementById('navbar');
    const colorFilters = document.getElementById('colorFilters');
    const isMobile = window.innerWidth <= 768;
    
    // حساب المسافة من الأعلى
    const scrollDelta = scrollTop - lastScrollTop;
    
    if (scrollTop > 100) {
        if (scrollDelta > 5) {
            // التمرير لأسفل - إخفاء الهيدر
            navbar.classList.add('hidden');
            if (isMobile) {
                navbar.classList.add('compact');
            }
        } else if (scrollDelta < -5) {
            // التمرير لأعلى - إظهار الهيدر
            navbar.classList.remove('hidden');
            if (scrollTop < 200) {
                navbar.classList.remove('compact');
            }
        }
        
        // إضافة تأثير shifted لقسم الفلاتر
        colorFilters.classList.add('shifted');
    } else {
        // إعادة كل شيء إلى وضعه الطبيعي
        navbar.classList.remove('hidden');
        navbar.classList.remove('compact');
        colorFilters.classList.remove('shifted');
    }
        
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}