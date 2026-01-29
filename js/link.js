(function () {
    const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67";
    const IDLE_TIME_DESKTOP = 6000; // 6 ثواني فـ PC
    const COOLDOWN_AFTER_AD = 8000; // شحال يستنى قبل ما يقدر يطلع إعلان آخر
    
    let idleTimer = null;
    let cooldownTimer = null;
    let isIdle = false;
    let inCooldown = false;
  
    // كشف واش هاتف ولا PC
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  
    function openAd() {
      if (inCooldown) return;
      
      window.open(AD_URL, "_blank");
      inCooldown = true;
      isIdle = false;
      
      clearTimeout(cooldownTimer);
      cooldownTimer = setTimeout(() => {
        inCooldown = false;
      }, COOLDOWN_AFTER_AD);
    }
  
    function resetIdleTimer() {
      clearTimeout(idleTimer);
      isIdle = false;
      
      idleTimer = setTimeout(() => {
        isIdle = true;
      }, IDLE_TIME_DESKTOP);
    }
  
    // ================= PC LOGIC =================
    if (!isMobile) {
      // أي حركة كتخرجك من السكون
      ["mousemove", "scroll", "keydown", "wheel", "click", "pointerdown"].forEach(evt => {
        document.addEventListener(evt, function() {
          // إلا كان ساكن وجا يحرك، يطلع الإعلان
          if (isIdle && !inCooldown) {
            openAd();
          }
          resetIdleTimer();
        }, { passive: true, capture: true });
      });
  
      resetIdleTimer();
    }
    // ================= MOBILE LOGIC =================
    else {
      let lastTouchTime = 0;
  
      function mobileTrigger() {
        const now = Date.now();
        if (now - lastTouchTime < 3000) return;
        lastTouchTime = now;
        openAd();
      }
  
      document.addEventListener("touchstart", mobileTrigger, { passive: true });
      document.addEventListener("pointerdown", mobileTrigger, true);
    }
  })();