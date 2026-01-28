// ========================================
// TOMITO NAVIGATION - MOBILE OPTIMIZED
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    setupSearch();
    setupDropdowns();
    setupMobileMenu();
    setupScrollEffect();
});

// ========================================
// MOBILE MENU SETUP - OPTIMIZED
// ========================================
function setupMobileMenu() {
    const hamburger = document.querySelector(".hamburger-menu");
    const navMenu = document.querySelector(".nav-menu");
    const body = document.body;
    
    if (!hamburger || !navMenu) {
        console.error("❌ Hamburger or Nav Menu not found!");
        return;
    }
    
    console.log("✅ Mobile menu initialized");
    
    // تحسين الأداء: إزالة الأنيميشن على الموبايل
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        navMenu.style.transition = "right 0.2s ease"; // أنيميشن أسرع
    }
    
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    function toggleMobileMenu() {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
        body.classList.toggle("menu-open");
    }
    
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                if (navMenu.classList.contains("active")) {
                    navMenu.classList.remove("active");
                    hamburger.classList.remove("active");
                    body.classList.remove("menu-open");
                    
                    document.querySelectorAll(".dropdown").forEach(dropdown => {
                        dropdown.classList.remove("active");
                        dropdown.querySelector(".dropdown-toggle")?.classList.remove("active");
                    });
                }
            }
        }
    });
    
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
            body.classList.remove("menu-open");
        }
    });
    
    const directLinks = document.querySelectorAll(".nav-link:not(.dropdown-toggle)");
    directLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove("active");
                hamburger.classList.remove("active");
                body.classList.remove("menu-open");
            }
        });
    });
}

// ========================================
// DROPDOWNS SETUP - OPTIMIZED
// ========================================
function setupDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown");
    const isMobile = window.innerWidth <= 768;
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        const menu = dropdown.querySelector(".dropdown-menu");
        
        if (!toggle || !menu) return;
        
        // تحسين الأداء: تقليل الأنيميشن على الموبايل
        if (isMobile) {
            menu.style.transition = "all 0.2s ease";
        }
        
        let hideTimeout;
        
        // ========================================
        // DESKTOP: Hover
        // ========================================
        if (!isMobile) {
            dropdown.addEventListener("mouseenter", () => {
                clearTimeout(hideTimeout);
                
                document.querySelectorAll(".dropdown").forEach(other => {
                    if (other !== dropdown) {
                        const otherToggle = other.querySelector(".dropdown-toggle");
                        const otherMenu = other.querySelector(".dropdown-menu");
                        if (otherToggle && otherMenu) {
                            otherToggle.classList.remove("active");
                            otherMenu.style.display = "none";
                            otherMenu.style.opacity = "0";
                            otherMenu.style.visibility = "hidden";
                        }
                    }
                });
                
                toggle.classList.add("active");
                menu.style.display = "block";
                
                requestAnimationFrame(() => {
                    menu.style.opacity = "1";
                    menu.style.visibility = "visible";
                });
            });
            
            dropdown.addEventListener("mouseleave", () => {
                hideTimeout = setTimeout(() => {
                    toggle.classList.remove("active");
                    menu.style.opacity = "0";
                    menu.style.visibility = "hidden";
                    
                    setTimeout(() => {
                        if (menu.style.opacity === "0") {
                            menu.style.display = "none";
                        }
                    }, 200);
                }, 150);
            });
            
            menu.addEventListener("mouseenter", () => {
                clearTimeout(hideTimeout);
            });
            
            menu.addEventListener("mouseleave", () => {
                hideTimeout = setTimeout(() => {
                    toggle.classList.remove("active");
                    menu.style.opacity = "0";
                    menu.style.visibility = "hidden";
                    
                    setTimeout(() => {
                        if (menu.style.opacity === "0") {
                            menu.style.display = "none";
                        }
                    }, 200);
                }, 150);
            });
        }
        
        // ========================================
        // MOBILE: Click (بدون أنيميشن معقدة)
        // ========================================
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = toggle.classList.contains("active");
            
            // إغلاق باقي الـ Dropdowns بسرعة
            document.querySelectorAll(".dropdown").forEach(other => {
                if (other !== dropdown) {
                    const otherToggle = other.querySelector(".dropdown-toggle");
                    const otherMenu = other.querySelector(".dropdown-menu");
                    if (otherToggle && otherMenu) {
                        otherToggle.classList.remove("active");
                        other.classList.remove("active");
                        
                        if (isMobile) {
                            // موبايل: إغلاق فوري
                            otherMenu.style.display = "none";
                        } else {
                            // ديسكتوب: مع أنيميشن
                            otherMenu.style.opacity = "0";
                            otherMenu.style.visibility = "hidden";
                            setTimeout(() => {
                                otherMenu.style.display = "none";
                            }, 200);
                        }
                    }
                }
            });
            
            // Toggle الحالي
            if (isActive) {
                toggle.classList.remove("active");
                dropdown.classList.remove("active");
                
                if (isMobile) {
                    menu.style.display = "none";
                } else {
                    menu.style.opacity = "0";
                    menu.style.visibility = "hidden";
                    setTimeout(() => {
                        menu.style.display = "none";
                    }, 200);
                }
            } else {
                toggle.classList.add("active");
                dropdown.classList.add("active");
                menu.style.display = "block";
                
                if (!isMobile) {
                    requestAnimationFrame(() => {
                        menu.style.opacity = "1";
                        menu.style.visibility = "visible";
                    });
                }
            }
        });
        
        // معالجة النقر على عناصر القائمة
        const dropdownItems = dropdown.querySelectorAll(".dropdown-item");
        dropdownItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                
                const category = item.dataset.category || 
                                item.dataset.subcategory || 
                                item.dataset.year || 
                                item.dataset.seriesType || 
                                item.dataset.seriesCategory;
                
                // إغلاق فوري بدون أنيميشن
                toggle.classList.remove("active");
                dropdown.classList.remove("active");
                menu.style.display = "none";
                menu.style.opacity = "0";
                menu.style.visibility = "hidden";
                
                if (window.innerWidth <= 768) {
                    const navMenu = document.querySelector(".nav-menu");
                    const hamburger = document.querySelector(".hamburger-menu");
                    
                    navMenu?.classList.remove("active");
                    hamburger?.classList.remove("active");
                    document.body.classList.remove("menu-open");
                }
                
                filterContent(category, item.textContent);
            });
        });
    });
    
    // إغلاق الـ Dropdowns عند النقر خارجها
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown").forEach(dropdown => {
                const toggle = dropdown.querySelector(".dropdown-toggle");
                const menu = dropdown.querySelector(".dropdown-menu");
                if (toggle && menu) {
                    toggle.classList.remove("active");
                    dropdown.classList.remove("active");
                    menu.style.display = "none";
                    menu.style.opacity = "0";
                    menu.style.visibility = "hidden";
                }
            });
        }
    });
}

function filterContent(filter, filterName) {
    if (!filter) return;

    let type = "movie";

    if (
        filter.includes("arabic") ||
        filter.includes("turkish") ||
        filter.includes("american") ||
        filter.includes("korean") ||
        filter.includes("anime")
    ) {
        type = "tv";
    }

    window.location.href = `category.html?type=${type}&filter=${filter}&name=${encodeURIComponent(filterName)}`;
}

// ========================================
// SEARCH FUNCTIONALITY - OPTIMIZED
// ========================================
function setupSearch() {
    const searchInput = document.getElementById("search");
    const searchBtn = document.querySelector(".search-btn");
    const searchResults = document.getElementById("searchResults");
    let searchTimeout;

    if (!searchInput || !searchResults) {
        console.error("❌ Search elements not found!");
        return;
    }

    // تحسين: تأخير أطول على الموبايل لتقليل الطلبات
    const debounceTime = window.innerWidth <= 768 ? 500 : 300;

    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            searchResults.classList.remove("active");
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, debounceTime);
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                performSearch(query);
            }
        }
    });

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                performSearch(query);
            }
        });
    }

    document.addEventListener("click", (e) => {
        if (!searchResults.contains(e.target) && 
            e.target !== searchInput && 
            e.target !== searchBtn) {
            searchResults.classList.remove("active");
        }
    });
}

async function performSearch(query) {
    const searchResults = document.getElementById("searchResults");
    
    if (!query || query.length < 2) {
        searchResults.classList.remove("active");
        return;
    }

    try {
        // Loading مبسط للموبايل
        searchResults.innerHTML = `
            <div class="result-item">
                <div class="result-poster">
                    <div style="width:60px;height:90px;background:#2a2a3a;border-radius:8px;"></div>
                </div>
                <div class="result-info">
                    <div style="width:200px;height:20px;background:#2a2a3a;border-radius:4px;margin-bottom:10px;"></div>
                    <div style="width:150px;height:15px;background:#2a2a3a;border-radius:4px;"></div>
                </div>
            </div>
        `;
        searchResults.classList.add("active");

        const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
        const BASE_URL = "https://api.themoviedb.org/3";
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=ar&query=${encodeURIComponent(query)}&page=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        const results = data.results || [];
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>لم يتم العثور على نتائج</h3>
                    <p>حاول استخدام كلمات أخرى</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.slice(0, 5).map(item => {
            const isMovie = item.media_type === "movie";
            const title = isMovie ? item.title : item.name;
            const year = isMovie ? 
                (item.release_date ? new Date(item.release_date).getFullYear() : "غير معروف") : 
                (item.first_air_date ? new Date(item.first_air_date).getFullYear() : "غير معروف");
            
            const poster = item.poster_path ? 
                `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=92&q=80";
            
            const overview = item.overview ? 
                item.overview.substring(0, 60) + "..." : 
                "لا يوجد وصف متاح";
            
            const rating = item.vote_average ? 
                item.vote_average.toFixed(1) : "N/A";
            
            return `
                <a href="watch.html?id=${item.id}&type=${isMovie ? 'movie' : 'tv'}" class="result-item">
                    <div class="result-poster">
                        <img src="${poster}" alt="${title}" loading="lazy">
                    </div>
                    <div class="result-info">
                        <h3 class="result-title">${title}</h3>
                        <div class="result-details">
                            <span class="result-rating">
                                <i class="fas fa-star"></i> ${rating}
                            </span>
                            <span class="result-year">${year}</span>
                            <span class="result-type">${isMovie ? 'فيلم' : 'مسلسل'}</span>
                        </div>
                        <p class="result-overview">${overview}</p>
                    </div>
                </a>
            `;
        }).join('');
        
        if (results.length > 5) {
            searchResults.innerHTML += `
                <a href="search.html?q=${encodeURIComponent(query)}" class="result-item view-all">
                    <div class="result-info">
                        <h3 class="result-title">عرض جميع النتائج (${results.length})</h3>
                        <p class="result-overview">اضغط هنا لمشاهدة المزيد</p>
                    </div>
                    <i class="fas fa-arrow-left"></i>
                </a>
            `;
        }
        
    } catch (error) {
        console.error("❌ Search error:", error);
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>خطأ في البحث</h3>
                <p>حاول مرة أخرى لاحقاً</p>
            </div>
        `;
    }
}

// ========================================
// NAVBAR SCROLL EFFECT - OPTIMIZED
// ========================================
function setupScrollEffect() {
    let ticking = false;
    
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const navbar = document.querySelector(".navbar");
                if (window.scrollY > 50) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ========================================
// NOTIFICATION HELPER
// ========================================
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 20px;
        background: linear-gradient(45deg, #f07d37, #cf0a0a);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

console.log("🚀 Tomito Navigation - Mobile Optimized!");