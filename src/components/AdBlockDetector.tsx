import { useEffect, useState } from "react";
import { Shield, ShieldOff, EyeOff, Chrome, RefreshCw } from "lucide-react";

type DetectionReason = "adblock" | "incognito" | null;

// Modern browsers: check storage quota (incognito has very limited quota)
// Incognito detection removed to avoid false positives and allow users to see ads even in Incognito.
async function detectIncognito(): Promise<boolean> {
  return false;
}

// Multiple network detection methods
async function detectNetworkBlock(): Promise<boolean> {
  const adUrls = [
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    "https://googleads.g.doubleclick.net/pagead/ads",
    "https://tpc.googlesyndication.com/safeframe/1-0-37/html/container.html",
    "https://www.googletagmanager.com/gtag/js",
  ];

  let blockedCount = 0;

  for (const url of adUrls) {
    try {
      await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
    } catch (error) {
      blockedCount++;
    }
  }

  // If more than half of the URLs are blocked, consider it adblock
  return blockedCount >= Math.ceil(adUrls.length / 2);
}

// Advanced DOM bait detection with multiple patterns
async function detectDOMBlock(): Promise<boolean> {
  const baitClasses = [
    "pub_300x250",
    "pub_300x250m",
    "pub_728x90",
    "text-ad",
    "textAd",
    "text_ad",
    "text_ads",
    "text-ads",
    "text-ad-links",
    "ad-text",
    "adSense",
    "adBlock",
    "adContent",
    "adBanner",
    "adsbox",
    "adsbygoogle",
    "google-ad",
    "google_ads",
    "google-ad-block",
    "ad-placement",
    "ad-sidebar",
    "ad-banner",
    "ad-container",
    "ad-wrapper",
    "ad-unit",
    "ad-slot",
    "ad-space",
    "advertisement",
    "banner-ad",
    "sponsor-ad",
  ];

  const baitIds = [
    "ad-banner",
    "ad-sidebar",
    "ad-container",
    "google-ads",
    "adsense",
    "ad-block",
  ];

  let blockedCount = 0;
  const baits: HTMLElement[] = [];

  try {
    // Test with class-based baits
    for (let i = 0; i < 3; i++) {
      const bait = document.createElement("div");
      bait.className = baitClasses.join(" ");
      bait.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
      document.body.appendChild(bait);
      baits.push(bait);
    }

    // Test with id-based baits
    for (const id of baitIds) {
      const bait = document.createElement("div");
      bait.id = id;
      bait.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
      document.body.appendChild(bait);
      baits.push(bait);
    }

    // Test with iframe bait
    const iframeBait = document.createElement("iframe");
    iframeBait.className = baitClasses.join(" ");
    iframeBait.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
    document.body.appendChild(iframeBait);
    baits.push(iframeBait);

    await new Promise((r) => setTimeout(r, 300));

    for (const bait of baits) {
      const computed = window.getComputedStyle(bait);
      const isHidden =
        bait.offsetHeight === 0 ||
        bait.offsetParent === null ||
        computed.display === "none" ||
        computed.visibility === "hidden" ||
        computed.opacity === "0" ||
        computed.height === "0px" ||
        computed.width === "0px";

      if (isHidden) blockedCount++;
    }

    // Cleanup
    for (const bait of baits) {
      if (bait.parentNode) {
        document.body.removeChild(bait);
      }
    }

    // If more than half are blocked, consider it adblock
    return blockedCount >= Math.ceil(baits.length / 2);
  } catch (_) {
    return true;
  }
}

// Detect if ad scripts are blocked from loading
async function detectScriptBlock(): Promise<boolean> {
  try {
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.async = true;
    script.style.cssText = "position:absolute;top:-9999px;left:-9999px;";
    
    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        resolve(true); // If it doesn't load quickly, it's likely blocked
      }, 2000);

      script.onload = () => {
        clearTimeout(timeout);
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        resolve(false);
      };

      script.onerror = () => {
        clearTimeout(timeout);
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        resolve(true);
      };

      document.body.appendChild(script);
    });
  } catch (_) {
    return true;
  }
}

// Detect CSS rules that hide ads
function detectCSSBlock(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const testElement = document.createElement("div");
      testElement.className = "adsbox ad-banner advertisement";
      testElement.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
      document.body.appendChild(testElement);

      setTimeout(() => {
        const computed = window.getComputedStyle(testElement);
        const isHidden =
          computed.display === "none" ||
          computed.visibility === "hidden" ||
          computed.opacity === "0" ||
          computed.height === "0px" ||
          computed.width === "0px";

        if (testElement.parentNode) {
          document.body.removeChild(testElement);
        }
        resolve(isHidden);
      }, 100);
    } catch (_) {
      resolve(true);
    }
  });
}

// Detect if window properties are blocked
function detectWindowBlock(): boolean {
  try {
    // Some adblockers block these properties
    const testProps = ["google_adblock", "adblock_detected", "canRunAds"];
    let blocked = false;

    for (const prop of testProps) {
      if (window[prop as keyof Window] !== undefined) {
        blocked = true;
      }
    }

    return blocked;
  } catch (_) {
    return false;
  }
}

// Combined detection with multiple methods
async function detectAdBlock(): Promise<boolean> {
  const results = await Promise.all([
    detectNetworkBlock(),
    detectDOMBlock(),
    detectScriptBlock(),
    detectCSSBlock(),
  ]);

  const windowBlocked = detectWindowBlock();

  // If any 2 or more methods detect adblock, consider it blocked
  const blockedCount = results.filter(r => r).length + (windowBlocked ? 1 : 0);
  return blockedCount >= 2;
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
              <ShieldOff className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">
              <span className="block mb-1">تم اكتشاف مانع الإعلانات</span>
              <span className="block text-sm text-gray-400">Ad Blocker Detected</span>
            </h2>
            <div className="text-sm leading-relaxed">
              <p className="text-gray-300">يبدو أنك تستخدم إضافة لمنع الإعلانات. الإعلانات هي المصدر الوحيد الذي يُبقي هذا الموقع مجانياً للجميع.</p>
              <p className="text-gray-500 mt-1" dir="ltr">It seems you are using an Ad Blocker. Ads are the only source of income that keeps this site free for everyone.</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Steps */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">كيفية تعطيل مانع الإعلانات</p>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">How to disable AdBlock</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold mt-1">1</div>
                <div>
                  <p className="text-sm text-gray-200">ابحث عن أيقونة الدرع أو الإضافة في شريط أدوات المتصفح</p>
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">Look for the shield or extension icon in your browser toolbar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold mt-1">2</div>
                <div>
                  <p className="text-sm text-gray-200">اضغط عليها ثم اختر "تعطيل على هذا الموقع" أو "Pause on this site"</p>
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">Click on it and select "Disable on this site" or "Pause on this site"</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold mt-1">3</div>
                <div>
                  <p className="text-sm text-gray-200">أعد تحميل الصفحة بالضغط على زر التحديث أدناه</p>
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">Reload the page by clicking the refresh button below</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Buttons */}
          <div className="flex justify-center mt-4 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>تحديث الصفحة</span>
              </div>
              <span className="text-[10px] opacity-70">Refresh Page</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="text-center">
            <p className="text-xs text-gray-400">شكراً لدعمك الموقع ❤️ — الإعلانات تساعدنا في الاستمرار مجاناً</p>
            <p className="text-[10px] text-gray-500 mt-1">Thank you for supporting the site ❤️ — Ads help us stay free</p>
          </div>
        </div>
      </div>
    </div>
  );
}
