import React, { useState, useEffect, useRef } from "react";
import { Server, Play, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupremeServer } from "@/hooks/useSupremeServers";
import { Button } from "@/components/ui/button";

interface SupremePlayerProps {
    servers: SupremeServer[];
    title: string;
}

// Map server names to display labels
const SERVER_LABELS: Record<string, string> = {
    DOODSTREAM: "DoodStream",
    SMOOTHPRE: "SmoothPre",
    MIXDROP: "MixDrop",
    VOE: "VOE",
    FSDCMO: "FSDCMO",
};

export function SupremePlayer({ servers, title }: SupremePlayerProps) {
    const [currentServer, setCurrentServer] = useState<SupremeServer>(servers[0]);
    const [iframeKey, setIframeKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync fullscreen state with browser changes
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
            console.error("Fullscreen error:", err);
        }
    };

    if (!servers.length) return null;

    const handleServerChange = (server: SupremeServer) => {
        setCurrentServer(server);
        setIframeKey((k) => k + 1);
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                سيرفرات إضافية
            </h2>

            {/* Server Selection */}
            <div className="flex flex-wrap items-center gap-2 mb-6 justify-center">
                {servers.map((server, idx) => (
                    <button
                        key={`${server.name}-${idx}`}
                        onClick={() => handleServerChange(server)}
                        className={cn(
                            "h-9 px-4 rounded-lg transition-all backdrop-blur-md shadow-sm border flex items-center gap-2",
                            currentServer === server
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
                        )}
                    >
                        <Server className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            {SERVER_LABELS[server.name] || server.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Video Player */}
            <div className="relative max-w-4xl mx-auto group/player">
                <div
                    ref={containerRef}
                    className={cn(
                        "relative aspect-video rounded-xl shadow-2xl border border-border/50 transition-all duration-300",
                        isFullscreen && "rounded-none border-0"
                    )}
                >
                    <iframe
                        key={iframeKey}
                        src={currentServer.url}
                        className="w-full h-full border-0 rounded-xl"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share; accelerometer; gyroscope; focus-without-user-activation; layout-animations; speaker-selection"
                        sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                        referrerPolicy="origin"
                        title={`${title} - ${SERVER_LABELS[currentServer.name] || currentServer.name}`}
                        allowFullScreen
                    />

                    {/* Floating Zoom Button - Bottom Right (Extreme Edge) */}
                    <div className="absolute bottom-4 right-4 z-[9999] opacity-100 lg:opacity-0 lg:group-hover/player:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-md shadow-2xl rounded-full"
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
