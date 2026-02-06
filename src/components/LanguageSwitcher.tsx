'use client';

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TMDB_CONFIG, getCurrentLanguage, setLanguage, Language } from "@/lib/tmdb";
import { useState } from "react";

export function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setCurrentLang(lang);
        // Reload to apply changes if needed, or just let React handle it if we use state.
        // The current implementation of tmdb.ts updates document.documentElement directly.
        // Many components use getCurrentLanguage() so they might need a refresh.
        window.location.reload();
    };

    const currentLanguageName = TMDB_CONFIG.SUPPORTED_LANGUAGES.find(
        (l) => l.code === currentLang
    )?.name || "Language";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 hover:bg-accent">
                    <Languages className="w-4 h-4 text-muted-foreground" />
                    <span className="hidden sm:inline text-xs font-medium">{currentLanguageName}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                {TMDB_CONFIG.SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className={`cursor-pointer justify-between ${currentLang === lang.code ? "bg-accent text-primary font-bold" : ""
                            }`}
                        onClick={() => handleLanguageChange(lang.code as Language)}
                    >
                        {lang.name}
                        {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
