export const GA_TRACKING_ID = "G-QR5KZFJ6HH";

// Log specific events
export const event = ({ action, category, label, value }: {
    action: string;
    category: string;
    label: string;
    value?: number;
}) => {
    if (typeof window.gtag !== "undefined") {
        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Log page views
export const pageview = (url: string) => {
    if (typeof window.gtag !== "undefined") {
        window.gtag("config", GA_TRACKING_ID, {
            page_path: url,
        });
    }
};
