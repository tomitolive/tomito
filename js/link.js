(function () {
  // ================= CONFIG =================
  const BASE_AD_URL = "https://www.effectivegatecpm.com/dgu0qrka";
  const AD_KEY = "c4910c58837838bcdfd2133530744a67";
  const IDLE_TIME_DESKTOP = 6000;  // 6 ثواني
  const IDLE_TIME_MOBILE = 4000;   // 4 ثواني
  const BASE_COOLDOWN = 8000;       // 8 ثواني وقت الانتظار قبل الإعلان التالي
  const SMART_TRACK_INTERVAL = 10000; // كل 10 ثواني تتبع النشاط

  // ================= STATE =================
  let idleTimer = null;
  let cooldownTimer = null;
  let isIdle = false;
  let inCooldown = false;
  let adCount = 0;
  let lastTouchTime = 0;

  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

  // ================= UTILS =================
  function generateAdLink() {
      const timestamp = Date.now();
      return `${BASE_AD_URL}?key=${AD_KEY}&session=${timestamp}&adcount=${adCount}`;
  }

  function logActivity(message, data = null) {
      console.log(`[AdSmart] ${message}`, data || "");
  }

  function openAd() {
      if (inCooldown) return;
      const adLink = generateAdLink();
      const win = window.open(adLink, "_blank");
      if (win) {
          adCount++;
          inCooldown = true;
          isIdle = false;
          logActivity(`Ad triggered #${adCount}`, adLink);

          clearTimeout(cooldownTimer);
          cooldownTimer = setTimeout(() => {
              inCooldown = false;
          }, BASE_COOLDOWN + Math.random() * 5000); // عشوائية صغيرة
      }
  }

  function resetIdleTimer(idleTime) {
      clearTimeout(idleTimer);
      isIdle = false;
      idleTimer = setTimeout(() => {
          isIdle = true;
      }, idleTime);
  }

  // ================= SMART TRACKING =================
  const activity = {
      mouseMoves: 0,
      clicks: 0,
      scrolls: 0,
      keys: 0,
      touches: 0
  };

  function trackActivity() {
      if (!isMobile) {
          document.addEventListener("mousemove", () => activity.mouseMoves++, { passive: true });
          document.addEventListener("click", () => activity.clicks++, { passive: true });
          document.addEventListener("scroll", () => activity.scrolls++, { passive: true });
          document.addEventListener("keydown", () => activity.keys++, { passive: true });
      } else {
          document.addEventListener("touchstart", () => activity.touches++, { passive: true });
          document.addEventListener("scroll", () => activity.scrolls++, { passive: true });
      }

      setInterval(() => {
          logActivity("User activity stats", activity);
      }, SMART_TRACK_INTERVAL);
  }

  // ================= PC LOGIC =================
  function setupPCLogic() {
      const EVENTS = ["mousemove", "scroll", "keydown", "wheel", "click", "pointerdown"];
      EVENTS.forEach(evt => {
          document.addEventListener(evt, function () {
              if (isIdle && !inCooldown) {
                  openAd();
              }
              resetIdleTimer(IDLE_TIME_DESKTOP);
          }, { passive: true, capture: true });
      });
      resetIdleTimer(IDLE_TIME_DESKTOP);
  }

  // ================= MOBILE LOGIC =================
  function setupMobileLogic() {
      function mobileTrigger() {
          const now = Date.now();
          if (now - lastTouchTime < 3000) return;
          lastTouchTime = now;
          openAd();
      }

      document.addEventListener("touchstart", mobileTrigger, { passive: true });
      document.addEventListener("pointerdown", mobileTrigger, true);
      resetIdleTimer(IDLE_TIME_MOBILE);
  }

  // ================= INITIALIZATION =================
  if (!isMobile) {
      setupPCLogic();
  } else {
      setupMobileLogic();
  }

  trackActivity();

  // ================= OPTIONAL EXTENSIONS =================
  // مثال: يمكن زيادة الذكاء لاحقاً
  // - تعديل IDLE_TIME حسب نشاط المستخدم
  // - تحديد عدد الإعلانات اليومي
  // - تحليل مكان الماوس أو scroll position لاختيار وقت أفضل

})();
