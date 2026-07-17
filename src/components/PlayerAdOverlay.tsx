import { useEffect, useRef, useState } from "react";

interface PlayerAdOverlayProps {
  onClose: () => void;
  poster?: string;
  title?: string;
}

export function PlayerAdOverlay({ onClose, poster, title }: PlayerAdOverlayProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(15); // 7 seconds countdown as requested

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydrate MagSrv banner script
  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clear and build the ad tags
    adContainerRef.current.innerHTML = "";

    const insNode = document.createElement("ins");
    insNode.className = "eas6a97888e31";
    insNode.setAttribute("data-zoneid", "5979274");
    // Ensure the advertisement fills the parent container length & width (100% size of the frame)
    insNode.style.display = "block";
    insNode.style.width = "100%";
    insNode.style.height = "100%";
    adContainerRef.current.appendChild(insNode);

    const scriptNode = document.createElement("script");
    scriptNode.type = "application/javascript";
    scriptNode.async = true;
    scriptNode.src = "https://a.magsrv.com/ad-provider.js";
    adContainerRef.current.appendChild(scriptNode);

    const pushScriptNode = document.createElement("script");
    pushScriptNode.type = "text/javascript";
    pushScriptNode.textContent =
      '(window.AdProvider = window.AdProvider || []).push({"serve": {}});';
    adContainerRef.current.appendChild(pushScriptNode);

    try {
      const AdProvider = (window as any).AdProvider || [];
      AdProvider.push({ serve: {} });
    } catch (e) {
      console.warn("Failed pushing to AdProvider in overlay:", e);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-30 bg-black select-none text-white overflow-hidden rounded-xl">
      {/* Background Poster overlay for gorgeous cinematic look */}
      {poster && (
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center z-0 blur-sm"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* The Ad Container taking 100% length and width of the frame */}
      <div
        ref={adContainerRef}
        className="w-full h-full absolute inset-0 z-10 flex items-center justify-center bg-transparent"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Glassmorphic floating controls on top of the ad */}
      <div className="absolute inset-x-0 top-0 z-20 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
        <span className="text-[10px] pointer-events-auto uppercase tracking-widest text-primary font-black bg-primary/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/30">
          إعلان ممول
        </span>
        {title && (
          <span className="text-[11px] font-bold text-gray-300 drop-shadow-md line-clamp-1 max-w-[50%]">
            {title}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center pointer-events-none">
        <button
          onClick={countdown === 0 ? onClose : undefined}
          disabled={countdown > 0}
          className={`pointer-events-auto h-11 px-8 rounded-xl font-bold flex items-center justify-center gap-2 border shadow-2xl backdrop-blur-md transition-all duration-300 ${countdown === 0
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/95 hover:scale-[1.03] active:scale-95 cursor-pointer font-black"
            : "bg-black/80 text-gray-300 border-white/10 cursor-not-allowed opacity-80"
            }`}
        >
          {countdown > 0 ? (
            <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5 font-bold">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] animate-pulse">
                {countdown}
              </span>
              انتظر لتخطي الإعلان...
            </span>
          ) : (
            <span className="text-xs flex items-center gap-2 font-black uppercase text-white">
              تخطي الإعلان وبدء المشاهدة ✕
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
