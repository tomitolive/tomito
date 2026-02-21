import React, { useState } from "react";
import { Server, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupremeServer } from "@/hooks/useSupremeServers";

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
            <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
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
            <div className="relative group max-w-4xl mx-auto">
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/50">
                    <iframe
                        key={iframeKey}
                        src={currentServer.url}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share"
                        title={`${title} - ${SERVER_LABELS[currentServer.name] || currentServer.name}`}
                    />
                </div>
            </div>
        </div>
    );
}
