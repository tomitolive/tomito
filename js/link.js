(function () {
    // ================= CONFIG =================
    const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka";
    const AD_KEY = "c4910c58837838bcdfd2133530744a67";
  
    const MAX_IDLE_TIME = 5000;     // 5 ثواني سكون
    const COOLDOWN_TIME = 8000;     // انتظار بين الإعلانات
    const INTERACTIONS_FOR_AD = 20; // كل 20 تفاعل حقيقي = إعلان
  
    const MOVE_THROTTLE = 300;      // mousemove / wheel كل 300ms فقط
  
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
      return performance.now(); // أدق توقيت
    }
  
    function generateAdLink() {
      return `${AD_URL}?key=${AD_KEY}&t=${Date.now()}&c=${adCount}`;
    }
  
    function triggerAd(reason) {
      if (inCooldown || !firstInteractionDone) return;
  
      adCount++;
      inCooldown = true;
  
      const link = generateAdLink();
  
      console.log(
        "[AdSmart]",
        reason,
        "| totalInteractions:",
        totalInteractions
      );
  
      if (isMobile) {
        location.href = link;
      } else {
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
  
    // ================= COUNTING =================
    function countInteraction(type) {
      totalInteractions++;
  
      if (totalInteractions % INTERACTIONS_FOR_AD === 0) {
        triggerAd(type + "_" + totalInteractions);
      }
  
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
    if (isMobile) {
      document.addEventListener("touchstart", handleStrongInteraction, {
        passive: true,
        capture: true
      });
  
      document.addEventListener("pointerdown", handleStrongInteraction, {
        passive: true,
        capture: true
      });
    } else {
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
  