/**
 * ============================================
 * ADVANCED DEVTOOLS DETECTION SYSTEM
 * ============================================
 * ⚠️ FOR EDUCATIONAL PURPOSES ONLY
 * 
 * هذا الكود لأغراض التعلم فقط لفهم تقنيات الحماية
 * ملاحظة: أي حماية client-side يمكن تجاوزها
 * ============================================
 */

(function() {
    'use strict';
  
    // ==================== الإعدادات ====================
    const CONFIG = {
      blockDuration: 10 * 60 * 1000, // 10 دقائق
      checkInterval: 500, // فحص كل نصف ثانية
      storageKey: 'devtools_block_time',
      violationKey: 'devtools_violations',
      maxViolations: 3,
      debugMode: false // للتجربة فقط
    };
  
    // ==================== حالة النظام ====================
    const State = {
      isDevToolsOpen: false,
      violations: 0,
      lastCheck: Date.now(),
      detectionMethods: {
        windowSize: false,
        debugger: false,
        toString: false,
        performance: false,
        firebug: false
      }
    };
  
    // ==================== 1. الكشف عن DevTools ====================
    
    /**
     * طريقة 1: فحص حجم النافذة
     * تعتمد على أن DevTools تأخذ مساحة من الشاشة
     */
    function detectByWindowSize() {
      const widthThreshold = 160;
      const heightThreshold = 160;
      
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      return widthDiff > widthThreshold || heightDiff > heightThreshold;
    }
  
    /**
     * طريقة 2: استخدام debugger
     * إذا كانت DevTools مفتوحة، سيتوقف التنفيذ
     */
    function detectByDebugger() {
      const start = performance.now();
      debugger; // سيتوقف هنا إذا كانت DevTools مفتوحة
      const end = performance.now();
      
      // إذا استغرق أكثر من 100ms، معناها توقف عند debugger
      return (end - start) > 100;
    }
  
    /**
     * طريقة 3: toString() trap
     * عند طباعة object في console، يتم استدعاء toString
     */
    function detectByToString() {
      let detected = false;
      const element = new Image();
      
      Object.defineProperty(element, 'id', {
        get: function() {
          detected = true;
          return 'devtools-detector';
        }
      });
      
      // طباعة في console (ستحدث فقط إذا كانت مفتوحة)
      console.log('%c', element);
      console.clear(); // مسح الأثر
      
      return detected;
    }
  
    /**
     * طريقة 4: فحص Firebug
     * للمتصفحات القديمة
     */
    function detectFirebug() {
      return window.console && 
             (window.console.firebug || 
              window.console.exception);
    }
  
    /**
     * طريقة 5: فحص أدوات console
     */
    function detectConsoleAPI() {
      const devtools = /./;
      devtools.toString = function() {
        State.isDevToolsOpen = true;
        return 'devtools';
      };
      console.log('%c', devtools);
      console.clear();
    }
  
    /**
     * دالة رئيسية للكشف - تجمع كل الطرق
     */
    function detectDevTools() {
      const methods = {
        windowSize: detectByWindowSize(),
        debugger: detectByDebugger(),
        firebug: detectFirebug()
      };
      
      // حفظ النتائج
      State.detectionMethods = methods;
      
      // إذا أي طريقة اكتشفت DevTools
      return Object.values(methods).some(detected => detected);
    }
  
    // ==================== 2. نظام العقوبات ====================
    
    /**
     * تسجيل انتهاك جديد
     */
    function recordViolation() {
      State.violations++;
      
      // حفظ في localStorage
      const violations = getViolations();
      violations.push({
        timestamp: Date.now(),
        methods: {...State.detectionMethods}
      });
      
      localStorage.setItem(CONFIG.violationKey, JSON.stringify(violations));
      
      if (CONFIG.debugMode) {
        console.warn(`⚠️ Violation #${State.violations} recorded`);
      }
    }
  
    /**
     * الحصول على الانتهاكات المحفوظة
     */
    function getViolations() {
      try {
        const stored = localStorage.getItem(CONFIG.violationKey);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
  
    /**
     * حظر الجلسة
     */
    function blockSession() {
      localStorage.setItem(CONFIG.storageKey, Date.now().toString());
      showBlockOverlay();
      
      // تجميد الصفحة
      if (!CONFIG.debugMode) {
        freezePage();
      }
    }
  
    /**
     * فحص إذا كانت الجلسة محظورة
     */
    function isSessionBlocked() {
      const blockTime = localStorage.getItem(CONFIG.storageKey);
      if (!blockTime) return false;
      
      const elapsed = Date.now() - parseInt(blockTime);
      return elapsed < CONFIG.blockDuration;
    }
  
    /**
     * تجميد الصفحة بالكامل
     */
    function freezePage() {
      // إيقاف كل التفاعلات
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
      
      // حلقة لا نهائية (قوية جداً - احذر!)
      // تم تعطيلها افتراضياً لأنها قد تعطل المتصفح
      // while(true) { debugger; }
    }
  
    // ==================== 3. واجهة الحظر ====================
    
    /**
     * عرض شاشة الحظر
     */
    function showBlockOverlay() {
      // إزالة أي overlay قديم
      const existing = document.getElementById('devtools-block-overlay');
      if (existing) existing.remove();
  
      const overlay = document.createElement('div');
      overlay.id = 'devtools-block-overlay';
      overlay.innerHTML = `
        <style>
          #devtools-block-overlay {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: white;
            animation: fadeIn 0.3s ease-in;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .block-content {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            animation: slideUp 0.5s ease-out;
          }
          
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          h1 {
            font-size: 28px;
            margin: 0 0 15px 0;
            color: #ff4444;
          }
          
          p {
            font-size: 16px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
            margin: 10px 0;
          }
          
          .timer {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 68, 68, 0.1);
            border-radius: 10px;
            font-size: 14px;
            color: #ff4444;
          }
          
          .violation-count {
            margin-top: 15px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
          }
        </style>
        
        <div class="block-content">
          <div class="icon">🔒</div>
          <h1>Developer Tools Detected</h1>
          <p>تم اكتشاف أدوات المطورين</p>
          <p>الرجاء إغلاق Inspect وإعادة تحميل الصفحة</p>
          <div class="timer" id="block-timer">
            Session blocked for: <span id="time-remaining">calculating...</span>
          </div>
          <div class="violation-count">
            Violations: ${State.violations} / ${CONFIG.maxViolations}
          </div>
        </div>
      `;
  
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      
      // تحديث المؤقت
      updateTimer();
    }
  
    /**
     * تحديث مؤقت الحظر
     */
    function updateTimer() {
      const timerElement = document.getElementById('time-remaining');
      if (!timerElement) return;
      
      const blockTime = parseInt(localStorage.getItem(CONFIG.storageKey));
      const endTime = blockTime + CONFIG.blockDuration;
      
      const interval = setInterval(() => {
        const remaining = endTime - Date.now();
        
        if (remaining <= 0) {
          clearInterval(interval);
          location.reload();
          return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }, 1000);
    }
  
    // ==================== 4. منع الاختصارات ====================
    
    /**
     * منع اختصارات لوحة المفاتيح
     */
    function preventKeyboardShortcuts(e) {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        recordViolation();
        if (State.violations >= CONFIG.maxViolations) {
          blockSession();
        }
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        recordViolation();
        if (State.violations >= CONFIG.maxViolations) {
          blockSession();
        }
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        recordViolation();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        recordViolation();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    }
  
    // ==================== 5. منع القائمة اليمنى ====================
    
    /**
     * منع القائمة اليمنى
     */
    function preventContextMenu(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  
    // ==================== 6. حماية النسخ ====================
    
    /**
     * حماية النسخ
     */
    function preventCopy(e) {
      e.preventDefault();
      e.clipboardData.setData('text/plain', '© Protected Content - Copying is not allowed');
      
      // إشعار بصري اختياري
      showCopyAlert();
    }
  
    /**
     * إشعار بصري عند محاولة النسخ
     */
    function showCopyAlert() {
      const alert = document.createElement('div');
      alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: sans-serif;
        z-index: 9999999;
        animation: slideIn 0.3s ease-out;
      `;
      alert.textContent = '⚠️ Copying is not allowed';
      document.body.appendChild(alert);
      
      setTimeout(() => alert.remove(), 2000);
    }
  
    // ==================== 7. منع السحب ====================
    
    /**
     * منع سحب العناصر
     */
    function preventDrag(e) {
      e.preventDefault();
      return false;
    }
  
    // ==================== 8. منع التحديد ====================
    
    /**
     * منع تحديد النص
     */
    function preventSelection() {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
    }
  
    // ==================== 9. المراقبة المستمرة ====================
    
    /**
     * حلقة المراقبة الرئيسية
     */
    function startMonitoring() {
      setInterval(() => {
        if (detectDevTools()) {
          if (!State.isDevToolsOpen) {
            State.isDevToolsOpen = true;
            recordViolation();
            
            if (State.violations >= CONFIG.maxViolations) {
              blockSession();
            }
          }
        } else {
          State.isDevToolsOpen = false;
        }
      }, CONFIG.checkInterval);
    }
  
    // ==================== 10. حماية Console ====================
    
    /**
     * تعطيل console (اختياري)
     */
    function disableConsole() {
      if (CONFIG.debugMode) return; // لا نعطله في وضع التجربة
      
      const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace'];
      methods.forEach(method => {
        console[method] = function() {};
      });
    }
  
    // ==================== 11. الحماية من التلاعب ====================
    
    /**
     * حماية الكود من التعديل
     */
    function protectCode() {
      // تجميد كائنات النظام
      Object.freeze(Object.prototype);
      Object.freeze(Array.prototype);
      Object.freeze(Function.prototype);
      
      // منع التعديل على localStorage
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key === CONFIG.storageKey || key === CONFIG.violationKey) {
          return originalSetItem.call(this, key, value);
        }
      };
    }
  
    // ==================== 12. التهيئة ====================
    
    /**
     * تهيئة النظام
     */
    function initialize() {
      // فحص إذا كانت الجلسة محظورة
      if (isSessionBlocked()) {
        showBlockOverlay();
        freezePage();
        return;
      }
      
      // تحميل الانتهاكات السابقة
      State.violations = getViolations().length;
      
      // تفعيل المستمعين
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('copy', preventCopy);
      document.addEventListener('dragstart', preventDrag);
      
      // منع التحديد
      preventSelection();
      
      // حماية الكود
      protectCode();
      
      // بدء المراقبة
      startMonitoring();
      
      // تعطيل console (اختياري)
      if (!CONFIG.debugMode) {
        disableConsole();
      }
      
      if (CONFIG.debugMode) {
        console.log('🛡️ Protection System Initialized');
        console.log('State:', State);
      }
    }
  
    // ==================== التشغيل ====================
    
    // التشغيل عند تحميل الصفحة
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  
    // التشغيل الفوري أيضاً
    initialize();
  
  })();
  
  /**
   * ============================================
   * ملاحظات تعليمية مهمة:
   * ============================================
   * 
   * 1. كل هذه التقنيات يمكن تجاوزها من قبل مطور محترف
   * 2. الحماية الحقيقية يجب أن تكون على الخادم (server-side)
   * 3. هذا الكود للتعلم فقط وفهم كيفية عمل هذه الأنظمة
   * 4. استخدام debugMode: true للتجربة بدون تجميد الصفحة
   * 
   * طرق التجاوز الشائعة:
   * - تعطيل JavaScript
   * - استخدام متصفح مختلف
   * - تعديل localStorage مباشرة
   * - استخدام proxy/middleware
   * - فتح DevTools قبل تحميل الصفحة
   * 
   * ============================================
   */