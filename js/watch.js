// ===========================================
// الإعدادات الأساسية
// ===========================================
const CONFIG = {
    API_KEY: "882e741f7283dc9ba1654d4692ec30f6",
    BASE_URL: "https://api.themoviedb.org/3",
    BASE_IMG: "https://image.tmdb.org/t/p"
};

// ===========================================
// قائمة الخوادم
// ===========================================
const SERVERS = [
    {
        id: 'server_3',
        name: 'سيرفر الرئيسي',
        movieUrl: 'https://vidsrc-embed.ru/embed/movie/',
        tvUrl: 'https://vidsrc-embed.ru/embed/tv/',
        quality: 'FHD',
        icon: 'fa-rocket',
        color: '#e74c3c',
        type: 'both',
        description: 'سيرفر احتياطي سريع',
        useIdType: 'tmdb',
        subtitles: 'ar'
    },
    {
        id: 'server_1',
        name: 'VIP',
        movieUrl: 'https://multiembed.mov/directstream.php?video_id=',
        tvUrl: 'https://multiembed.mov/directstream.php?video_id=',
        quality: 'VIP HD',
        icon: 'fa-play-circle',
        color: '#9b59b6',
        type: 'both',
        description: 'سيرفر VIP سريع مع جودة متعددة وترجمة',
        useIdType: 'imdb',
        subtitles: 'ar',
        vip: true,
        allowSubtitlesParam: true,
        allowTmdb: true,
        allowSeasonEpisode: true
    },
    {
        id: 'server_2',
        name: 'سيرفر 3',
        movieUrl: 'https://multiembed.mov/directstream.php?video_id=',
        tvUrl: 'https://multiembed.mov/directstream.php?video_id=',
        quality: 'HD+',
        icon: 'fa-film',
        description: 'سيرفر احتياطي مع ترجمة',
        color: '#1abc9c',
        type: 'both',
        useIdType: 'tmdb',
        useTmdbParam: true,
        subtitles: 'ar'
    },
    {
        id: 'server_4',
        name: 'سيرفر 4',
        movieUrl: 'https://www.nontongo.win/embed/movie/',
        tvUrl: 'https://www.nontongo.win/embed/tv/',
        quality: 'HD',
        icon: 'fa-tv',
        color: '#c0392b',
        type: 'both',
        description: 'سيرفر احتياطي عربي',
        useIdType: 'tmdb',
        subtitles: 'ar'
    },
    {
        id: 'server_5',
        name: 'سيرفر 5',
        movieUrl: 'https://vidsrc.me/embed/movie/',
        tvUrl: 'https://vidsrc.me/embed/tv/',
        quality: 'HD',
        icon: 'fa-star',
        color: '#16a085',
        type: 'both',
        description: 'سيرفر احتياطي بديل',
        useIdType: 'tmdb',
        subtitles: 'ar'
    },
    {
        id: 'server_6',
        name: 'سيرفر 6',
        movieUrl: 'https://moviesapi.club/movie/',
        tvUrl: 'https://moviesapi.club/tv/',
        quality: 'HD+',
        icon: 'fa-database',
        color: '#e67e22',
        type: 'both',
        description: 'سيرفر احتياطي كبير',
        useIdType: 'tmdb',
        subtitles: 'ar'
    },
    {
        id: 'server_7',
        name: 'سيرفر 7',
        movieUrl: 'https://www.2embed.cc/embed/',
        tvUrl: 'https://www.2embed.cc/embedtv/',
        quality: 'HD',
        icon: 'fa-sync',
        color: '#27ae60',
        type: 'both',
        description: 'سيرفر احتياطي موثوق',
        useIdType: 'tmdb',
        subtitles: 'ar'
    },
    {
        id: 'server_8',
        name: 'سيرفر 8',
        movieUrl: 'https://vidsrc.to/embed/movie/',
        tvUrl: 'https://vidsrc.to/embed/tv/',
        quality: 'HD',
        icon: 'fa-video',
        color: '#3498db',
        type: 'both',
        description: 'سيرفر احتياطي عالي',
        useIdType: 'tmdb',
        subtitles: 'ar'
    },
    {
        id: 'server_9',
        name: 'جديد',
        movieUrl: 'https://vidsrc-embed.ru/embed/movie',
        tvUrl: 'https://vidsrc-embed.ru/embed/tv',
        quality: 'FHD',
        icon: 'fa-globe',
        color: '#8e44ad',
        type: 'both',
        description: 'سيرفر جديد يدعم معلمات متقدمة',
        useIdType: 'tmdb',
        subtitles: 'ar',
        supportsParams: true, // يدعم معلمات في URL
        supportsImdbParam: true,
        supportsTmdbParam: true,
        supportsSubLang: true,
        supportsAutoPlay: true
    }
];

// ===========================================
// مشغل الفيديو
// ===========================================
class MoviePlayer {
    constructor() {
        this.movieId = null;
        this.imdbId = null;
        this.tmdbId = null;
        this.movieData = null;
        this.currentServer = SERVERS[0];
        this.contentType = 'movie';
        this.season = null;
        this.episode = null;
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        const params = new URLSearchParams(window.location.search);
        this.movieId = params.get('id');
        this.contentType = params.get('type') || 'movie';
        this.season = params.get('season');
        this.episode = params.get('episode');
        
        if (!this.movieId) {
            this.showLoading(false);
            return;
        }
        
        try {
            await this.loadMovieData();
            await this.fetchExternalIds();
            this.createServerButtons();
            
            // تشغيل تلقائي للسيرفر الأول
            setTimeout(() => {
                this.playVideo();
            }, 800);
            
        } catch (error) {
            console.error('خطأ:', error);
        } finally {
            this.showLoading(false);
        }
    }
    
    async fetchExternalIds() {
        try {
            const response = await fetch(
                `${CONFIG.BASE_URL}/movie/${this.movieId}/external_ids?api_key=${CONFIG.API_KEY}`
            );
            const data = await response.json();
            this.tmdbId = this.movieId;
            this.imdbId = data.imdb_id || null;
        } catch (error) {
            this.tmdbId = this.movieId;
            this.imdbId = null;
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
            throw error;
        }
    }
    
    async fetchData(endpoint) {
        const url = `${CONFIG.BASE_URL}${endpoint}&api_key=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
    
    updateUI() {
        if (!this.movieData) return;
        
        const { movie, credits, similar } = this.movieData;
        document.title = `${movie.title} - TOMITO`;
        
        // تحديث عنوان الهيدر
        const headerTitle = document.querySelector('.movie-title-header');
        if (headerTitle) headerTitle.textContent = movie.title || 'بدون عنوان';
        
        // تحديث البانر
        const bannerDesc = document.getElementById('banner-description');
        if (bannerDesc) bannerDesc.textContent = movie.overview || 'لا يوجد وصف متوفر';
        
        const banner = document.querySelector('.banner-background');
        if (banner && movie.backdrop_path) {
            const bgElement = banner.querySelector('::before') || banner;
            banner.style.setProperty('--bg-image', `url('${CONFIG.BASE_IMG}/original${movie.backdrop_path}')`);
        }
        
        // تحديث معلومات البانر
        const yearText = document.getElementById('year-text');
        const durationText = document.getElementById('duration-text');
        const ratingText = document.getElementById('rating-text');
        
        if (yearText) yearText.textContent = movie.release_date?.split('-')[0] || '----';
        if (durationText) durationText.textContent = movie.runtime ? `${movie.runtime} دقيقة` : '-- دقيقة';
        if (ratingText) ratingText.textContent = movie.vote_average?.toFixed(1) || '--';
        
        // تحديث التفاصيل
        const movieTitle = document.getElementById('movie-title-full');
        const poster = document.getElementById('movie-poster');
        const overviewText = document.getElementById('overview-text');
        const releaseYear = document.getElementById('release-year');
        const posterRating = document.getElementById('poster-rating');
        
        if (movieTitle) movieTitle.textContent = movie.title;
        if (poster && movie.poster_path) {
            poster.src = `${CONFIG.BASE_IMG}/w500${movie.poster_path}`;
        }
        if (overviewText) overviewText.textContent = movie.overview || 'لا يوجد وصف متوفر';
        if (releaseYear) releaseYear.textContent = movie.release_date?.split('-')[0] || '----';
        if (posterRating) posterRating.textContent = movie.vote_average?.toFixed(1) || '--';
        
        // تحديث معلومات الفيلم
        this.updateMovieMeta(movie);
        
        // التصنيفات
        const genresContainer = document.getElementById('genres-list');
        if (genresContainer) {
            genresContainer.innerHTML = (movie.genres || []).slice(0, 5).map(genre => 
                `<span class="genre-tag">${genre.name}</span>`
            ).join('');
        }
        
        // فريق التمثيل
        this.updateCast(credits.cast || []);
        
        // أفلام مشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateMovieMeta(movie) {
        const metaContainer = document.getElementById('movie-meta');
        if (!metaContainer) return;
        
        metaContainer.innerHTML = `
            <div class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                <div class="meta-content">
                    <span class="meta-label">تاريخ الإصدار</span>
                    <span class="meta-value">${movie.release_date?.split('-')[0] || 'غير متوفر'}</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-clock"></i>
                <div class="meta-content">
                    <span class="meta-label">المدة</span>
                    <span class="meta-value">${movie.runtime ? movie.runtime + ' دقيقة' : 'غير متوفر'}</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-star"></i>
                <div class="meta-content">
                    <span class="meta-label">التقييم</span>
                    <span class="meta-value">${movie.vote_average?.toFixed(1) || '--'}/10</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-language"></i>
                <div class="meta-content">
                    <span class="meta-label">اللغة</span>
                    <span class="meta-value">${movie.original_language?.toUpperCase() || 'غير متوفر'}</span>
                </div>
            </div>
        `;
    }
    
    updateCast(cast) {
        const container = document.getElementById('cast-list');
        if (!container) return;
    
        const actors = cast
            .filter(actor => actor.profile_path)
            .slice(0, 8)
            .map(actor => ({
                name: actor.name,
                character: actor.character,
                img: `${CONFIG.BASE_IMG}/w200${actor.profile_path}`
            }));
    
        container.innerHTML = actors.map(actor => `
            <div class="cast-card">
                <img src="${actor.img}" class="cast-img" alt="${actor.name}">
                <div class="cast-info">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character}</div>
                </div>
            </div>
        `).join('');
    }
    
    updateSimilar(movies) {
        const container = document.getElementById('similar-list');
        if (!container) return;
        
        const similarMovies = movies.slice(0, 6).map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date?.split('-')[0],
            rating: movie.vote_average?.toFixed(1),
            img: movie.poster_path ? `${CONFIG.BASE_IMG}/w300${movie.poster_path}` : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image'
        }));
        
        container.innerHTML = similarMovies.map(movie => `
            <div class="similar-card" onclick="playMovie(${movie.id})">
                <img src="${movie.img}" class="similar-img" alt="${movie.title}">
                <div class="similar-info">
                    <div class="similar-title">${movie.title}</div>
                    <div class="similar-meta">
                        <span>${movie.year}</span>
                        <span><i class="fas fa-star"></i> ${movie.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    createServerButtons() {
        const container = document.getElementById('server-buttons');
        if (!container) return;
        
        container.innerHTML = SERVERS.map(server => `
            <button class="server-btn ${this.currentServer.id === server.id ? 'active' : ''}"
                    onclick="moviePlayer.changeServer('${server.id}')"
                    data-server-id="${server.id}"
                    title="${server.description}">
                <i class="fas ${server.icon}"></i>
                <span>${server.name}</span>
                <span class="server-quality">${server.quality}</span>
            </button>
        `).join('');
        
        // تحديث السيرفر الحالي
        this.updateCurrentServerInfo();
    }
    
    updateCurrentServerInfo() {
        const currentServerEl = document.getElementById('current-server');
        if (currentServerEl) {
            currentServerEl.textContent = `جاري التشغيل: ${this.currentServer.name}`;
        }
    }
    
    getVideoIdForServer(server) {
        switch(server.useIdType) {
            case 'imdb':
                return this.imdbId || this.tmdbId;
            case 'tmdb':
            default:
                return this.tmdbId;
        }
    }
    
    buildVideoURL(server) {
        const videoId = this.getVideoIdForServer(server);
        if (!videoId) return '';
        
        let baseURL = this.contentType === 'tv' ? server.tvUrl : server.movieUrl;
        
        // معالجة السيرفر الجديد (server_9)
        if (server.id === 'server_9') {
            return this.buildVidsrcEmbedURL(server, videoId);
        }
        
        // معالجة السيرفرات الأخرى
        if (this.contentType === 'tv') {
            if (server.id.includes('server_1') || server.id.includes('server_2')) {
                let url = `${baseURL}${videoId}`;
                if (server.useTmdbParam) url += '&tmdb=1';
                if (this.season && this.episode) url += `&s=${this.season}&e=${this.episode}`;
                if (server.subtitles) url += `&sub=${server.subtitles}`;
                return url;
            } else if (server.id.includes('server_3')) {
                let url = `${baseURL}${videoId}`;
                if (this.season && this.episode) url += `/${this.season}/${this.episode}`;
                if (server.subtitles) url += `?language=${server.subtitles}`;
                return url;
            } else {
                let url = `${baseURL}${videoId}`;
                if (this.season && this.episode) url += `/${this.season}/${this.episode}`;
                return url;
            }
        } else {
            if (server.id.includes('server_1') || server.id.includes('server_2')) {
                let url = `${baseURL}${videoId}`;
                if (server.useTmdbParam) url += '&tmdb=1';
                if (server.subtitles) url += `&sub=${server.subtitles}`;
                return url;
            } else if (server.id.includes('server_3')) {
                let url = `${baseURL}${videoId}`;
                if (server.subtitles) url += `?language=${server.subtitles}`;
                return url;
            } else {
                return `${baseURL}${videoId}`;
            }
        }
    }
    
    buildVidsrcEmbedURL(server, videoId) {
        let url = server.movieUrl;
        const params = [];
        
        // إضافة معلمة معرف الفيلم
        if (server.useIdType === 'imdb' && this.imdbId) {
            params.push(`imdb=${this.imdbId}`);
        } else {
            params.push(`tmdb=${videoId}`);
        }
        
        // إضافة اللغة التلقائية للترجمة
        if (server.subtitles && server.supportsSubLang) {
            params.push(`ds_lang=${server.subtitles}`);
        }
        
        // إضافة خاصية التشغيل التلقائي
        if (server.supportsAutoPlay) {
            params.push('autoplay=1');
        }
        
        // لسلاسل المسلسلات
        if (this.contentType === 'tv') {
            url = server.tvUrl;
            if (this.season && this.episode) {
                // للسيرفر الجديد، نضيف الموسم والحلقة كجزء من المسار
                url = `${server.tvUrl}/${videoId}/${this.season}/${this.episode}`;
                
                // إعادة بناء المعلمات
                let newParams = [];
                if (server.subtitles && server.supportsSubLang) {
                    newParams.push(`ds_lang=${server.subtitles}`);
                }
                if (server.supportsAutoPlay) {
                    newParams.push('autoplay=1');
                }
                
                if (newParams.length > 0) {
                    return `${url}?${newParams.join('&')}`;
                }
                return url;
            }
        }
        
        // بناء URL النهائي
        if (params.length > 0) {
            return `${url}?${params.join('&')}`;
        }
        
        return `${url}/${videoId}`;
    }
    
    changeServer(serverId) {
        const server = SERVERS.find(s => s.id === serverId);
        if (!server) return;
        
        this.currentServer = server;
        
        // تحديث الأزرار النشطة
        document.querySelectorAll('.server-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-server-id="${serverId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // تحديث السيرفر الحالي
        this.updateCurrentServerInfo();
        
        // تشغيل الفيديو
        this.playVideo();
    }
    
    playVideo() {
        if (!this.currentServer) return;
    
        const videoWrapper = document.querySelector('.video-wrapper');
        if (!videoWrapper) return;
    
        try {
            const videoURL = this.buildVideoURL(this.currentServer);
            console.log('Video URL:', videoURL); // للتطوير
            
            // إضافة مؤشر تحميل
            videoWrapper.innerHTML = `
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
                    <div class="loading-spinner" style="margin: 0 auto 15px;"></div>
                    <div>جاري تحميل ${this.currentServer.name}...</div>
                    <small style="opacity: 0.7; margin-top: 5px;">${this.currentServer.quality}</small>
                </div>
            `;
    
            // تحميل الفيديو
            setTimeout(() => {
                videoWrapper.innerHTML = `
                    <iframe id="video-player" 
                            src="${videoURL}" 
                            frameborder="0" 
                            width="100%" 
                            height="100%" 
                            allowfullscreen="true" 
                            scrolling="no"
                            allow="autoplay; encrypted-media"
                            referrerpolicy="no-referrer">
                    </iframe>
                `;
            }, 500);
            
        } catch (error) {
            console.error('خطأ:', error);
            videoWrapper.innerHTML = `
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px; color: #e74c3c;"></i>
                    <div>خطأ في تحميل الفيديو</div>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
    
    showLoading(show) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = show ? 'flex' : 'none';
        }
    }
}

// ===========================================
// دوال مساعدة
// ===========================================
function playMovie(movieId) {
    window.location.href = `watch.html?id=${movieId}&type=movie`;
}

// زر التشغيل في البانر
document.addEventListener('DOMContentLoaded', () => {
    const playNowBtn = document.getElementById('play-now-btn');
    if (playNowBtn) {
        playNowBtn.addEventListener('click', () => {
            document.querySelector('.video-wrapper')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        });
    }
    
    // تهيئة مشغل الفيديو
    window.moviePlayer = new MoviePlayer();
});