import React, { useState, useEffect, useRef } from "react";
import {
    VideoServer,
    MOVIE_SERVERS,
    TV_SERVERS,
    getVideoUrl,
    getImdbIdFromTmdb,
} from "@/lib/tmdb";

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
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-border/50"
        >
            <iframe
                key={key}
                src={videoUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share"
                title={`${title} - ${currentServer.name}`}
            />
        </div>
    );
}
