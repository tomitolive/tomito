import React, { useEffect } from "react";

/**
 * AdPopup component for mobile devices.
 * Instead of a visible popup, it injects a popunder script.
 */
const AdPopup: React.FC = () => {
    useEffect(() => {
        // Create the script element
        const script = document.createElement("script");
        script.src = "https://balkliving.com/44/a7/57/44a757e47648e558150dd1b716ab3c93.js";
        script.async = true;

        // Append to body
        document.body.appendChild(script);

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
