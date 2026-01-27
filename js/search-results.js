// ================================
// TMDB CONFIG & GLOBAL VARIABLES
// ================================
const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

let currentQuery = "";
let currentType = "all";
let currentSort = "popularity";
let page = 1;
let totalPages = 1;
let isLoading = false;
let resultsData = [];

// ================================
// DOM CONTENT LOADED
// ================================
document.addEventListener("DOMContentLoaded", () => {
    // Load query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    const type = urlParams.get("type");
    const sort = urlParams.get("sort");
    
    if (q) {
        document.getElementById("searchQueryInput").value = q;
        currentQuery = q;
        
        if (type) {
            currentType = type;
            document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
            document.querySelector(`[data-type="${type}"]`).classList.add("active");
        }
        
        if (sort) {
            currentSort = sort;
            document.getElementById("sortSelect").value = sort;
        }
        
        performSearch();
    }
    
    // Add event listeners
    document.getElementById("searchQueryInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") performSearch();
    });
    
    // Set focus on search input
    setTimeout(() => {
        document.getElementById("searchQueryInput").focus();
    }, 300);
});

// ================================
// PERFORM SEARCH
// ================================
async function performSearch(q = null) {
    currentQuery = q || document.getElementById("searchQueryInput").value.trim();
    if (!currentQuery) {
        showEmptyState();
        return;
    }
    
    // Update URL
    updateURL();
    
    // Reset state
    page = 1;
    resultsData = [];
    isLoading = true;
    
    // Show loading and hide empty state
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("resultsContainer").innerHTML = "";
    document.getElementById("loadMoreContainer").style.display = "none";
    
    // Update title
    document.getElementById("searchTitle").innerText = `نتائج البحث: "${currentQuery}"`;
    
    try {
        const res = await fetch(
            `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${page}&language=ar&region=SA`
        );
        
        if (!res.ok) throw new Error("فشل في جلب البيانات");
        
        const data = await res.json();
        
        // Filter results to only include movies and TV shows
        resultsData = data.results.filter(
            r => r.media_type === "movie" || r.media_type === "tv"
        );
        
        totalPages = data.total_pages;
        
        // Update UI
        updateStats();
        renderResults();
        
        // Show/hide load more button
        if (page < totalPages && resultsData.length > 0) {
            document.getElementById("loadMoreContainer").style.display = "block";
        }
        
        // Scroll to results
        setTimeout(() => {
            document.querySelector(".results-info").scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
    } catch (error) {
        console.error("Search error:", error);
        showError("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
    } finally {
        isLoading = false;
        document.getElementById("loadingSpinner").style.display = "none";
        
        if (resultsData.length === 0) {
            showNoResults();
        }
    }
}

// ================================
// LOAD MORE RESULTS
// ================================
async function loadMore() {
    if (isLoading || page >= totalPages) return;
    
    isLoading = true;
    page++;
    
    const loadMoreBtn = document.querySelector(".load-more-btn");
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    loadMoreBtn.disabled = true;
    
    try {
        const res = await fetch(
            `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${page}&language=ar&region=SA`
        );
        
        const data = await res.json();
        
        const newResults = data.results.filter(
            r => r.media_type === "movie" || r.media_type === "tv"
        );
        
        resultsData = [...resultsData, ...newResults];
        
        // Sort results if needed
        if (currentSort !== "popularity") {
            sortResults(currentSort, false);
        }
        
        // Update UI
        updateStats();
        renderResults();
        
        // Hide load more button if no more pages
        if (page >= totalPages) {
            document.getElementById("loadMoreContainer").style.display = "none";
        }
        
    } catch (error) {
        console.error("Load more error:", error);
        page--; // Revert page on error
    } finally {
        isLoading = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> تحميل المزيد';
        loadMoreBtn.disabled = false;
    }
}

// ================================
// RENDER RESULTS
// ================================
function renderResults() {
    const container = document.getElementById("resultsContainer");
    
    // Clear only if it's first page
    if (page === 1) {
        container.innerHTML = "";
    }
    
    // Filter by type
    let filtered = resultsData.filter(item => {
        if (currentType === "all") return true;
        if (currentType === "movies") return item.media_type === "movie";
        if (currentType === "series") return item.media_type === "tv";
    });
    
    // Sort results
    filtered = sortResultsArray(filtered, currentSort);
    
    // Create cards
    filtered.forEach(item => {
        const card = createResultCard(item);
        container.appendChild(card);
    });
    
    // Add animation delay to each card
    const cards = container.querySelectorAll('.movie-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${(index % 10) * 0.05}s`;
    });
}

// ================================
// CREATE RESULT CARD
// ================================
function createResultCard(item) {
    const title = item.title || item.name;
    const poster = item.poster_path
        ? `${IMG_URL}${item.poster_path}`
        : "https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image";
    
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? releaseDate.substring(0, 4) : "غير معروف";
    
    const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    const mediaType = item.media_type === "movie" ? "فيلم" : "مسلسل";
    const typeClass = item.media_type === "movie" ? "movie" : "tv";
    
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.id = item.id;
    card.dataset.type = item.media_type;
    card.onclick = () => goToWatch(item.id, item.media_type);
    
    card.innerHTML = `
        <div class="poster-container">
            <img src="${poster}" alt="${title}" loading="lazy">
            <div class="poster-overlay">
                <button class="play-btn">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        </div>
        <div class="card-content">
            <div class="card-header">
                <h3 class="card-title" title="${title}">${title}</h3>
            </div>
            <div class="card-info">
                <span class="media-badge ${typeClass}">
                    ${mediaType} • ${year}
                </span>
                <span class="card-rating">
                    <i class="fas fa-star rating-star"></i>
                    ${rating}
                </span>
            </div>
        </div>
    `;
    
    return card;
}

// ================================
// FILTER RESULTS BY TYPE
// ================================
function filterResults(type) {
    currentType = type;
    
    // Update active tab
    document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
    document.querySelector(`[data-type="${type}"]`).classList.add("active");
    
    // Update URL
    updateURL();
    
    // Re-render results
    renderResults();
}

// ================================
// SORT RESULTS
// ================================
function sortResults(sortType, updateRender = true) {
    currentSort = sortType;
    
    // Update URL
    updateURL();
    
    if (updateRender) {
        renderResults();
    }
}

function sortResultsArray(array, sortType) {
    const arr = [...array];
    
    switch (sortType) {
        case "rating":
            return arr.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        
        case "date":
            return arr.sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || 0);
                const dateB = new Date(b.release_date || b.first_air_date || 0);
                return dateB - dateA;
            });
        
        case "title":
            return arr.sort((a, b) => {
                const titleA = (a.title || a.name || "").toLowerCase();
                const titleB = (b.title || b.name || "").toLowerCase();
                return titleA.localeCompare(titleB, 'ar');
            });
        
        default: // popularity
            return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
}

// ================================
// UPDATE STATISTICS
// ================================
function updateStats() {
    const movies = resultsData.filter(r => r.media_type === "movie").length;
    const series = resultsData.filter(r => r.media_type === "tv").length;
    const total = resultsData.length;
    
    // Animate numbers
    animateCounter("totalResults", total);
    animateCounter("moviesResults", movies);
    animateCounter("seriesResults", series);
}

function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    const increment = finalValue > currentValue ? 1 : -1;
    
    let current = currentValue;
    const stepTime = Math.abs(Math.floor(50 / (finalValue - currentValue)));
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === finalValue) {
            clearInterval(timer);
        }
    }, stepTime);
}

// ================================
// GO TO WATCH PAGE
// ================================
function goToWatch(id, type) {
    // Add click animation
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
            card.style.transform = "";
        }, 200);
    }
    
    // Navigate after animation
    setTimeout(() => {
        if (type === "movie") {
            window.location.href = `watch.html?id=${id}`;
        } else if (type === "tv") {
            window.location.href = `watch-tv.html?id=${id}`;
        }
    }, 300);
}

// ================================
// UPDATE URL PARAMETERS
// ================================
function updateURL() {
    const params = new URLSearchParams();
    params.set("q", currentQuery);
    if (currentType !== "all") params.set("type", currentType);
    if (currentSort !== "popularity") params.set("sort", currentSort);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
}

// ================================
// UI STATES
// ================================
function showEmptyState() {
    const container = document.getElementById("resultsContainer");
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search fa-3x"></i>
            <h2>ابدأ البحث الآن</h2>
            <p>اكتب اسم فيلم أو مسلسل في خانة البحث أعلاه</p>
        </div>
    `;
    
    document.getElementById("searchTitle").innerText = "ابحث عن أفلامك المفضلة";
    resetStats();
    document.getElementById("loadMoreContainer").style.display = "none";
}

function showNoResults() {
    const container = document.getElementById("resultsContainer");
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search fa-3x"></i>
            <h2>لم يتم العثور على نتائج</h2>
            <p>لم نتمكن من العثور على أي نتائج لـ "${currentQuery}"</p>
            <p class="suggestions">جرب استخدام كلمات مختلفة أو تحقق من الإملاء</p>
        </div>
    `;
    
    document.getElementById("loadMoreContainer").style.display = "none";
}

function showError(message) {
    const container = document.getElementById("resultsContainer");
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle fa-3x"></i>
            <h2>حدث خطأ</h2>
            <p>${message}</p>
            <button class="load-more-btn" onclick="performSearch()" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> حاول مرة أخرى
            </button>
        </div>
    `;
}

function resetStats() {
    document.getElementById("totalResults").textContent = "0";
    document.getElementById("moviesResults").textContent = "0";
    document.getElementById("seriesResults").textContent = "0";
}

// ================================
// INFINITE SCROLL (Optional)
// ================================
window.addEventListener("scroll", () => {
    if (isLoading) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    const loadMoreContainer = document.getElementById("loadMoreContainer");
    
    if (scrollPosition >= pageHeight - 500 && 
        loadMoreContainer.style.display !== "none" &&
        page < totalPages) {
        loadMore();
    }
});

// ================================
// HANDLE BROWSER BACK/FORWARD
// ================================
window.addEventListener("popstate", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    
    if (q) {
        document.getElementById("searchQueryInput").value = q;
        currentQuery = q;
        performSearch();
    }
});