import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchGenres, Genre, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { LayoutGrid } from "lucide-react";

interface GenreFiltersProps {
    type: "movie" | "tv";
    className?: string;
}

export function GenreFilters({ type, className }: GenreFiltersProps) {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const data = await fetchGenres(type);
                setGenres(data);
            } catch (error) {
                console.error("Error fetching genres:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadGenres();
    }, [type]);

    if (isLoading || genres.length === 0) return null;

    return (
        <div className={cn("mb-8", className)}>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        className="group relative overflow-hidden rounded-xl px-8 py-6 h-auto
                                 border-red-500/20 bg-secondary/20 hover:border-red-500/50
                                 transition-all duration-300 hover:scale-105 active:scale-95
                                 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                                <LayoutGrid className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-lg font-bold group-hover:text-red-500 transition-colors">
                                    {t("filterByGenre") || "تصفح الأنواع"}
                                </span>
                                <span className="text-xs text-muted-foreground group-hover:text-white/60">
                                    {type === "movie" ? t("movies") : t("tvShows")}
                                </span>
                            </div>
                        </div>
                    </Button>
                </SheetTrigger>

                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-l-border/50 p-0"
                >
                    <div className="h-full flex flex-col">
                        <SheetHeader className="p-6 border-b border-border/50">
                            <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                                <span className="w-2 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                                {type === "movie" ? t("movieGenres") : t("tvGenres")}
                            </SheetTitle>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                            <div className="grid grid-cols-2 gap-3 pb-8">
                                {genres.map((genre) => (
                                    <Button
                                        key={genre.id}
                                        variant="secondary"
                                        asChild
                                        className="h-auto p-4 justify-start group relative overflow-hidden rounded-xl
                                                 bg-secondary/40 border border-transparent hover:border-red-500/30
                                                 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        <Link to={`/category/${type}/${genre.id}`}>
                                            <div className="flex flex-col items-start gap-1 relative z-10 w-full">
                                                <span className="text-sm font-bold group-hover:text-white transition-colors">
                                                    {genre.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest group-hover:text-white/60">
                                                    {t("viewAll")}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 
                                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
