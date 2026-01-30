
(function () {
    'use strict';

    // ================= CONFIG =================
    const CONFIG = {
        adUrls: [
            'https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67',
            'https://www.effectivegatecpm.com/c9ctjvq7a?key=676182e8578e3502074cce1ff7c1e0b5'
        ],
        idleTime: 5000,   // سكون حقيقي
        countdown: 6,      // وقت قبل ما يبان X
        cooldown: 15000
    };

    let idleTimer;
    let isIdle = false;
    let popupOpen = false;
    let inCooldown = false;

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
        idleTimer = setTimeout(() => {
            isIdle = true;
        }, CONFIG.idleTime);
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

        const adUrl = CONFIG.adUrls[Math.floor(Math.random() * CONFIG.adUrls.length)];

        // سخّن الاتصال بكري
        warmUp(adUrl);

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '999999';
        overlay.style.background = 'rgba(0,0,0,.6)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        overlay.innerHTML = `
<div style="position:relative">
    <button id="closeAd"
        style="
            display:none;
            position:absolute;
            top:-14px;
            right:-14px;
            width:32px;
            height:32px;
            border-radius:50%;
            border:none;
            font-size:18px;
            cursor:pointer;
        ">✕</button>

    <!-- iframe يتحمّل مباشرة -->
    <iframe id="adFrame"
        loading="eager"
        referrerpolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
    </iframe>
</div>
        `;

        document.body.appendChild(overlay);

        const iframe = overlay.querySelector('#adFrame');
        const closeBtn = overlay.querySelector('#closeAd');

        // 🔥 التحميل من الأول (ما بقاش خاوي)
        iframe.src = adUrl;

        // ===== العداد مخفي، غير باش نتحكمو فـ X =====
        let t = CONFIG.countdown;
        const timer = setInterval(() => {
            t--;
            if (t <= 0) {
                clearInterval(timer);
                closeBtn.style.display = 'block'; // دابا بان X
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

    // حركة حقيقية
    document.addEventListener('mousemove', resetIdle);
    document.addEventListener('scroll', resetIdle, { passive: true });

    // click
    document.addEventListener('click', () => {
        if (isIdle && !popupOpen && !inCooldown) {
            showAd();
        }
        resetIdle();
    }, true);

    // ⌨️ الكتابة = نشاط (ماشي سكون)
    document.addEventListener('keydown', resetIdle);
    document.addEventListener('input', resetIdle);
    document.addEventListener('focusin', resetIdle);

    startIdle();
})();
