import React, { useState, useEffect } from "react";
import { Play, Server, Info, ChevronRight, ChevronLeft } from "lucide-react";
import {
    VideoServer,
    MOVIE_SERVERS,
    TV_SERVERS,
    getVideoUrl,
    getImdbIdFromTmdb,
    t
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
    id: number;
    type: "movie" | "tv";
    title: string;
    season?: number;
    episode?: number;
    onNavigate?: (season: number, episode: number) => void;
}

export function VideoPlayer({ id, type, title, season, episode, onNavigate }: VideoPlayerProps) {
    const servers = type === "movie" ? MOVIE_SERVERS : TV_SERVERS;
    const [currentServer, setCurrentServer] = useState<VideoServer>(servers[0]);
    const [imdbId, setImdbId] = useState<string | undefined>(undefined);
    const [key, setKey] = useState(0); // To force iframe reload

    // Fetch IMDB ID if needed
    useEffect(() => {
        const fetchIds = async () => {
            if (currentServer.useIdType === 'imdb' && !imdbId) {
                const idResult = await getImdbIdFromTmdb(id, type);
                if (idResult) setImdbId(idResult);
            }
        };
        fetchIds();
    }, [id, type, currentServer, imdbId]);

    const videoUrl = getVideoUrl(
        currentServer,
        id,
        type,
        season,
        episode,
        imdbId,
        { autoplay: true }
    );

    const handleServerChange = (server: VideoServer) => {
        setCurrentServer(server);
        setKey(prev => prev + 1);
    };

    return (
        <div className="w-full space-y-6">
            {/* Player Wrapper */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl group border border-border/50">
                <iframe
                    key={key}
                    src={videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={`${title} - ${currentServer.name}`}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />

                {/* Quality/Server Overlay */}
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/20 text-white">
                        {currentServer.quality}
                    </span>
                    <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white/80 border border-white/10 text-white">
                        {currentServer.name}
                    </span>
                </div>
            </div>

            {/* Controls Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">{t("chooseServer") || "اختيار السيرفر"}</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 min-w-[140px] justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    {currentServer.name}
                                </span>
                                <span className="text-[10px] opacity-60 bg-muted px-1 rounded">{currentServer.quality}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border-border">
                            {servers.map((server) => (
                                <DropdownMenuItem
                                    key={server.id}
                                    onClick={() => handleServerChange(server)}
                                    className={cn(
                                        "flex items-center justify-between cursor-pointer py-2.5",
                                        currentServer.id === server.id ? "bg-primary/10 text-primary" : ""
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Play className={cn("w-3.5 h-3.5", currentServer.id === server.id ? "fill-primary" : "opacity-40")} />
                                        <span className="font-medium text-sm">{server.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-60 uppercase">{server.quality}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* TV specific controls */}
                {type === "tv" && onNavigate && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => episode && episode > 1 && onNavigate(season || 1, episode - 1)}
                            disabled={episode === 1}
                            className="hover:bg-primary/10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <div className="px-4 py-1.5 bg-secondary/50 rounded-lg text-sm font-bold min-w-[120px] text-center">
                            {t("seasonLabel") || "الموسم"} {season} / {t("episodeLabel") || "الحلقة"} {episode}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onNavigate(season || 1, (episode || 1) + 1)}
                            className="hover:bg-primary/10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
                    <Info className="w-3.5 h-3.5" />
                    {t("disclaimer") || "هذا الموقع لا يستضيف أي محتوى على خوادمه"}
                </div>
            </div>
        </div>
    );
}
