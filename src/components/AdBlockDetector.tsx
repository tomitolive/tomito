import { useEffect, useState } from "react";
import { Shield, ShieldOff, EyeOff, Chrome, RefreshCw } from "lucide-react";
import { t } from "@/lib/tmdb";

type DetectionReason = "adblock" | "incognito" | null;

async function detectIncognito(): Promise<boolean> {
  // Modern browsers: check storage quota (incognito has very limited quota)
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const { quota } = await navigator.storage.estimate();
      // In incognito, Chrome limits quota to ~120MB
      if (quota !== undefined && quota < 200 * 1024 * 1024) {
        return true;
      }
    }
  } catch (_) {}
  return false;
}

async function detectAdBlock(): Promise<boolean> {
  // Method 1: Try loading a known ad script URL
  try {
    const bait = document.createElement("div");
    bait.className = "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-text adSense adBlock adContent adBanner adsbox adsbygoogle";
    bait.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
    document.body.appendChild(bait);

    await new Promise((r) => setTimeout(r, 200));

    const blocked =
      bait.offsetHeight === 0 ||
      bait.offsetParent === null ||
      window.getComputedStyle(bait).display === "none" ||
      window.getComputedStyle(bait).visibility === "hidden";

    document.body.removeChild(bait);
    return blocked;
  } catch (_) {
    return true;
  }
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
        {num}
      </div>
      <p className="text-sm text-gray-300 leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

export default function AdBlockDetector() {
  const [reason, setReason] = useState<DetectionReason>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Give the page a moment to load ad scripts properly
      await new Promise((r) => setTimeout(r, 1500));
      if (cancelled) return;

      const [adblocked, incognito] = await Promise.all([
        detectAdBlock(),
        detectIncognito(),
      ]);

      if (cancelled) return;

      if (incognito) {
        setReason("incognito");
      } else if (adblocked) {
        setReason("adblock");
      }

      setChecking(false);
    };

    run();
    return () => { cancelled = true; };
  }, []);

  if (checking || !reason) return null;

  const isIncognito = reason === "incognito";

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{
          background: "linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 100%)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

        <div className="p-7 space-y-5" dir="rtl">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              {isIncognito ? (
                <EyeOff className="w-8 h-8 text-primary" />
              ) : (
                <ShieldOff className="w-8 h-8 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">
              {isIncognito
                ? t("incognitoDetectedTitle" as any)
                : t("adblockDetectedTitle" as any)}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isIncognito
                ? t("incognitoDetectedDesc" as any)
                : t("adblockDetectedDesc" as any)}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Steps */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              {isIncognito ? t("incognitoHowToFix" as any) : t("adblockHowToFix" as any)}
            </p>

            {isIncognito ? (
              <>
                <Step num={1} text={t("incognitoStep1" as any)} />
                <Step num={2} text={t("incognitoStep2" as any)} />
                <Step num={3} text={t("incognitoStep3" as any)} />
              </>
            ) : (
              <>
                <Step num={1} text={t("adblockStep1" as any)} />
                <Step num={2} text={t("adblockStep2" as any)} />
                <Step num={3} text={t("adblockStep3" as any)} />
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Buttons */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full max-w-[200px] flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
            >
              <RefreshCw className="w-4 h-4" />
              {t("refreshPage" as any)}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-600">
            {t("thanksForSupport" as any)}
          </p>
        </div>
      </div>
    </div>
  );
}
