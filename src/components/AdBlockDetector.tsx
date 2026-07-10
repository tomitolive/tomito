import { useEffect, useState } from "react";
import { Shield, ShieldOff, EyeOff, Chrome, RefreshCw } from "lucide-react";

type DetectionReason = "adblock" | "incognito" | null;

// Modern browsers: check storage quota (incognito has very limited quota)
// Incognito detection removed to avoid false positives and allow users to see ads even in Incognito.
async function detectIncognito(): Promise<boolean> {
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
