import { Helmet } from 'react-helmet-async';
import { Movie } from '../../services/localData';

interface MovieSEOProps {
    movie: Movie | null | undefined;
    lang?: 'ar' | 'en';
}

export function MovieSEO({ movie, lang = 'ar' }: MovieSEOProps) {
    if (!movie) return null;

    const title = lang === 'ar' ? movie.title_ar : movie.title_en;
    const description = lang === 'ar' ? movie.overview_ar : movie.overview_en;
    const isMovie = movie.type === 'movie';
    const siteUrl = 'https://tomito.xyz'; // Replace with your actual domain

    const schema = {
        "@context": "https://schema.org",
        "@type": isMovie ? "Movie" : "TVSeries",
        "name": title,
        "alternateName": movie.title_en,
        "description": description?.slice(0, 300),
        "image": movie.poster,
        "datePublished": movie.date,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.rating.toFixed(1),
            "bestRating": "10",
            "worstRating": "0"
        },
        "inLanguage": ["ar", "en"]
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title} - Tomito</title>
            <meta name="description" content={description?.slice(0, 155)} />

            {/* Open Graph / Facebook */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description?.slice(0, 200)} />
            <meta property="og:image" content={movie.poster} />
            <meta property="og:type" content={isMovie ? "video.movie" : "video.tv_show"} />
            <meta property="og:url" content={`${siteUrl}/${movie.type}/${movie.id}`} />
            <meta property="og:site_name" content="Tomito" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description?.slice(0, 200)} />
            <meta name="twitter:image" content={movie.poster} />

            {/* Additional SEO */}
            <meta name="keywords" content={`${title}, ${movie.title_en}, فيلم, مسلسل, مشاهدة, أونلاين, ${isMovie ? 'أفلام' : 'مسلسلات'}`} />
            <link rel="canonical" href={`${siteUrl}/${movie.type}/${movie.id}`} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
}
