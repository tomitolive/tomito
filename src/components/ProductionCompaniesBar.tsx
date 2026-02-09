import { Link } from "react-router-dom";
import { PRODUCTION_COMPANIES } from "@/config/productionCompanies";

export const ProductionCompaniesBar = () => {
    return (
        <div className="w-full max-w-5xl mx-auto overflow-hidden my-6 animate-fade-in relative z-10 transition-all duration-500">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 p-4 sm:p-5 bg-card/25 backdrop-blur-lg rounded-2xl border border-primary/10 shadow-xl">
                {PRODUCTION_COMPANIES.map((company, index) => (
                    <div
                        key={company.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        <Link
                            to={`/company/${company.id}`}
                            className="group block"
                        >
                            <div className="relative w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/5 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-primary/20 hover:scale-105 active:scale-95">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="max-w-full max-h-full object-contain filter brightness-100 group-hover:brightness-110 transition-all duration-300"
                                    loading="lazy"
                                />

                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Company name label - subtle always visible */}
                            <div className="text-center mt-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors">
                                {company.nameAr}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
