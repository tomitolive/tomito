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
// قائمة الخوادم (جميع السيرفرات القديمة)
// ===========================================
const SERVERS = [
    {
        id: 'vidsrc_me',
        name: '🌟 VidSrc.me',
        movieUrl: 'https://vidsrc.me/embed/movie/',
        tvUrl: 'https://vidsrc.me/embed/tv/',
        quality: 'HD',
        icon: 'fa-star',
        color: '#16a085',
        type: 'both',
        description: 'بديل ممتاز'
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
        description: 'قاعدة بيانات ضخمة'
    },
    {
        id: '2embed',
        name: '🎞️ 2Embed',
        movieUrl: 'https://www.2embed.cc/embed/',
        tvUrl: 'https://www.2embed.cc/embedtv/',
        quality: 'HD',
        icon: 'fa-play-circle',
        color: '#27ae60',
        type: 'both',
        description: 'سيرفر سريع وموثوق'
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
        description: 'جودة عالية وسرعة ممتازة'
    },
    {
        id: 'autoembed',
        name: '🔄 AutoEmbed',
        movieUrl: 'https://autoembed.cc/embed/movie/',
        tvUrl: 'https://autoembed.cc/embed/tv/',
        quality: 'HD',
        icon: 'fa-sync',
        color: '#8e44ad',
        type: 'both',
        description: 'تحديث تلقائي'
    },
    {
        id: 'hnembed',
        name: '🎥 HnEmbed',
        movieUrl: 'https://hnembed.cc/embed/movie/',
        tvUrl: 'https://hnembed.cc/embed/tv/',
        quality: 'HD',
        icon: 'fa-video',
        color: '#3498db',
        type: 'both',
        description: 'مشغل سلس'
    }
];

// ===========================================
// نظام حجب الإعلانات المحسن
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
// مشغل الفيديو الرئيسي المحسن
// ===========================================
class MoviePlayer {
    constructor() {
        this.movieId = null;
        this.movieData = null;
        this.currentServer = null;
        this.autoPlayEnabled = true;
        this.savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '{}');
        this.contentType = 'movie';
        this.adBlocker = new AdBlocker();
        
        this.init();
    }
    async init() {
        this.showLoading(true);
        
        const params = new URLSearchParams(window.location.search);
        this.movieId = params.get('id');
        this.contentType = params.get('type') || 'movie';
        
        if (!this.movieId) {
            this.showError('لم يتم العثور على معرف الفيلم');
            this.showLoading(false);
            return;
        }
        
        try {
            await this.loadMovieData();
            this.setupEventListeners();
            this.createServerButtons();
            
            // إضافة ستايلات الكروت التفاعلية
            addCastCardStyles();
            
            // تفعيل النقر على الممثلين
            setupCastClickListeners();
            
            // التشغيل التلقائي للسيرفر الأول
            setTimeout(() => {
                if (this.autoPlayEnabled && SERVERS.length > 0) {
                    this.selectServer(SERVERS[0].id, true);
                }
            }, 1000);
            
        } catch (error) {
            console.error('خطأ التهيئة:', error);
            this.showError('حدث خطأ في تحميل الفيلم');
        } finally {
            this.showLoading(false);
        }
    }
    setupEventListeners() {
        // زر التشغيل الرئيسي
        const playBtn = document.getElementById('play-now-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playVideo());
        }
        
        // زر الحفظ
        const saveBtn = document.getElementById('save-movie-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.toggleSaveMovie());
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
        // إضافة تأثيرات للمس على الهاتف
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
            console.error('خطأ في تحميل البيانات:', error);
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
        const { movie, credits, similar } = this.movieData;
        
        // تحديث العنوان
        document.title = `${movie.title} - TOMITO`;
        
        // تحديث الهيدر
        const headerTitle = document.getElementById('movie-title-header');
        if (headerTitle) {
            headerTitle.textContent = movie.title || 'فيلم غير معروف';
        }
        
        // تحديث البانر
        this.updateBanner(movie);
        this.updateBannerMeta(movie);
        
        // تحديث التفاصيل
        this.updateMovieDetails(movie, credits, similar);
        
        // تحديث زر الحفظ
        this.updateSaveButton();
    }
    
    updateBannerMeta(movie) {
        const yearText = document.getElementById('year-text');
        const durationText = document.getElementById('duration-text');
        const ratingText = document.getElementById('rating-text');
        
        if (yearText) yearText.textContent = movie.release_date?.split('-')[0] || '--';
        if (durationText) durationText.textContent = movie.runtime ? `${movie.runtime} دقيقة` : '--';
        if (ratingText) ratingText.textContent = movie.vote_average?.toFixed(1) || '--';
    }
    
    updateBanner(movie) {
        const bannerTitle = document.getElementById('banner-title');
        const bannerDesc = document.getElementById('banner-description');
        
        if (bannerTitle) bannerTitle.textContent = movie.title || 'بدون عنوان';
        if (bannerDesc) bannerDesc.textContent = movie.overview || 'لا يوجد وصف متوفر';
        
        // خلفية البانر
        const banner = document.querySelector('.banner-background');
        if (banner && movie.backdrop_path) {
            banner.style.background = `
                linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                url('${CONFIG.BASE_IMG}/original${movie.backdrop_path}')
            `;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }
    }
    
    updateMovieDetails(movie, credits, similar) {
        // العنوان
        const movieTitle = document.getElementById('movie-title-full');
        if (movieTitle) movieTitle.textContent = movie.title;
        
        // سنة الإصدار
        const releaseYear = document.getElementById('release-year');
        if (releaseYear) releaseYear.textContent = movie.release_date?.split('-')[0] || '--';
        
        // الصورة الرئيسية
        const poster = document.getElementById('movie-poster');
        if (poster) {
            poster.src = movie.poster_path 
                ? `${CONFIG.BASE_IMG}/w500${movie.poster_path}`
                : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
            poster.alt = movie.title || 'صورة الفيلم';
        }
        
        // التقييم في البانر
        const posterRating = document.getElementById('poster-rating');
        if (posterRating) posterRating.textContent = movie.vote_average?.toFixed(1) || '--';
        
        // الميتاداتا
        this.updateMetaData(movie);
        
        // الوصف
        const overviewText = document.getElementById('overview-text');
        if (overviewText) overviewText.textContent = movie.overview || 'لا يوجد وصف متوفر';
        
        // التصنيفات
        this.updateGenres(movie.genres || []);
        
        // فريق التمثيل (باستخدام TMDB فقط)
        this.updateCast(credits.cast || []);
        
        // أفلام مشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateMetaData(movie) {
        const metaGrid = document.getElementById('movie-meta');
        if (!metaGrid) return;
        
        const metaData = [
            { 
                icon: 'calendar', 
                label: 'السنة', 
                value: movie.release_date?.split('-')[0] || '--' 
            },
            { 
                icon: 'clock', 
                label: 'المدة', 
                value: movie.runtime ? `${movie.runtime} دقيقة` : 'غير معروف' 
            },
            { 
                icon: 'star', 
                label: 'التقييم', 
                value: movie.vote_average?.toFixed(1) || '--' 
            },
            { 
                icon: 'users', 
                label: 'الأصوات', 
                value: movie.vote_count ? movie.vote_count.toLocaleString('ar') : '--' 
            },
            { 
                icon: 'language', 
                label: 'اللغة', 
                value: this.getLanguageName(movie.original_language) || '--' 
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
    
    getLanguageName(code) {
        const languages = {
            'en': 'الإنجليزية',
            'ar': 'العربية',
            'es': 'الإسبانية',
            'fr': 'الفرنسية',
            'de': 'الألمانية',
            'it': 'الإيطالية',
            'ja': 'اليابانية',
            'ko': 'الكورية',
            'zh': 'الصينية',
            'ru': 'الروسية',
            'hi': 'الهندية'
        };
        return languages[code] || code?.toUpperCase();
    }
    
    updateGenres(genres) {
        const container = document.getElementById('genres-list');
        if (!container) return;
        
        container.innerHTML = genres.slice(0, 5).map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('');
    }
    updateCast(cast) {
        const container = document.getElementById('cast-list');
        if (!container) return;
    
        // غير الممثلين اللي عندهم صورة
        const actors = cast
            .filter(actor => actor.profile_path)
            .slice(0, 8)
            .map(actor => ({
                id: actor.id,
                name: actor.name || 'غير معروف',
                character: actor.character || 'غير معروف',
                img: `${CONFIG.BASE_IMG}/w200${actor.profile_path}`
            }));
    
        // إلا ما كاين حتى ممثل عندو صورة
        if (actors.length === 0) {
            container.innerHTML = `
                <div class="no-cast">
                    لا توجد صور للممثلين
                </div>
            `;
            return;
        }
    
        container.innerHTML = actors.map(actor => `
            <div class="cast-card" data-actor-id="${actor.id}">
                <img 
                    src="${actor.img}" 
                    class="cast-img" 
                    alt="${actor.name}" 
                    loading="lazy"
                >
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
        
        const similarMovies = movies.slice(0, 4).map(movie => {
            const imgUrl = movie.poster_path 
                ? `${CONFIG.BASE_IMG}/w300${movie.poster_path}`
                : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image';
            
            return {
                id: movie.id,
                title: movie.title || 'بدون عنوان',
                year: movie.release_date?.split('-')[0] || '--',
                rating: movie.vote_average?.toFixed(1) || '--',
                img: imgUrl
            };
        });
        
        container.innerHTML = similarMovies.map(movie => `
            <div class="similar-card" data-id="${movie.id}" onclick="playMovie(${movie.id})">
                <img src="${movie.img}" 
                     class="similar-img" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image'">
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
            <button class="server-btn" 
                    data-server-id="${server.id}"
                    onclick="moviePlayer.selectServer('${server.id}')"
                    style="border-left-color: ${server.color};"
                    title="${server.description}">
                <i class="fas ${server.icon}" style="color: ${server.color}"></i>
                <span class="server-name">${server.name}</span>
                <span class="server-quality">${server.quality}</span>
            </button>
        `).join('');
        
        // تحديد السيرفر الأول تلقائياً
        if (SERVERS.length > 0) {
            const firstServerBtn = container.querySelector('.server-btn');
            if (firstServerBtn) {
                firstServerBtn.classList.add('active');
            }
        }
    }
    
    selectServer(serverId, autoPlay = false) {
        // إزالة النشاط من جميع الأزرار
        document.querySelectorAll('.server-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة النشاط للزر المحدد
        const selectedBtn = document.querySelector(`[data-server-id="${serverId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        // تحديث السيرفر الحالي
        const server = SERVERS.find(s => s.id === serverId);
        if (!server) {
            this.showError('السيرفر المحدد غير موجود');
            return;
        }
        
        this.currentServer = server;
        
        // تحديث النص أعلى الفيديو
        const currentServerText = document.getElementById('current-server');
        if (currentServerText) {
            currentServerText.textContent = `جاري التشغيل: ${server.name}`;
        }
        
        // التشغيل التلقائي (إما تلقائي عند الفتح أو عند النقر على سيرفر)
        if (autoPlay || !this.autoPlayEnabled) {
            setTimeout(() => {
                this.playVideo();
            }, 300);
        }
        
        this.showNotification(`تم التبديل إلى ${server.name}`, 'info');
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
        
        // بناء رابط الفيديو
        let videoURL;
        if (this.contentType === 'tv') {
            videoURL = `${this.currentServer.tvUrl}${this.movieId}`;
        } else {
            videoURL = `${this.currentServer.movieUrl}${this.movieId}`;
        }
        
        console.log('🎬 تشغيل الفيديو:', {
            server: this.currentServer.name,
            url: videoURL,
            type: this.contentType,
            id: this.movieId
        });
        
        this.showNotification(`جاري التشغيل على ${this.currentServer.name}...`, 'info');
        
        // تنظيف المشغل
        videoPlayer.src = '';
        
        // إضافة مؤقت لضمان التحميل الصحيح
        setTimeout(() => {
            try {
                videoPlayer.src = videoURL;
                
                // إضافة معالج للأحداث
                videoPlayer.onload = () => {
                    this.showNotification('✅ الفيديو جاهز للمشاهدة', 'success');
                };
                
                videoPlayer.onerror = (error) => {
                    console.error('خطأ في تحميل الفيديو:', error);
                    this.showNotification('❌ فشل تحميل الفيديو، جرب خادماً آخر', 'error');
                    
                    // محاولة السيرفر التالي تلقائياً
                    this.tryNextServer();
                };
                
            } catch (error) {
                console.error('خطأ في تشغيل الفيديو:', error);
                this.showError('حدث خطأ في تشغيل الفيديو');
            }
        }, 500);
    }
    
    tryNextServer() {
        if (!this.currentServer || SERVERS.length < 2) return;
        
        const currentIndex = SERVERS.findIndex(s => s.id === this.currentServer.id);
        if (currentIndex === -1) return;
        
        // محاولة السيرفر التالي
        const nextIndex = (currentIndex + 1) % SERVERS.length;
        const nextServer = SERVERS[nextIndex];
        
        this.showNotification(`جرب ${nextServer.name}...`, 'info');
        
        setTimeout(() => {
            this.selectServer(nextServer.id);
            setTimeout(() => this.playVideo(), 500);
        }, 1500);
    }
    
    toggleSaveMovie() {
        if (!this.movieData) return;
        
        const movie = this.movieData.movie;
        const movieId = movie.id.toString();
        const saveBtn = document.getElementById('save-movie-btn');
        
        if (this.savedMovies[movieId]) {
            // إزالة من المحفوظات
            delete this.savedMovies[movieId];
            if (saveBtn) {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="far fa-heart"></i> إضافة للمفضلة';
            }
            this.showNotification('تمت إزالة الفيلم من المحفوظات', 'info');
        } else {
            // إضافة إلى المحفوظات
            this.savedMovies[movieId] = {
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path,
                rating: movie.vote_average,
                year: movie.release_date?.split('-')[0]
            };
            if (saveBtn) {
                saveBtn.classList.add('saved');
                saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ في المفضلة';
            }
            this.showNotification('تم حفظ الفيلم في المحفوظات', 'success');
        }
        
        // حفظ في localStorage
        localStorage.setItem('savedMovies', JSON.stringify(this.savedMovies));
    }
    
    updateSaveButton() {
        if (!this.movieData) return;
        
        const movieId = this.movieData.movie.id.toString();
        const saveBtn = document.getElementById('save-movie-btn');
        
        if (saveBtn) {
            if (this.savedMovies[movieId]) {
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
        
        // إنشاء إشعار جديد
       
       
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        console.error('❌ خطأ:', message);
    }
}

// ===========================================
// دوال مساعدة عامة
// ===========================================

// دالة للانتقال إلى فيلم آخر
function playMovie(movieId) {
    window.location.href = `watch.html?id=${movieId}&type=movie`;
}

// دالة ملء الشاشة
function toggleFullscreen() {
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
// بدء التشغيل
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة مشغل الفيديو
    window.moviePlayer = new MoviePlayer();
    
    console.log('🚀 TOMITO Player جاهز للتشغيل!');
});// ===========================================
// دوال صفحة الممثل
// ===========================================

// دالة لفتح صفحة الممثل
function openActorPage(actorId) {
    console.log('🎭 فتح صفحة الممثل:', actorId);
    window.location.href = `actor.html?id=${actorId}`;
}

// جعل جميع كروت الممثلين قابلة للنقر
function setupCastClickListeners() {
    document.addEventListener('click', (e) => {
        const castCard = e.target.closest('.cast-card');
        if (castCard) {
            const actorId = castCard.getAttribute('data-actor-id');
            if (actorId) {
                openActorPage(actorId);
            }
        }
    });
}

// تعديل CSS لجعل الكروت تفاعلية
function addCastCardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .cast-card {
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .cast-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        
        .cast-card:hover .cast-img {
            transform: scale(1.05);
        }
        
        .cast-card:hover .cast-info {
            background: rgba(229, 9, 20, 0.1);
        }
        
        .cast-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(transparent 70%, rgba(0,0,0,0.7));
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        
        .cast-card:hover::after {
            opacity: 1;
        }
        
        .cast-card .cast-info {
            transition: all 0.3s ease;
        }
        
        .cast-card:hover .cast-name {
            color: #e50914;
        }
        
        .cast-card:active {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
}