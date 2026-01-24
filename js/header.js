// ========================================
// SEARCH FUNCTIONALITY - HTML/CSS BASED
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    setupSearch();
    setupDropdowns();
    setupMobileMenu();
});

function setupSearch() {
    const searchInput = document.getElementById("search");
    const searchBtn = document.querySelector(".search-btn");
    const searchResults = document.getElementById("searchResults");
    let searchTimeout;

    // البحث أثناء الكتابة
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

    // البحث عند الضغط على Enter
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                performSearch(query);
            }
        }
    });

    // البحث عند الضغط على زر البحث
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                performSearch(query);
            }
        });
    }

    // إغلاق نتائج البحث عند النقر خارجها
    document.addEventListener("click", (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) {
            searchResults.classList.remove("active");
        }
    });
}

async function performSearch(query) {
    const searchResults = document.getElementById("searchResults");
    const searchInput = document.getElementById("search");
    
    if (!query || query.length < 2) {
        searchResults.classList.remove("active");
        return;
    }

    try {
        // إظهار حالة التحميل
        searchResults.innerHTML = `
            <div class="result-item">
                <div class="result-poster">
                    <div class="loading-poster" style="width:60px;height:90px;background:#2a2a3a;border-radius:8px;"></div>
                </div>
                <div class="result-info">
                    <div class="loading-title" style="width:200px;height:20px;background:#2a2a3a;border-radius:4px;margin-bottom:10px;"></div>
                    <div class="loading-details" style="width:150px;height:15px;background:#2a2a3a;border-radius:4px;"></div>
                </div>
            </div>
        `;
        searchResults.classList.add("active");

        // البحث في TMDB API
        const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
        const BASE_URL = "https://api.themoviedb.org/3";
        const encodedQuery = encodeURIComponent(query);
        
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=ar&query=${encodedQuery}&page=1`;
        
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

        // عرض النتائج
        searchResults.innerHTML = results.slice(0, 5).map(item => {
            const isMovie = item.media_type === "movie";
            const title = isMovie ? item.title : item.name;
            const year = isMovie ? 
                (item.release_date ? new Date(item.release_date).getFullYear() : "غير معروف") : 
                (item.first_air_date ? new Date(item.first_air_date).getFullYear() : "غير معروف");
            
            const poster = item.poster_path ? 
                `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=92&q=80";
            
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
        
        // إضافة زر "عرض الكل"
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
// DROPDOWNS FUNCTIONALITY
// ========================================
function setupDropdowns() {
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    
    dropdownToggles.forEach(toggle => {
        // For desktop hover
        toggle.addEventListener("mouseenter", () => {
            if (window.innerWidth > 768) {
                toggle.classList.add("active");
            }
        });
        
        // For desktop mouse leave
        toggle.parentElement.addEventListener("mouseleave", () => {
            if (window.innerWidth > 768) {
                toggle.classList.remove("active");
            }
        });
        
        // For mobile click
        toggle.addEventListener("click", (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdownToggles.forEach(other => {
                    if (other !== toggle && other.parentElement.classList.contains("active")) {
                        other.parentElement.classList.remove("active");
                        other.classList.remove("active");
                    }
                });
                
                // Toggle current dropdown
                toggle.parentElement.classList.toggle("active");
                toggle.classList.toggle("active");
            }
        });
    });
    
    // Handle dropdown item clicks
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const category = item.dataset.category || 
                            item.dataset.subcategory || 
                            item.dataset.year || 
                            item.dataset.seriesType || 
                            item.dataset.seriesCategory || 
                            item.dataset.seriesView;
            
            // You can add your filtering logic here
            console.log(`Selected: ${item.textContent} (${category})`);
            
            // Close all dropdowns on mobile
            if (window.innerWidth <= 768) {
                dropdownToggles.forEach(toggle => {
                    toggle.parentElement.classList.remove("active");
                    toggle.classList.remove("active");
                });
            }
            
            // Redirect to filtered page or update content
            filterContent(category, item.textContent);
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown") && window.innerWidth > 768) {
            dropdownToggles.forEach(toggle => {
                toggle.classList.remove("active");
                toggle.parentElement.classList.remove("active");
            });
        }
    });
}
function filterContent(filter, filterName) {
    if (!filter) return;

    // نوع الصفحة (أفلام أو مسلسلات)
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

    // تحويل تلقائي لصفحة التصنيف
    window.location.href = `category.html?type=${type}&filter=${filter}&name=${encodeURIComponent(filterName)}`;
}

// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================
function setupMobileMenu() {
    const hamburger = document.querySelector(".hamburger-menu");
    const navMenu = document.querySelector(".nav-menu");
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
        
        // Animate hamburger to X
        const bars = hamburger.querySelectorAll(".bar");
        if (hamburger.classList.contains("active")) {
            bars[0].style.transform = "rotate(45deg) translate(5px, 5px)";
            bars[1].style.opacity = "0";
            bars[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
        } else {
            bars[0].style.transform = "none";
            bars[1].style.opacity = "1";
            bars[2].style.transform = "none";
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && window.innerWidth <= 768) {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
            
            const bars = hamburger.querySelectorAll(".bar");
            bars[0].style.transform = "none";
            bars[1].style.opacity = "1";
            bars[2].style.transform = "none";
            
            // Close all dropdowns
            document.querySelectorAll(".dropdown").forEach(dropdown => {
                dropdown.classList.remove("active");
            });
            document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
                toggle.classList.remove("active");
            });
        }
    });
    
    // Close mobile menu on resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
            
            const bars = hamburger.querySelectorAll(".bar");
            bars[0].style.transform = "none";
            bars[1].style.opacity = "1";
            bars[2].style.transform = "none";
        }
    });
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
// HELPER FUNCTIONS
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
        animation: slideInLeft 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideOutLeft 0.3s ease-out forwards";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize everything
setupScrollEffect();