import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentRow } from "@/components/ContentRow";
import { Star, Calendar, Play, LayoutGrid } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn } from "@/lib/utils";
import { fetchTVDetails, fetchSeasonDetails, t } from "@/lib/tmdb";

export default function TVDetail() {
    const { id } = useParams();
    const [tv, setTv] = useState<any>(null);
    const [seasonData, setSeasonData] = useState<any>(null);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTV = async () => {
            try {
                const data = await fetchTVDetails(parseInt(id || "0"));
                setTv(data);

                // Load first season data
                const sData = await fetchSeasonDetails(parseInt(id || "0"), 1);
                setSeasonData(sData);
            } catch (err) {
                console.error("Failed to fetch TV details:", err);
            } finally {
                setLoading(false);
            }
        };
        loadTV();
    }, [id]);

    const handleSeasonChange = async (sNum: number) => {
        setCurrentSeason(sNum);
        setCurrentEpisode(1);
        try {
            const data = await fetchSeasonDetails(parseInt(id || "0"), sNum);
            setSeasonData(data);
        } catch (err) {
            console.error("Failed to fetch season data:", err);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (!tv) return <div className="h-screen flex items-center justify-center">TV Show not found</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="relative h-[40vh] w-full">
                <img
                    src={`https://image.tmdb.org/t/p/original${tv.backdrop_path}`}
                    className="w-full h-full object-cover opacity-50"
                    alt={tv.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto">
                    <h1 className="text-5xl font-bold mb-4">{tv.name}</h1>
                    <div className="flex gap-6 text-sm opacity-90 font-medium text-white">
                        <span className="flex items-center gap-2 text-primary"><Star size={18} fill="currentColor" /> {tv.vote_average?.toFixed(1)}</span>
                        <span className="flex items-center gap-2"><Calendar size={18} /> {tv.first_air_date?.split('-')[0]}</span>
                        <span className="bg-primary/20 text-primary px-3 py-0.5 rounded-full">{tv.number_of_seasons} {t("seasons")}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Video Player Section */}
                        <section className="space-y-4 text-white">
                            <VideoPlayer
                                id={parseInt(id || "0")}
                                type="tv"
                                title={tv.name}
                                season={currentSeason}
                                episode={currentEpisode}
                                onNavigate={(s, e) => {
                                    if (s !== currentSeason) handleSeasonChange(s);
                                    setCurrentEpisode(e);
                                }}
                            />
                        </section>

                        {/* Overview */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold border-r-4 border-primary pr-4">نبذة عن المسلسل</h2>
                            <p className="text-lg leading-relaxed opacity-80 max-w-3xl">{tv.overview || "لا يوجد وصف متوفر"}</p>
                        </section>

                        {/* Episode Grid */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold border-r-4 border-primary pr-4">الحلقات</h2>
                                <select
                                    value={currentSeason}
                                    onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                                    className="bg-secondary text-white px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                >
                                    {tv.seasons?.filter((s: any) => s.season_number > 0).map((s: any) => (
                                        <option key={s.id} value={s.season_number}>الموسم {s.season_number}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {seasonData?.episodes?.map((ep: any) => (
                                    <button
                                        key={ep.id}
                                        onClick={() => setCurrentEpisode(ep.episode_number)}
                                        className={cn(
                                            "group relative flex flex-col gap-2 p-3 rounded-xl transition-all text-right border border-border/50 hover:border-primary/50",
                                            currentEpisode === ep.episode_number ? "bg-primary/10 border-primary" : "bg-card/50 hover:bg-card"
                                        )}
                                    >
                                        <div className="relative aspect-video rounded-lg overflow-hidden">
                                            <img
                                                src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : "/placeholder.svg"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={ep.name}
                                            />
                                            {currentEpisode === ep.episode_number && (
                                                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                                    <Play fill="white" className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                                                الحلقة {ep.episode_number}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-sm line-clamp-1">{ep.name}</h3>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Info Card */}
                        <div className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                            <img
                                src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`}
                                className="w-full rounded-xl shadow-2xl mb-6 shadow-primary/10"
                                alt={tv.name}
                            />
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-border/50 pb-2">
                                    <span className="opacity-60">تاريخ البدء</span>
                                    <span className="font-medium">{tv.first_air_date}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/50 pb-2">
                                    <span className="opacity-60">الحالة</span>
                                    <span className="font-medium text-primary">{tv.status === 'Returning Series' ? 'مستمر' : 'منتهي'}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/50 pb-2">
                                    <span className="opacity-60">عدد الحلقات</span>
                                    <span className="font-medium">{tv.number_of_episodes}</span>
                                </div>
                            </div>
                        </div>

                        {/* Networks */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <LayoutGrid size={18} className="text-primary" />
                                شبكة العرض
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {tv.networks?.map((n: any) => (
                                    <div key={n.id} className="bg-secondary/50 px-4 py-2 rounded-lg text-xs font-bold border border-border/50">
                                        {n.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <ContentRow title={t("similarTV")} items={tv.similar?.results || []} type="tv" />
                </div>
            </div>
            <Footer />
        </div>
    );
}
