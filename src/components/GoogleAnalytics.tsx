"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "../lib/analytics";

declare global {
    interface Window {
        gtag: (
            command: "config" | "event" | "js" | "set",
            targetId: string,
            config?: Record<string, any>
        ) => void;
    }
}

const GoogleAnalytics = () => {
    const location = { pathname: usePathname(), search: useSearchParams().toString() };

    useEffect(() => {
        pageview(location.pathname + location.search);
    }, [location]);

    return null;
};

export default GoogleAnalytics;
