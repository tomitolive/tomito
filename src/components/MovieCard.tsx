import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getImageUrl, Movie, TVShow } from "@/lib/tmdb";
import { cn, createSlug } from "@/lib/utils";

type MediaType = "movie" | "tv";

interface MovieCardProps {
  item: Movie | TVShow;
  type: MediaType;
  className?: string;
}

export function MovieCard({
  item,
  type,
  className,
}: MovieCardProps): JSX.Element {
  const title = "title" in item ? item.title : item.name;
  const releaseDate =
    "release_date" in item ? item.release_date : item.first_air_date;

  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const rating =
    typeof item.vote_average === "number"
      ? item.vote_average.toFixed(1)
      : "N/A";

  const link =
    type === "movie"
      ? `/movie/${item.id}`
      : `/tv/${item.id}`;

  return (
    <Link
      to={link}
      className={cn(
        "group block cursor-pointer transition-transform duration-300 lg:hover:-translate-y-2",
        className
      )}
    >
      {/* CARD IMAGE */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-md lg:group-hover:shadow-2xl transition-shadow duration-500">
        <img
          src={getImageUrl(item.poster_path, "w500")}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 lg:group-hover:scale-110 lg:group-hover:rotate-1"
          loading="lazy"
        />

        {/* Gradient قوي عند hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />

        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {rating}
        </div>

        {/* Info يظهر animate عند hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full lg:group-hover:translate-y-0 transition-transform duration-500 hidden lg:block">
          <h3 className="text-sm font-bold text-white line-clamp-2">{title}</h3>
          <p className="text-xs text-gray-300">{year}</p>
        </div>
      </div>

      {/* Title Mobile */}
      <div className="mt-2 lg:hidden transition-colors duration-300 lg:group-hover:text-primary">
        <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </Link>
  );
}

/* Skeleton */
export function MovieCardSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-lg bg-muted" />
      <div className="mt-2 space-y-1">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
