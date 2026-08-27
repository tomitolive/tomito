import { Link } from "react-router-dom";
import { Film, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Logo from "./Logo";
import { t } from "@/lib/tmdb";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Logo />

          {/* Movies Links */}
          <div>
            <h4 className="font-bold mb-4">{t("movies")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/movie/28" className="hover:text-primary transition-colors">{t("moviesAction")}</Link></li>
              <li><Link to="/category/movie/35" className="hover:text-primary transition-colors">{t("moviesComedy")}</Link></li>
              <li><Link to="/category/movie/18" className="hover:text-primary transition-colors">{t("moviesDrama")}</Link></li>
              <li><Link to="/category/movie/27" className="hover:text-primary transition-colors">{t("moviesHorror")}</Link></li>
              <li><Link to="/category/movie/all" className="hover:text-primary transition-colors">{t("allMovies")}</Link></li>
            </ul>
          </div>

          {/* TV Shows Links */}
          <div>
            <h4 className="font-bold mb-4">{t("tvShows")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/tv/18" className="hover:text-primary transition-colors">{t("tvDrama")}</Link></li>
              <li><Link to="/category/tv/10759" className="hover:text-primary transition-colors">{t("tvAction")}</Link></li>
              <li><Link to="/category/tv/35" className="hover:text-primary transition-colors">{t("tvComedy")}</Link></li>
              <li><Link to="/category/tv/80" className="hover:text-primary transition-colors">{t("tvCrime")}</Link></li>
              <li><Link to="/category/tv/all" className="hover:text-primary transition-colors">{t("allTVShows")}</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">{t("home")}</Link></li>
              <li><Link to="/search" className="hover:text-primary transition-colors">{t("search")}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("aboutUs")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t("contactUs")}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t("privacyPolicy")}</Link></li>

            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{t("copyright")} {new Date().getFullYear()} Tomito</p>
          <p className="mt-2">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
