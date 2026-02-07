import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                "relative h-10 w-10 rounded-lg transition-colors",
                "hover:bg-accent"
            )}
            aria-label="Toggle theme"
        >
            {/* Sun Icon (visible in dark mode) */}
            <Sun
                className={cn(
                    "h-5 w-5 transition-all",
                    theme === "dark"
                        ? "rotate-0 scale-100"
                        : "rotate-90 scale-0"
                )}
            />

            {/* Moon Icon (visible in light mode) */}
            <Moon
                className={cn(
                    "absolute h-5 w-5 transition-all",
                    theme === "light"
                        ? "rotate-0 scale-100"
                        : "-rotate-90 scale-0"
                )}
            />
        </Button>
    );
}
