"use client";

import { ThemeProvider } from "../context/ThemeContext";
import { SpatialNavigationProvider } from "../context/SpatialNavigationContext";
import { TooltipProvider } from "../components/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SpatialNavigationProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </SpatialNavigationProvider>
    </ThemeProvider>
  );
}
