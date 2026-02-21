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
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <Navbar />
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const episode = series?.episodes.find(ep => (ep.episode_number || 1) === episodeNum);

    if (!series || !episode) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-24 text-center px-4">
                <Navbar />
                <div className="bg-white/5 p-12 rounded-[40px] border border-white/10 max-w-lg space-y-6">
                    <h1 className="text-4xl font-black text-red-500">حدث خطأ ما</h1>
                    <p className="text-muted-foreground text-lg">لم نتمكن من العثور على روابط التحميل لهذه الحلقة.</p>
                    <Link to="/ramadan" className="block w-full">
                        <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-lg">العودة للرئيسية</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <Navbar />

            {/* Ambient background effect */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-30" />
            </div>

            <main className="container mx-auto px-4 pt-36 pb-24 relative z-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-3 text-sm text-muted-foreground/60 mb-12 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar font-bold">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Home className="w-4 h-4" /> الرئيسية
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link to="/ramadan" className="hover:text-primary transition-colors">رمضان 2026</Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link to={`/ramadan-trailer/${encodeURIComponent(series.clean_title || series.title)}`} className="hover:text-primary transition-colors max-w-[150px] truncate">
                        {series.title}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-primary font-black">تحميل الحلقة {episodeNum}</span>
                </nav>

                <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">
                    {/* Left Column: Download Links Table */}
                    <div className="space-y-10 order-2 lg:order-1">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter">روابط التحميل المتاحة</h1>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">اختر السيرفر المناسب لك للتحميل المباشر وبأعلى جودة.</p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-xl">
                            <div className="hidden md:grid grid-cols-[1fr_120px_160px] gap-6 px-10 py-6 border-b border-white/5 bg-white/[0.02] text-sm font-black text-muted-foreground uppercase tracking-widest">
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
                                        <div key={idx} className="group grid md:grid-cols-[1fr_120px_160px] items-center gap-6 px-10 py-8 hover:bg-white/[0.05] transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Server className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-base md:text-lg group-hover:text-primary transition-colors">{name}</h3>
                                                    <p className="text-xs text-muted-foreground/60 font-bold mt-1 uppercase tracking-widest group-hover:text-primary/40 transition-colors">Fast Download</p>
                                                </div>
                                            </div>

                                            <div className="flex md:justify-center">
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                    quality.includes("1080") || quality.toLowerCase() === "fhd"
                                                        ? "bg-primary/20 text-primary border-primary/30"
                                                        : "bg-white/5 text-muted-foreground border-white/10"
                                                )}>
                                                    {quality}
                                                </div>
                                            </div>

                                            <div className="flex md:justify-end mt-4 md:mt-0">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                                    <Button className="w-full md:w-auto h-12 px-6 rounded-2xl font-black text-sm gap-2 active:scale-95 transition-all shadow-xl shadow-primary/20">
                                                        <FileDown className="w-4 h-4" />
                                                        تحميل الآن
                                                        <ExternalLink className="w-3.5 h-3.5 opacity-40 ml-1" />
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
                    <div className="space-y-12 order-1 lg:order-2">
                        <div className="relative group">
                            <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-purple-600 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
                            <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)]">
                                <PosterImage src={series.poster} alt={series.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-0 right-0 p-8 text-center text-white">
                                    <h2 className="text-xl font-black tracking-tight mb-2">{series.title}</h2>
                                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-primary bg-black/40 backdrop-blur-md px-4 py-2 rounded-full w-fit mx-auto border border-white/10">
                                        الحلقة رقم {episodeNum}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-base font-black flex items-center gap-3">
                                <ListVideo className="w-6 h-6 text-primary" />
                                خيارات أخرى
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <Link to={`/watch-ramadan/${encodeURIComponent(seriesName)}?episode=${episodeNum}`}>
                                    <Button variant="outline" className="w-full h-12 rounded-2xl font-black text-sm gap-4 border-white/10 hover:bg-white/5 group">
                                        <Play className="w-5 h-5 fill-primary text-primary" />
                                        مشاهدة هذه الحلقة أونلاين
                                        <ArrowRight className="w-5 h-5 ml-auto opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </Button>
                                </Link>
                                <Link to={`/ramadan-trailer/${encodeURIComponent(seriesName)}`}>
                                    <Button variant="outline" className="w-full h-12 rounded-2xl font-black text-sm gap-4 border-white/10 hover:bg-white/5 group">
                                        <ChevronRight className="w-5 h-5" />
                                        العودة لصفحة المسلسل
                                        <Home className="w-5 h-5 ml-auto opacity-20 group-hover:opacity-100 transition-all" />
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
