import React, { useEffect } from "react";

/**
 * AdPopup component for mobile devices.
 * Injects a popunder script with a 24-hour cooldown.
 */
const AdPopup: React.FC = () => {
    useEffect(() => {
        const COOLDOWN_KEY = "lastMobileAdPop";
        const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        const now = Date.now();
        const lastPop = localStorage.getItem(COOLDOWN_KEY);

        // Check if we are within the cooldown period
        if (lastPop && now - parseInt(lastPop) < COOLDOWN_PERIOD) {
            console.log("Mobile ad is on cooldown.");
            return;
        }

        // Create the script element
        const script = document.createElement("script");
        script.src = "https://balkliving.com/44/a7/57/44a757e47648e558150dd1b716ab3c93.js";
        script.async = true;

        // Append to body
        document.body.appendChild(script);

        // Update the last pop timestamp
        localStorage.setItem(COOLDOWN_KEY, now.toString());

        // Cleanup on unmount
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // This component does not render any visible UI
    return null;
};

export default AdPopup;
