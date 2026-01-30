(function () {
  // ================= CONFIG =================
  const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka?key=c4910c58837838bcdfd2133530744a67";
  const AD_KEY = "c4910c58837838bcdfd2133530744a67";
  const MAX_IDLE_TIME = 5000; // 8 ثواني من السكون
  const AD_COOLDOWN = 10000; // 30 ثانية بين كل إعلان وآخر

  // ================= VARIABLES =================
  let idleTimer = null;
  let isUserIdle = false;
  let lastAdTime = 0; // وقت آخر إعلان

  // ================= FUNCTIONS =================
  
  // دالة لإظهار الإعلان
  function showAd() {
    const now = Date.now();
    
    // التحقق من مرور الوقت الكافي منذ آخر إعلان
    if (now - lastAdTime < AD_COOLDOWN) {
      console.log('⏳ الإعلان في فترة الانتظار');
      return;
    }
    
    // تحديث وقت آخر إعلان
    lastAdTime = now;
    
    // محاولة فتح الإعلان في نافذة جديدة
    const adWindow = window.open(AD_URL, '_blank', 'width=300,height=250');
    
    if (adWindow) {
      console.log('🎯 الإعلان تم إظهاره بنجاح');
    } else {
      console.log('❌ المتصفح حظر النافذة المنبثقة');
      // بديل: إنشاء iframe داخل الصفحة
      createAdIframe();
    }
  }

  // دالة بديلة لإنشاء إعلان كـ iframe
  function createAdIframe() {
    // إنشاء overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // إنشاء container للإعلان
    const adContainer = document.createElement('div');
    adContainer.style.cssText = `
      position: relative;
      background: white;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;

    // زر الإغلاق
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: -10px;
      right: -10px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 18px;
      z-index: 10000;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);

    // الـ iframe
    const iframe = document.createElement('iframe');
    iframe.src = AD_URL;
    iframe.width = '300';
    iframe.height = '250';
    iframe.style.border = 'none';

    adContainer.appendChild(closeBtn);
    adContainer.appendChild(iframe);
    overlay.appendChild(adContainer);
    document.body.appendChild(overlay);

    console.log('🎯 الإعلان تم إظهاره كـ iframe');
  }

  // إعادة تعيين مؤقت السكون
  function resetIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    
    if (isUserIdle) {
      isUserIdle = false;
      console.log('✅ المستخدم عاد للنشاط');
    }

    idleTimer = setTimeout(() => {
      isUserIdle = true;
      console.log('💤 المستخدم في حالة سكون (8 ثواني)');
    }, MAX_IDLE_TIME);
  }

  // دالة للتعامل مع أي نشاط من المستخدم
  function handleUserActivity() {
    if (isUserIdle) {
      showAd();
      isUserIdle = false;
    }
    
    resetIdleTimer();
  }

  // ================= EVENT LISTENERS =================
  
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  events.forEach(event => {
    document.addEventListener(event, handleUserActivity, true);
  });

  // ================= INITIALIZATION =================
  
  resetIdleTimer();
  console.log('🚀 نظام مراقبة السكون بدأ (8 ثواني)');

})();