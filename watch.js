// ===========================================
// الإعدادات الأساسية
// ===========================================
const CONFIG = {
    API_KEY: "882e741f7283dc9ba1654d4692ec30f6",
    BASE_URL: "https://api.themoviedb.org/3",
    BASE_IMG: "https://image.tmdb.org/t/p",
    AD_BLOCK_ENABLED: true
};

// ===========================================
// قائمة الخوادم
// ===========================================
const SERVERS = [
    {
        id: '2embed',
        name: '🎞️ 2Embed',
        movieUrl: 'https://www.2embed.cc/embed/',
        tvUrl: 'https://www.2embed.cc/embedtv/',
        quality: 'HD',
        icon: 'fa-play-circle',
        color: '#27ae60',
        type: 'both'
    },

    {
        id: 'vidsrc_to',
        name: '🎬 VidSrc.to',
        movieUrl: 'https://vidsrc.to/embed/movie/',
        tvUrl: 'https://vidsrc.to/embed/tv/',
        quality: 'HD',
        icon: 'fa-film',
        color: '#e74c3c',
        type: 'both'
    },
    {
        id: 'vidsrc_me',
        name: '🌟 VidSrc.me',
        movieUrl: 'https://vidsrc.me/embed/movie/',
        tvUrl: 'https://vidsrc.me/embed/tv/',
        quality: 'HD',
        icon: 'fa-star',
        color: '#16a085',
        type: 'both'
    },
    {
        id: 'autoembed',
        name: '🔄 AutoEmbed',
        movieUrl: 'https://autoembed.cc/embed/movie/',
        tvUrl: 'https://autoembed.cc/embed/tv/',
        quality: 'HD',
        icon: 'fa-sync',
        color: '#8e44ad',
        type: 'both'
    },
    {
        id: 'moviesapi',
        name: '🎯 MoviesAPI',
        movieUrl: 'https://moviesapi.club/movie/',
        tvUrl: 'https://moviesapi.club/tv/',
        quality: 'HD+',
        icon: 'fa-database',
        color: '#e67e22',
        type: 'both',
        useTMDB: true
    },
   
    {
        id: 'hnembed',
        name: '🎥 HnEmbed',
        movieUrl: 'https://hnembed.cc/embed/movie/',
        tvUrl: 'https://hnembed.cc/embed/tv/',
        quality: 'HD',
        icon: 'fa-video',
        color: '#3498db',
        type: 'both'
    }
];
// ===========================================
// نظام حجب الإعلانات
// ===========================================
class AdBlocker {
    constructor() {
        this.adDomains = new Set([
            'doubleclick.net', 'googleads', 'googlesyndication',
            'adsystem', 'adservice', 'adnxs', 'rubiconproject',
            'pubmatic', 'openx.net', 'criteo.net', 'taboola',
            'outbrain', 'revcontent', 'zemanta', 'mgid.com',
            'vast.', 'vmap.', 'vpaid.', 'adserver', 'ads.',
            'adv.', 'advert', 'analytics', 'tracking', 'pixel',
            'beacon', 'tagmanager', 'facebook.com/ads',
            'twitter.com/ads', 'tiktok.com/ads', 'snapchat.com/ads',
            'instagram.com/ads', 'jwplayer.com/ads',
            'video.unrulymedia.com', 'ads.vungle.com',
            'adcolony.com', 'unityads.unity3d.com'
        ]);
        
        this.init();
    }
    
    init() {
        if (!CONFIG.AD_BLOCK_ENABLED) return;
        
        this.hijackXMLHttpRequest();
        this.hijackFetch();
        this.hijackCreateElement();
        this.setupMutationObserver();
        this.blockPopups();
        
        console.log('✅ نظام حجب الإعلانات مفعل');
    }
    
    hijackXMLHttpRequest() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const self = this;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            if (self.isAdURL(url)) {
                console.log(`🚫 حظر طلب إعلان: ${url}`);
                this._blocked = true;
                return;
            }
            return originalOpen.apply(this, arguments);
        };
        
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(body) {
            if (this._blocked) {
                this.dispatchEvent(new Event('load'));
                return;
            }
            return originalSend.call(this, body);
        };
    }
    
    hijackFetch() {
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            if (self.isAdURL(url)) {
                console.log(`🚫 حظر fetch إعلان: ${url}`);
                return Promise.resolve(new Response('', { 
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' }
                }));
            }
            return originalFetch.call(this, input, init);
        };
    }
    
    hijackCreateElement() {
        const originalCreateElement = Document.prototype.createElement;
        const self = this;
        
        Document.prototype.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (['script', 'iframe', 'img'].includes(tagName.toLowerCase())) {
                const descriptor = Object.getOwnPropertyDescriptor(
                    HTMLScriptElement.prototype, 'src'
                );
                
                if (descriptor && descriptor.set) {
                    const originalSet = descriptor.set;
                    
                    Object.defineProperty(element, 'src', {
                        set: function(value) {
                            if (self.isAdURL(value)) {
                                console.log(`🚫 حظر ${tagName} إعلان: ${value}`);
                                this.style.display = 'none';
                                return;
                            }
                            originalSet.call(this, value);
                        },
                        get: descriptor.get
                    });
                }
            }
            
            return element;
        };
    }
    
    setupMutationObserver() {
        const self = this;
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        self.checkAndRemoveAds(node);
                    }
                });
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    checkAndRemoveAds(element) {
        const adIndicators = ['ad', 'ads', 'advert', 'banner', 'sponsor', 'popup'];
        const text = (element.className + ' ' + element.id).toLowerCase();
        
        if (adIndicators.some(indicator => text.includes(indicator))) {
            element.style.display = 'none';
            element.remove();
        }
        
        if (element.querySelectorAll) {
            element.querySelectorAll('script, iframe, img, div, span').forEach(child => {
                const childText = (child.className + ' ' + child.id).toLowerCase();
                if (adIndicators.some(indicator => childText.includes(indicator))) {
                    child.style.display = 'none';
                    child.remove();
                }
            });
        }
    }
    
    blockPopups() {
        const originalOpen = window.open;
        const self = this;
        
        window.open = function(url, target, features) {
            if (self.isAdURL(url)) {
                console.log(`🚫 حظر نافذة منبثقة: ${url}`);
                return null;
            }
            return originalOpen.call(this, url, target, features);
        };
    }
    
    isAdURL(url) {
        if (!url) return false;
        const urlStr = url.toString().toLowerCase();
        for (const domain of this.adDomains) {
            if (urlStr.includes(domain)) return true;
        }
        return false;
    }
}

// ===========================================
// مشغل الفيديو الرئيسي
// ===========================================
class MoviePlayer {
    constructor() {
        this.movieId = null;
        this.movieData = null;
        this.currentServer = SERVERS[0]; // AutoEmbed افتراضياً
        this.adBlocker = new AdBlocker();
        this.savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '{}');
        this.contentType = 'movie';
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        const params = new URLSearchParams(window.location.search);
        this.movieId = params.get('id');
        this.contentType = params.get('type') || 'movie';
        
        if (!this.movieId) {
            this.showError('لم يتم العثور على معرف الفيلم');
            return;
        }
        
        await this.loadMovieData();
        this.createServerButtons();
        this.setupEventListeners();
        this.showLoading(false);
    }
    
    setupEventListeners() {
        const playBtn = document.getElementById('play-now-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playVideo());
        }
        
        const saveBtn = document.getElementById('save-movie-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.toggleSaveMovie());
        }
    }
    
    async loadMovieData() {
        try {
            const [movie, credits, similar] = await Promise.all([
                this.fetchData(`/movie/${this.movieId}?language=ar`),
                this.fetchData(`/movie/${this.movieId}/credits?language=ar`),
                this.fetchData(`/movie/${this.movieId}/similar?language=ar&page=1`)
            ]);
            this.movieData = { movie, credits, similar };
            this.updateUI();
            
        } catch (error) {
            console.error('خطأ:', error);
            this.showError('فشل تحميل بيانات الفيلم');
        }
    }
    
    async fetchData(endpoint) {
        const url = `${CONFIG.BASE_URL}${endpoint}&api_key=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
    
    updateUI() {
        const { movie, credits, similar } = this.movieData;
        
        this.updateBanner(movie);
        this.updateBannerMeta(movie);
        this.updateMovieDetails(movie, credits, similar);
        this.updateSaveButton();
    }
    
    updateBannerMeta(movie) {
        const yearText = document.getElementById('year-text');
        const durationText = document.getElementById('duration-text');
        const ratingText = document.getElementById('rating-text');
        
        if (yearText) yearText.textContent = movie.release_date?.split('-')[0] || '--';
        if (durationText) durationText.textContent = movie.runtime ? `${movie.runtime} دقيقة` : 'غير معروف';
        if (ratingText) ratingText.textContent = movie.vote_average?.toFixed(1) || '--';
    }
    
    updateBanner(movie) {
        const bannerTitle = document.getElementById('banner-title');
        const bannerDesc = document.getElementById('banner-description');
        
        if (bannerTitle) bannerTitle.textContent = movie.title || movie.original_title || 'بدون عنوان';
        if (bannerDesc) bannerDesc.textContent = movie.overview || 'لا يوجد وصف متوفر.';
        
        const banner = document.querySelector('.movie-banner .banner-background');
        if (banner && movie.backdrop_path) {
            banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${CONFIG.BASE_IMG}/original${movie.backdrop_path}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }
    
    updateMovieDetails(movie, credits, similar) {
        document.title = `${movie.title} - Tomito`;
        
        const movieTitle = document.getElementById('movie-title');
        const movieTitleFull = document.getElementById('movie-title-full');
        
        if (movieTitle) movieTitle.textContent = movie.title;
        if (movieTitleFull) movieTitleFull.textContent = movie.title;
        
        const poster = document.getElementById('movie-poster');
        if (poster) {
            poster.src = movie.poster_path 
                ? `${CONFIG.BASE_IMG}/w500${movie.poster_path}`
                : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        }
        
        this.updateMetaData(movie);
        
        const overviewText = document.getElementById('overview-text');
        if (overviewText) overviewText.textContent = movie.overview || 'لا يوجد وصف متوفر.';
        
        this.updateGenres(movie.genres || []);
        this.updateCast(credits.cast || []);
        this.updateSimilar(similar.results || []);
    }
    
    updateMetaData(movie) {
        const metaGrid = document.getElementById('movie-meta');
        if (!metaGrid) return;
        
        const metaData = [
            { icon: 'calendar', label: 'السنة', value: movie.release_date?.split('-')[0] || '--' },
            { icon: 'clock', label: 'المدة', value: movie.runtime ? `${movie.runtime} دقيقة` : 'غير معروف' },
            { icon: 'star', label: 'التقييم', value: movie.vote_average?.toFixed(1) || '--' },
            { icon: 'users', label: 'الأصوات', value: movie.vote_count ? movie.vote_count.toLocaleString('ar') : '--' },
            { icon: 'language', label: 'اللغة', value: movie.original_language?.toUpperCase() || '--' },
            { icon: 'money-bill', label: 'الإيرادات', value: movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)} مليون` : '--' }
        ];
        
        metaGrid.innerHTML = metaData.map(item => `
            <div class="meta-item">
                <i class="fas fa-${item.icon}"></i>
                <div class="meta-content">
                    <span class="meta-label">${item.label}</span>
                    <span class="meta-value">${item.value}</span>
                </div>
            </div>
        `).join('');
    }
    
    updateGenres(genres) {
        const container = document.getElementById('genres-list');
        if (!container) return;
        
        container.innerHTML = genres.map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('');
    }
    
    updateCast(cast) {
        const container = document.getElementById('cast-list');
        if (!container) return;
        
        const actors = cast.slice(0, 8);
        
        container.innerHTML = actors.map(actor => {
            const img = actor.profile_path 
                ? `${CONFIG.BASE_IMG}/w200${actor.profile_path}`
                : 'https://via.placeholder.com/150x200/333/fff?text=?';
            
            return `
                <div class="cast-card">
                    <img src="${img}" 
                         class="cast-img" 
                         alt="${actor.name}"
                         loading="lazy">
                    <div class="cast-info">
                        <div class="cast-name">${actor.name || 'غير معروف'}</div>
                        <div class="cast-character">${actor.character || 'غير معروف'}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateSimilar(movies) {
        const container = document.getElementById('similar-list');
        if (!container) return;
        
        const similarMovies = movies.slice(0, 6);
        
        container.innerHTML = similarMovies.map(movie => {
            const img = movie.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${movie.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image';
            
            const year = movie.release_date?.split('-')[0] || '--';
            
            return `
                <div class="similar-card" data-id="${movie.id}">
                    <img src="${img}" 
                         class="similar-img" 
                         alt="${movie.title}"
                         loading="lazy">
                    <div class="similar-info">
                        <div class="similar-title">${movie.title || 'بدون عنوان'}</div>
                        <div class="similar-meta">
                            <span>${year}</span>
                            <span><i class="fas fa-star"></i> ${movie.vote_average?.toFixed(1) || '--'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.similar-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.getAttribute('data-id');
                window.location.href = `watch.html?id=${movieId}&type=movie`;
            });
        });
    }
    
    createServerButtons() {
        const container = document.getElementById('server-buttons');
        if (!container) return;
        
        container.innerHTML = SERVERS.map(server => `
            <button class="server-btn ${server.id === this.currentServer.id ? 'active' : ''}" 
                    data-server-id="${server.id}"
                    style="border-color: ${server.color}"
                    title="${server.description}">
                <i class="fas ${server.icon}" style="color: ${server.color}"></i>
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-quality">${server.quality}</div>
                </div>
            </button>
        `).join('');
        
        container.querySelectorAll('.server-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const serverId = btn.getAttribute('data-server-id');
                this.selectServer(serverId);
            });
        });
    }
    
    selectServer(serverId) {
        document.querySelectorAll('.server-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedBtn = document.querySelector(`[data-server-id="${serverId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        const server = SERVERS.find(s => s.id === serverId);
        if (!server) return;
        
        this.currentServer = server;
        this.showNotification(`تم اختيار ${server.name}`, 'success');
    }
    
    playVideo() {
        if (!this.currentServer || !this.movieId) {
            this.showError('الرجاء اختيار خادم أولاً');
            return;
        }
        
        const videoPlayer = document.getElementById('video-player');
        if (!videoPlayer) {
            this.showError('لم يتم العثور على مشغل الفيديو');
            return;
        }
        
        // بناء رابط الفيديو حسب نوع المحتوى
        let videoURL;
        if (this.contentType === 'tv') {
            videoURL = `${this.currentServer.tvUrl}${this.movieId}`;
        } else {
            videoURL = `${this.currentServer.movieUrl}${this.movieId}`;
        }
        
        console.log('🎬 رابط الفيديو:', videoURL);
        console.log('📊 السيرفر:', this.currentServer.name);
        console.log('🎯 نوع المحتوى:', this.contentType);
        
        this.showNotification(`جاري تحميل ${this.currentServer.name}...`, 'info');
        
        // تنظيف المشغل
        videoPlayer.src = '';
        
        setTimeout(() => {
            videoPlayer.src = videoURL;
            
            videoPlayer.onload = () => {
                this.showNotification('✅ الفيديو جاهز للمشاهدة', 'success');
            };
            
            videoPlayer.onerror = () => {
                this.showNotification('❌ فشل تحميل الفيديو، جرب خادماً آخر', 'error');
            };
        }, 300);
    }
    
    toggleSaveMovie() {
        if (!this.movieData) return;
        
        const movie = this.movieData.movie;
        const movieId = movie.id.toString();
        const saveBtn = document.getElementById('save-movie-btn');
        
        if (this.savedMovies[movieId]) {
            delete this.savedMovies[movieId];
            if (saveBtn) {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
            }
            this.showNotification('تمت إزالة الفيلم من المحفوظات', 'info');
        } else {
            this.savedMovies[movieId] = {
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path,
                rating: movie.vote_average,
                year: movie.release_date?.split('-')[0]
            };
            if (saveBtn) {
                saveBtn.classList.add('saved');
                saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            }
            this.showNotification('تم حفظ الفيلم في المحفوظات', 'success');
        }
        
        localStorage.setItem('savedMovies', JSON.stringify(this.savedMovies));
    }
    
    updateSaveButton() {
        if (!this.movieData) return;
        
        const movieId = this.movieData.movie.id.toString();
        const saveBtn = document.getElementById('save-movie-btn');
        
        if (saveBtn) {
            if (this.savedMovies[movieId]) {
                saveBtn.classList.add('saved');
                saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            } else {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
            }
        }
    }
    
    showLoading(show) {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-bar');
        
        if (show) {
            if (loadingScreen) loadingScreen.style.display = 'flex';
            if (progressBar) {
                progressBar.style.transform = 'scaleX(0)';
                progressBar.style.display = 'block';
            }
        } else {
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (progressBar) {
                progressBar.style.transform = 'scaleX(1)';
                setTimeout(() => {
                    progressBar.style.display = 'none';
                }, 300);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        console.error('ERROR:', message);
    }
}

// ===========================================
// دوال مساعدة عامة
// ===========================================

function playMovie(movieId) {
    window.location.href = `watch.html?id=${movieId}&type=movie`;
}

function toggleSaveMovie(movieId, title, poster, rating, element) {
    let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '{}');
    
    if (savedMovies[movieId]) {
        delete savedMovies[movieId];
        if (element) {
            element.innerHTML = '<i class="far fa-heart"></i> حفظ';
            element.classList.remove('saved');
        }
    } else {
        savedMovies[movieId] = { title, poster, rating };
        if (element) {
            element.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            element.classList.add('saved');
        }
    }
    
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
}

function setupPlayerControls() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const videoPlayer = document.getElementById('video-player');
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                videoPlayer.msRequestFullscreen();
            }
        });
    }
}

// ===========================================
// بدء التشغيل
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    window.moviePlayer = new MoviePlayer();
    setupPlayerControls();
});