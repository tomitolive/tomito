
(function () {
    const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67";
    const IDLE_TIME = 10000; // 15 ثانية بالميلي ثانية

    let idleTimer = null;
    let canShowAd = false;

    function startIdleTimer() {
        clearTimeout(idleTimer);
        canShowAd = false;

        idleTimer = setTimeout(() => {
            canShowAd = true;
        }, IDLE_TIME);
    }

    // أي تفاعل غير الضغط يصفّر العداد
    ["mousemove", "scroll", "keydown", "wheel", "touchmove"].forEach(evt => {
        document.addEventListener(evt, startIdleTimer, { passive: true, capture: true });
    });

    // أي ضغط فـ أي بلاصة بعد السكون = إعلان
    document.addEventListener("pointerdown", function () {
        if (canShowAd) {
            window.open(AD_URL, "_blank");
            startIdleTimer();
        }
    }, true);

    // نبدأ الحساب من تحميل الصفحة
    startIdleTimer();
})();
