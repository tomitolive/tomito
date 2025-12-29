// ========================================
// TOMITO HEADER SYSTEM
// ========================================

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
    { id: "53", name: "إثارة", icon: "fas fa-user-secret" },
    { id: "80", name: "جريمة", icon: "fas fa-user-secret" },
    { id: "99", name: "وثائقي", icon: "fas fa-camera" },
    { id: "36", name: "تاريخ", icon: "fas fa-landmark" },
    { id: "10402", name: "موسيقى", icon: "fas fa-music" },
    { id: "14", name: "خيال", icon: "fas fa-hat-wizard" },
    { id: "10751", name: "عائلي", icon: "fas fa-home" },
    { id: "10752", name: "حربي", icon: "fas fa-fighter-jet" },
    { id: "37", name: "غربي", icon: "fas fa-hat-cowboy" }
];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    setupHeaderScroll();
    loadGenreDropdown();
    setupGenreStrip();
});

// ========================================
// HEADER INITIALIZATION
// ========================================

function initHeader() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    
    // Handle mobile menu toggle
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileNav();
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownToggle?.contains(e.target) && !genreNav?.contains(e.target)) {
            closeMobileNav();
        }
    });
    
    // Close menu when clicking a link
    if (genreNav) {
        genreNav.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && window.innerWidth <= 992) {
                setTimeout(closeMobileNav, 300);
            }
        });
    }
    
    // Close menu on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            closeMobileNav();
        }
    });
    
    // Close menu on scroll (mobile)
    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 992 && genreNav?.classList.contains('open')) {
            closeMobileNav();
        }
    });
}

// ========================================
// GENRE STRIP (أزرار أكشن، كوميديا، دراما)
// ========================================

function setupGenreStrip() {
    const genreButtons = document.querySelectorAll('.genre-btn');
    const moreGenresBtn = document.getElementById('moreGenresBtn');
    
    // Setup each genre button
    genreButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const genreId = this.getAttribute('data-genre');
            const genreName = this.textContent.trim();
            
            // Remove active from all buttons
            genreButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');
            
            console.log(`🎬 اختيار من الشريط: ${genreName} (${genreId})`);
            
            // Load movies
            if (typeof loadMoviesByGenre === 'function') {
                loadMoviesByGenre(genreId);
            }
            
            // Update dropdown
            setActiveGenre(genreId);
        });
    });
    
    // More genres button
    if (moreGenresBtn) {
        moreGenresBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAllGenresModal();
        });
    }
}

// ========================================
// GENRE DROPDOWN
// ========================================

function loadGenreDropdown() {
    const dropdownContent = document.getElementById('genreDropdownContent');
    const dropdownBtn = document.getElementById('genreDropdownBtn');
    
    if (!dropdownContent || !dropdownBtn) return;
    
    dropdownContent.innerHTML = '';
    
    // Add main genres (first 9)
    const mainGenres = movieGenres.slice(0, 9);
    
    mainGenres.forEach(genre => {
        const option = document.createElement('button');
        option.className = 'genre-dropdown-option';
        option.setAttribute('data-genre', genre.id);
        option.innerHTML = `<i class="${genre.icon}"></i> ${genre.name}`;
        
        if (genre.id === "") {
            option.classList.add('active');
        }
        
        option.addEventListener('click', function(e) {
            e.preventDefault();
            handleGenreSelect(this);
        });
        
        dropdownContent.appendChild(option);
    });
    
    // Add divider
    const divider = document.createElement('div');
    divider.className = 'dropdown-divider';
    dropdownContent.appendChild(divider);
    
    // Add "All Genres" button
    const moreBtn = document.createElement('button');
    moreBtn.className = 'more-categories-btn';
    moreBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i> جميع التصنيفات';
    moreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showAllGenresModal();
    });
    dropdownContent.appendChild(moreBtn);
    
    // Toggle dropdown
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
        this.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });
}

function handleGenreSelect(selectedOption) {
    const genreId = selectedOption.getAttribute('data-genre');
    const genreName = selectedOption.textContent.trim();
    
    console.log(`🎬 اختيار من الـ dropdown: ${genreName} (${genreId})`);
    
    // Update all active states
    setActiveGenre(genreId);
    
    // Close dropdown
    document.getElementById('genreDropdownContent').classList.remove('show');
    document.getElementById('genreDropdownBtn').classList.remove('active');
    
    // Load movies
    if (typeof loadMoviesByGenre === 'function') {
        loadMoviesByGenre(genreId);
    }
}

// ========================================
// GENRES MODAL
// ========================================

function showAllGenresModal() {
    const modalHTML = `
        <div class="genres-modal" id="genresModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-layer-group"></i> جميع تصنيفات الأفلام</h3>
                    <button class="close-modal" onclick="closeGenresModal()">×</button>
                </div>
                <div class="modal-body" id="allGenresGrid"></div>
            </div>
            <div class="modal-backdrop" onclick="closeGenresModal()"></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const genresGrid = document.getElementById('allGenresGrid');
    genresGrid.innerHTML = '';
    
    // Add genre cards
    movieGenres.forEach(genre => {
        const genreCard = document.createElement('button');
        genreCard.className = 'genre-modal-card';
        genreCard.innerHTML = `
            <i class="${genre.icon}"></i>
            <span>${genre.name}</span>
        `;
        genreCard.onclick = () => {
            closeGenresModal();
            selectGenreFromModal(genre.id);
        };
        genresGrid.appendChild(genreCard);
    });
    
    // Add modal styles
    addModalStyles();
}

function closeGenresModal() {
    const modal = document.getElementById('genresModal');
    if (modal) modal.remove();
}

function selectGenreFromModal(genreId) {
    const genre = movieGenres.find(g => g.id === genreId);
    if (!genre) return;
    
    console.log(`🎬 اختيار من المودال: ${genre.name}`);
    
    // Update active states
    setActiveGenre(genreId);
    
    // Load movies
    if (typeof loadMoviesByGenre === 'function') {
        loadMoviesByGenre(genreId);
    }
}

function addModalStyles() {
    const existingStyle = document.getElementById('genres-modal-styles');
    if (existingStyle) return; // Avoid adding styles multiple times
    
    const style = document.createElement('style');
    style.id = 'genres-modal-styles';
    style.textContent = `
        .genres-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: modalFade 0.3s ease;
        }
        
        @keyframes modalFade {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            position: relative;
            background: #141414;
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
            max-height: 70vh;
            overflow: hidden;
            border: 2px solid #E50914;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            z-index: 2;
        }
        
        .modal-header {
            padding: 15px 20px;
            background: linear-gradient(90deg, #E50914 0%, #B81D24 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            margin: 0;
        }
        
        .close-modal {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 22px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .close-modal:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }
        
        .modal-body {
            padding: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 10px;
            max-height: 55vh;
            overflow-y: auto;
        }
        
        .genre-modal-card {
            background: #222;
            border: none;
            border-radius: 8px;
            padding: 15px 10px;
            color: #ccc;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            text-align: center;
            font-size: 13px;
        }
        
        .genre-modal-card:hover {
            background: #333;
            color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }
        
        .genre-modal-card i {
            font-size: 22px;
            color: #E50914;
        }
        
        .genre-modal-card span {
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// MOBILE NAV
// ========================================

function toggleMobileNav() {
    const genreNav = document.getElementById('genre-nav');
    if (!genreNav) return;
    
    if (genreNav.classList.contains('open')) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}

function openMobileNav() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    
    genreNav?.classList.add('open');
    dropdownToggle?.classList.add('active');
    navBackdrop?.classList.add('active');
    
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    const genreNav = document.getElementById('genre-nav');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const navBackdrop = document.getElementById('navBackdrop');
    
    genreNav?.classList.remove('open');
    dropdownToggle?.classList.remove('active');
    navBackdrop?.classList.remove('active');
    
    document.body.style.overflow = '';
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================

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

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getActiveGenre() {
    const activeOption = document.querySelector('.genre-dropdown-option.active');
    if (activeOption) {
        const genreId = activeOption.getAttribute('data-genre');
        const genre = movieGenres.find(g => g.id === genreId);
        return {
            id: genreId,
            name: genre ? genre.name : "الكل"
        };
    }
    return { id: "", name: "الكل" };
}

function setActiveGenre(genreId) {
    const stringId = genreId.toString();
    
    // Update dropdown options
    document.querySelectorAll('.genre-dropdown-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-genre') === stringId) {
            option.classList.add('active');
        }
    });
    
    // Update genre strip buttons
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-genre') === stringId) {
            btn.classList.add('active');
        }
    });
}

// ========================================
// GLOBAL API
// ========================================

window.TomitoHeader = {
    getActiveGenre,
    setActiveGenre,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
    closeGenresModal,
    showAllGenresModal,
    selectGenreFromModal,
    movieGenres
};

// Make functions globally accessible
window.showAllGenresModal = showAllGenresModal;
window.closeGenresModal = closeGenresModal;