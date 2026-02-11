import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const AD_URLS = [
    "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67",
    "https://www.effectivegatecpm.com/c9ctjvq7a?key=676182e8578e3502074cce1ff7c1e0b5",
    "https://www.effectivegatecpm.com/c9ypfz5and?key=2fb5110bcc456ed6f2662a281991b682",
    "https://www.effectivegatecpm.com/jsmds4sje?key=f4a2480b6a059baee6bfa7a01f6c4cad",
];

const AdPopup: React.FC = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [countdown, setCountdown] = useState(7);
    const [adUrl, setAdUrl] = useState("");
    const [dimensions, setDimensions] = useState({ width: "450px", height: "250px" });
    const [isHovered, setIsHovered] = useState(false);

    // Common reset function for all triggers
    const resetAd = useCallback(() => {
        setIsVisible(true);
        setCountdown(7);
        const randomUrl = AD_URLS[Math.floor(Math.random() * AD_URLS.length)];
        setAdUrl(randomUrl);
    }, []);

    // Trigger: Route change
    useEffect(() => {
        resetAd();
    }, [location.pathname, resetAd]);

    // Trigger: Visibility change (returning to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                resetAd();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [resetAd]);

    useEffect(() => {
        if (!isVisible) return;

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Responsive dimensions handler
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 768) {
                setDimensions({
                    width: `${width * 0.9}px`,
                    height: `${height * 0.25}px`,
                });
            } else if (width >= 768 && width <= 1024) {
                setDimensions({ width: "400px", height: "180px" });
            } else {
                setDimensions({ width: "450px", height: "250px" });
            }
        };

        handleResize(); // Initial call
        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(timer);
            window.removeEventListener("resize", handleResize);
        };
    }, [isVisible, adUrl]); // Restart timer if adUrl changes (reset occurs)

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const containerStyle: React.CSSProperties = {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        maxWidth: "95vw",
    };

    const iframeContainerStyle: React.CSSProperties = {
        position: "relative",
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.1)",
    };

    const badgeStyle: React.CSSProperties = {
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: countdown === 0 ? (isHovered ? "#333333" : "#666666") : "rgba(0, 0, 0, 0.6)",
        color: "#fff",
        border: "none",
        cursor: countdown === 0 ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "bold",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        transition: "background-color 0.2s ease, transform 0.2s ease",
        zIndex: 10000,
        backdropFilter: countdown === 0 ? "none" : "blur(4px)",
    };

    return (
        <div style={containerStyle}>
            <div style={iframeContainerStyle}>
                <div
                    style={badgeStyle}
                    onClick={countdown === 0 ? handleClose : undefined}
                    onMouseEnter={() => countdown === 0 && setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {countdown > 0 ? countdown : "×"}
                </div>
                <iframe
                    src={adUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    title="Advertisement"
                />
            </div>
        </div>
    );
};

export default AdPopup;
