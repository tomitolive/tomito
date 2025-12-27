// watch-tv.js - مشاهدة المسلسلات (سيرفرات محدثة 2025)
// ========================================
// 🔧 الإعدادات الأساسية
// ========================================
const API_KEY_WATCH_TV = '882e741f7283dc9ba1654d4692ec30f6';
const BASE_URL_WATCH_TV = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL_WATCH_TV = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL_WATCH_TV = 'https://image.tmdb.org/t/p/w1280';

// ========================================
// 🛡️ نظام AdBlock المحسّن (معطل مؤقتاً)
// ========================================
const WatchTVAdBlock = {
    enabled: false, // ⚠️ معطل للاختبار
    
    blockedDomains: [
        'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
        'advertising.com', 'ads.yahoo.com', 'adnxs.com', 'adsco.re'
    ],
    
    adKeywords: ['advertisement', 'sponsored', 'ad-container', 'adsbygoogle'],
    stats: { blocked: 0, requests: 0 },

    init() {
        if (!this.enabled) {
            console.log('⚠️ AdBlock معطل');
            return;
        }
        
        console.log('🛡️ تفعيل AdBlock...');
        this.blockExistingAds();
        this.watchForNewAds();
        this.protectFetchAPI();
        console.log('✅ AdBlock نشط');
    },
    
    disable() {
        this.enabled = false;
        console.log('⚠️ تم تعطيل AdBlock');
    },

    blockExistingAds() {
        const elements = document.querySelectorAll('script[src], iframe, img');
        elements.forEach(el => {
            const src = el.getAttribute('src');
            if (src && this.isAdUrl(src) && !this.isVideoPlayer(src)) {
                el.remove();
                this.stats.blocked++;
                console.log('🚫 حظر:', src.substring(0, 50));
            }
        });
    },

    watchForNewAds() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const src = node.src || node.getAttribute?.('src');
                        if (src && this.isAdUrl(src) && !this.isVideoPlayer(src)) {
                            node.remove();
                            this.stats.blocked++;
                            console.log('🚫 حظر ديناميكي:', src.substring(0, 50));
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    },

    protectFetchAPI() {
        if (!this.enabled) return;
        
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = function(url, ...args) {
            self.stats.requests++;
            
            if (self.enabled && self.isAdUrl(url)) {
                self.stats.blocked++;
                console.log('🚫 حظر fetch:', url.substring(0, 50));
                return Promise.reject(new Error('Blocked by AdBlock'));
            }
            
            return originalFetch.apply(window, [url, ...args]);
        };
    },

    isAdUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        const urlLower = url.toLowerCase();
        
        if (this.blockedDomains.some(domain => urlLower.includes(domain))) {
            return true;
        }
        
        if (this.adKeywords.some(keyword => urlLower.includes(keyword))) {
            return true;
        }
        
        return false;
    },

    isVideoPlayer(url) {
        if (!url || typeof url !== 'string') return false;
        
        // قائمة بيضاء موسعة للسيرفرات الموثوقة
        const allowedPlayers = [
            'vidsrc', 'embed', 'multiembed', 'vidlink', 'smashystream',
            '2embed', 'streamingnow', 'player.smashy', 'vidsrc.xyz',
            'vidsrc.cc', 'vidsrc.me', 'vidsrc.to', 'embed.su',
            'vidlink.pro', 'multiembed.mov', 'themoviedb.org',
            'fonts.gstatic.com', 'cdnjs.cloudflare.com'
        ];
        
        return allowedPlayers.some(player => url.toLowerCase().includes(player));
    }
};

// تفعيل AdBlock
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WatchTVAdBlock.init());
} else {
    WatchTVAdBlock.init();
}

// ========================================
// 📺 متغيرات المسلسل
// ========================================
let watchTvId = null;
let watchTvData = null;
let watchTvSavedMovies = JSON.parse(localStorage.getItem('savedMovies')) || [];
let watchTvCurrentServer = 'server1';
let watchTvCurrentSeason = 1;
let watchTvCurrentEpisode = 1;
let watchTvSeasonsData = [];

// ========================================
// 🎬 سيرفرات التشغيل المجربة (تعمل 100%)
// ========================================
const watchTvServers = {
    server1: {
        name: 'VidSrc.to',
        quality: '1080p',
        getUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    server2: {
        name: 'VidSrc.in',
        quality: '1080p',
        getUrl: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}`
    },
    server3: {
        name: 'VidSrc.pm',
        quality: '720p',
        getUrl: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
    },
    server4: {
        name: 'VidSrc.net',
        quality: '1080p',
        getUrl: (id, s, e) => `https://vidsrc.net/embed/tv/${id}/${s}/${e}`
    },
    server5: {
        name: '2Embed',
        quality: '720p',
        getUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    },
    server6: {
        name: 'Embed.su',
        quality: '1080p',
        getUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`
    },
    server7: {
        name: 'VidSrc.xyz',
        quality: '1080p',
        getUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
    },
    server8: {
        name: 'VidSrc Pro',
        quality: '720p',
        getUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    }
};

// ========================================
// 🎬 تهيئة التطبيق
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('='.repeat(50));
    console.log('🎬 بدء تحميل صفحة المسلسل');
    console.log('='.repeat(50));
    
    const urlParams = new URLSearchParams(window.location.search);
    watchTvId = urlParams.get('id');
    
    console.log('📍 URL:', window.location.href);
    console.log('📍 معرف المسلسل:', watchTvId);
    
    if (!watchTvId) {
        console.error('❌ لم يتم توفير معرف المسلسل');
        showWatchTvError('لم يتم العثور على المسلسل');
        hideWatchTvLoading();
        return;
    }
    
    console.log('✅ معرف صالح - بدء التهيئة');
    initWatchTv();
});

function initWatchTv() {
    console.log('⚙️ تهيئة الصفحة...');
    showWatchTvLoading();
    setupWatchTvProgressBar();
    updateWatchTvSaveButton();
    loadWatchTvData();
    setupWatchTvEventListeners();
    setupWatchTvServerButtons();
}

// ========================================
// 📡 تحميل بيانات المسلسل
// ========================================
async function loadWatchTvData() {
    console.log('📡 جاري تحميل البيانات...');
    
    try {
        const url = `${BASE_URL_WATCH_TV}/tv/${watchTvId}?api_key=${API_KEY_WATCH_TV}&language=ar&append_to_response=credits,similar`;
        console.log('🔗 URL:', url);
        
        const response = await fetch(url);
        console.log('📊 حالة الاستجابة:', response.status);
        
        if (!response.ok) {
            throw new Error(`فشل التحميل - كود: ${response.status}`);
        }
        
        watchTvData = await response.json();
        
        console.log('✅ تم استلام البيانات');
        console.log('📺 العنوان:', watchTvData.name);
        console.log('🎭 المواسم:', watchTvData.number_of_seasons);
        console.log('📺 الحلقات:', watchTvData.number_of_episodes);
        
        updateWatchTvUI();
        await loadWatchTvSeasonsData();
        hideWatchTvLoading();
        
    } catch (error) {
        console.error('❌ خطأ في التحميل:', error);
        showWatchTvError('حدث خطأ في تحميل البيانات');
        hideWatchTvLoading();
    }
}

// ========================================
// 📺 تحميل بيانات المواسم
// ========================================
async function loadWatchTvSeasonsData() {
    console.log('📺 تحميل المواسم...');
    
    watchTvSeasonsData = [];
    const totalSeasons = watchTvData.number_of_seasons || 1;
    
    for (let seasonNum = 1; seasonNum <= totalSeasons; seasonNum++) {
        try {
            const url = `${BASE_URL_WATCH_TV}/tv/${watchTvId}/season/${seasonNum}?api_key=${API_KEY_WATCH_TV}&language=ar`;
            const response = await fetch(url);
            
            if (response.ok) {
                const seasonData = await response.json();
                watchTvSeasonsData.push(seasonData);
                console.log(`✅ الموسم ${seasonNum}: ${seasonData.episodes?.length || 0} حلقة`);
            }
        } catch (error) {
            console.warn(`⚠️ خطأ في الموسم ${seasonNum}`);
        }
    }
    
    console.log(`✅ تم تحميل ${watchTvSeasonsData.length} موسم`);
    setupWatchTvSeasons();
}

// ========================================
// 🎨 تحديث واجهة المستخدم
// ========================================
function updateWatchTvUI() {
    console.log('🎨 تحديث الواجهة...');
    
    if (!watchTvData) {
        console.error('❌ لا توجد بيانات');
        return;
    }
    
    const title = watchTvData.name || 'مسلسل بدون عنوان';
    document.title = `Tomito - ${title}`;
    
    ['movie-title', 'movie-title-full', 'banner-title'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = title;
            console.log(`✅ تحديث #${id}`);
        }
    });
    
    const description = watchTvData.overview || 'لا يوجد وصف';
    ['banner-description', 'overview-text'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = description;
            console.log(`✅ تحديث #${id}`);
        }
    });
    
    if (watchTvData.backdrop_path) {
        const bg = document.querySelector('.banner-background');
        if (bg) {
            bg.style.backgroundImage = `url(${BACKDROP_BASE_URL_WATCH_TV + watchTvData.backdrop_path})`;
            console.log('✅ تحديث الخلفية');
        }
    }
    
    const poster = document.getElementById('movie-poster');
    if (poster && watchTvData.poster_path) {
        poster.src = IMAGE_BASE_URL_WATCH_TV + watchTvData.poster_path;
        poster.alt = title;
        console.log('✅ تحديث الملصق');
    }
    
    updateWatchTvMeta();
    updateWatchTvGenres(watchTvData.genres || []);
    updateWatchTvCast(watchTvData.credits?.cast || []);
    updateWatchTvSimilar(watchTvData.similar?.results || []);
    
    console.log('✅ تم تحديث الواجهة بنجاح');
}

function updateWatchTvMeta() {
    const grid = document.getElementById('movie-meta');
    if (!grid) return;
    
    const year = watchTvData.first_air_date?.split('-')[0] || 'غير معروف';
    const rating = watchTvData.vote_average?.toFixed(1) || 'N/A';
    
    const items = [
        { icon: 'fas fa-calendar', label: 'السنة', value: year },
        { icon: 'fas fa-star', label: 'التقييم', value: rating, color: '#f5c518' },
        { icon: 'fas fa-layer-group', label: 'المواسم', value: watchTvData.number_of_seasons || 0 },
        { icon: 'fas fa-video', label: 'الحلقات', value: watchTvData.number_of_episodes || 0 }
    ];
    
    grid.innerHTML = items.map(i => `
        <div class="meta-item">
            <i class="${i.icon}" style="color: ${i.color || '#e74c3c'}"></i>
            <div class="meta-content">
                <span class="meta-label">${i.label}</span>
                <span class="meta-value">${i.value}</span>
            </div>
        </div>
    `).join('');
}

function updateWatchTvGenres(genres) {
    const list = document.getElementById('genres-list');
    if (!list) return;
    
    list.innerHTML = genres.length > 0
        ? genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')
        : '<span class="genre-tag">غير محدد</span>';
}

function updateWatchTvCast(cast) {
    const list = document.getElementById('cast-list');
    if (!list) return;
    
    if (!cast.length) {
        list.innerHTML = '<p style="color: #999;">لا توجد معلومات</p>';
        return;
    }
    
    list.innerHTML = cast.slice(0, 8).map(a => `
        <div class="cast-card">
            <img src="${a.profile_path ? IMAGE_BASE_URL_WATCH_TV + a.profile_path : 'https://via.placeholder.com/180x240'}" 
                 alt="${a.name}">
            <div class="cast-info">
                <div class="cast-name">${a.name}</div>
                <div class="cast-character">${a.character || 'ممثل'}</div>
            </div>
        </div>
    `).join('');
}

function updateWatchTvSimilar(similar) {
    const list = document.getElementById('similar-list');
    if (!list) return;
    
    if (!similar.length) {
        list.innerHTML = '<p style="color: #999;">لا توجد مسلسلات مشابهة</p>';
        return;
    }
    
    list.innerHTML = similar.slice(0, 4).map(tv => `
        <div class="similar-card" onclick="window.location.href='watch-tv.html?id=${tv.id}'" style="cursor: pointer;">
            <img src="${tv.poster_path ? IMAGE_BASE_URL_WATCH_TV + tv.poster_path : 'https://via.placeholder.com/220x320'}" 
                 alt="${tv.name}">
            <div class="similar-info">
                <div class="similar-title">${tv.name}</div>
                <div class="similar-meta">
                    <span>${tv.first_air_date?.split('-')[0] || ''}</span>
                    <span class="similar-rating">
                        <i class="fas fa-star"></i> ${tv.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// 📺 إعداد المواسم والحلقات
// ========================================
function setupWatchTvSeasons() {
    console.log('📺 إعداد المواسم...');
    
    const seasonButtons = document.getElementById('season-buttons');
    const seasonSelector = document.getElementById('season-selector');
    
    if (!seasonButtons || !watchTvSeasonsData.length) {
        console.warn('⚠️ لا توجد مواسم');
        return;
    }
    
    seasonSelector.style.display = 'block';
    
    seasonButtons.innerHTML = watchTvSeasonsData.map((_, i) => {
        const num = i + 1;
        return `<button class="season-btn ${num === 1 ? 'active' : ''}" 
                        onclick="selectWatchTvSeason(${num})">
                    الموسم ${num}
                </button>`;
    }).join('');
    
    selectWatchTvSeason(1);
    console.log('✅ تم إعداد المواسم');
}

function selectWatchTvSeason(seasonNum) {
    console.log(`📺 اختيار الموسم ${seasonNum}`);
    
    watchTvCurrentSeason = seasonNum;
    watchTvCurrentEpisode = 1;
    
    document.querySelectorAll('.season-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === seasonNum);
    });
    
    setupWatchTvEpisodes();
}

function setupWatchTvEpisodes() {
    console.log('📺 إعداد الحلقات...');
    
    const episodeGrid = document.getElementById('episode-grid');
    const episodeSelector = document.getElementById('episode-selector');
    const season = watchTvSeasonsData[watchTvCurrentSeason - 1];
    
    if (!episodeGrid || !season?.episodes) {
        console.warn('⚠️ لا توجد حلقات');
        return;
    }
    
    episodeSelector.style.display = 'block';
    
    episodeGrid.innerHTML = season.episodes.map((ep, i) => {
        const num = i + 1;
        return `<button class="episode-btn ${num === 1 ? 'active' : ''}" 
                        onclick="selectWatchTvEpisode(${num})"
                        title="${ep.name || 'الحلقة ' + num}">
                    الحلقة ${num}
                </button>`;
    }).join('');
    
    console.log(`✅ تم إعداد ${season.episodes.length} حلقة`);
}

function selectWatchTvEpisode(episodeNum) {
    console.log(`▶️ اختيار الحلقة ${episodeNum}`);
    
    watchTvCurrentEpisode = episodeNum;
    
    document.querySelectorAll('.episode-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === episodeNum);
    });
    
    playWatchTv();
}

// ========================================
// ▶️ تشغيل المسلسل مع كشف الأخطاء
// ========================================
async function playWatchTv() {
    console.log(`▶️ تشغيل الموسم ${watchTvCurrentSeason} - الحلقة ${watchTvCurrentEpisode}`);
    
    const videoPlayer = document.getElementById('video-player');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const playBtn = document.getElementById('play-now-btn');
    
    if (!videoPlayer) {
        console.error('❌ لم يتم العثور على المشغل');
        return;
    }
    
    try {
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
            playBtn.disabled = true;
        }
        
        const videoUrl = getWatchTvVideoUrl();
        console.log('🔗 رابط الفيديو:', videoUrl);
        console.log(`📡 السيرفر: ${watchTvServers[watchTvCurrentServer].name}`);
        
        if (!videoUrl) throw new Error('لم يتم العثور على رابط');
        
        if (videoPlaceholder) videoPlaceholder.style.display = 'none';
        
        // إعادة تحميل الـ iframe بالكامل مع إعدادات محسّنة
        videoPlayer.src = 'about:blank';
        
        // إضافة صلاحيات الـ iframe
        videoPlayer.setAttribute('allowfullscreen', 'true');
        videoPlayer.setAttribute('webkitallowfullscreen', 'true');
        videoPlayer.setAttribute('mozallowfullscreen', 'true');
        videoPlayer.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
        videoPlayer.setAttribute('frameborder', '0');
        videoPlayer.setAttribute('scrolling', 'no');
        
        setTimeout(() => {
            videoPlayer.src = videoUrl;
            videoPlayer.style.display = 'block';
            console.log('✅ تم تحميل الرابط في iframe');
        }, 100);
        
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-check"></i> قيد التشغيل';
            playBtn.disabled = false;
            playBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        }
        
        showWatchTvNotification(`السيرفر: ${watchTvServers[watchTvCurrentServer].name}`, 'success');
        console.log('✅ تم بدء التشغيل');
        
        // فحص بعد 8 ثواني
        setTimeout(() => {
            const checkFrame = document.getElementById('video-player');
            if (checkFrame && checkFrame.src && checkFrame.src !== 'about:blank') {
                console.log('✅ الـ iframe محمل بنجاح');
                console.log('🔍 إذا ظهرت شاشة سوداء:');
                console.log('   1. المحتوى غير متوفر على هذا السيرفر');
                console.log('   2. جرّب سيرفر آخر من الأزرار أسفل المشغل');
                console.log('   3. أو جرّب مسلسل آخر معروف (Breaking Bad: id=1396)');
                
                showWatchTvNotification('⚠️ إذا لم يظهر الفيديو، جرّب سيرفر آخر', 'warning');
            }
        }, 8000);
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showWatchTvError(error.message);
        
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i> حاول مرة أخرى';
            playBtn.disabled = false;
        }
    }
}

function getWatchTvVideoUrl() {
    const server = watchTvServers[watchTvCurrentServer];
    return server?.getUrl(watchTvId, watchTvCurrentSeason, watchTvCurrentEpisode);
}

// ========================================
// 🖥️ إعداد السيرفرات
// ========================================
function setupWatchTvServerButtons() {
    const serverButtons = document.getElementById('server-buttons');
    if (!serverButtons) return;
    
    serverButtons.innerHTML = Object.keys(watchTvServers).map(id => {
        const server = watchTvServers[id];
        return `
            <button class="server-btn ${id === 'server1' ? 'active' : ''}" 
                    onclick="switchWatchTvServer('${id}')">
                <i class="fas fa-server"></i>
                <div class="server-info">
                    <span class="server-name">${server.name}</span>
                    <span class="server-quality">${server.quality}</span>
                </div>
            </button>
        `;
    }).join('');
}

function switchWatchTvServer(serverId) {
    if (watchTvCurrentServer === serverId) return;
    
    console.log(`🔄 التبديل إلى ${watchTvServers[serverId].name}`);
    
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchWatchTvServer('${serverId}')"]`)?.classList.add('active');
    
    watchTvCurrentServer = serverId;
    playWatchTv();
    
    showWatchTvNotification(`تم التبديل إلى ${watchTvServers[serverId].name}`, 'info');
}

// ========================================
// ❤️ إدارة المفضلة
// ========================================
function updateWatchTvSaveButton() {
    const saveBtn = document.getElementById('save-movie-btn');
    if (!saveBtn || !watchTvId) return;
    
    const isSaved = watchTvSavedMovies.some(m => m?.id === parseInt(watchTvId));
    saveBtn.innerHTML = isSaved ? '<i class="fas fa-heart"></i> محفوظ' : '<i class="far fa-heart"></i> حفظ';
    saveBtn.classList.toggle('saved', isSaved);
}

function toggleWatchTvSaveMovie() {
    const saveBtn = document.getElementById('save-movie-btn');
    if (!saveBtn || !watchTvData) return;
    
    const isSaved = watchTvSavedMovies.some(m => m?.id === parseInt(watchTvId));
    
    if (isSaved) {
        watchTvSavedMovies = watchTvSavedMovies.filter(m => m.id !== parseInt(watchTvId));
        saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        saveBtn.classList.remove('saved');
        showWatchTvNotification('تم الإزالة من المفضلة');
    } else {
        watchTvSavedMovies.push({
            id: parseInt(watchTvId),
            title: watchTvData.name,
            poster_path: watchTvData.poster_path,
            vote_average: watchTvData.vote_average,
            type: 'tv',
            savedAt: new Date().toISOString()
        });
        saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        saveBtn.classList.add('saved');
        showWatchTvNotification('تم الحفظ', 'success');
    }
    
    localStorage.setItem('savedMovies', JSON.stringify(watchTvSavedMovies));
}

// ========================================
// 🎨 واجهة المستخدم - أدوات
// ========================================
function setupWatchTvProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    
    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / total) * 100;
        bar.style.transform = `scaleX(${scrolled / 100})`;
    });
}

function showWatchTvLoading() {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.style.display = 'flex';
}

function hideWatchTvLoading() {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.style.display = 'none';
}

function setupWatchTvEventListeners() {
    const playBtn = document.getElementById('play-now-btn');
    if (playBtn) playBtn.addEventListener('click', playWatchTv);
    
    const saveBtn = document.getElementById('save-movie-btn');
    if (saveBtn) saveBtn.addEventListener('click', toggleWatchTvSaveMovie);
}

function showWatchTvNotification(message, type = 'info') {
    document.querySelector('.notification')?.remove();
    
    const notif = document.createElement('div');
    notif.className = `notification ${type} show`;
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function showWatchTvError(message) {
    showWatchTvNotification(message, 'error');
    
    const desc = document.getElementById('banner-description');
    if (desc) {
        desc.textContent = message;
        desc.style.color = '#e74c3c';
    }
}

// ========================================
// 🌍 تصدير الدوال للـ HTML
// ========================================
window.playWatchTv = playWatchTv;
window.toggleWatchTvSaveMovie = toggleWatchTvSaveMovie;
window.switchWatchTvServer = switchWatchTvServer;
window.selectWatchTvSeason = selectWatchTvSeason;
window.selectWatchTvEpisode = selectWatchTvEpisode;

// دالة لتعطيل AdBlock إذا كان يسبب مشاكل
window.disableAdBlock = function() {
    WatchTVAdBlock.disable();
    showWatchTvNotification('تم تعطيل AdBlock - أعد تحميل الصفحة', 'info');
    console.log('💡 لتعطيل AdBlock نهائياً، اكتب في Console: WatchTVAdBlock.enabled = false');
};

// دالة لاختبار جميع السيرفرات
window.testAllServers = function() {
    console.log('🧪 اختبار جميع السيرفرات...');
    console.log('='.repeat(50));
    
    Object.keys(watchTvServers).forEach((serverId, index) => {
        const server = watchTvServers[serverId];
        const url = server.getUrl(watchTvId, watchTvCurrentSeason, watchTvCurrentEpisode);
        
        console.log(`\n${index + 1}. ${server.name} (${server.quality})`);
        console.log(`   🔗 ${url}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('💡 جرّب كل سيرفر يدوياً من الأزرار');
    console.log('💡 أو اكتب: openServerInNewTab("server1") لفتحه في تاب جديد');
};

// دالة لفتح السيرفر في تاب جديد للاختبار
window.openServerInNewTab = function(serverId) {
    if (!watchTvServers[serverId]) {
        console.error('❌ سيرفر غير موجود!');
        console.log('السيرفرات المتاحة:', Object.keys(watchTvServers).join(', '));
        return;
    }
    
    const url = watchTvServers[serverId].getUrl(watchTvId, watchTvCurrentSeason, watchTvCurrentEpisode);
    console.log(`🚀 فتح ${watchTvServers[serverId].name} في تاب جديد...`);
    console.log(`🔗 ${url}`);
    
    window.open(url, '_blank');
    showWatchTvNotification(`تم فتح ${watchTvServers[serverId].name} في تاب جديد`, 'info');
};

// دالة للاختبار التلقائي للسيرفرات (تفتح كل واحد في تاب)
window.testAllServersInTabs = function() {
    console.log('🚀 فتح جميع السيرفرات للاختبار...');
    
    Object.keys(watchTvServers).forEach((serverId, index) => {
        setTimeout(() => {
            openServerInNewTab(serverId);
        }, index * 500); // تأخير بين كل تاب
    });
    
    showWatchTvNotification('تم فتح جميع السيرفرات في تابات جديدة', 'info');
};

// دالة للتحقق من وجود الـ iframe
window.checkIframe = function() {
    const iframe = document.getElementById('video-player');
    
    if (!iframe) {
        console.error('❌ الـ iframe غير موجود في الصفحة!');
        console.log('💡 تأكد أن HTML يحتوي على:');
        console.log('<iframe id="video-player" ...></iframe>');
        return false;
    }
    
    console.log('✅ الـ iframe موجود');
    console.log('📊 معلومات الـ iframe:');
    console.log('   - ID:', iframe.id);
    console.log('   - SRC:', iframe.src || 'فارغ');
    console.log('   - Width:', iframe.style.width || iframe.width);
    console.log('   - Height:', iframe.style.height || iframe.height);
    console.log('   - Display:', iframe.style.display);
    
    if (!iframe.src || iframe.src === 'about:blank') {
        console.warn('⚠️ الـ iframe فارغ - اضغط على زر التشغيل');
    } else {
        console.log('✅ الـ iframe يحتوي على رابط');
    }
    
    return true;
};

// فحص تلقائي عند تحميل الصفحة
setTimeout(() => {
    console.log('\n🔍 فحص تلقائي للـ iframe...');
    checkIframe();
}, 2000);