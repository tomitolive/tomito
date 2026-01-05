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
// قائمة الخوادم للمسلسلات
// ===========================================
const TV_SERVERS = [
    {
        id: 'vidsrc_embed',
        name: '🎬 VidSrc Embed',
        baseUrl: 'https://vidsrc-embed.ru/embed/tv',
        quality: 'HD',
        icon: 'fa-film',
        color: '#e74c3c',
        supportsSeasons: true,
        format: 'tmdb/{id}/{season}/{episode}'
    },
    {
        id: 'hnembed',
        name: '🎥 HnEmbed',
        baseUrl: 'https://hnembed.cc/embed/tv',
        quality: 'HD',
        icon: 'fa-video',
        color: '#3498db',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: 'autoembed',
        name: '🔄 AutoEmbed',
        baseUrl: 'https://player.autoembed.cc/embed/tv',
        quality: 'HD',
        icon: 'fa-sync',
        color: '#8e44ad',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: '2embed',
        name: '🎞️ 2Embed',
        baseUrl: 'https://www.2embed.cc/embedtv',
        quality: 'HD',
        icon: 'fa-play-circle',
        color: '#27ae60',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    }
];

// ===========================================
// مشغل المسلسلات الرئيسي
// ===========================================
class TVSeriesPlayer {
    constructor() {
        this.seriesId = null;
        this.seriesData = null;
        this.currentServer = TV_SERVERS[0];
        
        // إعدادات الموسم والحلقة
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.totalSeasons = 1;
        this.totalEpisodes = 1;
        this.seasonsData = {};
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        const params = new URLSearchParams(window.location.search);
        this.seriesId = params.get('id');
        
        if (!this.seriesId) {
            this.showError('لم يتم العثور على معرف المسلسل');
            return;
        }
        
        await this.loadSeriesData();
        await this.loadSeasonData(this.currentSeason);
        this.createServerButtons();
        this.setupEventListeners();
        this.populateSeasonsDropdown();
        this.showLoading(false);
    }
    
    setupEventListeners() {
        // زر التشغيل
        const playBtn = document.getElementById('play-now-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playEpisode());
        }
        
        // أزرار التنقل بين الحلقات
        const prevBtn = document.getElementById('prev-episode');
        const nextBtn = document.getElementById('next-episode');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateEpisode(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateEpisode(1));
        }
        
        // اختيار الموسم
        const seasonSelect = document.getElementById('season-select');
        if (seasonSelect) {
            seasonSelect.addEventListener('change', (e) => {
                this.changeSeason(parseInt(e.target.value));
            });
        }
        
        // اختيار الحلقة
        const episodeSelect = document.getElementById('episode-select');
        if (episodeSelect) {
            episodeSelect.addEventListener('change', (e) => {
                this.changeEpisode(parseInt(e.target.value));
            });
        }
    }
    
    async loadSeriesData() {
        try {
            const [series, credits, similar] = await Promise.all([
                this.fetchData(`/tv/${this.seriesId}?language=ar`),
                this.fetchData(`/tv/${this.seriesId}/credits?language=ar`),
                this.fetchData(`/tv/${this.seriesId}/similar?language=ar&page=1`)
            ]);
            
            this.seriesData = { series, credits, similar };
            this.totalSeasons = series.number_of_seasons || 1;
            this.currentSeason = Math.min(this.totalSeasons, 1);
            
            this.updateUI();
            
        } catch (error) {
            console.error('خطأ:', error);
            this.showError('فشل تحميل بيانات المسلسل');
        }
    }
    
    async loadSeasonData(seasonNumber) {
        try {
            const seasonData = await this.fetchData(`/tv/${this.seriesId}/season/${seasonNumber}?language=ar`);
            this.seasonsData[seasonNumber] = seasonData;
            this.totalEpisodes = seasonData.episodes?.length || 1;
            this.currentEpisode = Math.min(this.currentEpisode, this.totalEpisodes);
            
            this.populateEpisodesDropdown(seasonNumber);
            this.updateEpisodeInfo();
            
        } catch (error) {
            console.error(`خطأ في تحميل الموسم ${seasonNumber}:`, error);
            this.showError(`فشل تحميل بيانات الموسم ${seasonNumber}`);
        }
    }
    
    async fetchData(endpoint) {
        const url = `${CONFIG.BASE_URL}${endpoint}&api_key=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
    
    updateUI() {
        const { series, credits, similar } = this.seriesData;
        
        this.updateBanner(series);
        this.updateBannerMeta(series);
        this.updateSeriesDetails(series, credits, similar);
    }
    
    updateBannerMeta(series) {
        const seasonsText = document.getElementById('seasons-text');
        const statusText = document.getElementById('status-text');
        const ratingText = document.getElementById('rating-text');
        
        if (seasonsText) seasonsText.textContent = `${series.number_of_seasons} مواسم`;
        if (statusText) statusText.textContent = series.status === 'Returning Series' ? 'مستمر' : 'منتهي';
        if (ratingText) ratingText.textContent = series.vote_average?.toFixed(1) || '--';
    }
    
    updateBanner(series) {
        const bannerTitle = document.getElementById('banner-title');
        const bannerDesc = document.getElementById('banner-description');
        const seriesTitle = document.getElementById('series-title');
        
        if (bannerTitle) bannerTitle.textContent = series.name || series.original_name || 'بدون عنوان';
        if (bannerDesc) bannerDesc.textContent = series.overview || 'لا يوجد وصف متوفر.';
        if (seriesTitle) seriesTitle.textContent = series.name || 'جاري التحميل...';
        
        const banner = document.querySelector('.series-banner .banner-background');
        if (banner && series.backdrop_path) {
            banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${CONFIG.BASE_IMG}/original${series.backdrop_path}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }
    
    updateSeriesDetails(series, credits, similar) {
        document.title = `${series.name} - Tomito`;
        
        const seriesTitleFull = document.getElementById('series-title-full');
        const releaseYear = document.getElementById('release-year');
        
        if (seriesTitleFull) seriesTitleFull.textContent = series.name;
        if (releaseYear) {
            const year = series.first_air_date?.split('-')[0] || '--';
            releaseYear.textContent = year;
        }
        
        // تحديث ملصق المسلسل
        const poster = document.getElementById('series-poster');
        if (poster) {
            poster.src = series.poster_path 
                ? `${CONFIG.BASE_IMG}/w500${series.poster_path}`
                : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
            poster.alt = series.name || 'ملصق المسلسل';
        }
        
        // تحديث التقييم في البادج
        const ratingBadge = document.getElementById('rating-badge');
        if (ratingBadge) {
            const ratingSpan = ratingBadge.querySelector('span');
            if (ratingSpan) {
                ratingSpan.textContent = series.vote_average?.toFixed(1) || '--';
            }
        }
        
        // تحديث المعلومات الوصفية
        this.updateMetaData(series);
        
        // تحديث ملخص القصة
        const overviewText = document.getElementById('overview-text');
        if (overviewText) overviewText.textContent = series.overview || 'لا يوجد وصف متوفر.';
        
        // تحديث التصنيفات
        this.updateGenres(series.genres || []);
        
        // تحديث شبكات البث
        this.updateNetworks(series.networks || []);
        
        // تحديث طاقم التمثيل
        this.updateCast(credits.cast || []);
        
        // تحديث المسلسلات المشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateMetaData(series) {
        const metaGrid = document.getElementById('series-meta');
        if (!metaGrid) return;
        
        const metaData = [
            { icon: 'calendar', label: 'السنة الأولى', value: series.first_air_date?.split('-')[0] || '--' },
            { icon: 'calendar-times', label: 'السنة الأخيرة', value: series.last_air_date?.split('-')[0] || 'مستمر' },
            { icon: 'star', label: 'التقييم', value: series.vote_average?.toFixed(1) || '--' },
            { icon: 'users', label: 'الأصوات', value: series.vote_count ? series.vote_count.toLocaleString('ar') : '--' },
            { icon: 'layer-group', label: 'المواسم', value: series.number_of_seasons || '--' },
            { icon: 'play-circle', label: 'الحلقات', value: series.number_of_episodes || '--' },
            { icon: 'clock', label: 'مدة الحلقة', value: series.episode_run_time?.[0] ? `${series.episode_run_time[0]} دقيقة` : 'غير معروف' },
            { icon: 'broadcast-tower', label: 'الحالة', value: series.status === 'Returning Series' ? 'مستمر' : 'منتهي' }
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
        
        if (genres.length === 0) {
            container.innerHTML = '<span class="no-data">لا توجد تصنيفات</span>';
            return;
        }
        
        container.innerHTML = genres.map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('');
    }
    
    updateNetworks(networks) {
        const container = document.getElementById('networks-list');
        if (!container) return;
        
        if (networks.length === 0) {
            container.innerHTML = '<span class="no-data">لا توجد شبكات بث</span>';
            return;
        }
        
        container.innerHTML = networks.map(network => {
            const logo = network.logo_path 
                ? `<img src="${CONFIG.BASE_IMG}/w45${network.logo_path}" alt="${network.name}" class="network-logo" loading="lazy">`
                : `<div class="network-name-only">${network.name}</div>`;
            
            return `
                <div class="network-item">
                    ${logo}
                    <span class="network-name">${network.name}</span>
                </div>
            `;
        }).join('');
    }
    
    updateCast(cast) {
        const container = document.getElementById('cast-list');
        if (!container) return;
        
        if (cast.length === 0) {
            container.innerHTML = '<div class="no-cast">لا يوجد طاقم تمثيل</div>';
            return;
        }
        
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
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/150x200/333/fff?text=?'">
                    <div class="cast-info">
                        <div class="cast-name">${actor.name || 'غير معروف'}</div>
                        <div class="cast-character">${actor.character || 'غير معروف'}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateSimilar(series) {
        const container = document.getElementById('similar-list');
        if (!container) return;
        
        if (series.length === 0) {
            container.innerHTML = '<div class="no-similar">لا توجد مسلسلات مشابهة</div>';
            return;
        }
        
        const similarSeries = series.slice(0, 6);
        
        container.innerHTML = similarSeries.map(item => {
            const img = item.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${item.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image';
            
            const year = item.first_air_date?.split('-')[0] || '--';
            
            return `
                <div class="similar-card" data-id="${item.id}" data-type="tv">
                    <img src="${img}" 
                         class="similar-img" 
                         alt="${item.name}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image'">
                    <div class="similar-info">
                        <div class="similar-title" title="${item.name}">${item.name || 'بدون عنوان'}</div>
                        <div class="similar-meta">
                            <span>${year}</span>
                            <span><i class="fas fa-star"></i> ${item.vote_average?.toFixed(1) || '--'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.similar-card').forEach(card => {
            card.addEventListener('click', () => {
                const seriesId = card.getAttribute('data-id');
                window.location.href = `watch-tv.html?id=${seriesId}`;
            });
        });
    }
    
    createServerButtons() {
        const container = document.getElementById('server-buttons');
        if (!container) return;
        
        container.innerHTML = TV_SERVERS.map(server => `
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
        
        const server = TV_SERVERS.find(s => s.id === serverId);
        if (!server) return;
        
        this.currentServer = server;
        this.showNotification(`تم اختيار ${server.name}`, 'success');
    }
    
    populateSeasonsDropdown() {
        const seasonSelect = document.getElementById('season-select');
        if (!seasonSelect) return;
        
        seasonSelect.innerHTML = '';
        
        for (let i = 1; i <= this.totalSeasons; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `الموسم ${i}`;
            if (i === this.currentSeason) option.selected = true;
            seasonSelect.appendChild(option);
        }
    }
    
    populateEpisodesDropdown(seasonNumber) {
        const episodeSelect = document.getElementById('episode-select');
        if (!episodeSelect) return;
        
        episodeSelect.innerHTML = '';
        
        const season = this.seasonsData[seasonNumber];
        const episodes = season?.episodes || [];
        
        if (episodes.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "لا توجد حلقات";
            episodeSelect.appendChild(option);
            return;
        }
        
        episodes.forEach((episode, index) => {
            const episodeNumber = index + 1;
            const option = document.createElement('option');
            option.value = episodeNumber;
            option.textContent = episode.name ? `الحلقة ${episodeNumber}: ${episode.name}` : `الحلقة ${episodeNumber}`;
            if (episodeNumber === this.currentEpisode) option.selected = true;
            episodeSelect.appendChild(option);
        });
    }
    
    async changeSeason(seasonNumber) {
        if (seasonNumber < 1 || seasonNumber > this.totalSeasons) return;
        
        this.currentSeason = seasonNumber;
        this.currentEpisode = 1;
        
        this.showLoading(true);
        
        if (!this.seasonsData[seasonNumber]) {
            await this.loadSeasonData(seasonNumber);
        } else {
            this.totalEpisodes = this.seasonsData[seasonNumber].episodes?.length || 1;
            this.populateEpisodesDropdown(seasonNumber);
            this.updateEpisodeInfo();
        }
        
        this.showLoading(false);
        this.showNotification(`تم اختيار الموسم ${seasonNumber}`, 'info');
    }
    
    changeEpisode(episodeNumber) {
        if (episodeNumber < 1 || episodeNumber > this.totalEpisodes) return;
        
        this.currentEpisode = episodeNumber;
        this.updateEpisodeInfo();
        this.showNotification(`الحلقة ${episodeNumber}`, 'info');
    }
    
    navigateEpisode(direction) {
        let newEpisode = this.currentEpisode + direction;
        let newSeason = this.currentSeason;
        
        if (newEpisode < 1) {
            if (newSeason > 1) {
                newSeason--;
                if (this.seasonsData[newSeason]) {
                    newEpisode = this.seasonsData[newSeason].episodes?.length || 1;
                } else {
                    newEpisode = 1;
                }
            } else {
                this.showNotification('هذه أول حلقة في المسلسل', 'info');
                return;
            }
        } else if (newEpisode > this.totalEpisodes) {
            if (newSeason < this.totalSeasons) {
                newSeason++;
                newEpisode = 1;
            } else {
                this.showNotification('هذه آخر حلقة في المسلسل', 'info');
                return;
            }
        }
        
        if (newSeason !== this.currentSeason) {
            this.changeSeason(newSeason);
            setTimeout(() => {
                this.changeEpisode(newEpisode);
                this.playEpisode();
            }, 500);
        } else {
            this.changeEpisode(newEpisode);
            this.playEpisode();
        }
    }
    
    updateEpisodeInfo() {
        const season = this.seasonsData[this.currentSeason];
        const episode = season?.episodes?.[this.currentEpisode - 1];
        
        if (episode) {
            const playBtn = document.getElementById('play-now-btn');
            if (playBtn) {
                const episodeName = episode.name ? `: ${episode.name.substring(0, 30)}${episode.name.length > 30 ? '...' : ''}` : '';
                playBtn.innerHTML = `<i class="fas fa-play-circle"></i> تشغيل الحلقة ${this.currentEpisode}${episodeName}`;
            }
        }
    }
    
    playEpisode() {
        if (!this.currentServer || !this.seriesId) {
            this.showError('الرجاء اختيار خادم أولاً');
            return;
        }
        
        const videoPlayer = document.getElementById('video-player');
        if (!videoPlayer) {
            this.showError('لم يتم العثور على مشغل الفيديو');
            return;
        }
        
        // بناء رابط الفيديو
        let videoURL;
        
        if (this.currentServer.format) {
            videoURL = this.currentServer.format
                .replace('{id}', this.seriesId)
                .replace('{season}', this.currentSeason)
                .replace('{episode}', this.currentEpisode);
            videoURL = `${this.currentServer.baseUrl}/${videoURL}`;
        } else {
            videoURL = `${this.currentServer.baseUrl}/${this.seriesId}/${this.currentSeason}/${this.currentEpisode}`;
        }
        
        // لسيرفر VidSrc Embed الخاص
        if (this.currentServer.id === 'vidsrc_embed') {
            videoURL = `https://vidsrc-embed.ru/embed/tv/${this.seriesId}/${this.currentSeason}/${this.currentEpisode}`;
        }
        
        console.log('🎬 تشغيل:', this.currentServer.name);
        console.log('🔗 الرابط:', videoURL);
        console.log('📺 الموسم:', this.currentSeason, 'الحلقة:', this.currentEpisode);
        
        this.showNotification(`جاري تحميل ${this.currentServer.name}...`, 'info');
        
        videoPlayer.src = '';
        
        setTimeout(() => {
            videoPlayer.src = videoURL;
            
            videoPlayer.onload = () => {
                this.showNotification('✅ الحلقة جاهزة', 'success');
            };
            
            videoPlayer.onerror = () => {
                this.showNotification('❌ فشل التحميل، جرب خادماً آخر', 'error');
                if (this.currentServer.id === 'autoembed') {
                    const altURL = `${videoURL}?server=2`;
                    setTimeout(() => {
                        videoPlayer.src = altURL;
                    }, 1000);
                }
            };
        }, 300);
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
        // إزالة الإشعارات السابقة
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
// إضافة CSS للإشعارات
// ===========================================
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .notification.success {
        background: #27ae60;
        border-left: 4px solid #219653;
    }
    
    .notification.error {
        background: #e74c3c;
        border-left: 4px solid #c0392b;
    }
    
    .notification.info {
        background: #3498db;
        border-left: 4px solid #2980b9;
    }
    
    .notification.warning {
        background: #f39c12;
        border-left: 4px solid #d35400;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-data, .no-cast, .no-similar {
        color: #999;
        font-style: italic;
        text-align: center;
        padding: 20px;
        width: 100%;
    }
`;

// إضافة الـ CSS للصفحة
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// ===========================================
// بدء التشغيل
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    window.tvSeriesPlayer = new TVSeriesPlayer();
});