import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
    Download, Home, ChevronRight, ListVideo, Sparkles,
    FileDown, ExternalLink, ArrowRight, Server
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PosterImage } from "@/components/PosterImage";
import { cn } from "@/lib/utils";

interface Episode {
    id: string;
    title: string;
    episode_number: number | null;
    poster: string;
    description: string;
    watch_servers: any[];
    download_links: { name: string; url: string }[];
}

interface SeriesItem {
    id: string;
    title: string;
    clean_title: string;
    poster: string;
    description: string;
    year: string;
    type: string;
    episodes: Episode[];
}

export function RamadanDownloadPage() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const seriesName = decodeURIComponent(slug || "");
    const episodeNum = parseInt(searchParams.get("episode") || "1");

    const [series, setSeries] = useState<SeriesItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/ramadan_2026_results.json");
                const data: SeriesItem[] = await response.json();

                const found = data.find(item =>
                    (item.clean_title && item.clean_title.toLowerCase() === seriesName.toLowerCase()) ||
                    (item.title && item.title.toLowerCase() === seriesName.toLowerCase())
                );

                if (found) {
                    setSeries(found);
                }
            } catch (err) {
                console.error("Failed to load download data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [seriesName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Navbar />
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const episode = series?.episodes.find(ep => (ep.episode_number || 1) === episodeNum);

    if (!series || !episode) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <div className="bg-card p-10 rounded-2xl border border-border max-w-lg space-y-4">
                    <h1 className="text-3xl font-black text-destructive">حدث خطأ ما</h1>
                    <p className="text-muted-foreground text-base">لم نتمكن من العثور على روابط التحميل لهذه الحلقة.</p>
                    <Link to="/ramadan" className="block w-full">
                        <Button variant="secondary" className="w-full h-12 rounded-xl font-bold text-base">العودة للرئيسية</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Navbar />

            {/* Ambient background effect */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[100px] rounded-full opacity-30" />
            </div>

            <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[11px] text-muted-foreground/60 mb-10 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar font-bold uppercase tracking-wide">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors">رمضان 2026</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link to={`/ramadan-trailer/${encodeURIComponent(series.clean_title || series.title)}`} className="hover:text-primary transition-colors max-w-[120px] truncate">
                        {series.title}
                    </Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-primary font-black uppercase">تحميل الحلقة {episodeNum}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">
                    {/* Left Column: Download Links Table */}
                    <div className="space-y-8 order-2 lg:order-1">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                                <h1 className="text-xl md:text-2xl font-black tracking-tight">روابط التحميل المتاحة</h1>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">اختر السيرفر المناسب لك للتحميل المباشر وبأعلى جودة.</p>
                        </div>

                        <div className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
                            <div className="hidden md:grid grid-cols-[1fr_100px_140px] gap-4 px-8 py-4 border-b border-border bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <div>سيرفر التحميل</div>
                                <div className="text-center">الجودة</div>
                                <div className="text-right">رابط مباشر</div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {episode.download_links.map((link, idx) => {
                                    // Extract quality if bracketed (e.g. [1080])
                                    const qualityMatch = link.name.match(/\[(.*?)\]/);
                                    const quality = qualityMatch ? qualityMatch[1] : "HD";
                                    const name = link.name.replace(/\[.*?\]/, "").trim();

                                    return (
                                        <div key={idx} className="group grid md:grid-cols-[1fr_100px_140px] items-center gap-4 px-8 py-6 hover:bg-muted/50 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                                    <Server className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{name}</h3>
                                                    <p className="text-[9px] text-muted-foreground/60 font-black mt-0.5 uppercase tracking-widest group-hover:text-primary/40 transition-colors">Fast Download</p>
                                                </div>
                                            </div>

                                            <div className="flex md:justify-center">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    quality.includes("1080") || quality.toLowerCase() === "fhd"
                                                        ? "bg-primary/10 text-primary border-primary/20"
                                                        : "bg-muted text-muted-foreground border-border"
                                                )}>
                                                    {quality}
                                                </div>
                                            </div>

                                            <div className="flex md:justify-end mt-3 md:mt-0">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                                    <Button className="w-full md:w-auto h-10 px-5 rounded-xl font-bold text-xs gap-2 active:scale-95 transition-all shadow-lg shadow-primary/10">
                                                        <FileDown className="w-4 h-4" />
                                                        تحميل الآن
                                                        <ExternalLink className="w-3 h-3 opacity-40 ml-1" />
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-8 flex gap-6 items-start">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-500">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-black text-base">نصيحة تقنية</h4>
                                <p className="text-muted-foreground/80 font-medium leading-relaxed">
                                    نحن نوصي باستخدام سيرفرات **StreamHG** أو **savefiles** لأفضل سرعة تحميل واستمرارية للروابط. في حال واجهت أي مشكلة في التحميل، جرب سيرفر آخر أو تواصل معنا عبر التليجرام.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Series Info & Preview */}
                    <div className="space-y-10 order-1 lg:order-2">
                        <div className="relative group max-w-[320px] mx-auto lg:mx-0">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-purple-600 rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition duration-500" />
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-lg">
                                <PosterImage src={series.poster} alt={series.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-0 right-0 p-6 text-center text-white">
                                    <h2 className="text-lg font-bold tracking-tight mb-2">{series.title}</h2>
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-primary bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit mx-auto border border-white/10 uppercase tracking-widest">
                                        الحلقة رقم {episodeNum}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                                <ListVideo className="w-5 h-5 text-primary" />
                                خيارات أخرى
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                <Link to={`/watch-ramadan/${encodeURIComponent(seriesName)}?episode=${episodeNum}`}>
                                    <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs gap-3 border-border hover:bg-accent group">
                                        <Play className="w-4 h-4 fill-primary text-primary" />
                                        مشاهدة هذه الحلقة أونلاين
                                        <ArrowRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </Button>
                                </Link>
                                <Link to={`/ramadan-trailer/${encodeURIComponent(seriesName)}`}>
                                    <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs gap-3 border-border hover:bg-accent group">
                                        <ChevronRight className="w-4 h-4" />
                                        العودة لصفحة المسلسل
                                        <Home className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-100 transition-all" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Temporary for compilation if Play is not imported from lucide-react (re-check)
function Play(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
}
