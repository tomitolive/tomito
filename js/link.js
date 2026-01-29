(function () {

    // ================= CONFIG =================
    const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka";
    const AD_KEY = "c4910c58837838bcdfd2133530744a67";
  
    const MAX_IDLE_TIME = 5000;     // أقصى سكون 5 ثواني
    const COOLDOWN_TIME = 8000;     // انتظار بين الإعلانات
    const CLICKS_FOR_AD = 20;        // 5 ضغطات = إعلان
  
    // ================= STATE =================
    let idleTimer = null;
    let inCooldown = false;
    let adCount = 0;
    let clickCount = 0;
    let firstInteractionDone = false;
  
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  
    // ================= UTILS =================
    function generateAdLink() {
      return `${AD_URL}?key=${AD_KEY}&t=${Date.now()}&c=${adCount}`;
    }
  
    function triggerAd(reason) {
      if (inCooldown) return;
      if (!firstInteractionDone) return;
  
      const link = generateAdLink();
      adCount++;
      inCooldown = true;
      clickCount = 0;
  
      console.log("[AdSmart] Ad triggered:", reason);
  
      if (isMobile) {
        // الهاتف: بلا popup
        location.href = link;
      } else {
        // الحاسوب
        window.open(link, "_blank");
      }
  
      setTimeout(() => {
        inCooldown = false;
      }, COOLDOWN_TIME);
    }
  
    // ================= IDLE LOGIC =================
    function resetIdleTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        triggerAd("IDLE");
      }, MAX_IDLE_TIME);
    }
  
    // ================= INTERACTION HANDLER =================
    function handleInteraction() {
  
      // أول تفاعل = تفعيل فقط
      if (!firstInteractionDone) {
        firstInteractionDone = true;
        resetIdleTimer();
        return;
      }
  
      clickCount++;
  
      if (clickCount >= CLICKS_FOR_AD) {
        triggerAd("CLICKS");
      }
  
      resetIdleTimer();
    }
  
    // ================= EVENTS =================
    const EVENTS = isMobile
      ? ["touchstart", "pointerdown"]
      : ["click", "mousemove", "keydown", "wheel", "pointerdown"];
  
    EVENTS.forEach(evt => {
      document.addEventListener(evt, handleInteraction, {
        passive: true,
        capture: true
      });
    });
  
    resetIdleTimer();
  
  })();
  