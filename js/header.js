// ========================================
// TOMITO NAVIGATION - DROPDOWN FIXED
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    setupSearch();
    setupDropdowns();
    setupMobileMenu();
    setupScrollEffect();
});

// ========================================
// DROPDOWNS SETUP - FIXED FOR DESKTOP
// ========================================
function setupDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown");
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        const menu = dropdown.querySelector(".dropdown-menu");
        
        if (!toggle || !menu) return;
        
        let hideTimeout;
        
        // ========================================
        // DESKTOP: Hover with delay
        // ========================================
        if (window.innerWidth > 768) {
            
            // عند hover على الـ dropdown كامل
            dropdown.addEventListener("mouseenter", () => {
                clearTimeout(hideTimeout);
                
                // إغلاق الـ dropdowns الأخرى
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
                
                // فتح الـ dropdown الحالي
                toggle.classList.add("active");
                menu.style.display = "block";
                
                // تأخير بسيط للأنيميشن
                setTimeout(() => {
                    menu.style.opacity = "1";
                    menu.style.visibility = "visible";
                }, 10);
            });
            
            // عند مغادرة الـ dropdown
            dropdown.addEventListener("mouseleave", () => {
                hideTimeout = setTimeout(() => {
                    toggle.classList.remove("active");
                    menu.style.opacity = "0";
                    menu.style.visibility = "hidden";
                    
                    setTimeout(() => {
                        if (menu.style.opacity === "0") {
                            menu.style.display = "none";
                        }
                    }, 300);
                }, 150); // تأخير 150ms قبل الإخفاء
            });
            
            // منع الإخفاء عند التحرك داخل القائمة
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
                    }, 300);
                }, 150);
            });
        }
        
        // ========================================
        // MOBILE & DESKTOP: Click
        // ========================================
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = toggle.classList.contains("active");
            
            // إغلاق باقي الـ Dropdowns
            document.querySelectorAll(".dropdown").forEach(other => {
                if (other !== dropdown) {
                    const otherToggle = other.querySelector(".dropdown-toggle");
                    const otherMenu = other.querySelector(".dropdown-menu");
                    if (otherToggle && otherMenu) {
                        otherToggle.classList.remove("active");
                        other.classList.remove("active");
                        otherMenu.style.display = "none";
                        otherMenu.style.opacity = "0";
                        otherMenu.style.visibility = "hidden";
                    }
                }
            });
            
            // Toggle الحالي
            if (isActive) {
                toggle.classList.remove("active");
                dropdown.classList.remove("active");
                menu.style.opacity = "0";
                menu.style.visibility = "hidden";
                setTimeout(() => {
                    menu.style.display = "none";
                }, 300);
            } else {
                toggle.classList.add("active");
                dropdown.classList.add("active");
                menu.style.display = "block";
                setTimeout(() => {
                    menu.style.opacity = "1";
                    menu.style.visibility = "visible";
                }, 10);
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
                
                console.log(`Selected: ${item.textContent} (${category})`);
                
                // إغلاق القائمة
                toggle.classList.remove("active");
                dropdown.classList.remove("active");
                menu.style.opacity = "0";
                menu.style.visibility = "hidden";
                setTimeout(() => {
                    menu.style.display = "none";
                }, 300);
                
                // إغلاق المينيو في الموبايل
                if (window.innerWidth <= 768) {
                    const navMenu = document.querySelector(".nav-menu");
                    const hamburger = document.querySelector(".hamburger-menu");
                    
                    navMenu?.classList.remove("active");
                    hamburger?.classList.remove("active");
                    document.body.classList.remove("menu-open");
                }
                
                // التوجيه للصفحة
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
                    menu.style.opacity = "0";
                    menu.style.visibility = "hidden";
                    setTimeout(() => {
                        menu.style.display = "none";
                    }, 300);
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
// MOBILE MENU SETUP
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
    
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    function toggleMobileMenu() {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
        body.classList.toggle("menu-open");
        
        console.log("Menu toggled:", navMenu.classList.contains("active"));
    }
    
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                if (navMenu.classList.contains("active")) {
                    navMenu.classList.remove("active");
                    hamburger.classList.remove("active");
                    body.classList.remove("menu-open");
                    
                    document.querySelectorAll(".dropdown").forEach(dropdown => {
                        const toggle = dropdown.querySelector(".dropdown-toggle");
                        const menu = dropdown.querySelector(".dropdown-menu");
                        if (toggle && menu) {
                            dropdown.classList.remove("active");
                            toggle.classList.remove("active");
                            menu.style.display = "none";
                        }
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
// SEARCH FUNCTIONALITY
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

    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            searchResults.classList.remove("active");
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
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
// NAVBAR SCROLL EFFECT
// ========================================
function setupScrollEffect() {
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
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
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out forwards";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

console.log("🚀 Tomito Navigation - Dropdown Fixed!");