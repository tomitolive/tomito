
(function () {
    const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67";
    const IDLE_TIME = 10000; // 10 ثواني
    const COOLDOWN = 30000; // ما يعاودش الإشهار حتى يدوز 30 ثانية

    let idleTimer = null;
    let isIdle = false;
    let canShowAd = false;
    let lastAdTime = 0;

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        isIdle = false;
        canShowAd = false;

        idleTimer = setTimeout(() => {
            isIdle = true;
            canShowAd = true;
        }, IDLE_TIME);
    }

    function openAd() {
        const now = Date.now();
        if (!canShowAd) return;
        if (now - lastAdTime < COOLDOWN) return;

        lastAdTime = now;
        canShowAd = false;
        isIdle = false;

        // فتح الإشهار (Popunder friendly)
        const adWindow = window.open(AD_URL, "_blank");
        if (adWindow) adWindow.blur();
        window.focus();

        resetIdleTimer();
    }

    // أي حركة ديال المستخدم ترجع التايمر
    ["mousemove", "scroll", "keydown", "touchstart"].forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, true);
    });

    // أول كليك بعد السكون = إشهار
    document.addEventListener("click", function () {
        if (isIdle) {
            openAd();
        }
    }, true);

    // بدا التايمر منين تحل الموقع
    resetIdleTimer();
})();