(function () {
    'use strict';

    // ================= CONFIG =================
    const CONFIG = {
        adUrls: [
            'https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67',
            'https://www.effectivegatecpm.com/c9ctjvq7a?key=676182e8578e3502074cce1ff7c1e0b5',
            'https://www.effectivegatecpm.com/c9ypfz5and?key=2fb5110bcc456ed6f2662a281991b682',
            'https://www.effectivegatecpm.com/jsmds4sje?key=f4a2480b6a059baee6bfa7a01f6c4cad'
        ],
        idleTime: 5000,
        countdown: 7,
        cooldown: 15000
    };

    let idleTimer;
    let isIdle = false;
    let popupOpen = false;
    let inCooldown = false;

    // ================= PAGE ROTATION =================
    function getPageAd() {
        let index = Number(sessionStorage.getItem('ad_index')) || 0;
        const url = CONFIG.adUrls[index % CONFIG.adUrls.length];
        sessionStorage.setItem('ad_index', index + 1);
        return url;
    }

    // ================= SPEED =================
    function warmUp(url) {
        try {
            const u = new URL(url);
            ['dns-prefetch', 'preconnect'].forEach(rel => {
                const l = document.createElement('link');
                l.rel = rel;
                l.href = u.origin;
                if (rel === 'preconnect') l.crossOrigin = '';
                document.head.appendChild(l);
            });
        } catch (e) {}
    }

    // ================= IDLE =================
    function startIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => isIdle = true, CONFIG.idleTime);
    }

    function resetIdle() {
        if (!popupOpen) {
            isIdle = false;
            startIdle();
        }
    }

    // ================= AD =================
    function showAd() {
        if (popupOpen || inCooldown) return;
        popupOpen = true;

        const adUrl = getPageAd();
        warmUp(adUrl);

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;
            inset:0;
            z-index:999999;
            background:rgba(0,0,0,.7);
            display:flex;
            align-items:center;
            justify-content:center;
        `;

        overlay.innerHTML = `
<div style="
    position:relative;
    width:90vw;
    height:90vh;
    max-width:420px;
    max-height:720px;
">
    <button id="closeAd"
        style="
            position:absolute;
            top:-14px;
            right:-14px;
            width:50px;
            height:50px;
            border-radius:50%;
            border:none;
            font-size:16px;
            cursor:pointer;
            z-index:10;
            background:rgba(0,0,0,0.5);
            color:#fff;
            display:flex;
            align-items:center;
            justify-content:center;
        ">
        ${CONFIG.countdown}
    </button>

    <iframe
        src="${adUrl}"
        style="
            width:100%;
            height:100%;
            border:none;
            border-radius:12px;
            background:#000;
        "
        loading="eager"
        allow="autoplay; fullscreen"
        referrerpolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox">
    </iframe>
</div>
        `;

        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('#closeAd');

        // العداد داخل الزر
        let t = CONFIG.countdown;
        const timer = setInterval(() => {
            t--;
            if (t > 0) {
                closeBtn.textContent = t;
            } else {
                clearInterval(timer);
                closeBtn.textContent = '✕';
            }
        }, 1000);

        closeBtn.onclick = () => {
            overlay.remove();
            popupOpen = false;
            isIdle = false;
            inCooldown = true;
            setTimeout(() => inCooldown = false, CONFIG.cooldown);
        };
    }

    // ================= EVENTS =================
    const activityEvents = ['mousemove', 'scroll', 'keydown', 'input', 'focusin'];
    activityEvents.forEach(evt => {
        document.addEventListener(evt, resetIdle, evt === 'scroll' ? { passive: true } : false);
    });

    function interactionHandler() {
        if (isIdle && !popupOpen && !inCooldown) {
            showAd();
        }
        resetIdle();
    }

    // للحاسوب
    document.addEventListener('click', interactionHandler, true);
    // للموبايل
    document.addEventListener('touchstart', interactionHandler, { passive: true });
    // شامل لجميع الأجهزة الحديثة
    document.addEventListener('pointerdown', interactionHandler, true);

    // ================= VISIBILITY =================
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !popupOpen && !inCooldown) {
            showAd();
        }
    });

    startIdle();
})();
