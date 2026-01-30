(function () {

  // ================= CONFIG =================

  const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka"; // رابط الإعلان
  const AD_KEY = "c4910c58837838bcdfd2133530744a67";

  const MAX_IDLE_TIME = 8000; // 5 ثواني سكون قبل ظهور الرسالة
  const COOLDOWN_TIME = 10000; // انتظار بين الإعلانات

  const MOVE_THROTTLE = 300; // mousemove / wheel كل 300ms فقط

  // ================= STATE =================

  let idleTimer = null;
  let inCooldown = false;
  let adCount = 0;
  let totalInteractions = 0;
  let firstInteractionDone = false;
  let lastMoveTime = 0;

  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    .test(navigator.userAgent);

  // ================= UTILS =================

  function now() {
    return performance.now();
  }

  function generateAdLink() {
    return `${AD_URL}?key=${AD_KEY}&t=${Date.now()}&c=${adCount}`;
  }

  function showAdMessage() {
    if (inCooldown || !firstInteractionDone || isMobile) return;

    inCooldown = true;
    adCount++;

    // إنشاء العنصر ديال الرسالة
    const adOverlay = document.createElement("div");
    adOverlay.id = "netflix-ad-overlay";
    adOverlay.innerHTML = `
      <div class="ad-content">
        <h2>⚠️ انتبه!</h2>
        <p>لبقاءك في الصفحة ومتابعة المحتوى، يجب عليك مشاهدة الإعلان أولاً.</p>
        <button id="ad-watch-btn">شاهد الإعلان الآن</button>
      </div>
    `;

    document.body.appendChild(adOverlay);

    // ستايل شبيه بـ Netflix
    const style = document.createElement("style");
    style.innerHTML = `
      #netflix-ad-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
        color: #fff;
      }
      #netflix-ad-overlay .ad-content {
        text-align: center;
        max-width: 500px;
        padding: 30px;
        background: #141414;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0,0,0,0.7);
      }
      #netflix-ad-overlay h2 {
        font-size: 2em;
        margin-bottom: 20px;
        color: #E50914;
      }
      #netflix-ad-overlay p {
        font-size: 1.2em;
        margin-bottom: 25px;
      }
      #ad-watch-btn {
        padding: 12px 25px;
        font-size: 16px;
        background: #E50914;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: #fff;
        transition: background 0.3s;
      }
      #ad-watch-btn:hover {
        background: #B81D24;
      }
    `;
    document.head.appendChild(style);

    // عند الضغط على الزر، نفتح الإعلان
    document.getElementById("ad-watch-btn").addEventListener("click", () => {
      window.open(generateAdLink(), "_blank");
      document.body.removeChild(adOverlay);
      inCooldown = false; // يمكن تكرار العملية
      resetIdleTimer();
    });
  }

  // ================= IDLE LOGIC =================

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      showAdMessage();
    }, MAX_IDLE_TIME);
  }

  // ================= COUNTING =================

  function countInteraction(type) {
    totalInteractions++;
    resetIdleTimer();
  }

  // ================= HANDLERS =================

  function handleStrongInteraction(e) {
    if (!firstInteractionDone) {
      firstInteractionDone = true;
      resetIdleTimer();
      return;
    }
    countInteraction(e.type);
  }

  function handleMoveInteraction(e) {
    const currentTime = now();
    if (currentTime - lastMoveTime < MOVE_THROTTLE) return;
    lastMoveTime = currentTime;

    if (!firstInteractionDone) {
      firstInteractionDone = true;
      resetIdleTimer();
      return;
    }

    countInteraction(e.type);
  }

  // ================= EVENTS =================

  if (!isMobile) {
    document.addEventListener("click", handleStrongInteraction, true);
    document.addEventListener("keydown", handleStrongInteraction, true);
    document.addEventListener("pointerdown", handleStrongInteraction, true);

    document.addEventListener("mousemove", handleMoveInteraction, {
      passive: true,
      capture: true
    });

    document.addEventListener("wheel", handleMoveInteraction, {
      passive: true,
      capture: true
    });
  }

  resetIdleTimer();

})();
