(function () {
  // ================= CONFIG =================
  const AD_URL = "https://www.effectivegatecpm.com/dgu0qrka";
  const AD_KEY = "c4910c58837838bcdfd2133530744a67";
  const MAX_IDLE_TIME = 5000; // 8 ثواني من السكون

  // ================= VARIABLES =================
  let idleTimer = null;
  let isUserIdle = false;

  // ================= FUNCTIONS =================
  
  // دالة لإظهار الإعلان
  function showAd() {
    const adOptions = {
      key: AD_KEY,
      format: "iframe",
      height: 250,
      width: 300,
      params: {}
    };
    
    // فتح الإعلان في نافذة/تاب جديد
    window.open(AD_URL, '_blank');
    
    console.log('🎯 الإعلان تم إظهاره بعد السكون');
  }

  // إعادة تعيين مؤقت السكون
  function resetIdleTimer() {
    // إلغاء المؤقت السابق
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    
    // إذا كان المستخدم كان في حالة سكون وعاد للنشاط
    if (isUserIdle) {
      isUserIdle = false;
      console.log('✅ المستخدم عاد للنشاط');
    }

    // بدء مؤقت جديد
    idleTimer = setTimeout(() => {
      isUserIdle = true;
      console.log('💤 المستخدم في حالة سكون');
    }, MAX_IDLE_TIME);
  }

  // دالة للتعامل مع أي نشاط من المستخدم
  function handleUserActivity() {
    // إذا كان المستخدم في حالة سكون وقام بأي نشاط
    if (isUserIdle) {
      showAd(); // إظهار الإعلان
      isUserIdle = false;
    }
    
    // إعادة تعيين المؤقت
    resetIdleTimer();
  }

  // ================= EVENT LISTENERS =================
  
  // الاستماع لجميع أنواع النشاط
  const events = [
    'mousedown',    // النقر بالماوس
    'mousemove',    // تحريك الماوس
    'keypress',     // الضغط على لوحة المفاتيح
    'scroll',       // التمرير
    'touchstart',   // اللمس (للأجهزة المحمولة)
    'click'         // النقر
  ];

  // إضافة مستمع لكل حدث
  events.forEach(event => {
    document.addEventListener(event, handleUserActivity, true);
  });

  // ================= INITIALIZATION =================
  
  // بدء المؤقت عند تحميل الصفحة
  resetIdleTimer();
  console.log('🚀 نظام مراقبة السكون بدأ العمل');

})();