// movie-seo.js - ضع هذا الملف في مجلد js/
// واستدعيه في صفحة movie.html

/**
 * تحديث SEO لصفحة الفيلم بشكل ديناميكي
 * @param {Object} movie - بيانات الفيلم من TMDB API
 */
function updateMovieSEO(movie) {
    const movieTitle = movie.title || movie.name;
    const year = movie.release_date ? movie.release_date.split('-')[0] : '';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
    
    // 1. تحديث Title مع كلمة Tomito
    document.title = `Tomito | ${movieTitle} ${year} مترجم HD - مشاهدة فيلم ${movieTitle}`;
    
    // 2. تحديث Description
    updateOrCreateMetaTag('name', 'description', 
        `شاهد فيلم ${movieTitle} ${year} مترجم بجودة عالية HD على موقع Tomito. ${movie.overview || 'أحدث الأفلام والمسلسلات المترجمة بجودة عالية.'} تقييم IMDb: ${rating}/10`
    );
    
    // 3. تحديث Keywords مع Tomito
    const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : '';
    updateOrCreateMetaTag('name', 'keywords',
        `tomito, tomito ${movieTitle}, فيلم ${movieTitle}, مشاهدة ${movieTitle}, ${movieTitle} مترجم, ${movieTitle} ${year}, tomito افلام, ${movieTitle} tomito, افلام tomito, ${genres}, مشاهدة افلام اون لاين`
    );
    
    // 4. Open Graph Tags
    updateOrCreateMetaTag('property', 'og:type', 'video.movie');
    updateOrCreateMetaTag('property', 'og:site_name', 'Tomito');
    updateOrCreateMetaTag('property', 'og:title', `${movieTitle} ${year} - Tomito`);
    updateOrCreateMetaTag('property', 'og:description', 
        `شاهد ${movieTitle} مترجم بجودة عالية على Tomito - تقييم ${rating}/10`
    );
    
    if (movie.poster_path) {
        updateOrCreateMetaTag('property', 'og:image', 
            `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        );
        updateOrCreateMetaTag('property', 'og:image:width', '780');
        updateOrCreateMetaTag('property', 'og:image:height', '1170');
    }
    
    updateOrCreateMetaTag('property', 'og:url', window.location.href);
    updateOrCreateMetaTag('property', 'og:locale', 'ar_AR');
    
    // 5. Twitter Card
    updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('name', 'twitter:site', '@tomito');
    updateOrCreateMetaTag('name', 'twitter:title', `${movieTitle} ${year} - Tomito`);
    updateOrCreateMetaTag('name', 'twitter:description', 
        `شاهد ${movieTitle} مترجم على Tomito`
    );
    
    if (movie.poster_path) {
        updateOrCreateMetaTag('name', 'twitter:image', 
            `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        );
    }
    
    // 6. Canonical URL
    updateCanonicalURL(window.location.href);
    
    // 7. Schema.org JSON-LD
    addMovieSchema(movie);
}

/**
 * دالة مساعدة لتحديث أو إنشاء Meta Tag
 */
function updateOrCreateMetaTag(attribute, attributeValue, content) {
    let meta = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attributeValue);
        document.head.appendChild(meta);
    }
    
    meta.content = content;
}

/**
 * تحديث Canonical URL
 */
function updateCanonicalURL(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    
    canonical.href = url;
}

/**
 * إضافة Schema.org للفيلم (JSON-LD)
 */
function addMovieSchema(movie) {
    const movieTitle = movie.title || movie.name;
    const year = movie.release_date ? movie.release_date.split('-')[0] : '';
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movieTitle,
        "alternateName": [`tomito ${movieTitle}`, `${movieTitle} tomito`, `فيلم ${movieTitle}`],
        "image": movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : '',
        "description": movie.overview || `شاهد ${movieTitle} على Tomito`,
        "datePublished": movie.release_date || year,
        "genre": movie.genres ? movie.genres.map(g => g.name) : [],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.vote_average || 0,
            "ratingCount": movie.vote_count || 0,
            "bestRating": "10",
            "worstRating": "1"
        },
        "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
        "url": window.location.href,
        "potentialAction": {
            "@type": "WatchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": window.location.href,
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform",
                    "http://schema.org/IOSPlatform",
                    "http://schema.org/AndroidPlatform"
                ]
            }
        },
        "provider": {
            "@type": "Organization",
            "name": "Tomito",
            "url": "https://tomito.xyz"
        }
    };
    
    // إزالة Schema القديم إن وجد
    const oldSchema = document.querySelector('script[data-schema="movie"]');
    if (oldSchema) {
        oldSchema.remove();
    }
    
    // إضافة Schema جديد
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-schema', 'movie');
    scriptTag.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(scriptTag);
}

/**
 * إنشاء Breadcrumbs Schema
 */
function addBreadcrumbSchema(movieTitle) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Tomito",
                "item": "https://tomito.xyz"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "أفلام",
                "item": "https://tomito.xyz/movies"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": movieTitle,
                "item": window.location.href
            }
        ]
    };
    
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-schema', 'breadcrumb');
    scriptTag.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(scriptTag);
}

/**
 * إضافة محتوى SEO نصي في الصفحة
 */
function addSEOContent(movie) {
    const movieTitle = movie.title || movie.name;
    const year = movie.release_date ? movie.release_date.split('-')[0] : '';
    const genres = movie.genres ? movie.genres.map(g => g.name).join('، ') : 'أكشن ودراما';
    
    const seoHTML = `
        <section class="seo-content" style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
            <h2 style="color: #ffd700; margin-bottom: 15px;">
                <i class="fas fa-film"></i> مشاهدة فيلم ${movieTitle} على Tomito
            </h2>
            <p style="line-height: 1.8; margin-bottom: 15px;">
                يوفر لك موقع <strong>Tomito</strong> مشاهدة فيلم <strong>${movieTitle} ${year}</strong> مترجم بجودة عالية HD.
                يمكنك مشاهدة الفيلم مباشرة بدون تحميل على <strong>Tomito</strong>، الموقع الأول للأفلام والمسلسلات المترجمة في الوطن العربي.
            </p>
            
            <h3 style="color: #ffd700; margin: 20px 0 10px;">
                <i class="fas fa-star"></i> لماذا تشاهد ${movieTitle} على Tomito؟
            </h3>
            <ul style="line-height: 2; padding-right: 20px;">
                <li>جودة عالية HD وFull HD</li>
                <li>ترجمة احترافية ودقيقة</li>
                <li>مشاهدة مباشرة بدون تقطيع</li>
                <li>تحديث يومي للأفلام الجديدة</li>
                <li>واجهة سهلة وسريعة</li>
            </ul>
            
            <p style="line-height: 1.8; margin-top: 15px;">
                فيلم <strong>${movieTitle}</strong> من تصنيف ${genres}، وهو من الأفلام المميزة لعام ${year}.
                شاهد الآن على <strong>Tomito</strong> واستمتع بأفضل تجربة مشاهدة.
            </p>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,215,0,0.1); border-radius: 8px; border-right: 4px solid #ffd700;">
                <strong style="color: #ffd700;">💡 نصيحة:</strong>
                ابحث عن أي فيلم بكتابة "tomito" + اسم الفيلم في جوجل للوصول السريع!
            </div>
        </section>
    `;
    
    // البحث عن مكان مناسب لإضافة المحتوى
    const container = document.querySelector('.movie-details') || 
                     document.querySelector('.container') || 
                     document.querySelector('main');
    
    if (container) {
        container.insertAdjacentHTML('beforeend', seoHTML);
    }
}

/**
 * الدالة الرئيسية - استدعيها بعد تحميل بيانات الفيلم
 */
function initMovieSEO(movie) {
    if (!movie) return;
    
    // تحديث جميع عناصر SEO
    updateMovieSEO(movie);
    addBreadcrumbSchema(movie.title || movie.name);
    addSEOContent(movie);
    
    console.log('✅ SEO تم تحديث بيانات الـ');
}

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMovieSEO, updateMovieSEO };
}