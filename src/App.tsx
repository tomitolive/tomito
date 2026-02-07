import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import TVDetail from "./pages/TVDetail";
import Category from "./pages/Category";
import Search from "./pages/Search";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import WatchMovie from "./pages/WatchMovie";
import WatchTV from "./pages/WatchTV";
import ActorPage from "./pages/ActorPage";
import GoogleAnalytics from "./components/GoogleAnalytics";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Router>
          <GoogleAnalytics />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<WatchMovie />} />
            <Route path="/tv/:id" element={<WatchTV />} />
            <Route path="/category/:type/:genreId" element={<Category />} />
            <Route path="/search" element={<Search />} />
            <Route path="/actor/:id" element={<ActorPage />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
