import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Play, Pause, Server, Info, ChevronRight, ChevronLeft,
    Maximize, Minimize, Settings2, MonitorPlay as Pip,
    Volume2, VolumeX, Languages, Scan, RotateCw, Subtitles
} from "lucide-react";


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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

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
    currentServer?: VideoServer;
}

export function VideoPlayer({ id, type, title, season, episode, onNavigate, currentServer: externalServer }: VideoPlayerProps) {
    const servers = type === "movie" ? MOVIE_SERVERS : TV_SERVERS;
    const [internalServer, setInternalServer] = useState<VideoServer>(servers[0]);
    const currentServer = externalServer || internalServer;

    const [imdbId, setImdbId] = useState<string | undefined>(undefined);
    const [key, setKey] = useState(0);
    const [showControls, setShowControls] = useState(true); // Default to true
    const [isFullscreen, setIsFullscreen] = useState(false);


    // New Enhanced States
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState([80]);
    const [isMuted, setIsMuted] = useState(false);
    const [zoomMode, setZoomMode] = useState<'contain' | 'cover' | 'fill'>('contain');
    const [subtitleEnabled, setSubtitleEnabled] = useState(true);
    const [brightness, setBrightness] = useState([100]);


    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


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
            subtitleLang: subtitleEnabled ? 'ar' : undefined
        }
    );


    const handleServerChange = (server: VideoServer) => {
        setInternalServer(server);
        setKey(prev => prev + 1);
    };

    const [isIdle, setIsIdle] = useState(false);

    const handleInteraction = useCallback(() => {
        setIsIdle(false);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            setIsIdle(true);
        }, 3000);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        handleInteraction();

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [handleInteraction]);


    return (

        <div
            ref={containerRef}
            className={cn(
                "relative w-full bg-black rounded-xl overflow-hidden shadow-2xl group border border-border/50 select-none",
                isFullscreen ? "fixed inset-0 z-[9999] rounded-none border-none" : "aspect-video"
            )}
        >
            {/* Brightness Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
                style={{
                    backgroundColor: 'black',
                    opacity: (100 - brightness[0]) / 100
                }}
            />

            <iframe
                key={key}
                ref={iframeRef}
                src={videoUrl}
                className={cn(
                    "w-full h-full transition-all duration-500 ease-out",
                    zoomMode === 'cover' ? "scale-110 object-cover" :
                        zoomMode === 'fill' ? "scale-[1.2] object-fill" : "object-contain"
                )}
                allow="autoplay; encrypted-media; fullscreen"
                title={`${title} - ${currentServer.name}`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />

            {/* Refined Control Bar - Top, Sharp Corners, Less Transparent */}
            <div className={cn(
                "absolute top-4 left-1/2 -translate-x-1/2 z-20 flex justify-center transition-all duration-500 pointer-events-none",
                isIdle ? "opacity-40 scale-95" : "opacity-100 scale-100"
            )}>
                <div className="flex items-center gap-2 px-3 h-9 rounded-lg pointer-events-auto">
                    {/* Left: Navigation */}
                    {type === "tv" && onNavigate && (
                        <div className="flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onNavigate(season!, Math.max(1, (episode || 1) - 1))}
                                disabled={episode === 1}
                                className="w-8 h-8 hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onNavigate(season!, (episode || 1) + 1)}
                                className="w-8 h-8 hover:bg-white/10 text-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}





                    {/* Center: Controls */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 group/volume px-3 h-8 rounded-lg">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                {isMuted || volume[0] === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                            <Slider
                                value={isMuted ? [0] : volume}
                                max={100}
                                step={1}
                                onValueChange={(val) => {
                                    setVolume(val);
                                    setIsMuted(false);
                                }}
                                className="w-20 cursor-pointer [&_.bg-primary]:bg-white [&_.border-primary]:border-white"
                            />
                        </div>

                        <div className="flex items-center gap-2 group/brightness px-3 h-8 rounded-lg">
                            <span className="text-white/60 text-[10px]">☀️</span>
                            <Slider
                                value={brightness}
                                max={100}
                                min={20}
                                step={5}
                                onValueChange={setBrightness}
                                className="w-20 cursor-pointer [&_.bg-primary]:bg-white [&_.border-primary]:border-white"
                            />
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    {/* Right: Screen & Zoom */}
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => {
                                const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
                                const nextIndex = (modes.indexOf(zoomMode) + 1) % modes.length;
                                setZoomMode(modes[nextIndex]);
                            }}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-all",
                                zoomMode !== 'contain' && "text-primary hover:text-primary opacity-100"
                            )}
                            title="Format"
                        >
                            <Scan className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    containerRef.current?.requestFullscreen();
                                    setIsFullscreen(true);
                                } else {
                                    document.exitFullscreen();
                                    setIsFullscreen(false);
                                }
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-all"
                            title="Full Screen"
                        >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>








        </div>
    );
}
