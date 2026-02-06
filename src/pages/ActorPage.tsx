import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Star, Film, Tv } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { fetchPersonDetails, fetchPersonCredits, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export default function ActorPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    const loadPerson = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [personData, creditsData] = await Promise.all([
          fetchPersonDetails(parseInt(id)),
          fetchPersonCredits(parseInt(id)),
        ]);
        setPerson(personData);
        // Sort credits by popularity
        const sortedCredits = creditsData.sort((a: any, b: any) => b.popularity - a.popularity);
        setCredits(sortedCredits);
      } catch (error) {
        console.error("Error loading person:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerson();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">الممثل غير موجود</h1>
            <Button asChild>
              <Link to="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredCredits = credits.filter((item) => {
    if (filter === "all") return true;
    return item.media_type === filter;
  });

  const stats = {
    movies: credits.filter((c) => c.media_type === "movie").length,
    tv: credits.filter((c) => c.media_type === "tv").length,
  };

  const age = person.birthday
    ? Math.floor(
        (new Date().getTime() - new Date(person.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rtl-flip" />
          <span className="text-foreground">{person.name}</span>
        </nav>

        {/* Person Info */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Photo */}
          <div className="flex-shrink-0 w-48 lg:w-64 mx-auto lg:mx-0">
            <img
              src={getImageUrl(person.profile_path, "w500")}
              alt={person.name}
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{person.name}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              {person.birthday && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(person.birthday).toLocaleDateString("ar-EG")}
                  {age && <span>({age} سنة)</span>}
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {person.place_of_birth}
                </div>
              )}
              {person.popularity && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500" />
                  شعبية: {person.popularity.toFixed(0)}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-6">
              <div className="text-center p-4 bg-card rounded-lg">
                <Film className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.movies}</p>
                <p className="text-sm text-muted-foreground">فيلم</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <Tv className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.tv}</p>
                <p className="text-sm text-muted-foreground">مسلسل</p>
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <div>
                <h2 className="text-xl font-bold mb-3">السيرة الذاتية</h2>
                <p className={cn("text-muted-foreground leading-relaxed", !showFullBio && "line-clamp-3")}>
                  {person.biography}
                </p>
                {person.biography.length > 300 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2"
                    onClick={() => setShowFullBio(!showFullBio)}
                  >
                    {showFullBio ? "عرض أقل" : "عرض المزيد"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filmography */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">الأعمال</h2>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                الكل ({credits.length})
              </Button>
              <Button
                variant={filter === "movie" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("movie")}
                className="gap-1"
              >
                <Film className="w-4 h-4" />
                أفلام ({stats.movies})
              </Button>
              <Button
                variant={filter === "tv" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("tv")}
                className="gap-1"
              >
                <Tv className="w-4 h-4" />
                مسلسلات ({stats.tv})
              </Button>
            </div>
          </div>

          {/* Credits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCredits.slice(0, 30).map((item) => (
              <MovieCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                type={item.media_type as "movie" | "tv"}
              />
            ))}
          </div>

          {filteredCredits.length > 30 && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                يتم عرض أفضل 30 عمل من أصل {filteredCredits.length}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
