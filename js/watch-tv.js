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
// قائمة الخوادم للمسلسلات (جميع السيرفرات)
// ===========================================
const TV_SERVERS = [
    {
        id: 'vidsrc_embed',
        name: '🎬 سيرفر',
        baseUrl: 'https://vidsrc-embed.ru/embed/tv',
        quality: 'HD',
        icon: 'fa-film',
        color: '#e74c3c',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: 'hnembed',
        name: '🎥 سيرفر 2',
        baseUrl: 'https://hnembed.cc/embed/tv',
        quality: 'HD',
        icon: 'fa-video',
        color: '#3498db',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: 'autoembed',
        name: '🔄 سيرفر 3',
        baseUrl: 'https://player.autoembed.cc/embed/tv',
        quality: 'HD',
        icon: 'fa-sync',
        color: '#8e44ad',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: '2embed',
        name: '🎞️ سيرفر 4',
        baseUrl: 'https://www.2embed.cc/embedtv',
        quality: 'HD',
        icon: 'fa-play-circle',
        color: '#27ae60',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: 'vidsrc_to',
        name: '🌟 سيرفر 5',
        baseUrl: 'https://vidsrc.to/embed/tv',
        quality: 'HD',
        icon: 'fa-star',
        color: '#16a085',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    },
    {
        id: 'vidsrc_me',
        name: '🎯 سيرفر 6',
        baseUrl: 'https://vidsrc.me/embed/tv',
        quality: 'HD',
        icon: 'fa-tv',
        color: '#e67e22',
        supportsSeasons: true,
        format: '{id}/{season}/{episode}'
    }
];

// ===========================================
// نظام حجب الإعلانات للمسلسلات
// ===========================================
class TVAdBlocker {   
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
        
        if (CONFIG.AD_BLOCK_ENABLED) {
            this.init();
        }
    }
    
    init() {
        this.hijackXMLHttpRequest();
        this.hijackFetch();
        this.hijackCreateElement();
        this.setupMutationObserver();
        this.blockPopups();
        
        console.log('✅ نظام حجب الإعلانات للمسلسلات مفعل');
    }
    
    hijackXMLHttpRequest() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const self = this;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            if (self.isAdURL(url)) {
                console.log(`🚫 حظر طلب إعلان للمسلسل: ${url}`);
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
                console.log(`🚫 حظر fetch إعلان للمسلسل: ${url}`);
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
                                console.log(`🚫 حظر ${tagName} إعلان للمسلسل: ${value}`);
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
                console.log(`🚫 حظر نافذة منبثقة للمسلسل: ${url}`);
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
// دوال مساعدة للكروت القابلة للنقر
// ===========================================

// دالة لفتح صفحة الممثل
function openActorPage(actorId) {
    console.log('🎭 فتح صفحة الممثل:', actorId);
    window.open(`actor.html?id=${actorId}`, '_blank');
}

// جعل كروت الممثلين قابلة للنقر
function makeCastClickable() {
    console.log('🔗 تفعيل خاصية النقر على الممثلين');
    
    // أضف نمط CSS للكروت القابلة للنقر
    const style = document.createElement('style');
    style.textContent = `
        .cast-card {
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border-radius: 10px;
        }
        
        .cast-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(229, 9, 20, 0.2);
        }
        
        .cast-card:hover .cast-img {
            transform: scale(1.05);
        }
        
        .cast-card .cast-img {
            transition: transform 0.3s ease;
        }
        
        .cast-card:hover::after {
            content: '👤 عرض الملف الشخصي';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(229, 9, 20, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            font-weight: bold;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            z-index: 2;
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        .cast-card:active {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
    
    // إضافة مستمع النقر
    document.addEventListener('click', function(e) {
        // البحث عن أقرب عنصر cast-card
        let element = e.target;
        while (element && !element.classList.contains('cast-card')) {
            element = element.parentElement;
        }
        
        if (element && element.classList.contains('cast-card')) {
            const actorId = element.getAttribute('data-actor-id');
            if (actorId) {
                console.log('🎬 النقر على الممثل ID:', actorId);
                openActorPage(actorId);
            } else {
                console.log('⚠️ لم يتم العثور على معرف الممثل');
            }
        }
    });
}

// ===========================================
// مشغل المسلسلات الرئيسي المحسن
// ===========================================
class TVSeriesPlayer {
    constructor() {
        this.seriesId = null;
        this.seriesData = null;
        this.currentServer = null;
        this.autoPlayEnabled = true;
        
        // إعدادات الموسم والحلقة
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.totalSeasons = 1;
        this.totalEpisodes = 1;
        this.seasonsData = {};
        this.savedSeries = JSON.parse(localStorage.getItem('savedSeries') || '{}');
        
        this.adBlocker = new TVAdBlocker();
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        const params = new URLSearchParams(window.location.search);
        this.seriesId = params.get('id');
        
        if (!this.seriesId) {
            this.showError('لم يتم العثور على معرف المسلسل');
            this.showLoading(false);
            return;
        }
        
        try {
            await this.loadSeriesData();
            await this.loadSeasonData(this.currentSeason);
            this.createServerButtons();
            this.setupEventListeners();
            this.populateSeasonsDropdown();
            
            // تفعيل خاصية النقر على الممثلين
            makeCastClickable();
            
            // التشغيل التلقائي للسيرفر الأول
            setTimeout(() => {
                if (this.autoPlayEnabled && TV_SERVERS.length > 0) {
                    this.selectServer(TV_SERVERS[0].id, true);
                }
            }, 1000);
            
        } catch (error) {
            console.error('خطأ التهيئة:', error);
            this.showError('حدث خطأ في تحميل المسلسل');
        } finally {
            this.showLoading(false);
        }
    }
    
    setupEventListeners() {
        // زر التشغيل الرئيسي
        const playBtn = document.getElementById('play-now-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playEpisode());
        }
        
        // زر الحفظ
        const saveBtn = document.getElementById('save-series-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.toggleSaveSeries());
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
        
        // تحديث شريط التقدم عند التمرير
        window.addEventListener('scroll', () => {
            const progressBar = document.getElementById('progress-bar');
            if (!progressBar) return;
            
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.transform = `scaleX(${scrolled / 100})`;
        });
        
        // تحسين تجربة الهاتف
        this.setupMobileEvents();
    }
    
    setupMobileEvents() {
        const buttons = document.querySelectorAll('.server-btn, .play-btn-lg, .save-btn-lg');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
                btn.style.transition = 'transform 0.1s';
            });
            
            btn.addEventListener('touchend', () => {
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });
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
            console.error('خطأ في تحميل البيانات:', error);
            throw error;
        }
    }
    async loadSeasonData(seasonNumber) {
        try {
            const grid = document.getElementById('episodes-grid');
            if (grid) grid.classList.add('loading');
    
            const seasonData = await this.fetchData(`/tv/${this.seriesId}/season/${seasonNumber}?language=ar`);
            this.seasonsData[seasonNumber] = seasonData;
            this.totalEpisodes = seasonData.episodes?.length || 1;
            this.currentEpisode = 1;
    
            this.populateEpisodesGrid(seasonNumber);
            this.updateEpisodeInfo();
    
        } catch (error) {
            console.error(`خطأ في تحميل الموسم ${seasonNumber}:`, error);
            this.showError(`فشل تحميل بيانات الموسم ${seasonNumber}`);
        } finally {
            const grid = document.getElementById('episodes-grid');
            if (grid) {
                setTimeout(() => grid.classList.remove('loading'), 300);
            }
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
        
        // تحديث العنوان
        document.title = `${series.name} - TOMITO`;
        
        // تحديث الهيدر
        const headerTitle = document.getElementById('series-title-header');
        if (headerTitle) {
            headerTitle.textContent = series.name || 'مسلسل غير معروف';
        }
        
        // تحديث البانر
        this.updateBanner(series);
        this.updateBannerMeta(series);
        
        // تحديث التفاصيل
        this.updateSeriesDetails(series, credits, similar);
        
        // تحديث زر الحفظ
        this.updateSaveButton();
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
        
        if (bannerTitle) bannerTitle.textContent = series.name || 'بدون عنوان';
        if (bannerDesc) bannerDesc.textContent = series.overview || 'لا يوجد وصف متوفر';
        if (seriesTitle) seriesTitle.textContent = series.name;
        
        const banner = document.querySelector('.banner-background');
        if (banner && series.backdrop_path) {
            banner.style.background = `
                linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                url('${CONFIG.BASE_IMG}/original${series.backdrop_path}')
            `;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }
    }
    
    updateSeriesDetails(series, credits, similar) {
        // العنوان
        const seriesTitleFull = document.getElementById('series-title-full');
        const releaseYear = document.getElementById('release-year');
        
        if (seriesTitleFull) seriesTitleFull.textContent = series.name;
        if (releaseYear) {
            const year = series.first_air_date?.split('-')[0] || '--';
            releaseYear.textContent = year;
        }
        
        // الصورة الرئيسية
        const poster = document.getElementById('series-poster');
        if (poster) {
            poster.src = series.poster_path 
                ? `${CONFIG.BASE_IMG}/w500${series.poster_path}`
                : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
            poster.alt = series.name || 'ملصق المسلسل';
        }
        
        // التقييم في البانر
        const ratingBadge = document.getElementById('rating-badge');
        if (ratingBadge) {
            const ratingSpan = ratingBadge.querySelector('span');
            if (ratingSpan) {
                ratingSpan.textContent = series.vote_average?.toFixed(1) || '--';
            }
        }
        
        // الميتاداتا
        this.updateMetaData(series);
        
        // الوصف
        const overviewText = document.getElementById('overview-text');
        if (overviewText) overviewText.textContent = series.overview || 'لا يوجد وصف متوفر.';
        
        // التصنيفات
        this.updateGenres(series.genres || []);
        
        // شبكات البث
        this.updateNetworks(series.networks || []);
        
        // طاقم التمثيل
        this.updateCast(credits.cast || []);
        
        // مسلسلات مشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateMetaData(series) {
        const metaGrid = document.getElementById('series-meta');
        if (!metaGrid) return;
        
        const metaData = [
            { 
                icon: 'calendar', 
                label: 'السنة الأولى', 
                value: series.first_air_date?.split('-')[0] || '--' 
            },
            { 
                icon: 'calendar-times', 
                label: 'السنة الأخيرة', 
                value: series.last_air_date?.split('-')[0] || 'مستمر' 
            },
            { 
                icon: 'star', 
                label: 'التقييم', 
                value: series.vote_average?.toFixed(1) || '--' 
            },
            { 
                icon: 'users', 
                label: 'الأصوات', 
                value: series.vote_count ? series.vote_count.toLocaleString('ar') : '--' 
            },
            { 
                icon: 'layer-group', 
                label: 'المواسم', 
                value: series.number_of_seasons || '--' 
            },
            { 
                icon: 'play-circle', 
                label: 'الحلقات', 
                value: series.number_of_episodes || '--' 
            },
            { 
                icon: 'clock', 
                label: 'مدة الحلقة', 
                value: series.episode_run_time?.[0] ? `${series.episode_run_time[0]} دقيقة` : 'غير معروف' 
            },
            { 
                icon: 'broadcast-tower', 
                label: 'الحالة', 
                value: series.status === 'Returning Series' ? 'مستمر' : 'منتهي' 
            }
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
        
        container.innerHTML = genres.slice(0, 5).map(genre => 
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
                ? `<img src="${CONFIG.BASE_IMG}/w45${network.logo_path}" alt="${network.name}" class="network-logo" loading="lazy" onerror="this.style.display='none'">`
                : '';
            
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
    
        const actors = cast
            .filter(actor => actor.profile_path) // غير اللي عندهم صورة
            .slice(0, 8)
            .map(actor => ({
                id: actor.id,
                name: actor.name || 'غير معروف',
                character: actor.character || 'غير معروف',
                img: `${CONFIG.BASE_IMG}/w200${actor.profile_path}`
            }));
    
        if (actors.length === 0) {
            container.innerHTML = '<div class="no-cast">لا توجد صور للممثلين</div>';
            return;
        }
    
        container.innerHTML = actors.map(actor => `
            <div class="cast-card" data-actor-id="${actor.id}">
                <img src="${actor.img}" class="cast-img" alt="${actor.name}" loading="lazy">
                <div class="cast-info">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character}</div>
                </div>
            </div>
        `).join('');
    }
    
    
    updateSimilar(series) {
        const container = document.getElementById('similar-list');
        if (!container) return;
        
        const similarSeries = series.slice(0, 4).map(item => {
            const imgUrl = item.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${item.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image';
            
            return {
                id: item.id,
                title: item.name || 'بدون عنوان',
                year: item.first_air_date?.split('-')[0] || '--',
                rating: item.vote_average?.toFixed(1) || '--',
                img: imgUrl
            };
        });
        
        container.innerHTML = similarSeries.map(item => `
            <div class="similar-card" data-id="${item.id}" onclick="playTVSeries(${item.id})">
                <img src="${item.img}" 
                     class="similar-img" 
                     alt="${item.title}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image'">
                <div class="similar-info">
                    <div class="similar-title">${item.title}</div>
                    <div class="similar-meta">
                        <span>${item.year}</span>
                        <span><i class="fas fa-star"></i> ${item.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    createServerButtons() {
        const container = document.getElementById('server-buttons');
        if (!container) return;
        
        container.innerHTML = TV_SERVERS.map(server => `
            <button class="server-btn" 
                    data-server-id="${server.id}"
                    onclick="tvSeriesPlayer.selectServer('${server.id}')"
                    style="border-left-color: ${server.color};"
                    title="${server.name} - ${server.quality}">
                <i class="fas ${server.icon}" style="color: ${server.color}"></i>
                <span class="server-name">${server.name}</span>
                <span class="server-quality">${server.quality}</span>
            </button>
        `).join('');
        
        if (TV_SERVERS.length > 0) {
            this.selectServer(TV_SERVERS[0].id, true);
        }
        
    }
    
    selectServer(serverId, autoPlay = false) {
        document.querySelectorAll('.server-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    
        const selectedBtn = document.querySelector(`[data-server-id="${serverId}"]`);
        if (selectedBtn) selectedBtn.classList.add('active');
    
        const server = TV_SERVERS.find(s => s.id === serverId);
        if (!server) {
            this.showError('السيرفر المحدد غير موجود');
            return;
        }
    
        this.currentServer = server;
    
        const currentServerText = document.getElementById('current-server');
        if (currentServerText) {
            currentServerText.textContent = `جاري التشغيل: ${server.name}`;
        }
    
        // ✅ التشغيل التلقائي الصحيح
        if (autoPlay || this.autoPlayEnabled) {
            this.playEpisode();
        }
    
        this.showNotification(`تم التبديل إلى ${server.name}`, 'info');
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
    populateEpisodesGrid(seasonNumber) {
        const container = document.getElementById('episodes-grid');
        if (!container) return;
    
        const season = this.seasonsData[seasonNumber];
        const episodes = season?.episodes || [];
    
        if (episodes.length === 0) {
            container.innerHTML = '<div class="no-data">لا توجد حلقات</div>';
            return;
        }
    
        container.innerHTML = episodes.map((ep, index) => {
            const epNum = index + 1;
            const img = ep.still_path
                ? `${CONFIG.BASE_IMG}/w300${ep.still_path}`
                : 'https://via.placeholder.com/300x170/1a1a1a/fff?text=Episode';
    
            return `
                <div class="episode-card ${epNum === this.currentEpisode ? 'active' : ''}" 
                     onclick="tvSeriesPlayer.selectEpisodeCard(${epNum})">
                    <img src="${img}" class="episode-thumb">
                    <div class="episode-info">
                        <div class="episode-number">الحلقة ${epNum}</div>
                        <div class="episode-name">${ep.name || 'بدون عنوان'}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    selectEpisodeCard(epNumber) {
        this.currentEpisode = epNumber;
        this.updateEpisodeInfo();
        this.populateEpisodesGrid(this.currentSeason);
        this.playEpisode();
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
            this.populateEpisodesGrid(seasonNumber);

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
                if (this.autoPlayEnabled && TV_SERVERS.length > 0) {
                    this.selectServer(TV_SERVERS[0].id, true);
                }
            }, 1000);
            
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
        
        console.log('🎬 تشغيل المسلسل:', {
            server: this.currentServer.name,
            season: this.currentSeason,
            episode: this.currentEpisode,
            url: videoURL
        });
        
        this.showNotification(`جاري التشغيل على ${this.currentServer.name}...`, 'info');
        
        videoPlayer.src = '';
        
        setTimeout(() => {
            try {
                videoPlayer.src = videoURL;
                
                videoPlayer.onload = () => {
                    this.showNotification('✅ الحلقة جاهزة للمشاهدة', 'success');
                };
                
                videoPlayer.onerror = (error) => {
                    console.error('خطأ في تحميل الفيديو:', error);
                    this.showNotification('❌ فشل تحميل الحلقة، جرب خادماً آخر', 'error');
                    
                    // محاولة السيرفر التالي تلقائياً
                    this.tryNextServer();
                };
                
            } catch (error) {
                console.error('خطأ في تشغيل الفيديو:', error);
                this.showError('حدث خطأ في تشغيل الحلقة');
            }
        }, 500);
    }
    
    tryNextServer() {
        if (!this.currentServer || TV_SERVERS.length < 2) return;
        
        const currentIndex = TV_SERVERS.findIndex(s => s.id === this.currentServer.id);
        if (currentIndex === -1) return;
        
        // محاولة السيرفر التالي
        const nextIndex = (currentIndex + 1) % TV_SERVERS.length;
        const nextServer = TV_SERVERS[nextIndex];
        
        this.showNotification(`جرب ${nextServer.name}...`, 'info');
        
        setTimeout(() => {
            this.selectServer(nextServer.id);
            setTimeout(() => this.playEpisode(), 500);
        }, 1500);
    }
    
    toggleSaveSeries() {
        if (!this.seriesData) return;
        
        const series = this.seriesData.series;
        const seriesId = series.id.toString();
        const saveBtn = document.getElementById('save-series-btn');
        
        if (this.savedSeries[seriesId]) {
            // إزالة من المحفوظات
            delete this.savedSeries[seriesId];
            if (saveBtn) {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="far fa-heart"></i> إضافة للمفضلة';
            }
            this.showNotification('تمت إزالة المسلسل من المحفوظات', 'info');
        } else {
            // إضافة إلى المحفوظات
            this.savedSeries[seriesId] = {
                id: series.id,
                title: series.name,
                poster: series.poster_path,
                rating: series.vote_average,
                year: series.first_air_date?.split('-')[0],
                seasons: series.number_of_seasons
            };
            if (saveBtn) {
                saveBtn.classList.add('saved');
                saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ في المفضلة';
            }
            this.showNotification('تم حفظ المسلسل في المحفوظات', 'success');
        }
        
        // حفظ في localStorage
        localStorage.setItem('savedSeries', JSON.stringify(this.savedSeries));
    }
    
    updateSaveButton() {
        if (!this.seriesData) return;
        
        const seriesId = this.seriesData.series.id.toString();
        const saveBtn = document.getElementById('save-series-btn');
        
        if (saveBtn) {
            if (this.savedSeries[seriesId]) {
                saveBtn.classList.add('saved');
                saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ في المفضلة';
            } else {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="far fa-heart"></i> إضافة للمفضلة';
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
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            if (progressBar) {
                progressBar.style.transform = 'scaleX(1)';
                setTimeout(() => {
                    progressBar.style.display = 'none';
                }, 300);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // إزالة الإشعارات القديمة
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
    
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        console.error('❌ خطأ:', message);
    }
}

// ===========================================
// دوال مساعدة للمسلسلات
// ===========================================

// دالة للانتقال إلى مسلسل آخر
function playTVSeries(seriesId) {
    window.location.href = `watch-tv.html?id=${seriesId}`;
}

// دالة ملء الشاشة للمسلسلات
function toggleFullscreenTV() {
    const videoPlayer = document.getElementById('video-player');
    if (!videoPlayer) return;
    
    if (!document.fullscreenElement) {
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
            videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.msRequestFullscreen) {
            videoPlayer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// ===========================================
// CSS للإشعارات للمسلسلات
// ===========================================
const tvNotificationStyles = `
    .notification {
        position: fixed;
        top: 80px;
        right: 20px;
        left: 20px;
        max-width: 400px;
        margin: 0 auto;
        padding: 12px 16px;
        background: rgba(0, 0, 0, 0.95);
        border-left: 4px solid #E50914;
        border-radius: 8px;
        color: #fff;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification i {
        font-size: 18px;
    }
    
    .notification.success {
        border-left-color: #27ae60;
    }
    
    .notification.error {
        border-left-color: #e74c3c;
    }
    
    .notification.info {
        border-left-color: #3498db;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-data, .no-cast, .no-similar {
        color: #999;
        font-style: italic;
        text-align: center;
        padding: 20px;
        width: 100%;
    }
    
    /* تحسينات للمسلسلات */
    .network-item {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.03);
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .network-logo {
        width: 45px;
        height: auto;
        border-radius: 4px;
    }
    
    .network-name {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
    }
    
    /* تعديلات للهاتف */
    @media (max-width: 768px) {
        .notification {
            top: 70px;
            right: 10px;
            left: 10px;
            max-width: calc(100% - 20px);
        }
        
        .network-item {
            flex-direction: column;
            text-align: center;
        }
    }
`;

// إضافة الـ CSS للمسلسلات
const tvStyleSheet = document.createElement("style");
tvStyleSheet.textContent = tvNotificationStyles;
document.head.appendChild(tvStyleSheet);

// ===========================================
// بدء التشغيل للمسلسلات
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة مشغل المسلسلات
    window.tvSeriesPlayer = new TVSeriesPlayer();
    
    console.log('📺 TOMITO TV Player جاهز للتشغيل!');
    console.log('🎭 خاصية النقر على الممثلين مفعلة!');
});