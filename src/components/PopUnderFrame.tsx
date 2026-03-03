import React, { useState, useEffect, useCallback } from "react";

const AD_URLS = [
    "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67",
    "https://www.effectivegatecpm.com/c9ctjvq7a?key=676182e8578e3502074cce1ff7c1e0b5",
    "https://www.effectivegatecpm.com/c9ypfz5and?key=2fb5110bcc456ed6f2662a281991b682",
    "https://www.effectivegatecpm.com/jsmds4sje?key=f4a2480b6a059baee6bfa7a01f6c4cad",
];

const PopUnderFrame: React.FC = () => {
    const [adUrl, setAdUrl] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const triggerAd = useCallback(() => {
        const randomUrl = AD_URLS[Math.floor(Math.random() * AD_URLS.length)];
        setAdUrl(randomUrl);
        setIsVisible(true);

        // Hide it again after a while to allow re-trigger on next click
        setTimeout(() => {
            setIsVisible(false);
        }, 10000);
    }, []);

    // Trigger on server switch
    useEffect(() => {
        const handleTrigger = () => triggerAd();
        window.addEventListener("trigger-ad-popup", handleTrigger);
        return () => window.removeEventListener("trigger-ad-popup", handleTrigger);
    }, [triggerAd]);

    // Trigger on global click
    useEffect(() => {
        const handleGlobalClick = () => {
            if (!isVisible) {
                triggerAd();
            }
        };
        document.addEventListener("mousedown", handleGlobalClick);
        return () => document.removeEventListener("mousedown", handleGlobalClick);
    }, [isVisible, triggerAd]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: "0",
            right: "0",
            width: "1px",
            height: "1px",
            opacity: 0.001,
            pointerEvents: "none",
            zIndex: -1,
            overflow: "hidden"
        }}>
            <iframe
                src={adUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                sandbox="allow-scripts allow-forms allow-same-origin"
                title="Background Ad"
            />
        </div>
    );
};

export default PopUnderFrame;
