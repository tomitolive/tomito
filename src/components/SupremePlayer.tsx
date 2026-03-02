import React, { useState, useEffect, useRef } from "react";
import { Server, Play, Maximize2, Minimize2 } from "lucide-react";
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
    const [shieldClicks, setShieldClicks] = useState(2);
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
        setShieldClicks(2); // Reset shield on server change
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

                    {/* AdBlock Shield Overlay */}
                    {shieldClicks > 0 && (
                        <div
                            className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[6px] cursor-pointer flex flex-col items-center justify-center group/shield transition-all duration-500"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShieldClicks(prev => prev - 1);
                            }}
                        >
                            <div className="relative">
                                <div className={cn(
                                    "absolute inset-0 bg-primary/20 blur-3xl rounded-full transition-all duration-700",
                                    shieldClicks === 1 ? "bg-orange-500/30 scale-150" : "group-hover/shield:scale-150"
                                )} />
                                <div className={cn(
                                    "relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 transition-all duration-500",
                                    shieldClicks === 1 ? "bg-orange-500 scale-110 rotate-12" : "bg-primary group-hover/shield:scale-110"
                                )}>
                                    {shieldClicks === 2 ? (
                                        <Play className="w-12 h-12 fill-white translate-x-1" />
                                    ) : (
                                        <svg className="w-12 h-12 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 text-center space-y-4 max-w-xs px-6">
                                <p className="text-2xl font-black text-white tracking-tight">
                                    {shieldClicks === 2 ? "تشغيل آمن" : "تأكيد الحماية"}
                                </p>

                                <div className={cn(
                                    "flex items-center gap-2 justify-center px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                                    shieldClicks === 2
                                        ? "bg-green-500/10 border border-green-500/20 text-green-500"
                                        : "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                                )}>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full animate-pulse",
                                        shieldClicks === 2 ? "bg-green-500" : "bg-orange-500"
                                    )} />
                                    {shieldClicks === 2 ? "SHIELD ACTIVE" : "BLOCKING POPUPS... CLICK AGAIN"}
                                </div>

                                <p className="text-white/40 text-[10px] font-bold leading-relaxed">
                                    {shieldClicks === 2
                                        ? "اضغط هنا لبدء المشاهدة بدون إعلانات منبثقة"
                                        : "نقرة واحدة أخيرة لفتح المشغل بأمان تام"}
                                </p>
                            </div>

                            <div className="absolute bottom-10 flex flex-col items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className={cn("w-8 h-1 rounded-full transition-all duration-500", shieldClicks <= 2 ? "bg-primary" : "bg-white/10")} />
                                    <div className={cn("w-8 h-1 rounded-full transition-all duration-500", shieldClicks <= 1 ? "bg-primary" : "bg-white/10")} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating Zoom Button */}
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
