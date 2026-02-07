import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
    const location = useLocation();

    useEffect(() => {
        if (typeof window.gtag === "function") {
            window.gtag("config", "G-QR5KZFJ6HH", {
                page_path: location.pathname + location.search,
            });
        }
    }, [location]);

    return null;
};

export default GoogleAnalytics;
