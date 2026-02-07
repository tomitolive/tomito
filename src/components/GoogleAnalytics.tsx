import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
    const location = useLocation();

    useEffect(() => {
        pageview(location.pathname + location.search);
    }, [location]);

    return null;
};

export default GoogleAnalytics;
