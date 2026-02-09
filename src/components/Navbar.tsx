import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search, Film, Tv, Menu, X, ChevronDown, Home,
  Zap, Laugh, Drama, Ghost, Heart, Rocket,
  Swords, Sparkles, Users, Clapperboard
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { t } from "@/lib/tmdb";
import { PRODUCTION_COMPANIES } from "@/config/productionCompanies";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const movieCategories = (translate: typeof t) => [
  { id: 28, name: translate("moviesAction" as any) || "أكشن", icon: Zap },
  { id: 35, name: translate("moviesComedy" as any) || "كوميديا", icon: Laugh },
  { id: 18, name: translate("moviesDrama" as any) || "دراما", icon: Drama },
  { id: 27, name: translate("moviesHorror" as any) || "رعب", icon: Ghost },
  { id: 10749, name: translate("moviesRomance" as any) || "رومانسي", icon: Heart },
  { id: 878, name: translate("moviesSciFi" as any) || "خيال علمي", icon: Rocket },
];

const tvCategories = (translate: typeof t) => [
  { id: 10759, name: translate("tvAction" as any) || "أكشن", icon: Swords },
  { id: 35, name: translate("tvComedy" as any) || "كوميديا", icon: Laugh },
  { id: 18, name: translate("tvDrama" as any) || "دراما", icon: Drama },
  { id: 10765, name: translate("tvSciFi" as any) || "خيال علمي", icon: Sparkles },
  { id: 80, name: translate("tvCrime" as any) || "جريمة", icon: Search },
  { id: 10751, name: translate("tvFamily" as any) || "عائلي", icon: Users },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  /* State for delayed dropdown close */
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "navbar-solid shadow-lg" : "navbar-blur"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-foreground"
              )}
            >
              <Home className="w-4 h-4" />
              {t("home")}
            </Link>

            {/* Movies Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("movies")}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                <Film className="w-4 h-4" />
                {t("movies")}
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "movies" && "rotate-180")} />
              </button>
              {activeDropdown === "movies" && (
                <div
                  className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl animate-fade-in p-2"
                  onMouseEnter={() => handleMouseEnter("movies")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-2 gap-1">
                    {movieCategories(t).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/movie/${cat.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                      >
                        {cat.icon && <cat.icon className="w-4 h-4" />}
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <Link
                      to="/category/movie/all"
                      className="block text-center text-sm text-primary hover:underline"
                    >
                      {t("allMovies")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* TV Shows Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("tv")}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                <Tv className="w-4 h-4" />
                {t("tvShows")}
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "tv" && "rotate-180")} />
              </button>
              {activeDropdown === "tv" && (
                <div
                  className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl animate-fade-in p-2"
                  onMouseEnter={() => handleMouseEnter("tv")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {tvCategories(t).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/tv/${cat.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                      >
                        {cat.icon && <cat.icon className="w-4 h-4" />}
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <Link
                      to="/category/tv/all"
                      className="block text-center text-sm text-primary hover:underline"
                    >
                      {t("allTVShows")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Production Companies Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("companies")}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition-all duration-300 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-primary/25 group">
                {"شركات الإنتاج"}
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "companies" && "rotate-180")} />
              </button>
              {activeDropdown === "companies" && (
                <div
                  className="absolute top-full right-0 mt-3 w-72 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl animate-fade-in p-2 z-50 overflow-hidden"
                  onMouseEnter={() => handleMouseEnter("companies")}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-1 gap-1">
                    {PRODUCTION_COMPANIES.map((company) => (
                      <Link
                        key={company.id}
                        to={`/company/${company.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-all duration-200 group/item"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 flex items-center justify-center bg-white/5 rounded p-1 group-hover/item:bg-white/10 transition-colors">
                            <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <span className="font-medium group-hover/item:text-primary transition-colors">{company.nameAr}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search, Theme, Language & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <div
                className={cn(
                  "flex items-center transition-all duration-300 overflow-hidden",
                  isSearchOpen ? "w-64" : "w-10"
                )}
              >
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "bg-secondary/50 border-border h-10 pr-10 transition-all",
                    isSearchOpen ? "opacity-100" : "opacity-0 w-0"
                  )}
                />
                <Button
                  type={isSearchOpen && searchQuery ? "submit" : "button"}
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 h-10 w-10"
                  onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              {isSearchOpen && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 h-10 w-10"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </form>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border animate-slide-down">
            <div className="py-4 space-y-4">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                {t("home")}
              </Link>

              {/* Mobile Movies */}
              <div className="px-4">
                <button
                  className="flex items-center justify-between w-full py-2 font-medium"
                  onClick={() => setActiveDropdown(activeDropdown === "movies-mobile" ? null : "movies-mobile")}
                >
                  <span className="flex items-center gap-3">
                    <Film className="w-5 h-5" />
                    {t("movies")}
                  </span>
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform", activeDropdown === "movies-mobile" && "rotate-180")}
                  />
                </button>
                {activeDropdown === "movies-mobile" && (
                  <div className="mt-2 mr-8 space-y-1">
                    {movieCategories(t).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/movie/${cat.id}`}
                        className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {cat.icon && <cat.icon className="w-4 h-4" />}
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile TV */}
              <div className="px-4">
                <button
                  className="flex items-center justify-between w-full py-2 font-medium"
                  onClick={() => setActiveDropdown(activeDropdown === "tv-mobile" ? null : "tv-mobile")}
                >
                  <span className="flex items-center gap-3">
                    <Tv className="w-5 h-5" />
                    {t("tvShows")}
                  </span>
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform", activeDropdown === "tv-mobile" && "rotate-180")}
                  />
                </button>
                {activeDropdown === "tv-mobile" && (
                  <div className="mt-2 mr-8 space-y-1">
                    {tvCategories(t).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/tv/${cat.id}`}
                        className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {cat.icon && <cat.icon className="w-4 h-4" />}
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Companies */}
              <div className="px-4">
                <button
                  className="flex items-center justify-between w-full py-2 font-medium"
                  onClick={() => setActiveDropdown(activeDropdown === "companies-mobile" ? null : "companies-mobile")}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    {"شركات الإنتاج"}
                  </span>
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform", activeDropdown === "companies-mobile" && "rotate-180")}
                  />
                </button>
                {activeDropdown === "companies-mobile" && (
                  <div className="mt-2 mr-8 space-y-1">
                    {PRODUCTION_COMPANIES.map((company) => (
                      <Link
                        key={company.id}
                        to={`/company/${company.id}`}
                        className="flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <img src={company.logo} alt={company.name} className="w-8 h-4 object-contain brightness-90" />
                        <span>{company.nameAr}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Theme & Language */}
              <div className="px-4 py-2 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("theme" as any) || "Theme"}</span>
                  <ThemeToggle />
                </div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}