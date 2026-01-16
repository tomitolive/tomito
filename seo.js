// توليد Sitemap تلقائياً من TMDB
async function generateSitemap() {
    const apiKey = 'YOUR_TMDB_API_KEY';
    const baseUrl = 'https://tomito.xyz';
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // الصفحة الرئيسية
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;
    
    // صفحة المسلسلات
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/tv.html</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.9</priority>\n`;
    sitemap += `  </url>\n`;
    
    // جلب الأفلام الشائعة
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ar`);
    const data = await response.json();
    
    // إضافة كل فيلم
    data.results.forEach(movie => {
        const slug = movie.title.toLowerCase().replace(/\s+/g, '-');
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/movie/${movie.id}/${slug}</loc>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
    });
    
    sitemap += '</urlset>';
    
    // حفظ الملف
    console.log(sitemap);
    return sitemap;
}

// seo-utils.js
// دوال مساعدة لتحسين السيو تلقائياً

/**
 * تحديث Meta Tags ديناميكياً لصفحة الفيلم
 */
function updateMovieSEO(movie) {
    const movieTitle = movie.title || movie.name;
    const year = movie.release_date ? movie.release_date.split('-')[0] : '2025';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
    
    // تحديث Title
    document.title = `فيلم ${movieTitle} (${year}) مترجم HD - Tomito`;
    
    // تحديث Description
    updateMetaTag('description', 
        `شاهد فيلم ${movieTitle} مترجم بجودة عالية HD على Tomito. تقييم ${rating}/10. ${movie.overview ? movie.overview.substring(0, 100) : ''}`
    );
    
    // تحديث Keywords
    updateMetaTag('keywords', 
        `فيلم ${movieTitle}, ${movieTitle} tomito, ${movieTitle} مترجم, tomito, افلام ${year}, مشاهدة ${movieTitle}`
    );
    
    // تحديث Open Graph
    updateOGTag('og:title', `فيلم ${movieTitle} مترجم - Tomito`);
    updateOGTag('og:description', `شاهد الآن على Tomito بجودة HD`);
    updateOGTag('og:image', `https://image.tmdb.org/t/p/w500${movie.poster_path}`);
    updateOGTag('og:url', window.location.href);
    
    // إضافة Schema.org
    addMovieSchema(movie);
}

/**
 * تحديث Meta Tag
 */
function updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
    }
    meta.content = content;
}

/**
 * تحديث Open Graph Tags
 */
function updateOGTag(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

/**
 * إضافة Schema.org JSON-LD للفيلم
 */
function addMovieSchema(movie) {
    // حذف Schema القديم إن وجد
    const oldSchema = document.getElementById('movie-schema');
    if (oldSchema) oldSchema.remove();
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movie.title || movie.name,
        "image": `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        "description": movie.overview,
        "datePublished": movie.release_date,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.vote_average,
            "bestRating": "10",
            "ratingCount": movie.vote_count
        },
        "genre": movie.genres ? movie.genres.map(g => g.name) : [],
        "url": window.location.href
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'movie-schema';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}

/**
 * إضافة Breadcrumb Schema
 */
function addBreadcrumbSchema(items) {
    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-schema';
    script.textContent = JSON.stringify(breadcrumb, null, 2);
    document.head.appendChild(script);
}

/**
 * توليد Alt نصوص للصور محسّنة للسيو
 */
function generateImageAlt(movie) {
    const title = movie.title || movie.name;
    return `فيلم ${title} مترجم - شاهد على Tomito بجودة HD`;
}

/**
 * إنشاء URL صديق للسيو
 */
function createSEOFriendlyURL(title, id) {
    const slug = title
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    return `/movie/${id}/${slug}`;
}

/**
 * إضافة Canonical URL
 */
function addCanonicalURL(url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
    }
    link.href = url;
}

/**
 * مثال استخدام عند تحميل صفحة فيلم:
 */
/*
async function loadMoviePage(movieId) {
    const movie = await fetchMovieDetails(movieId);
    
    // تحديث SEO
    updateMovieSEO(movie);
    
    // إضافة Breadcrumb
    addBreadcrumbSchema([
        { name: 'الرئيسية', url: 'https://tomito.xyz/' },
        { name: 'أفلام', url: 'https://tomito.xyz/movies' },
        { name: movie.title, url: window.location.href }
    ]);
    
    // إضافة Canonical
    addCanonicalURL(window.location.href);
}
*/

// تصدير الدوال
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateMovieSEO,
        addMovieSchema,
        addBreadcrumbSchema,
        generateImageAlt,
        createSEOFriendlyURL,
        addCanonicalURL
    };
}