// ========================================
// CATEGORY PAGE - معالجة التصنيفات من القائمة المنسدلة
// ========================================

// تحليل معلمات URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        type: params.get('type') || 'movies', // 'movies' أو 'series'
        category: params.get('category'),
        subcategory: params.get('subcategory'),
        year: params.get('year'),
        seriesType: params.get('seriesType'),
        seriesCategory: params.get('seriesCategory'),
        seriesView: params.get('seriesView'),
        seriesCategory: params.get('seriesCategory'),
    };
}

// تحويل معلمات التصنيف إلى بيانات TMDB API
function mapCategoryToAPI(params) {
    const isMovies = params.type === 'movies';
    let apiParams = {
        endpoint: '',
        query: {},
        title: '',
        description: ''
    };

    // تحديد نقطة النهاية الأساسية
    if (isMovies) {
        apiParams.endpoint = '/discover/movie';
        apiParams.title = 'أفلام';
    } else {
        apiParams.endpoint = '/discover/tv';
        apiParams.title = 'مسلسلات';
    }

    // معالجة معلمات الأفلام
    if (isMovies) {
        // تصنيفات النوع
        const categoryMap = {
            'action': 28,
            'comedy': 35,
            'drama': 18,
            'horror': 27,
            'romance': 10749
        };

        if (params.category && categoryMap[params.category]) {
            apiParams.query.with_genres = categoryMap[params.category];
            
            // تحديث العنوان
            const categoryTitles = {
                'action': 'أفلام أكشن',
                'comedy': 'أفلام كوميديا',
                'drama': 'أفلام دراما',
                'horror': 'أفلام رعب',
                'romance': 'أفلام رومانسية'
            };
            apiParams.title = categoryTitles[params.category] || 'أفلام';
            apiParams.description = `تصفح أفضل ${categoryTitles[params.category]}`;
        }

        // معالجة التصنيفات الفرعية
        if (params.subcategory) {
            switch(params.subcategory) {
                case 'new':
                    apiParams.endpoint = '/movie/now_playing';
                    apiParams.title = 'الأفلام الجديدة';
                    apiParams.description = 'أحدث الأفلام المعروضة حالياً';
                    break;
                case 'popular':
                    apiParams.endpoint = '/movie/popular';
                    apiParams.title = 'الأفلام الأكثر مشاهدة';
                    apiParams.description = 'الأفلام الأكثر شعبية حالياً';
                    break;
                case 'top-rated':
                    apiParams.endpoint = '/movie/top_rated';
                    apiParams.title = 'الأفلام الأعلى تقييماً';
                    apiParams.description = 'أفضل الأفلام تقييماً حسب الجمهور';
                    break;
                case 'upcoming':
                    apiParams.endpoint = '/movie/upcoming';
                    apiParams.title = 'الأفلام القادمة';
                    apiParams.description = 'الأفلام التي ستعرض قريباً';
                    break;
                case 'trending':
                    apiParams.endpoint = '/trending/movie/week';
                    apiParams.title = 'الأفلام الشائعة';
                    apiParams.description = 'الأفلام الأكثر تداولاً هذا الأسبوع';
                    break;
            }
        }

        // معالجة السنة
        if (params.year) {
            apiParams.query.primary_release_year = params.year;
            apiParams.title = `أفلام سنة ${params.year}`;
            apiParams.description = `أفضل أفلام سنة ${params.year}`;
        }

    } else {
        // معالجة معلمات المسلسلات
        console.log('📺 معلمات المسلسلات:', params);

        // أنواع المسلسلات (عربية، تركية، إلخ) - هذه تحتاج منطق خاص
        if (params.seriesType) {
            const seriesTypeMap = {
                'arabic': { title: 'مسلسلات عربية', query: { with_original_language: 'ar' } },
                'turkish': { title: 'مسلسلات تركية', query: { with_original_language: 'tr' } },
                'american': { title: 'مسلسلات أمريكية', query: { with_original_language: 'en', with_origin_country: 'US' } },
                'korean': { title: 'مسلسلات كورية', query: { with_original_language: 'ko' } },
                'anime': { title: 'أنمي', query: { with_keywords: '210024' } } // Anime keyword ID
            };

            if (seriesTypeMap[params.seriesType]) {
                const typeInfo = seriesTypeMap[params.seriesType];
                apiParams.title = typeInfo.title;
                apiParams.description = `أفضل ${typeInfo.title}`;
                
                // دمج الاستعلامات
                Object.assign(apiParams.query, typeInfo.query);
            }
        }

        // تصنيفات المسلسلات
        const seriesCategoryMap = {
            'drama': 18,
            'comedy': 35,
            'action': 10759, // Action & Adventure
            'fantasy': 10765, // Sci-Fi & Fantasy
            'romance': 10749
        };

        if (params.seriesCategory && seriesCategoryMap[params.seriesCategory]) {
            apiParams.query.with_genres = seriesCategoryMap[params.seriesCategory];
            
            const categoryTitles = {
                'drama': 'مسلسلات دراما',
                'comedy': 'مسلسلات كوميديا',
                'action': 'مسلسلات أكشن ومغامرة',
                'fantasy': 'مسلسلات فانتازيا',
                'romance': 'مسلسلات رومانسية'
            };
            apiParams.title = categoryTitles[params.seriesCategory] || 'مسلسلات';
            apiParams.description = `تصفح أفضل ${categoryTitles[params.seriesCategory]}`;
        }

        // معالجة حالة المشاهدة
        if (params.seriesView) {
            switch(params.seriesView) {
                case 'ongoing':
                    apiParams.query.with_status = 'Returning Series';
                    apiParams.title = 'مسلسلات جارية';
                    apiParams.description = 'مسلسلات لا تزال مستمرة في العرض';
                    break;
                case 'completed':
                    apiParams.query.with_status = 'Ended';
                    apiParams.title = 'مسلسلات مكتملة';
                    apiParams.description = 'مسلسلات انتهت من العرض';
                    break;
                case 'new':
                    apiParams.endpoint = '/tv/on_the_air';
                    apiParams.title = 'مسلسلات جديدة';
                    apiParams.description = 'أحدث المسلسلات المعروضة حالياً';
                    break;
                case 'popular':
                    apiParams.endpoint = '/tv/popular';
                    apiParams.title = 'المسلسلات الأكثر مشاهدة';
                    apiParams.description = 'المسلسلات الأكثر شعبية حالياً';
                    break;
                case 'top-rated':
                    apiParams.endpoint = '/tv/top_rated';
                    apiParams.title = 'المسلسلات الأعلى تقييماً';
                    apiParams.description = 'أفضل المسلسلات تقييماً حسب الجمهور';
                    break;
            }
        }
        
        // إضافة استعلامات إضافية للمسلسلات
        apiParams.query.include_adult = false;
        apiParams.query.include_video = false;
    }

    return apiParams;
}

// تحميل العناصر بناءً على التصنيف
async function loadCategoryItems() {
    showProgress();
    
    const params = getUrlParams();
    const apiConfig = mapCategoryToAPI(params);
    
    try {
        let url = `${BASE_URL}${apiConfig.endpoint}?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&page=${currentPage}`;
        
        // إضافة معلمات إضافية
        Object.keys(apiConfig.query).forEach(key => {
            url += `&${key}=${apiConfig.query[key]}`;
        });
        
        // إضافة نوع المحتوى للطلب
        if (params.type === 'series') {
            url += '&sort_by=popularity.desc';
        }
        
        console.log(`📡 جاري تحميل من: ${url}`);
        console.log('⚙️ إعدادات API:', apiConfig);
        
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📊 بيانات الاستجابة:', {
            total_results: data.total_results,
            total_pages: data.total_pages,
            items_count: data.results?.length || 0
        });
        
        // تحديث عنوان الصفحة
        updatePageTitle(apiConfig.title, apiConfig.description);
        
        // إذا لم توجد نتائج، جرب البديل
        if (!data.results || data.results.length === 0) {
            console.log('⚠️ لا توجد نتائج، جلب محتوى شعبي بدلاً من ذلك');
            await loadFallbackContent(params.type);
            return;
        }
        
        // عرض العناصر
        displayItems(data.results, params.type);
        
        // تحديث التصفح
        totalPages = Math.min(data.total_pages, 500); // TMDB يحدد بـ 500 صفحة كحد أقصى
        updatePagination();
        
        console.log(`✅ تم تحميل ${data.results.length} عنصر`);
        
    } catch (error) {
        console.error("❌ خطأ في تحميل التصنيف:", error);
        showNotification('حدث خطأ في تحميل البيانات', 'error');
        await loadFallbackContent(params.type);
    } finally {
        hideProgress();
    }
}

// تحميل محتوى بديل إذا فشل التحميل
async function loadFallbackContent(type) {
    try {
        const isMovie = type === 'movies';
        const endpoint = isMovie ? '/movie/popular' : '/tv/popular';
        const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}&page=${currentPage}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            displayItems(data.results, type);
            totalPages = Math.min(data.total_pages, 500);
            updatePagination();
            
            // تحديث العنوان للإشارة إلى أن هذا محتوى شعبي
            const titleElement = document.querySelector('.title h1');
            if (titleElement) {
                const originalTitle = titleElement.textContent;
                titleElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${originalTitle} (محتوى شعبي)`;
            }
            
            showNotification('عرض محتوى شعبي بسبب عدم توفر النتائج المحددة', 'info');
        } else {
            displayNoItems();
        }
    } catch (error) {
        console.error("❌ خطأ في تحميل المحتوى البديل:", error);
        displayNoItems();
    }
}

// تحديث عنوان الصفحة
function updatePageTitle(title, description = '') {
    // تحديث عنوان الصفحة في المتصفح
    document.title = `${title} | Tomito`;
    
    // تحديث العنوان الرئيسي في الصفحة
    const pageHeader = document.querySelector('.title h1');
    if (pageHeader) {
        pageHeader.innerHTML = `<i class="fas ${title.includes('أفلام') ? 'fa-film' : 'fa-tv'}"></i> ${title}`;
    }
    
    // تحديث الوصف إن وجد
    const pageDescription = document.querySelector('.page');
    if (pageDescription && description) {
        pageDescription.textContent = description;
    }
}

// عرض العناصر في الشبكة
function displayItems(items, type) {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!items || items.length === 0) {
        displayNoItems();
        return;
    }
    
    // إضافة فئة للشبكة بناءً على النوع
    grid.className = `items-grid ${type}`;
    
    items.forEach((item, index) => {
        const card = createItemCard(item, type);
        card.style.animationDelay = `${index * 0.05}s`;
        grid.appendChild(card);
    });
}

// إنشاء بطاقة العنصر
function createItemCard(item, type) {
    const isMovie = type === 'movies';
    
    const card = document.createElement("div");
    card.className = "item-card";
    card.setAttribute('data-id', item.id);
    card.setAttribute('data-type', isMovie ? 'movie' : 'tv');
    
    // اختيار الصورة المناسبة
    let posterUrl;
    if (item.poster_path) {
        posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    } else if (item.backdrop_path) {
        posterUrl = `https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
    } else {
        // صورة افتراضية بناءً على النوع
        posterUrl = isMovie 
            ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            : 'https://images.unsplash.com/photo-1560972550-aba3456b5564?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    }
    
    const title = isMovie ? item.title : item.name;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    
    const releaseDate = isMovie ? item.release_date : item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'غير معروف';
    
    // التحقق إذا كان محفوظاً
    const savedItems = isMovie ? savedMovies : savedSeries;
    const isSaved = savedItems.some(savedItem => savedItem.id === item.id);
    const saveIcon = isSaved ? 'fas fa-heart' : 'far fa-heart';
    const saveClass = isSaved ? 'saved' : '';
    
    // اختصار الوصف
    const overview = item.overview 
        ? (item.overview.length > 120 ? item.overview.substring(0, 120) + '...' : item.overview)
        : isMovie ? 'فيلم مثير للاهتمام' : 'مسلسل مثير للاهتمام';
    
    card.innerHTML = `
        <div class="item-card-inner">
            <div class="item-poster-container">
                <img src="${posterUrl}" alt="${title}" class="item-poster" loading="lazy">
                <div class="item-badge">
                    ${isMovie ? '<i class="fas fa-film"></i>' : '<i class="fas fa-tv"></i>'}
                </div>
                <div class="item-rating-badge">
                    <i class="fas fa-star"></i> ${rating}
                </div>
            </div>
            
            <div class="item-info">
                <h3 class="item-title" title="${title}">${title}</h3>
                <div class="item-meta">
                    <span class="item-year">
                        <i class="fas fa-calendar"></i> ${year}
                    </span>
                    <span class="item-type">
                        ${isMovie ? 'فيلم' : 'مسلسل'}
                    </span>
                </div>
                
                <p class="item-overview">${overview}</p>
                
                <div class="item-actions">
                    <button class="watch-btn" onclick="goToItem(${item.id}, '${isMovie ? 'movie' : 'tv'}')">
                        <i class="fas fa-play"></i> مشاهدة
                    </button>
                   
                  
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// دالة للانتقال لمشاهدة العنصر
function goToItem(id, type) {
    if (type === 'movie') {
        window.location.href = `watch.html?id=${id}&type=movie`;
    } else {
        window.location.href = `watch-tv.html?id=${id}`;
    }
}

// دالة لحفظ العنصر
function toggleSaveItem(id, title, posterPath, rating, type, btn) {
    const item = { 
        id, 
        title, 
        poster_path: posterPath, 
        vote_average: rating,
        type: type,
        saved_date: new Date().toISOString()
    };
    
    let savedItems = type === 'movie' ? savedMovies : savedSeries;
    let storageKey = type === 'movie' ? 'savedMovies' : 'savedSeries';
    
    const index = savedItems.findIndex(savedItem => savedItem.id === id);
    if (index === -1) {
        savedItems.push(item);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add("saved");
        }
        showNotification(`تم إضافة "${title}" إلى المفضلة`);
    } else {
        savedItems.splice(index, 1);
        if (btn) {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove("saved");
        }
        showNotification(`تم إزالة "${title}" من المفضلة`);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(savedItems));
    
    // تحديث المتغيرات العامة
    if (type === 'movie') {
        savedMovies = savedItems;
    } else {
        savedSeries = savedItems;
    }
}

// دالة لعرض معلومات العنصر
async function showItemInfo(id, type) {
    try {
        const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=${DISPLAY_LANGUAGE}`;
        const res = await fetch(url);
        const data = await res.json();
        
        // يمكنك إضافة نافذة منبثقة أو صفحة تفاصيل هنا
        console.log('معلومات العنصر:', data);
        
        // مثال: فتح صفحة التفاصيل
        window.open(`details.html?id=${id}&type=${type}`, '_blank');
        
    } catch (error) {
        console.error("❌ خطأ في تحميل التفاصيل:", error);
        showNotification('حدث خطأ في تحميل التفاصيل', 'error');
    }
}

// عرض رسالة لا توجد عناصر
function displayNoItems() {
    const grid = document.getElementById('items-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="no-items">
                <i class="fas fa-film"></i>
                <h3>لا توجد نتائج</h3>
                <p>لم يتم العثور على عناصر في هذا التصنيف</p>
                <button class="back-btn" onclick="window.history.back()">
                    <i class="fas fa-arrow-right"></i> العودة
                </button>
            </div>
        `;
    }
}

// تحديث التصفح
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) {
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pagination.innerHTML = '';
    
    // زر السابق
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i> السابق';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);
    
    // أزرار الصفحات
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // ضبط startPage إذا كان نطاق الصفحات قصيراً
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // صفحة البداية
    if (startPage > 1) {
        const firstBtn = createPageButton(1);
        pagination.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }
    
    // صفحات وسيطة
    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageButton(i));
    }
    
    // صفحة النهاية
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
        
        const lastBtn = createPageButton(totalPages);
        pagination.appendChild(lastBtn);
    }
    
    // زر التالي
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn next';
    nextBtn.innerHTML = 'التالي <i class="fas fa-chevron-left"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

function createPageButton(pageNum) {
    const btn = document.createElement('button');
    btn.className = `pagination-page ${pageNum === currentPage ? 'active' : ''}`;
    btn.textContent = pageNum;
    btn.onclick = () => changePage(pageNum);
    return btn;
}

// تغيير الصفحة
// تغيير الصفحة - إصلاح النسخة
function changePage(newPage) {
    console.log(`🔄 تغيير الصفحة من ${currentPage} إلى ${newPage}`);
    
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
        console.log('⏹️ تغيير الصفحة مرفوض:', { newPage, currentPage, totalPages });
        return;
    }
    
    currentPage = newPage;
    
    // تحديث URL مع إضافة/تحديث معلمة الصفحة
    const url = new URL(window.location);
    url.searchParams.set('page', newPage);
    
    // تحديث عنوان URL بدون إعادة تحميل كاملة
    window.history.pushState({ page: newPage }, '', url);
    
    console.log(`📄 تم تحديث URL إلى: ${url}`);
    
    // تحميل العناصر الجديدة
    loadCategoryItems();
    
    // التمرير إلى أعلى الشبكة بعد تحميل العناصر
    setTimeout(() => {
        const grid = document.getElementById('items-grid');
        const header = document.querySelector('.page-header');
        if (grid) {
            const scrollTo = header ? header.offsetTop : grid.offsetTop;
            window.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }
    }, 500);
}

// تهيئة متغيرات الصفحة
let currentPage = 1;
let totalPages = 1;

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 تهيئة صفحة التصنيفات...');
    
    // الحصول على معلمة الصفحة من URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = parseInt(urlParams.get('page')) || 1;
    
    // تحميل العناصر بناءً على التصنيف
    loadCategoryItems();
    
    // إعداد تصفح التاريخ للتعامل مع أزرار التقدم والرجوع
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        currentPage = parseInt(urlParams.get('page')) || 1;
        loadCategoryItems();
    });
    
    // إضافة أزرار تصفح إضافية في الأسفل
    addBottomNavigation();
    setupCategoryNavigation();

});

// إضافة أزرار تصفح إضافية
function addBottomNavigation() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    
    // زر العودة للأعلى
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.id = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // إظهار/إخفاء زر العودة للأعلى
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    
    document.body.appendChild(scrollToTopBtn);
}

// CSS إضافي
const style = document.createElement('style');
style.textContent = `
    /* تحسينات للبطاقات */
    .item-card {
        background: var(--card-bg);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        height: 100%;
    }
    
    .item-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }
    
    .item-poster-container {
        position: relative;
        height: 250px;
        overflow: hidden;
    }
    
    .item-poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    
    .item-card:hover .item-poster {
        transform: scale(1.1);
    }
    
    .item-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: var(--primary-color);
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }
    
    .item-rating-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #ffd700;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .item-info {
        padding: 15px;
    }
    
    .item-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--text-primary);
        line-height: 1.4;
        height: 45px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    
    .item-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        color: var(--text-secondary);
    }
    
    .item-overview {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 15px;
        line-height: 1.5;
        height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    
    .item-actions {
        display: flex;
        gap: 8px;
    }
    
    .item-actions button {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.3s ease;
    }
    
    .watch-btn {
        background: var(--primary-color);
        color: white;
    }
    
    .watch-btn:hover {
        background: var(--secondary-color);
    }
    
    .save-btn {
        background: var(--bg-secondary);
        color: var(--text-primary);
        width: 40px;
    }
    
    .save-btn.saved {
        background: #e74c3c;
        color: white;
    }
    
    .save-btn:hover {
        background: var(--primary-color);
        color: white;
    }
    
    .info-btn {
        background: var(--bg-secondary);
        color: var(--text-primary);
        width: 40px;
    }
    
    .info-btn:hover {
        background: var(--primary-color);
        color: white;
    }
    
    /* زر العودة للأعلى */
    #scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        display: none;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    }
    
    #scroll-to-top:hover {
        background: var(--secondary-color);
        transform: translateY(-5px);
    }
    
    /* زر العودة */
    .back-btn {
        margin-top: 15px;
        padding: 10px 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .back-btn:hover {
        background: var(--secondary-color);
    }
`;

document.head.appendChild(style);

// إضافة المفاتيح للنافذة
window.goToItem = goToItem;
window.toggleSaveItem = toggleSaveItem;
window.showItemInfo = showItemInfo;
window.changePage = changePage;
