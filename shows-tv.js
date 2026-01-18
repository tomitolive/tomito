// API Configuration
const API_KEY = "882e741f7283dc9ba1654d4692ec30f6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const LANGUAGE = 'en';

// API Endpoints
const ENDPOINTS = {
    popular: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}&page=1`,
    topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${LANGUAGE}&page=1`,
    upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=${LANGUAGE}&page=1`
};

// DOM Elements
const carouselTracks = {
    'popular-movies': document.getElementById('popular-movies-track'),
    'top-rated': document.getElementById('top-rated-track'),
    'upcoming': document.getElementById('upcoming-track')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadAllMovies();
    setupCarouselControls();
});

// Fetch movies from API
async function fetchMovies(endpoint, sectionId) {
    try {
        showLoading(sectionId);
        
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displayMovies(data.results.slice(0, 10), sectionId); // Show first 10 movies
    } catch (error) {
        console.error(`Error fetching movies for ${sectionId}:`, error);
        showError(sectionId, error.message);
    }
}

// Load all movie categories
function loadAllMovies() {
    fetchMovies(ENDPOINTS.popular, 'popular-movies');
    fetchMovies(ENDPOINTS.topRated, 'top-rated');
    fetchMovies(ENDPOINTS.upcoming, 'upcoming');
}

// Display movies in carousel
function displayMovies(movies, sectionId) {
    const track = carouselTracks[sectionId];
    if (!track) return;
    
    track.innerHTML = '';
    
    movies.forEach(movie => {
        const movieItem = createMovieElement(movie);
        track.appendChild(movieItem);
    });
}

// Create movie element
function createMovieElement(movie) {
    const div = document.createElement('div');
    div.className = 'movie-item';
    
    // Format date
    const releaseDate = movie.release_date ? 
        new Date(movie.release_date).getFullYear() : 'N/A';
    
    // Format rating
    const rating = movie.vote_average ? 
        movie.vote_average.toFixed(1) : 'N/A';
    
    // Use placeholder if no image
    const posterPath = movie.poster_path ? 
        `${IMG_URL}${movie.poster_path}` : 
        'https://via.placeholder.com/500x750?text=No+Image';
    
    div.innerHTML = `
        <img src="${posterPath}" 
             alt="${movie.title}" 
             class="movie-poster"
             onerror="this.src='https://via.placeholder.com/500x750?text=Image+Not+Found'">
        <div class="movie-info">
            <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
            <div class="movie-details">
                <span class="movie-year">${releaseDate}</span>
                <span class="movie-rating">
                    <i class="fas fa-star"></i>${rating}
                </span>
            </div>
        </div>
    `;
    
    // Add click event to show movie details
    div.addEventListener('click', () => showMovieDetails(movie));
    
    return div;
}

// Show movie details (basic alert - can be enhanced)
function showMovieDetails(movie) {
    const overview = movie.overview || 'No description available.';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const releaseDate = movie.release_date || 'Not available';
    
    alert(`
        🎬 ${movie.title}
        
        ⭐ Rating: ${rating}/10
        📅 Release Date: ${releaseDate}
        
        📖 Overview:
        ${overview.substring(0, 300)}${overview.length > 300 ? '...' : ''}
        
        🎭 Genre: ${movie.genre_ids ? 'Various' : 'Not specified'}
    `);
}

// Setup carousel navigation
function setupCarouselControls() {
    document.querySelectorAll('.arrow__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = btn.getAttribute('data-section');
            const track = carouselTracks[sectionId];
            
            if (!track) return;
            
            const scrollAmount = 220; // Width of movie item + gap
            const direction = btn.classList.contains('next-btn') ? 1 : -1;
            
            track.scrollBy({
                left: scrollAmount * direction,
                behavior: 'smooth'
            });
        });
    });
}

// Show loading state
function showLoading(sectionId) {
    const track = carouselTracks[sectionId];
    if (!track) return;
    
    track.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            Loading movies...
        </div>
    `;
}

// Show error state
function showError(sectionId, errorMessage) {
    const track = carouselTracks[sectionId];
    if (!track) return;
    
    track.innerHTML = `
        <div class="loading">
            <i class="fas fa-exclamation-triangle"></i>
            Failed to load movies. Please try again later.
            <br><small>Error: ${errorMessage}</small>
        </div>
    `;
}

// Optional: Auto-scroll carousel (uncomment if needed)
/*
function autoScrollCarousel(sectionId, interval = 5000) {
    const track = carouselTracks[sectionId];
    if (!track) return;
    
    setInterval(() => {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: 220, behavior: 'smooth' });
        }
    }, interval);
}

// Call autoScroll for each section
Object.keys(carouselTracks).forEach(sectionId => {
    autoScrollCarousel(sectionId, 5000);
});
*/