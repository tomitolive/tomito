// sitemap-generator.js
// سكريبت لتوليد Sitemap ديناميكي للأفلام من TMDB API

const API_KEY = 'YOUR_TMDB_API_KEY'; // ضع مفتاح API الخاص بك
const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_URL = 'https://www.tomito.xyz';

/**
 * جلب قائمة الأفلام من TMDB
 */
async function fetchMovies(page = 1) {
    const endpoints = [
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=ar`,
        `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}&language=ar`,
        `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}&language=ar`,
        `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}&language=ar`
    ];

    const allMovies = [];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            allMovies.push(...data.results);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    // إزالة التكرار
    const uniqueMovies = [...new Map(allMovies.map(movie => [movie.id, movie])).values()];
    return uniqueMovies;
}

/**
 * توليد XML للـ Sitemap
 */
function generateSitemapXML(movies) {
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    movies.forEach(movie => {
        const movieUrl = `${SITE_URL}/movie/${movie.id}`;
        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
            : '';
        const backdropUrl = movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
            : '';

        xml += `
    <url>
        <loc>${movieUrl}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>`;

        if (posterUrl) {
            xml += `
        <image:image>
            <image:loc>${posterUrl}</image:loc>
            <image:title>${escapeXml(movie.title)}</image:title>
            <image:caption>${escapeXml(movie.overview || movie.title)}</image:caption>
        </image:image>`;
        }

        if (backdropUrl) {
            xml += `
        <image:image>
            <image:loc>${backdropUrl}</image:loc>
            <image:title>${escapeXml(movie.title)} - خلفية</image:title>
        </image:image>`;
        }

        xml += `
    </url>`;
    });

    xml += `
</urlset>`;

    return xml;
}

/**
 * حماية النصوص في XML
 */
function escapeXml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * توليد Sitemap Index (للمواقع الكبيرة)
 */
function generateSitemapIndex() {
    const today = new Date().toISOString().split('T')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${SITE_URL}/sitemap.xml</loc>
        <lastmod>${today}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${SITE_URL}/sitemap-movies.xml</loc>
        <lastmod>${today}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${SITE_URL}/sitemap-tv.xml</loc>
        <lastmod>${today}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${SITE_URL}/sitemap-genres.xml</loc>
        <lastmod>${today}</lastmod>
    </sitemap>
</sitemapindex>`;
}

/**
 * حفظ Sitemap كملف
 */
function saveSitemap(xml, filename) {
    // في Node.js:
    // const fs = require('fs');
    // fs.writeFileSync(filename, xml);

    // في المتصفح (للتحميل):
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * تشغيل المولد
 */
async function generateSitemap() {
    console.log('🚀 بدء توليد Sitemap...');

    try {
        // جلب الأفلام من صفحات متعددة
        const allMovies = [];
        for (let page = 1; page <= 5; page++) {
            console.log(`📥 جلب الصفحة ${page}...`);
            const movies = await fetchMovies(page);
            allMovies.push(...movies);

            // تأخير لتجنب تجاوز حد الطلبات
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        console.log(`✅ تم جلب ${allMovies.length} فيلم`);

        // توليد XML
        const sitemapXML = generateSitemapXML(allMovies);

        // حفظ الملف
        saveSitemap(sitemapXML, 'sitemap-movies.xml');

        console.log('✅ تم توليد sitemap-movies.xml بنجاح!');

        // توليد Sitemap Index
        const indexXML = generateSitemapIndex();
        saveSitemap(indexXML, 'sitemap-index.xml');

        console.log('✅ تم توليد sitemap-index.xml بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في توليد Sitemap:', error);
    }
}

// تشغيل المولد تلقائياً
// generateSitemap();

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSitemap,
        fetchMovies,
        generateSitemapXML,
        generateSitemapIndex
    };
}
