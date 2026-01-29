
(function () {
    const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67";

    let idleTimer = null;
    let canShowAd = false;

    function getIdleTime() {
        // بين 10 و 12 ثانية
        return 10000 + Math.random() * 2000;
    }

    function startIdleTimer() {
        clearTimeout(idleTimer);
        canShowAd = false;

        idleTimer = setTimeout(() => {
            canShowAd = true;
        }, getIdleTime());
    }

    // أي تفاعل غير الضغط يصفّر العداد
    ["mousemove", "scroll", "keydown", "wheel", "touchmove"].forEach(evt => {
        document.addEventListener(evt, startIdleTimer, { passive: true, capture: true });
    });

    // أي ضغط فـ أي بلاصة = إعلان (إلا كان سكون)
    document.addEventListener("pointerdown", function () {
        if (canShowAd) {
            window.open(AD_URL, "_blank");
            startIdleTimer();
        }
    }, true);

    // البداية
    startIdleTimer();
})();
