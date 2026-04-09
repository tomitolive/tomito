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
        <div className="relative w-full py-20 my-10 border-y border-border/10">
            {/* Theme-aware Cinematic Backgrounds */}
            <div className="absolute inset-0 bg-background pointer-events-none opacity-50 transition-colors duration-700" />
            <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[120%] bg-primary/5 blur-[100px] rounded-full animate-float pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[120%] bg-primary/5 blur-[100px] rounded-full animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Header / Title */}
                <div className="flex items-center gap-4 mb-10 group/title">
                    <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.6)] group-hover/title:shadow-[0_0_25px_hsl(var(--primary)/0.8)] transition-all duration-500" />
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/90 group-hover/title:text-foreground transition-colors duration-500">
                        {t("productionCompanies")}
                    </h2>
                </div>

                {/* Horizontal Scrollable Content */}
                <div className="flex gap-4 sm:gap-6 overflow-x-auto pt-10 pb-12 hide-scrollbar snap-x snap-mandatory">
                    {PRODUCTION_COMPANIES.slice(0, 12).map((company, index) => {
                        const isPixar = company.name.toLowerCase() === 'pixar';
                        
                        return (
                            <div
                                key={company.id}
                                className="flex-shrink-0 w-36 sm:w-44 md:w-48 snap-start animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Link
                                    to={`/company/${company.id}`}
                                    className="group relative block aspect-[2/3] transition-all duration-700 z-10 hover:z-20"
                                >
                                    {/* Cinematic Magic Glow - Universal on Hover */}
                                    <div className="absolute inset-0 pointer-events-none overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] bg-primary/20 blur-[50px] animate-pulse pointer-events-none" />
                                        {/* Particles */}
                                        {[...Array(8)].map((_, i) => (
                                            <div 
                                                key={i}
                                                className="absolute w-1 h-1 bg-primary rounded-full blur-[1px] animate-float opacity-0 translate-x-0"
                                                style={{ 
                                                    top: `${Math.random() * 100}%`, 
                                                    left: `${Math.random() * 100}%`,
                                                    animationDelay: `${i * 1.5}s`,
                                                    animationDuration: `${5 + Math.random() * 5}s`
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Main Vertical Card */}
                                    <div className="
                                        relative h-full flex flex-col items-center justify-center p-6 rounded-3xl
                                        backdrop-blur-3xl transition-all duration-700 overflow-hidden
                                        bg-card/20 border border-black/10 dark:border-white/10
                                        group-hover:bg-primary/[0.03] group-hover:border-primary/50 
                                        group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)] group-hover:animate-pulse-glow
                                        group-hover:-translate-y-3 group-hover:scale-[1.05]
                                    ">
                                        {/* Glass Shimmer */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 opacity-30 pointer-events-none" />
                                        
                                        {/* Logo Container - Large Iconic Center */}
                                        <div className="relative w-full h-[70%] flex items-center justify-center mb-4 p-2 transition-transform duration-700 group-hover:scale-110">
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                className={`
                                                    max-w-[100%] max-h-[100%] object-contain transition-all duration-700
                                                    ${isPixar 
                                                        ? 'scale-125 drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]' 
                                                        : 'drop-shadow-[0_0_8px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                                                    }
                                                    saturate-[1.1] contrast-[1.05]
                                                `}
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Symbolic Company Details */}
                                        <div className="
                                            flex flex-col items-center gap-1 transition-all duration-500
                                            translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                                        ">
                                            <p className="text-[10px] sm:text-xs font-black tracking-widest uppercase transition-colors duration-500 text-foreground/60 group-hover:text-primary">
                                                {getCompanyName(company)}
                                            </p>
                                            <div className="w-4 h-1 bg-primary rounded-full opacity-50" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
