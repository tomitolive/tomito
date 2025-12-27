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
// قائمة الخوادم (السيرفر الرابع أولاً)
// ===========================================
const SERVERS = [
    {
        id: 'server4',
        name: '🎬 الخادم الرابع',
        url: 'https://vidsrc.me/embed/',
        quality: '720p',
        icon: 'fa-film',
        color: '#f39c12'
    },
    {
        id: 'server1',
        name: '📺 الخادم الأول',
        url: 'https://vidstream.pro/embed/tmdb',
        quality: '1080p',
        icon: 'fa-server',
        color: '#e74c3c'
    },
    {
        id: 'server2',
        name: '⚡ الخادم الثاني',
        url: 'https://vidcloud.pro/embed/tmdb',
        quality: '720p',
        icon: 'fa-bolt',
        color: '#3498db'
    },
    {
        id: 'server3',
        name: '🌐 الخادم الثالث',
        url: 'https://streamtape.com/e/',
        quality: '1080p',
        icon: 'fa-globe',
        color: '#2ecc71'
    },
    {
        id: 'server5',
        name: '🚀 الخادم الخامس',
        url: 'https://multiembed.mov/direct/',
        quality: '1080p',
        icon: 'fa-rocket',
        color: '#9b59b6'
    },
    {
        id: 'server6',
        name: '💎 الخادم السادس',
        url: 'https://2embed.org/embed/',
        quality: '4K',
        icon: 'fa-gem',
        color: '#1abc9c'
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
        this.currentServer = SERVERS[0]; // السيرفر الرابع أولاً
        this.adBlocker = new AdBlocker();
        this.savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '{}');
        
        this.init();
    }
    
    async init() {
        this.showLoading(true);
        
        // استخراج معرف الفيلم
        const params = new URLSearchParams(window.location.search);
        this.movieId = params.get('id');
        
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
        // زر مشاهدة الآن في البانر
        document.getElementById('play-now-btn').addEventListener('click', () => {
            this.playVideo();
        });
        
        // زر حفظ الفيلم
        document.getElementById('save-movie-btn').addEventListener('click', () => {
            this.toggleSaveMovie();
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
        
        // تحديث البانر العلوي
        this.updateBanner(movie);
        
        // تحديث بقية الواجهة
        this.updateMovieDetails(movie, credits, similar);
        
        // تحديث حالة زر الحفظ
        this.updateSaveButton();
    }
    
    updateBanner(movie) {
        const bannerTitle = document.getElementById('banner-title');
        const bannerDesc = document.getElementById('banner-description');
        
        // إذا كان الفيلم "الطوفان العظيم" (ID: 982843)
        if (this.movieId === '982843') {
            bannerTitle.textContent = 'الطوفان العظيم';
            bannerDesc.textContent = 'في ما قد يكون اليوم الأخير على الأرض، سرعان ما يتحول صراع ما بين الحياة أو الموت في شقة غارقة إلى بصيص الأمل الوحيد لنجاة البشرية وبقائها....';
        } else {
            bannerTitle.textContent = movie.title;
            bannerDesc.textContent = movie.overview ? movie.overview.substring(0, 200) + '...' : '';
        }
        
        // تعيين خلفية البانر
        const banner = document.querySelector('.movie-banner .banner-background');
        if (movie.backdrop_path) {
            banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${CONFIG.BASE_IMG}/original${movie.backdrop_path}')`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }
    
    updateMovieDetails(movie, credits, similar) {
        // العنوان
        document.title = `${movie.title} - Tomito`;
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-title-full').textContent = movie.title;
        
        // الملصق
        const poster = document.getElementById('movie-poster');
        poster.src = movie.poster_path 
            ? `${CONFIG.BASE_IMG}/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        
        // الميتاداتا
        this.updateMetaData(movie);
        
        // القصة
        document.getElementById('overview-text').textContent = movie.overview || 'لا يوجد وصف متوفر.';
        
        // الأنواع
        this.updateGenres(movie.genres || []);
        
        // الممثلين
        this.updateCast(credits.cast || []);
        
        // الأفلام المشابهة
        this.updateSimilar(similar.results || []);
    }
    
    updateMetaData(movie) {
        const metaGrid = document.getElementById('movie-meta');
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
        container.innerHTML = genres.map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('');
    }
    
    updateCast(cast) {
        const container = document.getElementById('cast-list');
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
        
        // إضافة مستمعي الأحداث للأفلام المشابهة
        container.querySelectorAll('.similar-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.getAttribute('data-id');
                window.location.href = `watch.html?id=${movieId}`;
            });
        });
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
        if (!this.currentServer || !this.movieId) {
            this.showError('الرجاء اختيار خادم أولاً');
            return;
        }
        
        const videoPlayer = document.getElementById('video-player');
        const videoURL = `${this.currentServer.url}${this.movieId}`;
        
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
    
    toggleSaveMovie() {
        if (!this.movieData) return;
        
        const movie = this.movieData.movie;
        const movieId = movie.id.toString();
        const saveBtn = document.getElementById('save-movie-btn');
        
        if (this.savedMovies[movieId]) {
            // إزالة من المحفوظات
            delete this.savedMovies[movieId];
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
            this.showNotification('تمت إزالة الفيلم من المحفوظات', 'info');
        } else {
            // إضافة للمحفوظات
            this.savedMovies[movieId] = {
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path,
                rating: movie.vote_average,
                year: movie.release_date?.split('-')[0]
            };
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
            this.showNotification('تم حفظ الفيلم في المحفوظات', 'success');
        }
        
        // حفظ في localStorage
        localStorage.setItem('savedMovies', JSON.stringify(this.savedMovies));
    }
    
    updateSaveButton() {
        if (!this.movieData) return;
        
        const movieId = this.movieData.movie.id.toString();
        const saveBtn = document.getElementById('save-movie-btn');
        
        if (this.savedMovies[movieId]) {
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
    window.moviePlayer = new MoviePlayer();
});

// دالة مساعدة للفيلم المحدد
function playMovie(movieId) {
    window.location.href = `watch.html?id=${movieId}`;
}

function toggleSaveMovie(movieId, title, poster, rating, element) {
    // حفظ في localStorage
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