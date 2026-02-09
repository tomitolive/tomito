import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import TVDetail from "./pages/TVDetail";
import Category from "./pages/Category";
import Search from "./pages/Search";
import { ThemeProvider } from "./context/ThemeContext";
import { SpatialNavigationProvider } from "./context/SpatialNavigationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import WatchMovie from "./pages/WatchMovie";
import WatchTV from "./pages/WatchTV";
import MovieTrailer from "./pages/MovieTrailer";
import TVTrailer from "./pages/TVTrailer";
import ActorPage from "./pages/ActorPage";
import GoogleAnalytics from "./components/GoogleAnalytics";
import AdPopup from "./components/AdPopup";
import CompanyContent from "./pages/CompanyContent";

function App() {
  return (
    <ThemeProvider>
      <SpatialNavigationProvider>
        <TooltipProvider>
          <Router>
            <GoogleAnalytics />
            <AdPopup />
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Trailer pages - shown first when clicking on content */}
              <Route path="/movie/:id" element={<MovieTrailer />} />
              <Route path="/tv/:id" element={<TVTrailer />} />
              {/* Watch pages - shown after clicking "Watch Now" */}
              <Route path="/movie/:id/watch" element={<WatchMovie />} />
              <Route path="/tv/:id/watch" element={<WatchTV />} />
              <Route path="/category/:type/:genreId" element={<Category />} />
              <Route path="/search" element={<Search />} />
              <Route path="/actor/:id" element={<ActorPage />} />
              <Route path="/company/:companyId" element={<CompanyContent />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </SpatialNavigationProvider>
    </ThemeProvider>
  );
}

export default App;
