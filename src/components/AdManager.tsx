import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const AD_URLS = [
    "https://balkliving.com/h7j148nt?key=4410022172dc075167992dcbdce8a144",
    
];

/**
 * AdManager Component
 * 
 * Handles popunder ads by intercepting the first click on each route change.
 * Uses sessionStorage to ensure the ad only triggers once per page visit/session.
 */
const AdManager: React.FC = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    /**
     * Resets the ad state to visible.
     * We removed the sessionStorage check to make it trigger every time.
     */
    const resetAdState = useCallback(() => {
        setIsVisible(true);
    }, []);

    // Reset overlay whenever the user navigates
    useEffect(() => {
        resetAdState();
    }, [location.pathname, resetAdState]);

    // Optional: Re-show the ad after a delay to fulfill "mora kola event"
    // This allows multiple popunders even on the same page after some interaction time.
    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000); // 5 seconds "cooldown" before it can trigger again
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    const handleAdTrigger = () => {
        const randomUrl = AD_URLS[Math.floor(Math.random() * AD_URLS.length)];

        // 1. Open the ad link in a new window with specific features
        // Providing dimensions can sometimes trick browsers into backgrounding it
        const adWindow = window.open(randomUrl, "_blank", "width=100,height=100,left=0,top=0");

        // 2. Immediate focus back to our app
        window.focus();

        // 3. Robust refocusing: Wait a tiny bit then focus again
        setTimeout(() => {
            window.focus();
            if (adWindow) {
                adWindow.blur();
            }
        }, 100);

        // 4. Hide the overlay
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            id="ad-manager-overlay"
            onClick={handleAdTrigger}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                zIndex: 9999,
                backgroundColor: "transparent",
                cursor: "pointer",
            }}
        />
    );
};

export default AdManager;
