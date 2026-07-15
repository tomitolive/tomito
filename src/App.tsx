import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import TVDetail from "./pages/TVDetail";
import Category from "./pages/Category";
import Search from "./pages/Search";
import { ThemeProvider } from "./context/ThemeContext";
import { SpatialNavigationProvider } from "./context/SpatialNavigationContext";
import WatchMovie from "./pages/WatchMovie";
import WatchTV from "./pages/WatchTV";
import MovieTrailer from "./pages/MovieTrailer";
import TVTrailer from "./pages/TVTrailer";
import ActorPage from "./pages/ActorPage";
import GoogleAnalytics from "./components/GoogleAnalytics";

import CompanyContent from "./pages/CompanyContent";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import RamadanPage from "./pages/RamadanPage";
import { WatchRamadanPage } from "./pages/WatchRamadanPage";
import { RamadanTrailerPage } from "./pages/RamadanTrailerPage";
import { RamadanDownloadPage } from "./pages/RamadanDownloadPage";
import SeriesDownloadList from "./pages/SeriesDownloadList";
import CPATest from "./pages/CPATest";
import { AIAssistant } from "./components/AIAssistant";
import AdBlockDetector from "./components/AdBlockDetector";
import { OfferModal } from "./components/OfferModal";



import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {

  return (
    <HelmetProvider>
      <ThemeProvider>
        <SpatialNavigationProvider>
          <TooltipProvider>

            <Router>
              <ScrollToTop />
              <GoogleAnalytics />
              <AdBlockDetector />
              <Routes>
                <Route path="/" element={<Home />} />
                {/* Trailer pages - shown first when clicking on content */}
                <Route path="/movie/:slug" element={<MovieTrailer />} />
                <Route path="/tv/:slug" element={<TVTrailer />} />
                {/* Watch pages - shown after clicking "Watch Now" */}
                <Route path="/movie/:id/watch" element={<WatchMovie />} />
                <Route path="/tv/:id/watch" element={<WatchTV />} />
                <Route path="/category/:type/:genreId" element={<Category />} />
                <Route path="/search" element={<Search />} />
                <Route path="/actor/:id" element={<ActorPage />} />
                <Route path="/company/:companyId" element={<CompanyContent />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/ramadan" element={<RamadanPage />} />
                <Route path="/ramadan-trailer/:slug" element={<RamadanTrailerPage />} />
                <Route path="/watch-ramadan/:slug" element={<WatchRamadanPage />} />
                <Route path="/ramadan-download/:slug" element={<><RamadanDownloadPage /></>} />
                <Route path="/series-download" element={<SeriesDownloadList />} />
                <Route path="/cpa-test" element={<CPATest />} />
              </Routes>
              <OfferModal />
              <AIAssistant />
            </Router>
          </TooltipProvider>
        </SpatialNavigationProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

