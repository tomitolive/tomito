/**
 * ============================================
 * DEVTOOLS AUTO-EXIT PROTECTION
 * ============================================
 * ⚠️ FOR EDUCATIONAL PURPOSES ONLY
 * 
 * عند فتح DevTools، الصفحة تخرج تلقائياً
 * ============================================
 */

(function() {
    'use strict';
  
    // ==================== الإعدادات ====================
    const CONFIG = {
      checkInterval: 300, // فحص كل 300ms (أسرع)
      redirectUrl: 'about:blank', // الصفحة اللي بغيتي تخرج ليها
      // خيارات أخرى:
      // redirectUrl: 'https://google.com'
      // redirectUrl: window.location.origin + '/blocked.html'
      
      closeTab: true, // محاولة إغلاق التبويب (ما يخدمش دائماً)
      showWarning: false, // false = خروج مباشر، true = تحذير أولاً
      warningDuration: 3000, // مدة التحذير قبل الخروج
      
      debugMode: false // true للتجربة بدون خروج
    };
  
    // ==================== حالة النظام ====================
    const State = {
      isDevToolsOpen: false,
      warningShown: false,
      exitTriggered: false
    };
  
    // ==================== الكشف عن DevTools ====================
    
    /**
     * طريقة 1: فحص حجم النافذة (الأسرع)
     */
    function detectByWindowSize() {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      return widthDiff > threshold || heightDiff > threshold;
    }
  
    /**
     * طريقة 2: debugger timing
     */
    function detectByDebugger() {
      const start = performance.now();
      debugger;
      const end = performance.now();
      return (end - start) > 100;
    }
  
    /**
     * طريقة 3: toString trap
     */
    function detectByToString() {
      let detected = false;
      const element = new Image();
      
      Object.defineProperty(element, 'id', {
        get: function() {
          detected = true;
          return 'detect';
        }
      });
      
      console.log('%c', element);
      console.clear();
      return detected;
    }
  
    /**
     * طريقة 4: console.log timing
     */
    function detectByConsole() {
      let detected = false;
      const obj = {};
      Object.defineProperty(obj, 'toString', {
        get: function() {
          detected = true;
          return '';
        }
      });
      console.log(obj);
      console.clear();
      return detected;
    }
  
    /**
     * الكشف الشامل
     */
    function isDevToolsOpen() {
      return detectByWindowSize() || 
             detectByDebugger() || 
             detectByToString() ||
             detectByConsole();
    }
  
    // ==================== الخروج من الصفحة ====================
    
    /**
     * محاولة إغلاق التبويب
     */
    function closeTab() {
      // هذا يخدم فقط إذا الصفحة انفتحت بـ window.open()
      window.close();
      
      // إذا ما قدرش يغلق، يرجع null
      setTimeout(() => {
        if (!window.closed) {
          redirectPage();
        }
      }, 100);
    }
  
    /**
     * إعادة التوجيه لصفحة أخرى
     */
    function redirectPage() {
      // محاولات متعددة للخروج
      try {
        window.location.href = CONFIG.redirectUrl;
      } catch(e) {
        try {
          window.location.replace(CONFIG.redirectUrl);
        } catch(e) {
          try {
            window.location.assign(CONFIG.redirectUrl);
          } catch(e) {
            // آخر محاولة: صفحة فارغة
            document.body.innerHTML = '';
            document.write('<!DOCTYPE html><html><body></body></html>');
          }
        }
      }
    }
  
    /**
     * الخروج الفوري من الصفحة
     */
    function exitPage() {
      if (State.exitTriggered) return;
      State.exitTriggered = true;
  
      if (CONFIG.debugMode) {
        console.warn('🚨 DevTools detected! Would exit now...');
        return;
      }
  
      // محاولة إغلاق التبويب أولاً
      if (CONFIG.closeTab) {
        closeTab();
      } else {
        redirectPage();
      }
    }
  
    /**
     * عرض تحذير قبل الخروج
     */
    function showWarningAndExit() {
      if (State.warningShown) return;
      State.warningShown = true;
  
      // إنشاء overlay التحذير
      const overlay = document.createElement('div');
      overlay.innerHTML = `
        <style>
          .devtools-warning {
            position: fixed;
            inset: 0;
            background: #ff0000;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            color: white;
            animation: flash 0.5s infinite;
          }
          
          @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .warning-content {
            text-align: center;
            font-size: 40px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .countdown {
            font-size: 80px;
            margin-top: 20px;
          }
        </style>
        
        <div class="devtools-warning">
          <div class="warning-content">
            <div>⚠️ DEVTOOLS DETECTED</div>
            <div>تم اكتشاف أدوات المطورين</div>
            <div class="countdown" id="countdown">3</div>
          </div>
        </div>
      `;
  
      document.body.appendChild(overlay);
  
      // العد التنازلي
      let count = 3;
      const countdownEl = document.getElementById('countdown');
      
      const interval = setInterval(() => {
        count--;
        if (countdownEl) countdownEl.textContent = count;
        
        if (count <= 0) {
          clearInterval(interval);
          exitPage();
        }
      }, 1000);
    }
  
    /**
     * معالج الكشف
     */
    function handleDetection() {
      if (!State.isDevToolsOpen && isDevToolsOpen()) {
        State.isDevToolsOpen = true;
        
        if (CONFIG.showWarning) {
          showWarningAndExit();
        } else {
          exitPage();
        }
      }
    }
  
    // ==================== منع الاختصارات ====================
    
    /**
     * منع فتح DevTools بالاختصارات
     */
    function preventShortcuts(e) {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        exitPage();
        return false;
      }
      
      // Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        exitPage();
        return false;
      }
      
      // Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        exitPage();
        return false;
      }
      
      // Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        exitPage();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        exitPage();
        return false;
      }
    }
  
    // ==================== منع القائمة اليمنى ====================
    
    function preventContextMenu(e) {
      e.preventDefault();
      exitPage();
      return false;
    }
  
    // ==================== المراقبة المستمرة ====================
    
    /**
     * بدء المراقبة
     */
    function startMonitoring() {
      // فحص دوري سريع
      setInterval(handleDetection, CONFIG.checkInterval);
      
      // فحص عند تغيير حجم النافذة
      window.addEventListener('resize', handleDetection);
      
      // فحص عند focus
      window.addEventListener('focus', handleDetection);
      
      // فحص عند blur (قد يكون فتح DevTools)
      window.addEventListener('blur', handleDetection);
    }
  
    // ==================== الحماية الإضافية ====================
    
    /**
     * منع النسخ
     */
    function preventCopy(e) {
      e.preventDefault();
      return false;
    }
  
    /**
     * منع التحديد
     */
    function preventSelection() {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }
  
    /**
     * تعطيل console
     */
    function disableConsole() {
      if (CONFIG.debugMode) return;
      
      const noop = () => {};
      ['log', 'warn', 'error', 'info', 'debug', 'trace'].forEach(method => {
        console[method] = noop;
      });
    }
  
    // ==================== الحماية من Breakpoints ====================
    
    /**
     * حلقة debugger مستمرة (قوية جداً!)
     */
    function antiDebugLoop() {
      setInterval(() => {
        debugger; // سيوقف التنفيذ إذا DevTools مفتوحة
      }, 100);
    }
  
    // ==================== فحص أولي ====================
    
    /**
     * فحص عند التحميل
     */
    function initialCheck() {
      // فحص فوري
      if (isDevToolsOpen()) {
        if (CONFIG.debugMode) {
          console.warn('🚨 DevTools already open on page load!');
        } else {
          exitPage();
        }
      }
    }
  
    // ==================== التهيئة ====================
    
    function initialize() {
      // فحص أولي
      initialCheck();
      
      // تفعيل المستمعين
      document.addEventListener('keydown', preventShortcuts);
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('copy', preventCopy);
      
      // منع التحديد
      preventSelection();
      
      // تعطيل console
      disableConsole();
      
      // بدء المراقبة
      startMonitoring();
      
      // حلقة anti-debug (اختياري - قوي جداً)
      // antiDebugLoop(); // ⚠️ فك التعليق بحذر
      
      if (CONFIG.debugMode) {
        console.log('🛡️ Auto-Exit Protection Active');
        console.log('Config:', CONFIG);
      }
    }
  
    // ==================== التشغيل ====================
    
    // التشغيل الفوري
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  
    // نسخة احتياطية - تشغيل فوري
    setTimeout(initialize, 0);
  
  })();
  
  /**
   * ============================================
   * طريقة الاستخدام:
   * ============================================
   * 
   * 1. للتجربة (بدون خروج):
   *    debugMode: true
   * 
   * 2. للإنتاج (خروج فوري):
   *    debugMode: false
   *    showWarning: false
   * 
   * 3. مع تحذير (عد تنازلي 3 ثواني):
   *    showWarning: true
   * 
   * 4. تغيير الصفحة المستهدفة:
   *    redirectUrl: 'https://google.com'
   * 
   * ============================================
   * ملاحظات:
   * ============================================
   * 
   * - closeTab يخدم فقط للصفحات المفتوحة بـ window.open()
   * - redirectUrl يخدم في كل الحالات
   * - about:blank = صفحة فارغة
   * - يمكنك توجيهه لصفحة مخصصة "blocked.html"
   * 
   * ⚠️ تنبيه: هذا للتعلم فقط!
   * ============================================
   */