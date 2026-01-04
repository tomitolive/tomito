// ===========================================
// الإعدادات الأساسية
// ===========================================
const CONFIG = {
    API_KEY: "882e741f7283dc9ba1654d4692ec30f6",
    BASE_URL: "https://api.themoviedb.org/3",
    BASE_IMG: "https://image.tmdb.org/t/p",
    AD_BLOCK_ENABLED: true,
    VIDSRC_API: "https://vidsrc.to/vapi/tv"
};

// ===========================================
// قائمة الخوادم للمسلسلات
// ===========================================
const SERVERS = [
    {
        id: 'superembed',
        name: '⚡ SuperEmbed VIP',
        movieUrl: 'https://multiembed.mov/directstream.php?video_id=',
        tvUrl: 'https://multiembed.mov/directstream.php?video_id=',
        quality: 'VIP',
        icon: 'fa-bolt',
        color: '#f39c12',
        type: 'both',
        format: 'tmdb',
        useTMDB: true
    },
    {
        id: '2embed',
        name: '🎞️ 2Embed',
        movieUrl: 'https://www.2embed.cc/embedtv/',
        tvUrl: 'https://www.2embed.cc/embedtv/',
        quality: 'HD',
        icon: 'fa-play-circle',
        color: '#27ae60',
        type: 'both',
        format: 'imdb'
    },
    {
        id: 'vidsrc_to',
        name: '🎬 VidSrc.to',
        movieUrl: 'https://vidsrc.to/embed/movie/',
        tvUrl: 'https://vidsrc.to/embed/tv/',
        quality: 'HD',
        icon: 'fa-film',
        color: '#e74c3c',
        type: 'both',
        format: 'both'
    },
    {
        id: 'autoembed',
        name: '🔄 AutoEmbed',
        movieUrl: 'https://player.autoembed.cc/embed/movie/',
        tvUrl: 'https://player.autoembed.cc/embed/tv/',
        quality: 'HD',
        icon: 'fa-sync',
        color: '#8e44ad',
        type: 'both',
        format: 'both'
    },
    {
        id: 'godrive',
        name: '💾 GoDrive',
        movieUrl: 'https://godriveplayer.com/player.php?type=movie&tmdb=',
        tvUrl: 'https://godriveplayer.com/player.php?type=series&tmdb=',
        quality: 'HD',
        icon: 'fa-cloud',
        color: '#3498db',
        type: 'both',
        format: 'tmdb',
        customFormat: true
    },
    {
        id: 'vidsrc_me',
        name: '🌟 VidSrc.me',
        movieUrl: 'https://vidsrc.me/embed/movie/',
        tvUrl: 'https://vidsrc.me/embed/tv/',
        quality: 'HD',
        icon: 'fa-star',
        color: '#16a085',
        type: 'both',
        format: 'tmdb'
    }
];

// ===========================================
// نظام حجب الإعلانات المطور
// ===========================================
class AdBlocker {
    constructor() {
        this.adDomains = new Set([
            'doubleclick.net', 'googleads', 'googlesyndication',
            'adsystem', 'adservice', 'adnxs', 'rubiconproject',
            'pubmatic', 'openx.net', 'criteo.net', 'taboola',
            'outbrain', 'revcontent', 'zemanta', 'mgid.com',
            'vast.', 'vmap.', 'vpaid.', 'adserver', 'ads.',
            'adv.', 'advert', 'ad-delivery', 'adtech',
            'analytics', 'tracking', 'pixel', 'beacon',
            'tagmanager', 'facebook.com/ads', 'twitter.com/ads',
            'jwplayer.com/ads', 'imasdk.googleapis.com',
            'popads', 'popcash', 'propellerads', 'exoclick'
        ]);
        
        this.init();
    }
    
    init() {
        if (!CONFIG.AD_BLOCK_ENABLED) return;
        
        console.log('🛡️ نظام حجب الإعلانات مفعل');
        
        this.hijackXMLHttpRequest();
        this.hijackFetch();
        this.blockPopups();
        this.injectCSS();
    }
    
    hijackXMLHttpRequest() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const self = this;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            if (self.isAdURL(url)) {
                console.log(`🚫 حظر XHR: ${url}`);
                this._blocked = true;
                return;
            }
            return originalOpen.apply(this, arguments);
        };
    }
    
    hijackFetch() {
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            if (self.isAdURL(url)) {
                console.log(`🚫 حظر Fetch: ${url}`);
                return Promise.resolve(new Response('', { status: 200 }));
            }
            return originalFetch.call(this, input, init);
        };
    }
    
    blockPopups() {
        const originalOpen = window.open;
        const self = this;
        
        window.open = function(url, target, features) {
            if (!url || self.isAdURL(url)) {
                console.log(`🚫 حظر نافذة منبثقة`);
                return null;
            }
            return originalOpen.call(this, url, target, features);
        };
    }
    
    injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            [class*="ad-"], [id*="ad-"],
            [class*="advertisement"], [class*="banner"],
            .adsbygoogle, #ads {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
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
// مشغل المسلسلات الرئيسي
// ===========================================
class SeriesPlayer {
    constructor() {
        this.seriesId = null;
        this.imdbId = null;
        this.seriesData = null;
        this.currentServer = SERVERS[0]; // 2Embed كخادم افتراضي
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.episodes = [];
        this.savedSeries = JSON.parse(localStorage.getItem('savedSeries') || '[]');
        this.adBlocker = new AdBlocker();
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        const params = new URLSearchParams(window.location.search);
        this.seriesId = params.get('id');
        this.currentSeason = parseInt(params.get('s')) || 1;
        this.currentEpisode = parseInt(params.get('e')) || 1;
        
        if (!this.seriesId) {
            this.showError('لم يتم العثور على معرف المسلسل');
            this.showLatestSeries();
            return;
        }
        
        await this.loadSeriesData();
        this.createServerButtons();
        this.setupEventListeners();
        this.updateSeasonSelector();
        this.updateEpisodeSelector();
        this.showLoading(false);
        
        // تشغيل تلقائي للحلقة الأولى
        setTimeout(() => this.playVideo(), 500);
    }
    
    async loadSeriesData() {
        try {
            const [series, credits, externalIds, similar] = await Promise.all([
                this.fetchData(`/tv/${this.seriesId}?language=ar`),
                this.fetchData(`/tv/${this.seriesId}/credits?language=ar`),
                this.fetchData(`/tv/${this.seriesId}/external_ids`),
                this.fetchData(`/tv/${this.seriesId}/similar?language=ar&page=1`)
            ]);
            
            this.seriesData = { series, credits, similar };
            this.imdbId = externalIds.imdb_id;
            
            this.updateUI();
            
        } catch (error) {
            console.error('خطأ:', error);
            this.showError('فشل تحميل بيانات المسلسل');
        }
    }
    
  
    
    updateUI() {
        const { series, credits, similar } = this.seriesData;
        
        // تحديث العنوان
        document.title = `${series.name} - Tomito`;
        
        // تحديث البانر
        this.updateBanner(series);
        
        // تحديث الملصق
        const poster = document.getElementById('series-poster');
        if (poster) {
            poster.src = series.poster_path 
                ? `${CONFIG.BASE_IMG}/w500${series.poster_path}`
                : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        }
        
        // تحديث المعلومات
        this.updateSeriesInfo(series);
        
        // تحديث الممثلين
        this.updateCast(credits.cast || []);
        
        // تحديث المواسم
        this.updateSeasons(series.seasons || []);
        
        // تحديث المسلسلات المشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateBanner(series) {
        const banner = document.querySelector('.series-banner .banner-background');
        const bannerTitle = document.getElementById('banner-title');
        const bannerDesc = document.getElementById('banner-description');
        
        if (banner && series.backdrop_path) {
            banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${CONFIG.BASE_IMG}/original${series.backdrop_path}')`;
        }
        
        if (bannerTitle) bannerTitle.textContent = series.name || series.original_name;
        if (bannerDesc) bannerDesc.textContent = series.overview || 'لا يوجد وصف';
    }
    
    updateSeriesInfo(series) {
        const infoContainer = document.getElementById('series-meta');
        if (!infoContainer) return;
        
        const firstAir = series.first_air_date?.split('-')[0] || '--';
        const rating = series.vote_average?.toFixed(1) || '--';
        const seasons = series.number_of_seasons || '--';
        const episodes = series.number_of_episodes || '--';
        const status = series.status === 'Ended' ? 'منتهي' : series.status === 'Returning Series' ? 'مستمر' : 'غير معروف';
        
        infoContainer.innerHTML = `
            <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <div class="meta-content">
                    <span class="meta-label">السنة</span>
                    <span class="meta-value">${firstAir}</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-star"></i>
                <div class="meta-content">
                    <span class="meta-label">التقييم</span>
                    <span class="meta-value">${rating}</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-layer-group"></i>
                <div class="meta-content">
                    <span class="meta-label">المواسم</span>
                    <span class="meta-value">${seasons}</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-film"></i>
                <div class="meta-content">
                    <span class="meta-label">الحلقات</span>
                    <span class="meta-value">${episodes}</span>
                </div>
            </div>
            <div class="meta-item">
                <i class="fas fa-info-circle"></i>
                <div class="meta-content">
                    <span class="meta-label">الحالة</span>
                    <span class="meta-value">${status}</span>
                </div>
            </div>
        `;
        
        // تحديث قسم القصة
        const overviewSection = document.getElementById('overview-section');
        if (overviewSection) {
            overviewSection.innerHTML = `
                <h2 class="section-title">📖 ملخص القصة</h2>
                <p class="overview-text">${series.overview || 'لا يوجد ملخص متوفر لهذا المسلسل.'}</p>
            `;
        }
        
        // تحديث التصنيفات
        const genresSection = document.getElementById('genres-section');
        if (genresSection && series.genres && series.genres.length > 0) {
            genresSection.innerHTML = `
                <h2 class="section-title">🎭 التصنيفات</h2>
                <div class="genres-list">
                    ${series.genres.map(genre => `
                        <span class="genre-tag">${genre.name}</span>
                    `).join('')}
                </div>
            `;
        }
        
        // تحديث شبكات البث
        if (series.networks && series.networks.length > 0) {
            const networksSection = document.getElementById('networks-section');
            if (networksSection) {
                networksSection.innerHTML = `
                    <h2 class="section-title">📡 شبكات البث</h2>
                    <div class="networks-list">
                        ${series.networks.map(network => `
                            <div class="network-item">
                                ${network.logo_path ? 
                                    `<img src="${CONFIG.BASE_IMG}/w92${network.logo_path}" alt="${network.name}">` :
                                    `<span class="network-name">${network.name}</span>`
                                }
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
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
                    <img src="${img}" class="cast-img" alt="${actor.name}">
                    <div class="cast-info">
                        <div class="cast-name">${actor.name}</div>
                        <div class="cast-character">${actor.character || 'غير معروف'}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateSeasons(seasons) {
        const container = document.getElementById('seasons-list');
        if (!container) return;
        
        container.innerHTML = seasons.filter(s => s.season_number > 0).map(season => {
            const img = season.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${season.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=S' + season.season_number;
            
            return `
                <div class="season-card" onclick="window.seriesPlayer.selectSeason(${season.season_number})">
                    <img src="${img}" class="season-img" alt="${season.name}">
                    <div class="season-info">
                        <div class="season-name">${season.name}</div>
                        <div class="season-meta">${season.episode_count} حلقة</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateSimilar(series) {
        const container = document.getElementById('similar-list');
        if (!container) return;
        
        const similarSeries = series.slice(0, 6);
        
        container.innerHTML = similarSeries.map(show => {
            const img = show.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${show.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image';
            
            const year = show.first_air_date?.split('-')[0] || '--';
            
            return `
                <div class="similar-card" onclick="location.href='watch.html?id=${show.id}&type=tv'">
                    <img src="${img}" class="similar-img" alt="${show.name}">
                    <div class="similar-info">
                        <div class="similar-title">${show.name || 'بدون عنوان'}</div>
                        <div class="similar-meta">
                            <span>${year}</span>
                            <span><i class="fas fa-star"></i> ${show.vote_average?.toFixed(1) || '--'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    async updateSeasonSelector() {
        const seasonSelect = document.getElementById('season-select');
        if (!seasonSelect || !this.seriesData) return;
        
        const seasons = this.seriesData.series.seasons.filter(s => s.season_number > 0);
        
        seasonSelect.innerHTML = seasons.map(season => 
            `<option value="${season.season_number}" ${season.season_number === this.currentSeason ? 'selected' : ''}>
                الموسم ${season.season_number}
            </option>`
        ).join('');
    }
    
    async updateEpisodeSelector() {
        const episodeSelect = document.getElementById('episode-select');
        if (!episodeSelect) return;
        
        try {
            const seasonData = await this.fetchData(`/tv/${this.seriesId}/season/${this.currentSeason}?language=ar`);
            this.episodes = seasonData.episodes;
            
            episodeSelect.innerHTML = this.episodes.map(episode => 
                `<option value="${episode.episode_number}" ${episode.episode_number === this.currentEpisode ? 'selected' : ''}>
                    الحلقة ${episode.episode_number} - ${episode.name || ''}
                </option>`
            ).join('');
            
        } catch (error) {
            console.error('خطأ في تحميل الحلقات:', error);
        }
    }
    
    createServerButtons() {
        const container = document.getElementById('server-buttons');
        if (!container) return;
        
        container.innerHTML = SERVERS.map(server => `
            <button class="server-btn ${server.id === this.currentServer.id ? 'active' : ''}" 
                    data-server-id="${server.id}"
                    style="border-color: ${server.color}">
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
        
        // تشغيل مباشر
        this.playVideo();
    }
    
    selectSeason(seasonNumber) {
        this.currentSeason = seasonNumber;
        this.currentEpisode = 1;
        
        const seasonSelect = document.getElementById('season-select');
        if (seasonSelect) {
            seasonSelect.value = seasonNumber;
        }
        
        this.updateEpisodeSelector();
        this.playVideo();
    }
    
    setupEventListeners() {
        const seasonSelect = document.getElementById('season-select');
        const episodeSelect = document.getElementById('episode-select');
        const playBtn = document.getElementById('play-now-btn');
        const prevBtn = document.getElementById('prev-episode-btn');
        const nextBtn = document.getElementById('next-episode-btn');
        
        if (seasonSelect) {
            seasonSelect.addEventListener('change', (e) => {
                this.currentSeason = parseInt(e.target.value);
                this.currentEpisode = 1;
                this.updateEpisodeSelector();
            });
        }
        
        if (episodeSelect) {
            episodeSelect.addEventListener('change', (e) => {
                this.currentEpisode = parseInt(e.target.value);
                this.playVideo();
            });
        }
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playVideo();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousEpisode();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextEpisode();
            });
        }
    }
    
    buildVideoURL() {
        const server = this.currentServer;
        let url = '';
        
        if (server.customFormat) {
            // GoDrive Player
            url = `${server.tvUrl}${this.seriesId}&season=${this.currentSeason}&episode=${this.currentEpisode}`;
        } else if (server.format === 'imdb' || (server.format === 'both' && this.imdbId)) {
            // استخدام IMDB ID
            const id = this.imdbId || this.seriesId;
            url = `${server.tvUrl}${id}/${this.currentSeason}/${this.currentEpisode}`;
        } else if (server.useTMDB) {
            // SuperEmbed
            url = `${server.tvUrl}${this.seriesId}&tmdb=1&s=${this.currentSeason}&e=${this.currentEpisode}`;
        } else {
            // استخدام TMDB ID
            url = `${server.tvUrl}${this.seriesId}/${this.currentSeason}/${this.currentEpisode}`;
        }
        
        return url;
    }
    
    playVideo() {
        if (!this.currentServer || !this.seriesId) {
            this.showError('حدث خطأ في التشغيل');
            return;
        }
        
        const videoPlayer = document.getElementById('video-player');
        if (!videoPlayer) {
            this.showError('لم يتم العثور على مشغل الفيديو');
            return;
        }
        
        const videoURL = this.buildVideoURL();
        
        console.log('🎬 رابط الفيديو:', videoURL);
        
        this.showNotification(`جاري تحميل الحلقة ${this.currentEpisode}...`, 'info');
        
        videoPlayer.src = '';
        
        setTimeout(() => {
            videoPlayer.src = videoURL;
            this.updateCurrentPlaying();
        }, 300);
    }
    
    updateCurrentPlaying() {
        const currentEp = document.getElementById('current-episode');
        if (currentEp) {
            const episode = this.episodes.find(e => e.episode_number === this.currentEpisode);
            currentEp.textContent = episode ? episode.name : `الحلقة ${this.currentEpisode}`;
        }
    }
    
    previousEpisode() {
        if (this.currentEpisode > 1) {
            this.currentEpisode--;
            document.getElementById('episode-select').value = this.currentEpisode;
            this.playVideo();
        } else if (this.currentSeason > 1) {
            this.currentSeason--;
            document.getElementById('season-select').value = this.currentSeason;
            this.updateEpisodeSelector().then(() => {
                this.currentEpisode = this.episodes.length;
                document.getElementById('episode-select').value = this.currentEpisode;
                this.playVideo();
            });
        }
    }
    
    nextEpisode() {
        if (this.currentEpisode < this.episodes.length) {
            this.currentEpisode++;
            document.getElementById('episode-select').value = this.currentEpisode;
            this.playVideo();
        } else {
            const maxSeasons = this.seriesData.series.number_of_seasons;
            if (this.currentSeason < maxSeasons) {
                this.currentSeason++;
                this.currentEpisode = 1;
                document.getElementById('season-select').value = this.currentSeason;
                this.updateEpisodeSelector().then(() => {
                    this.playVideo();
                });
            }
        }
    }
    
    async showLatestSeries() {
        try {
            const response = await fetch(`${CONFIG.VIDSRC_API}/new/1`);
            if (!response.ok) throw new Error('فشل التحميل');
            
            const series = await response.json();
            this.displaySeriesList(series, 'أحدث المسلسلات');
            
        } catch (error) {
            console.error('خطأ:', error);
            this.showError('فشل تحميل المسلسلات');
        }
    }
    
    displaySeriesList(series, title) {
        document.getElementById('banner-title').textContent = title;
        
        const container = document.getElementById('series-list');
        if (!container) return;
        
        container.innerHTML = series.map(show => `
            <div class="series-card" onclick="location.href='watch.html?id=${show.tmdb_id}&type=tv'">
                <img src="${show.poster || 'https://via.placeholder.com/200x300'}" 
                     alt="${show.title}">
                <div class="series-info">
                    <h3>${show.title}</h3>
                    <p>${show.year || '--'}</p>
                </div>
            </div>
        `).join('');
    }
    
    showLoading(show) {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        console.error('ERROR:', message);
    }
}

// ===========================================
// بدء التشغيل
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    window.seriesPlayer = new SeriesPlayer();
});