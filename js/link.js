(function () {
  // ============ CONFIG ============
  const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67";
  const MAX_IDLE_TIME = 5000;   // 5 ثواني سكون
  const AD_COOLDOWN = 10000;    // 10 ثواني بين الإعلانات

  // ============ VARIABLES ============
  let idleTimer = null;
  let isIdle = false;
  let lastAdTime = 0;

  // ============ FUNCTIONS ============

  function showAd() {
    const now = Date.now();
    if (now - lastAdTime < AD_COOLDOWN) return;

    lastAdTime = now;

    const adWindow = window.open(AD_URL, "_blank", "width=300,height=250");

    if (!adWindow) {
      createAdIframe();
    }
  }

  function createAdIframe() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.7);
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:9999;
    `;

    const box = document.createElement("div");
    box.style.cssText = `
      background:#000;
      border-radius:12px;
      overflow:hidden;
    `;

    const iframe = document.createElement("iframe");
    iframe.src = AD_URL;
    iframe.width = "300";
    iframe.height = "250";
    iframe.style.border = "0";

    overlay.onclick = () => document.body.removeChild(overlay);

    box.appendChild(iframe);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    isIdle = false;

    idleTimer = setTimeout(() => {
      isIdle = true;
    }, MAX_IDLE_TIME);
  }

  function onActivity() {
    if (isIdle) {
      showAd();
      isIdle = false;
    }
    resetIdle();
  }

  // ============ EVENTS ============
  ["mousemove", "mousedown", "scroll", "touchstart", "keydown"].forEach(e =>
    document.addEventListener(e, onActivity, true)
  );

  // ============ INIT ============
  resetIdle();
})();
