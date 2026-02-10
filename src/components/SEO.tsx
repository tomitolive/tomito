import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogType?: string;
}

const defaultKeywords = "أفلام مجانية, مسلسلات مجانية, أفلام عربية, أفلام أجنبية, مسلسلات مترجمة, مشاهدة أونلاين, tomito, تومتو, افلام 2025, مسلسلات رمضان 2025, شاهد فور يو, ايجي بست, ماي سيما";

export function SEO({

    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogType = "website"
}: SEOProps) {
    const fullTitle = title ? `${title} | Tomito` : "Tomito - شاهد أفلام ومسلسلات مجانية أونلاين";

    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            <meta name="keywords" content={keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords} />

            {/* Open Graph */}
            <meta property="og:title" content={ogTitle || fullTitle} />
            {description && <meta property="og:description" content={ogDescription || description} />}
            <meta property="og:type" content={ogType} />

            {/* Twitter */}
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            {description && <meta name="twitter:description" content={ogDescription || description} />}
        </Helmet>
    );
}
