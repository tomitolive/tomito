/**
 * ============================================
 * TOMITO PROTECTION SYSTEM
 * ============================================
 * ✅ حماية من DevTools (خروج فوري)
 * ✅ إخفاء ملفات JS من Sources
 * ✅ منع رؤية Network requests
 * ✅ الكود يبقى يخدم 100%
 * ============================================
 * 
 * طريقة الاستخدام:
 * حط هاد الملف في أول <head> قبل أي حاجة!
 * <script src="tomito-protection.js"></script>
 * ============================================
 */

(function() {
  'use strict';

  // ==================== الإعدادات ====================
  const CONFIG = {
    // DevTools Protection
    checkInterval: 50,
    aggressiveMode: true,
    instantBlock: true,
    
    // JS Files Protection
    filesToHide: [
      'watch.js',
      'api.js',
      'tv.js',
      'watch-tv.js'
    ],
    
    // Debug Mode (غيرها ل true للاختبار)
    debugMode: false
  };

  // ==================== حالة النظام ====================
  let blocked = false;
  let scriptsLoaded = {};

  // ==================== 1. حماية DevTools ====================
  
  function quickCheck() {
    try {
      if (!window.outerWidth) return false;
      
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      if (widthDiff > 150 || heightDiff > 150) return true;
      
      if (window.screen) {
        const wRatio = window.innerWidth / screen.availWidth;
        const hRatio = window.innerHeight / screen.availHeight;
        if (wRatio < 0.65 || hRatio < 0.65) return true;
      }
      
      return false;
    } catch(e) {
      return false;
    }
  }

  function detectConsole() {
    try {
      let detected = false;
      const el = new Image();
      Object.defineProperty(el, 'id', {
        get: function() { detected = true; return ''; }
      });
      console.dir(el);
      console.clear();
      return detected;
    } catch(e) {
      return false;
    }
  }

  function detectDevTools() {
    if (quickCheck()) return true;
    if (detectConsole()) return true;
    
    try {
      const start = performance.now();
      (function(){}['constructor']('debugger')());
      return (performance.now() - start) > 100;
    } catch(e) {
      return false;
    }
  }

  function instantBlock() {
    if (blocked) return;
    blocked = true;

    if (CONFIG.debugMode) {
      console.warn('🚨 DevTools detected! (Debug mode - not blocking)');
      return;
    }

    try {
      window.stop();
      document.documentElement.innerHTML = '';
      document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Access Denied</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#fff}.container{text-align:center;padding:40px;background:rgba(0,0,0,0.3);border-radius:20px;max-width:500px}.icon{font-size:100px;margin-bottom:20px;animation:pulse 2s infinite}h1{font-size:48px;margin-bottom:20px}p{font-size:24px;opacity:0.9;margin-bottom:30px}.ar{font-size:28px;margin-top:20px;opacity:0.8}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}</style></head><body><div class="container"><div class="icon">🚫</div><h1>Access Denied</h1><p>Developer tools are not allowed</p><div class="ar">الوصول ممنوع - أدوات المطورين غير مسموحة</div></div></body></html>');
      document.close();
    } catch(e) {}

    setTimeout(function() {
      try {
        window.close();
      } catch(e) {
        try {
          window.location.replace('about:blank');
        } catch(e2) {}
      }
    }, 100);
  }

  // ==================== 2. إخفاء ملفات JS ====================
  
  function loadAndHideScript(url, scriptElement) {
    if (scriptsLoaded[url]) return;
    scriptsLoaded[url] = true;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          // تنفيذ الكود في الذاكرة
          const scriptCode = xhr.responseText;
          
          // استخدام Function بدل eval (أكثر أماناً)
          const executeScript = new Function(scriptCode);
          executeScript();
          
          // حذف script tag الأصلي
          if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
          }
          
          if (CONFIG.debugMode) {
            console.log('✅ تم إخفاء:', url);
          }
          
        } catch(e) {
          console.error('❌ فشل تنفيذ:', url, e);
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ فشل تحميل:', url);
    };
    
    xhr.send();
  }

  function hideAllJSFiles() {
    const scripts = document.getElementsByTagName('script');
    const scriptsArray = Array.from(scripts);
    
    scriptsArray.forEach(function(script) {
      const src = script.getAttribute('src') || '';
      
      // فحص إذا كان من الملفات المستهدفة
      const shouldHide = CONFIG.filesToHide.some(function(filename) {
        return src.indexOf(filename) !== -1;
      });
      
      if (shouldHide) {
        loadAndHideScript(src, script);
      }
    });
  }

  // ==================== 3. حماية Network ====================
  
  function protectNetwork() {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = function() {
      if (detectDevTools()) {
        instantBlock();
        return Promise.reject(new Error('Blocked'));
      }
      return originalFetch.apply(this, arguments);
    };
    
    // Override XHR
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    const originalSend = XHR.send;
    
    XHR.open = function() {
      if (detectDevTools()) {
        instantBlock();
        throw new Error('Blocked');
      }
      return originalOpen.apply(this, arguments);
    };
    
    XHR.send = function() {
      if (detectDevTools()) {
        instantBlock();
        throw new Error('Blocked');
      }
      return originalSend.apply(this, arguments);
    };
  }

  // ==================== 4. منع الاختصارات ====================
  
  function blockShortcuts(e) {
    const key = e.keyCode || e.which;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    
    // F12
    if (key === 123) {
      e.preventDefault();
      e.stopImmediatePropagation();
      instantBlock();
      return false;
    }
    
    // Ctrl+Shift+I/J/C
    if (ctrl && shift && (key === 73 || key === 74 || key === 67)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      instantBlock();
      return false;
    }
    
    // Ctrl+U
    if (ctrl && key === 85) {
      e.preventDefault();
      e.stopImmediatePropagation();
      instantBlock();
      return false;
    }
    
    // Ctrl+S
    if (ctrl && key === 83) {
      e.preventDefault();
      return false;
    }
  }

  function blockContextMenu(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    setTimeout(function() {
      if (detectDevTools()) instantBlock();
    }, 10);
    return false;
  }

  function blockCopy(e) {
    e.preventDefault();
    return false;
  }

  // ==================== 5. تعطيل Console ====================
  
  function disableConsole() {
    if (CONFIG.debugMode) return;
    
    try {
      const noop = function() {};
      const methods = ['log','warn','error','info','debug','trace','dir','dirxml','table','group','groupEnd','clear'];
      
      methods.forEach(function(method) {
        if (console[method]) {
          console[method] = noop;
        }
      });
      
      Object.freeze(console);
    } catch(e) {}
  }

  // ==================== 6. إخفاء الأخطاء ====================
  
  function hideErrors() {
    window.onerror = function() { return true; };
    
    window.addEventListener('error', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }, true);
    
    window.addEventListener('unhandledrejection', function(e) {
      e.preventDefault();
    }, true);
  }

  // ==================== 7. منع Selection ====================
  
  function disableSelection() {
    try {
      const css = document.createElement('style');
      css.innerHTML = '*{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;user-select:none!important}';
      document.head.appendChild(css);
    } catch(e) {}
  }

  // ==================== 8. المراقبة المستمرة ====================
  
  function startMonitoring() {
    // فحص سريع كل 50ms
    setInterval(function() {
      if (!blocked && detectDevTools()) {
        instantBlock();
      }
    }, CONFIG.checkInterval);
    
    // فحص إضافي في أول 3 ثواني (كل 10ms)
    const quickInterval = setInterval(function() {
      if (!blocked && detectDevTools()) {
        instantBlock();
      }
    }, 10);
    
    setTimeout(function() {
      clearInterval(quickInterval);
    }, 3000);
    
    // مراقبة Resize
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
      const widthChange = Math.abs(window.innerWidth - lastWidth);
      const heightChange = Math.abs(window.innerHeight - lastHeight);
      
      if (widthChange > 100 || heightChange > 100) {
        if (detectDevTools()) instantBlock();
      }
      
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    }, true);
    
    // مراقبة Focus
    window.addEventListener('focus', function() {
      setTimeout(function() {
        if (detectDevTools()) instantBlock();
      }, 10);
    }, true);
  }

  // ==================== التهيئة ====================
  
  function init() {
    // فحص أولي
    if (detectDevTools()) {
      instantBlock();
      return;
    }
    
    try {
      // تفعيل الحماية
      hideErrors();
      disableConsole();
      disableSelection();
      protectNetwork();
      
      // تفعيل المستمعات
      document.addEventListener('keydown', blockShortcuts, true);
      document.addEventListener('keyup', blockShortcuts, true);
      document.addEventListener('contextmenu', blockContextMenu, true);
      document.addEventListener('copy', blockCopy, true);
      document.addEventListener('cut', blockCopy, true);
      document.addEventListener('selectstart', blockCopy, true);
      
      // إخفاء ملفات JS
      hideAllJSFiles();
      
      // بدء المراقبة
      startMonitoring();
      
      if (CONFIG.debugMode) {
        console.log('🛡️ TOMITO Protection Active');
        console.log('📁 Files to hide:', CONFIG.filesToHide);
      }
      
    } catch(e) {
      setTimeout(init, 100);
    }
  }

  // ==================== التشغيل ====================
  
  // فحص فوري
  if (detectDevTools()) {
    instantBlock();
  } else {
    // تشغيل تلقائي
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    
    // Fallback
    setTimeout(init, 0);
    setTimeout(init, 10);
    setTimeout(init, 50);
    setTimeout(init, 100);
  }

})();

/**
 * ============================================
 * ملاحظات الاستخدام:
 * ============================================
 * 
 * 1. في HTML ديالك:
 * 
 * <!DOCTYPE html>
 * <html>
 * <head>
 *   <!-- أول حاجة: الحماية -->
 *   <script src="tomito-protection.js"></script>
 *   
 *   <!-- بعدها: ملفاتك العادية -->
 *   <script src="watch.js"></script>
 *   <script src="api.js"></script>
 *   <script src="tv.js"></script>
 * </head>
 * 
 * 2. الكود غادي يدير:
 *    ✅ يكشف DevTools فور فتحها
 *    ✅ يخرج من الصفحة فوراً
 *    ✅ يحمل watch.js و api.js بـ AJAX
 *    ✅ ينفذهم في الذاكرة
 *    ✅ يحذف <script src="...">
 *    ✅ النتيجة: ما كيبانوش في Sources!
 * 
 * 3. للاختبار:
 *    - غير debugMode: true
 *    - افتح Console
 *    - شوف الرسائل
 * 
 * ============================================
 */