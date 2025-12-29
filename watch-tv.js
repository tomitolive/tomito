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
        id: 'server1',
        name: '🎬 الخادم الأول',
        url: 'https://vidsrc.me/embed/tv/',
        quality: '720p',
        icon: 'fa-film',
        color: '#e74c3c'
    },
    {
        id: 'server2',
        name: '📺 الخادم الثاني',
        url: 'https://vidstream.pro/embed/tmdb/tv/',
        quality: '1080p',
        icon: 'fa-server',
        color: '#3498db'
    },
    {
        id: 'server3',
        name: '⚡ الخادم الثالث',
        url: 'https://vidcloud.pro/embed/tmdb/tv/',
        quality: '720p',
        icon: 'fa-bolt',
        color: '#2ecc71'
    },
    {
        id: 'server4',
        name: '🌐 الخادم الرابع',
        url: 'https://2embed.org/embed/tvdb/',
        quality: '1080p',
        icon: 'fa-globe',
        color: '#f39c12'
    }
];

// ===========================================
// مشغل المسلسلات الرئيسي
// ===========================================
class SeriesPlayer {
    constructor() {
        this.seriesId = null;
        this.seriesData = null;
        this.currentServer = SERVERS[0];
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.episodes = [];
        this.savedSeries = JSON.parse(localStorage.getItem('savedSeries') || '[]');
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        // استخراج معرف المسلسل
        const params = new URLSearchParams(window.location.search);
        this.seriesId = params.get('id');
        
        if (!this.seriesId) {
            this.showError('لم يتم العثور على معرف المسلسل');
            return;
        }
        
        await this.loadSeriesData();
        this.createServerButtons();
        this.setupEventListeners();
        this.updateEpisodeSelector();
        this.showLoading(false);
    }
    
    setupEventListeners() {
        // زر مشاهدة الآن
        document.getElementById('play-now-btn').addEventListener('click', () => {
            this.playVideo();
        });
        
        // زر حفظ المسلسل
        document.getElementById('save-series-btn').addEventListener('click', () => {
            this.toggleSaveSeries();
        });
        
        // زر الإعلان التشويقي
        document.getElementById('trailer-btn').addEventListener('click', () => {
            this.playTrailer();
        });
        
        // تغيير الموسم
        document.getElementById('season-select').addEventListener('change', (e) => {
            this.currentSeason = parseInt(e.target.value);
            this.updateEpisodesList();
        });
        
        // تغيير الحلقة
        document.getElementById('episode-select').addEventListener('change', (e) => {
            this.currentEpisode = parseInt(e.target.value);
        });
    }
    
    async loadSeriesData() {
        try {
            const [series, credits, similar] = await Promise.all([
                this.fetchData(`/tv/${this.seriesId}?language=ar&append_to_response=content_ratings,external_ids`),
                this.fetchData(`/tv/${this.seriesId}/credits?language=ar`),
                this.fetchData(`/tv/${this.seriesId}/similar?language=ar&page=1`)
            ]);
            
            this.seriesData = { series, credits, similar };
            this.updateUI();
            
        } catch (error) {
            console.error('خطأ:', error);
            this.showError('فشل تحميل بيانات المسلسل');
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
        
        // تحديث البانر العلوي
        this.updateBanner(series);
        
        // تحديث بقية الواجهة
        this.updateSeriesDetails(series, credits, similar);
        
        // تحديث حالة زر الحفظ
        this.updateSaveButton();
        
        // تحديث قائمة المواسم
        this.updateSeasonsList(series.seasons || []);
    }
    
    updateBanner(series) {
        const bannerTitle = document.getElementById('banner-title');
        const bannerDesc = document.getElementById('banner-description');
        const seasonsCount = document.getElementById('seasons-text');
        const statusText = document.getElementById('status-text');
        
        bannerTitle.textContent = series.name || 'بدون عنوان';
        bannerDesc.textContent = series.overview ? series.overview.substring(0, 200) + '...' : 'لا يوجد وصف';
        
        // عدد المواسم
        const seasons = series.seasons?.filter(s => s.season_number > 0) || [];
        seasonsCount.textContent = `${seasons.length} موسم${seasons.length !== 1 ? 'ات' : ''}`;
        
        // حالة المسلسل
        const status = series.status === 'Returning Series' ? 'مستمر' : 
                      series.status === 'Ended' ? 'منتهي' : 
                      series.status === 'Canceled' ? 'ملغي' : 
                      series.status || 'غير معروف';
        statusText.textContent = status;
        
        // تعيين خلفية البانر
        const banner = document.querySelector('.series-banner .banner-background');
        if (series.backdrop_path) {
            banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${CONFIG.BASE_IMG}/original${series.backdrop_path}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }
    
    updateSeriesDetails(series, credits, similar) {
        // العنوان
        document.title = `${series.name} - Tomito`;
        document.getElementById('series-title').textContent = series.name;
        document.getElementById('series-title-full').textContent = series.name;
        
        // الملصق
        const poster = document.getElementById('series-poster');
        poster.src = series.poster_path 
            ? `${CONFIG.BASE_IMG}/w500${series.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        
        // الميتاداتا
        this.updateMetaData(series);
        
        // القصة
        document.getElementById('overview-text').textContent = series.overview || 'لا يوجد وصف متوفر.';
        
        // الأنواع
        this.updateGenres(series.genres || []);
        
        // شبكات البث
        this.updateNetworks(series.networks || []);
        
        // الممثلين
        this.updateCast(credits.cast || []);
        
        // المسلسلات المشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateMetaData(series) {
        const metaGrid = document.getElementById('series-meta');
        const firstAirDate = series.first_air_date ? new Date(series.first_air_date).getFullYear() : '--';
        const lastAirDate = series.last_air_date ? new Date(series.last_air_date).getFullYear() : '--';
        
        const metaData = [
            { icon: 'calendar', label: 'سنة الإصدار', value: `${firstAirDate} - ${lastAirDate}` },
            { icon: 'clock', label: 'مدة الحلقة', value: series.episode_run_time?.[0] ? `${series.episode_run_time[0]} دقيقة` : 'غير معروف' },
            { icon: 'star', label: 'التقييم', value: series.vote_average?.toFixed(1) || '--' },
            { icon: 'users', label: 'الأصوات', value: series.vote_count ? series.vote_count.toLocaleString('ar') : '--' },
            { icon: 'language', label: 'اللغة', value: series.original_language?.toUpperCase() || '--' },
            { icon: 'flag', label: 'البلد', value: series.origin_country?.[0] || '--' }
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
        container.innerHTML = genres.map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('');
    }
    
    updateNetworks(networks) {
        const container = document.getElementById('networks-list');
        container.innerHTML = networks.map(network => {
            const logo = network.logo_path 
                ? `${CONFIG.BASE_IMG}/w45${network.logo_path}`
                : 'https://via.placeholder.com/45x45/333/fff?text=N';
            
            return `
                <div class="network-item">
                    <img src="${logo}" alt="${network.name}" class="network-logo" loading="lazy">
                    <span class="network-name">${network.name}</span>
                </div>
            `;
        }).join('');
    }
    
    updateCast(cast) {
        const container = document.getElementById('cast-list');
        const actors = cast.slice(0, 10); // أول 10 ممثلين فقط
        
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
    
    updateSimilar(seriesList) {
        const container = document.getElementById('similar-list');
        const similarSeries = seriesList.slice(0, 6);
        
        container.innerHTML = similarSeries.map(series => {
            const img = series.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${series.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image';
            
            const year = series.first_air_date?.split('-')[0] || '--';
            
            return `
                <div class="similar-card" data-id="${series.id}">
                    <img src="${img}" 
                         class="similar-img" 
                         alt="${series.name}"
                         loading="lazy">
                    <div class="similar-info">
                        <div class="similar-title">${series.name || 'بدون عنوان'}</div>
                        <div class="similar-meta">
                            <span>${year}</span>
                            <span><i class="fas fa-star"></i> ${series.vote_average?.toFixed(1) || '--'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // إضافة مستمعي الأحداث للمسلسلات المشابهة
        container.querySelectorAll('.similar-card').forEach(card => {
            card.addEventListener('click', () => {
                const seriesId = card.getAttribute('data-id');
                window.location.href = `watch-tv.html?id=${seriesId}`;
            });
        });
    }
    
    updateSeasonsList(seasons) {
        const container = document.getElementById('seasons-container');
        
        // تصفية الموسم 0 (الإجمالي)
        const regularSeasons = seasons.filter(s => s.season_number > 0);
        
        if (regularSeasons.length === 0) {
            container.innerHTML = '<div class="no-seasons">لا توجد مواسم متاحة</div>';
            return;
        }
        
        container.innerHTML = regularSeasons.map(season => {
            const img = season.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${season.poster_path}`
                : 'https://via.placeholder.com/300x450/333/fff?text=No+Image';
            
            const episodeCount = season.episode_count || 0;
            const airYear = season.air_date ? new Date(season.air_date).getFullYear() : '--';
            
            return `
                <div class="season-card" data-season="${season.season_number}">
                    <div class="season-poster">
                        <img src="${img}" alt="${season.name}" loading="lazy">
                        <div class="season-number">الموسم ${season.season_number}</div>
                    </div>
                    <div class="season-info">
                        <h3 class="season-name">${season.name || `الموسم ${season.season_number}`}</h3>
                        <div class="season-meta">
                            <span><i class="fas fa-film"></i> ${episodeCount} حلقة</span>
                            <span><i class="fas fa-calendar"></i> ${airYear}</span>
                        </div>
                        <p class="season-overview">${season.overview || 'لا يوجد وصف.'}</p>
                        <button class="watch-season-btn" data-season="${season.season_number}">
                            <i class="fas fa-play"></i> مشاهدة الموسم
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // إضافة مستمعي الأحداث لأزرار مشاهدة الموسم
        container.querySelectorAll('.watch-season-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seasonNumber = parseInt(e.target.dataset.season);
                this.currentSeason = seasonNumber;
                
                // تحديث الـ Select
                document.getElementById('season-select').value = seasonNumber;
                
                // تحديث قائمة الحلقات
                this.updateEpisodesList();
                
                // التمرير إلى قسم الفيديو
                document.getElementById('video-section').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    updateEpisodeSelector() {
        const seasonSelect = document.getElementById('season-select');
        const episodeSelect = document.getElementById('episode-select');
        
        if (!this.seriesData) return;
        
        const seasons = this.seriesData.series.seasons?.filter(s => s.season_number > 0) || [];
        
        // تحديث قائمة المواسم
        seasonSelect.innerHTML = seasons.map(season => 
            `<option value="${season.season_number}">الموسم ${season.season_number}</option>`
        ).join('');
        
        // تحديث قائمة الحلقات للموسم الأول
        this.updateEpisodesList();
    }
    
    async updateEpisodesList() {
        const episodeSelect = document.getElementById('episode-select');
        
        try {
            // جلب تفاصيل الموسم
            const data = await this.fetchData(`/tv/${this.seriesId}/season/${this.currentSeason}?language=ar`);
            this.episodes = data.episodes || [];
            
            // تحديث قائمة الحلقات
            episodeSelect.innerHTML = this.episodes.map(episode => 
                `<option value="${episode.episode_number}">الحلقة ${episode.episode_number}: ${episode.name || 'بدون عنوان'}</option>`
            ).join('');
            
            // تحديد الحلقة الأولى افتراضياً
            if (this.episodes.length > 0) {
                this.currentEpisode = 1;
                episodeSelect.value = 1;
            }
            
        } catch (error) {
            console.error('خطأ في جلب الحلقات:', error);
            episodeSelect.innerHTML = '<option value="">خطأ في تحميل الحلقات</option>';
        }
    }
    
    createServerButtons() {
        const container = document.getElementById('server-buttons');
        
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
        
        // إضافة مستمعي الأحداث للأزرار
        container.querySelectorAll('.server-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const serverId = btn.getAttribute('data-server-id');
                this.selectServer(serverId);
            });
        });
    }
    
    selectServer(serverId) {
        // إزالة النشط من جميع الأزرار
        document.querySelectorAll('.server-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة النشط للزر المحدد
        const selectedBtn = document.querySelector(`[data-server-id="${serverId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // العثور على بيانات الخادم
        const server = SERVERS.find(s => s.id === serverId);
        if (!server) return;
        
        this.currentServer = server;
    }
    
    playVideo() {
        if (!this.currentServer || !this.seriesId || !this.currentSeason || !this.currentEpisode) {
            this.showError('الرجاء اختيار الموسم والحلقة والخادم أولاً');
            return;
        }
        
        const videoPlayer = document.getElementById('video-player');
        
        // بناء رابط الفيديو مع الموسم والحلقة
        const videoURL = `${this.currentServer.url}${this.seriesId}/${this.currentSeason}/${this.currentEpisode}`;
        
        // إضافة معلمات لمنع الإعلانات
        const cleanURL = `${videoURL}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0`;
        
        this.showNotification(`جاري تحميل ${this.currentServer.name}...`, 'info');
        
        videoPlayer.src = cleanURL;
        
        videoPlayer.onload = () => {
            this.showNotification('✅ الفيديو جاهز للمشاهدة', 'success');
        };
        
        videoPlayer.onerror = () => {
            this.showNotification('❌ فشل تحميل الفيديو، جرب خادماً آخر', 'error');
        };
    }
    
    async playTrailer() {
        if (!this.seriesId) return;
        
        try {
            const videos = await this.fetchData(`/tv/${this.seriesId}/videos?language=ar`);
            const trailers = videos.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube');
            
            if (trailers.length === 0) {
                this.showError('لا يوجد إعلان تشويقي متاح');
                return;
            }
            
            const trailer = trailers[0];
            const videoPlayer = document.getElementById('video-player');
            const trailerURL = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            
            videoPlayer.src = trailerURL;
            this.showNotification('جاري تشغيل الإعلان التشويقي...', 'info');
            
        } catch (error) {
            console.error('خطأ في جلب الإعلان التشويقي:', error);
            this.showError('فشل تحميل الإعلان التشويقي');
        }
    }
    
    toggleSaveSeries() {
        if (!this.seriesData) return;
        
        const series = this.seriesData.series;
        const seriesId = series.id.toString();
        const saveBtn = document.getElementById('save-series-btn');
        
        // البحث عن المسلسل في المحفوظات
        const existingIndex = this.savedSeries.findIndex(s => s.id.toString() === seriesId);
        
        if (existingIndex !== -1) {
            // إزالة من المحفوظات
            this.savedSeries.splice(existingIndex, 1);
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
            this.showNotification('تمت إزالة المسلسل من المحفوظات', 'info');
        } else {
            // إضافة للمحفوظات
            this.savedSeries.push({
                id: series.id,
                name: series.name,
                poster: series.poster_path,
                rating: series.vote_average,
                year: series.first_air_date?.split('-')[0],
                seasons: series.seasons?.filter(s => s.season_number > 0).length || 0
            });
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            this.showNotification('تم حفظ المسلسل في المحفوظات', 'success');
        }
        
        // حفظ في localStorage
        localStorage.setItem('savedSeries', JSON.stringify(this.savedSeries));
    }
    
    updateSaveButton() {
        if (!this.seriesData) return;
        
        const seriesId = this.seriesData.series.id.toString();
        const saveBtn = document.getElementById('save-series-btn');
        
        // البحث عن المسلسل في المحفوظات
        const isSaved = this.savedSeries.some(s => s.id.toString() === seriesId);
        
        if (isSaved) {
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        } else {
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        }
    }
    
    // ======== دوال المساعدة ========
    showLoading(show) {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-bar');
        
        if (show) {
            loadingScreen.style.display = 'flex';
            progressBar.style.transform = 'scaleX(0)';
            progressBar.style.display = 'block';
        } else {
            loadingScreen.style.display = 'none';
            progressBar.style.transform = 'scaleX(1)';
            setTimeout(() => {
                progressBar.style.display = 'none';
            }, 300);
        }
    }
    
    showNotification(message, type = 'info') {
        // إزالة التنبيهات القديمة
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // إنشاء تنبيه جديد
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // إزالة التنبيه بعد 3 ثواني
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
}

// ===========================================
// بدء التشغيل عند تحميل الصفحة
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    window.seriesPlayer = new SeriesPlayer();
});

// دوال عامة للاستخدام من صفحات أخرى
function playSeries(seriesId, season = 1, episode = 1) {
    window.location.href = `watch-tv.html?id=${seriesId}&season=${season}&episode=${episode}`;
}

function toggleSaveSeries(seriesId, title, poster, rating, element) {
    // حفظ في localStorage
    let savedSeries = JSON.parse(localStorage.getItem('savedSeries') || '[]');
    const index = savedSeries.findIndex(s => s.id === seriesId);
    
    if (index !== -1) {
        savedSeries.splice(index, 1);
        if (element) {
            element.innerHTML = '<i class="far fa-heart"></i> حفظ';
            element.classList.remove('saved');
        }
    } else {
        savedSeries.push({ id: seriesId, name: title, poster_path: poster, vote_average: rating });
        if (element) {
            element.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            element.classList.add('saved');
        }
    }
    
    localStorage.setItem('savedSeries', JSON.stringify(savedSeries));
}