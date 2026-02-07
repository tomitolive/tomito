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

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<WatchMovie />} />
            <Route path="/tv/:id" element={<WatchTV />} />
            <Route path="/category/:type/:genreId" element={<Category />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
