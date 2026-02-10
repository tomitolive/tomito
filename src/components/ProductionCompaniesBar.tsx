import { Link } from "react-router-dom";
import { PRODUCTION_COMPANIES } from "@/config/productionCompanies";
import { t, getCurrentLanguage } from "@/lib/tmdb";

export const ProductionCompaniesBar = () => {
    const lang = getCurrentLanguage();

    const getCompanyName = (company: typeof PRODUCTION_COMPANIES[0]) => {
        if (lang === 'ar') return company.nameAr;
        if (lang === 'fr') return company.nameFr || company.name;
        if (lang === 'es') return company.nameEs || company.name;
        return company.name;
    };

    return (
        <div className="w-full max-w-7xl mx-auto my-12 animate-fade-in relative z-10">
            {/* Header / Title */}
            <div className="flex items-center gap-3 px-4 mb-6">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h2 className="text-xl font-bold tracking-tight text-foreground/90">{t("productionCompanies")}</h2>
            </div>

            {/* Content Container with Horizontal Scroll on Mobile */}
            <div className="relative group/bar px-4">
                {/* Fade Masks for horizontal scroll */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none opacity-0 sm:hidden group-hover:opacity-100 transition-opacity" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none opacity-0 sm:hidden group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-4 py-6 overflow-x-auto hide-scrollbar sm:flex-wrap sm:justify-center px-2 flex-nowrap">
                    {PRODUCTION_COMPANIES.map((company, index) => (
                        <div
                            key={company.id}
                            className="flex-shrink-0 animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Link
                                to={`/company/${company.id}`}
                                className="group relative block"
                            >
                                <div className="relative w-32 h-16 sm:w-36 sm:h-20 flex items-center justify-center p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 group overflow-hidden">
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-x-0 -top-full h-full bg-gradient-to-b from-white/10 to-transparent rotate-12 transition-all duration-700 group-hover:top-full" />

                                    <div className="w-full h-full flex items-center justify-center bg-white/95 rounded-lg p-2 shadow-inner">
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/5 transition-opacity duration-500" />
                                </div>

                                {/* Label */}
                                <div className="text-center mt-3 text-[10px] sm:text-xs font-bold text-muted-foreground/40 group-hover:text-primary transition-colors tracking-wide uppercase">
                                    {getCompanyName(company)}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
