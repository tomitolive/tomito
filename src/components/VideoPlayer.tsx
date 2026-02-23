import React, { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2, X, Play } from "lucide-react";
import {
    VideoServer,
    MOVIE_SERVERS,
    TV_SERVERS,
    getVideoUrl,
    getImdbIdFromTmdb,
} from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    id: number;
    type: "movie" | "tv";
    title: string;
    season?: number;
    episode?: number;
    onNavigate?: (season: number, episode: number) => void;
    currentServer?: VideoServer;
}

export function VideoPlayer({ id, type, title, season, episode, onNavigate, currentServer: externalServer }: VideoPlayerProps) {
    const servers = type === "movie" ? MOVIE_SERVERS : TV_SERVERS;
    const [internalServer, setInternalServer] = useState<VideoServer>(servers[0]);
    const currentServer = externalServer || internalServer;

    const [imdbId, setImdbId] = useState<string | undefined>(undefined);
    const [key, setKey] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sync fullscreen state with browser changes (Esc key, etc.)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Error attempting to toggle full-screen mode:", err);
        }
    };

    // Update key when server or episode changes to reload iframe
    useEffect(() => {
        setKey(prev => prev + 1);
    }, [currentServer.id, season, episode]);

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
        {
            autoplay: true,
        }
    );

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative group/player w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
                isFullscreen && "rounded-none border-0"
            )}
        >
            <iframe
                key={key}
                src={videoUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share; accelerometer; gyroscope; focus-without-user-activation; layout-animations; speaker-selection"
                sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="origin"
                title={`${title} - ${currentServer.name}`}
                allowFullScreen
            />

            {/* Floating Zoom Button - Bottom Right (Extreme Edge) */}
            <div className="absolute bottom-4 right-4 z-[9999] opacity-100 lg:opacity-0 lg:group-hover/player:opacity-100 transition-opacity pointer-events-none">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                    }}
                    className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md shadow-2xl rounded-full pointer-events-auto"
                >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
            </div>
        </div>
    );
}
