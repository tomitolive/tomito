import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchGenres, Genre, t } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

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
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                {type === "movie" ? t("movieGenres") : t("tvGenres")}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {genres.map((genre) => (
                    <Button
                        key={genre.id}
                        variant="secondary"
                        size="sm"
                        asChild
                        className="flex-shrink-0 group relative overflow-hidden rounded-full px-6 py-5 
                                 bg-secondary/40 border-border/50 hover:border-red-500/50
                                 transition-all duration-300 hover:scale-105 active:scale-95
                                 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                        <Link to={`/category/${type}/${genre.id}`}>
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                {genre.name}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                    </Button>
                ))}
            </div>
        </div>
    );
}
