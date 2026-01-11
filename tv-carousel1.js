// ========================================
// TV CAROUSEL FUNCTIONALITY
// ========================================
let tvCarouselInterval;
let tvCurrentSlide = 0;

function initializeTVCarousel() {
    const slides = document.querySelectorAll('.carousel-card');
    
    if (slides.length === 0) return;
    
    // Set initial slide
    tvCurrentSlide = 0;
    
    // Setup auto-play
    startTVCarouselAutoPlay();
    
    // Pause on hover
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.addEventListener('mouseenter', pauseTVCarouselAutoPlay);
        carousel.addEventListener('mouseleave', startTVCarouselAutoPlay);
    }
}

function startTVCarouselAutoPlay() {
    if (tvCarouselInterval) clearInterval(tvCarouselInterval);
    
    tvCarouselInterval = setInterval(() => {
        tvCurrentSlide++;
        scrollCarousel(1);
        
        // Reset if at end
        if (tvCurrentSlide >= 20) { // Assuming 20 items
            tvCurrentSlide = 0;
            const carouselTrack = document.getElementById('carouselTrack');
            if (carouselTrack) {
                carouselTrack.style.transform = `translateX(0px)`;
            }
        }
    }, 6000);
}

function pauseTVCarouselAutoPlay() {
    if (tvCarouselInterval) {
        clearInterval(tvCarouselInterval);
        tvCarouselInterval = null;
    }
}

function resetTVCarouselAutoPlay() {
    pauseTVCarouselAutoPlay();
    startTVCarouselAutoPlay();
}

// Initialize carousel when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for carousel to be rendered
    setTimeout(() => {
        initializeTVCarousel();
    }, 2000);
});

// Reinitialize when carousel updates
function reinitializeTVCarousel() {
    setTimeout(initializeTVCarousel, 1000);
}function showAllMovies() {
    const section = document.querySelector('.all-movies-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}
