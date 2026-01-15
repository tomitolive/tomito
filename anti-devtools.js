// /**
//  * ============================================
//  * TOMITO PROTECTION - FIREFOX COMPATIBLE
//  * ============================================
//  * ✅ يخدم في Firefox/Chrome/Edge/Safari
//  * ✅ إخفاء تام لملفات JS
//  * ✅ حماية قوية من DevTools
//  * ============================================
//  */


// (function() {
//   'use strict';

//   // ==================== الإعدادات ====================
//   const CONFIG = {
//     // ملفات JS المستهدفة
//     filesToHide: ['watch.js', 'api.js', 'tv.js', 'watch-tv.js'],
    
//     // حماية DevTools
//     checkInterval: 50,
//     aggressiveMode: true,
    
//     // حماية الموبايل
//     ignoreMobileZoom: true,      // تجاهل التكبير في الهاتف
//     ignoreOrientationChange: true, // تجاهل تدوير الشاشة
    
//     // Debug
//     debugMode: false
//   };

//   let blocked = false;
//   let scriptsHidden = new Set();
  
//   // متغيرات للهاتف
//   let isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
//   let lastOrientation = window.orientation;
//   let isZooming = false;
//   let zoomTimeout = null;

//   // ==================== 1. إخفاء ملفات JS (طريقة Firefox) ====================
  
//   /**
//    * الطريقة 1: Inline Injection (الأفضل لـ Firefox)
//    */
//   function hideScriptInline(scriptElement) {
//     const src = scriptElement.getAttribute('src');
//     if (!src || scriptsHidden.has(src)) return;
    
//     scriptsHidden.add(src);
    
//     // إنشاء XHR لتحميل الكود
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', src, false); // Synchronous للتأكد من الترتيب
    
//     try {
//       xhr.send(null);
      
//       if (xhr.status === 200) {
//         const code = xhr.responseText;
        
//         // إنشاء script جديد inline
//         const newScript = document.createElement('script');
//         newScript.type = 'text/javascript';
//         newScript.textContent = code; // الكود مباشرة بدون src
        
//         // استبدال القديم بالجديد
//         scriptElement.parentNode.insertBefore(newScript, scriptElement);
//         scriptElement.parentNode.removeChild(scriptElement);
        
//         if (CONFIG.debugMode) {
//           console.log('✅ Firefox: أخفينا', src);
//         }
//       }
//     } catch(e) {
//       console.error('❌ فشل إخفاء:', src, e);
//     }
//   }

//   /**
//    * الطريقة 2: Data URL (بديل قوي)
//    */
//   function hideScriptDataURL(scriptElement) {
//     const src = scriptElement.getAttribute('src');
//     if (!src || scriptsHidden.has(src)) return;
    
//     scriptsHidden.add(src);
    
//     fetch(src)
//       .then(response => response.text())
//       .then(code => {
//         // تحويل الكود لـ base64
//         const base64 = btoa(unescape(encodeURIComponent(code)));
//         const dataURL = 'data:text/javascript;base64,' + base64;
        
//         // إنشاء script بـ data URL
//         const newScript = document.createElement('script');
//         newScript.src = dataURL;
        
//         scriptElement.parentNode.insertBefore(newScript, scriptElement);
//         scriptElement.parentNode.removeChild(scriptElement);
        
//         if (CONFIG.debugMode) {
//           console.log('✅ Data URL:', src);
//         }
//       })
//       .catch(e => console.error('❌ فشل:', src, e));
//   }

//   /**
//    * الطريقة 3: Blob URL (الأقوى)
//    */
//   function hideScriptBlob(scriptElement) {
//     const src = scriptElement.getAttribute('src');
//     if (!src || scriptsHidden.has(src)) return;
    
//     scriptsHidden.add(src);
    
//     fetch(src)
//       .then(response => response.text())
//       .then(code => {
//         // إنشاء Blob
//         const blob = new Blob([code], { type: 'text/javascript' });
//         const blobURL = URL.createObjectURL(blob);
        
//         // إنشاء script بـ blob URL
//         const newScript = document.createElement('script');
//         newScript.src = blobURL;
        
//         newScript.onload = function() {
//           // حذف blob URL بعد التحميل
//           URL.revokeObjectURL(blobURL);
          
//           if (CONFIG.debugMode) {
//             console.log('✅ Blob:', src);
//           }
//         };
        
//         scriptElement.parentNode.insertBefore(newScript, scriptElement);
//         scriptElement.parentNode.removeChild(scriptElement);
//       })
//       .catch(e => console.error('❌ فشل:', src, e));
//   }

//   /**
//    * الطريقة 4: Module System (أحدث طريقة)
//    */
//   function hideScriptModule(scriptElement) {
//     const src = scriptElement.getAttribute('src');
//     if (!src || scriptsHidden.has(src)) return;
    
//     scriptsHidden.add(src);
    
//     fetch(src)
//       .then(response => response.text())
//       .then(code => {
//         // تحويل لـ ES Module
//         const moduleCode = `
//           (function() {
//             ${code}
//           })();
//         `;
        
//         const blob = new Blob([moduleCode], { type: 'text/javascript' });
//         const url = URL.createObjectURL(blob);
        
//         const moduleScript = document.createElement('script');
//         moduleScript.type = 'module';
//         moduleScript.src = url;
        
//         moduleScript.onload = function() {
//           URL.revokeObjectURL(url);
//         };
        
//         scriptElement.parentNode.insertBefore(moduleScript, scriptElement);
//         scriptElement.parentNode.removeChild(scriptElement);
        
//         if (CONFIG.debugMode) {
//           console.log('✅ Module:', src);
//         }
//       })
//       .catch(e => console.error('❌ فشل:', src, e));
//   }

//   /**
//    * المسح التلقائي للـ scripts
//    */
//   function scanAndHideScripts() {
//     const allScripts = document.querySelectorAll('script[src]');
    
//     allScripts.forEach(script => {
//       const src = script.getAttribute('src');
      
//       // فحص إذا كان من الملفات المستهدفة
//       const shouldHide = CONFIG.filesToHide.some(filename => 
//         src && src.includes(filename)
//       );
      
//       if (shouldHide && !scriptsHidden.has(src)) {
//         // استخدام الطريقة الأنسب حسب المتصفح
//         if (isFirefox()) {
//           hideScriptInline(script); // Firefox يفضل inline
//         } else {
//           hideScriptBlob(script);   // Chrome/Edge يفضلو Blob
//         }
//       }
//     });
//   }

//   // كشف Firefox
//   function isFirefox() {
//     return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
//   }

//   // ==================== 2. منع Source Maps ====================
  
//   function blockSourceMaps() {
//     // Override fetch
//     const originalFetch = window.fetch;
//     window.fetch = function(input) {
//       const url = typeof input === 'string' ? input : input.url;
      
//       // منع .map files
//       if (url && url.endsWith('.map')) {
//         if (CONFIG.debugMode) {
//           console.log('🚫 منعنا source map:', url);
//         }
//         return Promise.reject(new Error('Source maps blocked'));
//       }
      
//       return originalFetch.apply(this, arguments);
//     };
    
//     // Override XHR
//     const originalOpen = XMLHttpRequest.prototype.open;
//     XMLHttpRequest.prototype.open = function(method, url) {
//       if (url && url.endsWith('.map')) {
//         if (CONFIG.debugMode) {
//           console.log('🚫 منعنا source map XHR:', url);
//         }
//         this.abort();
//         return;
//       }
//       return originalOpen.apply(this, arguments);
//     };
//   }

//   // ==================== 3. إخفاء Stack Traces ====================
  
//   function obfuscateStackTraces() {
//     const originalError = Error;
    
//     window.Error = function(message) {
//       const error = new originalError(message);
      
//       // تعديل stack trace
//       Object.defineProperty(error, 'stack', {
//         get: function() {
//           let stack = originalError.prototype.stack;
//           if (!stack) return '';
          
//           // إزالة أسماء الملفات
//           CONFIG.filesToHide.forEach(filename => {
//             const regex = new RegExp(filename, 'g');
//             stack = stack.replace(regex, 'app.js');
//           });
          
//           // إزالة URLs
//           stack = stack.replace(/https?:\/\/[^\s)]+/g, '<internal>');
          
//           return stack;
//         }
//       });
      
//       return error;
//     };
    
//     window.Error.prototype = originalError.prototype;
//   }

//   // ==================== 4. حماية DevTools (محسّنة للهاتف) ====================
  
//   function isMobileDevice() {
//     return /Android|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//   }
  
//   function isTablet() {
//     return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
//   }
  
//   function detectMobileZoom() {
//     if (!isMobile) return false;
    
//     try {
//       // فحص التكبير (pinch zoom)
//       const viewport = document.querySelector('meta[name="viewport"]');
//       if (viewport) {
//         const content = viewport.getAttribute('content');
//         if (content && content.includes('user-scalable=yes')) {
//           // المستخدم كيكبر عادي
//           return true;
//         }
//       }
      
//       // فحص visualViewport (Chrome/Safari)
//       if (window.visualViewport) {
//         const scale = window.visualViewport.scale;
//         if (scale > 1) {
//           isZooming = true;
//           clearTimeout(zoomTimeout);
//           zoomTimeout = setTimeout(() => { isZooming = false; }, 1000);
//           return true;
//         }
//       }
      
//       // فحص devicePixelRatio
//       if (window.devicePixelRatio) {
//         const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);
//         if (zoom > 100 && zoom < 500) {
//           return true; // zoom عادي
//         }
//       }
      
//       return false;
//     } catch(e) {
//       return false;
//     }
//   }
  
//   function detectOrientationChange() {
//     if (!isMobile) return false;
    
//     try {
//       const currentOrientation = window.orientation;
      
//       if (currentOrientation !== lastOrientation) {
//         lastOrientation = currentOrientation;
        
//         if (CONFIG.debugMode) {
//           console.log('📱 تدوير الشاشة:', currentOrientation);
//         }
        
//         return true; // تدوير عادي
//       }
      
//       return false;
//     } catch(e) {
//       return false;
//     }
//   }
  
//   function quickCheck() {
//     try {
//       // تجاهل على الهاتف إذا كان zoom
//       if (isMobile && CONFIG.ignoreMobileZoom && detectMobileZoom()) {
//         return false;
//       }
      
//       // تجاهل تدوير الشاشة
//       if (isMobile && CONFIG.ignoreOrientationChange && detectOrientationChange()) {
//         return false;
//       }
      
//       // تجاهل فحص الأبعاد على الهاتف
//       if (isMobile) {
//         // على الهاتف، غير نفحصو إذا كان فرق كبير بزاف
//         if (!window.outerWidth) return false;
        
//         const widthDiff = window.outerWidth - window.innerWidth;
//         const heightDiff = window.outerHeight - window.innerHeight;
        
//         // على الهاتف threshold أعلى بكثير (لأن الهاتف عندو toolbars)
//         const mobileThreshold = 300;
        
//         if (widthDiff > mobileThreshold || heightDiff > mobileThreshold) {
//           return true;
//         }
        
//         return false; // ما نفحصوش screen ratio على الهاتف
//       }
      
//       // على الكمبيوتر (الفحص العادي)
//       if (!window.outerWidth) return false;
      
//       const widthDiff = window.outerWidth - window.innerWidth;
//       const heightDiff = window.outerHeight - window.innerHeight;
      
//       // Firefox عندو thresholds مختلفة
//       const threshold = isFirefox() ? 200 : 150;
      
//       if (widthDiff > threshold || heightDiff > threshold) return true;
      
//       if (window.screen) {
//         const wRatio = window.innerWidth / screen.availWidth;
//         const hRatio = window.innerHeight / screen.availHeight;
//         if (wRatio < 0.6 || hRatio < 0.6) return true;
//       }
      
//       return false;
//     } catch(e) {
//       return false;
//     }
//   }

//   function detectConsole() {
//     try {
//       let detected = false;
//       const el = new Image();
      
//       Object.defineProperty(el, 'id', {
//         get: function() { 
//           detected = true; 
//           return ''; 
//         }
//       });
      
//       // Firefox يستخدم console.log بطريقة مختلفة
//       if (isFirefox()) {
//         console.dir(el);
//       } else {
//         console.log('%c', el);
//       }
      
//       console.clear();
//       return detected;
//     } catch(e) {
//       return false;
//     }
//   }

//   function detectDebugger() {
//     try {
//       const start = performance.now ? performance.now() : Date.now();
//       (function(){}['constructor']('debugger')());
//       const time = (performance.now ? performance.now() : Date.now()) - start;
      
//       // Firefox threshold مختلف
//       const threshold = isFirefox() ? 150 : 100;
//       return time > threshold;
//     } catch(e) {
//       return false;
//     }
//   }

//   function detectDevTools() {
//     // على الهاتف، ما نفحصوش إذا كان zoom أو orientation change
//     if (isMobile) {
//       if (isZooming) {
//         if (CONFIG.debugMode) {
//           console.log('📱 Zoom detected - ignoring');
//         }
//         return false;
//       }
      
//       if (detectOrientationChange()) {
//         if (CONFIG.debugMode) {
//           console.log('📱 Orientation change - ignoring');
//         }
//         return false;
//       }
//     }
    
//     let detected = 0;
    
//     if (quickCheck()) detected++;
    
//     // على الهاتف، ما نستخدموش console detection (كيعطي false positives)
//     if (!isMobile) {
//       if (detectConsole()) detected++;
//       if (detectDebugger()) detected++;
//     }
    
//     // على الهاتف نحتاجو 2 من 1 (يعني غير quickCheck)
//     // على الكمبيوتر نحتاجو 2 من 3
//     const threshold = isMobile ? 1 : 2;
    
//     return detected >= threshold;
//   }

//   function instantBlock() {
//     if (blocked) return;
//     blocked = true;

//     if (CONFIG.debugMode) {
//       console.warn('🚨 DevTools detected! (Debug mode)');
//       return;
//     }

//     try {
//       window.stop();
//       document.documentElement.innerHTML = '';
//       document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Access Denied</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#fff}.container{text-align:center;padding:40px;background:rgba(0,0,0,0.3);border-radius:20px;max-width:500px}.icon{font-size:100px;margin-bottom:20px;animation:pulse 2s infinite}h1{font-size:48px;margin-bottom:20px}p{font-size:24px;opacity:0.9}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}</style></head><body><div class="container"><div class="icon">🚫</div><h1>Access Denied</h1><p>Developer tools are not allowed</p></div></body></html>');
//       document.close();
//     } catch(e) {}

//     setTimeout(function() {
//       try { window.close(); } 
//       catch(e) { window.location.replace('about:blank'); }
//     }, 100);
//   }

//   // ==================== 5. منع الاختصارات ====================
  
//   function blockShortcuts(e) {
//     const key = e.keyCode || e.which;
//     const ctrl = e.ctrlKey || e.metaKey;
//     const shift = e.shiftKey;
    
//     // F12
//     if (key === 123) {
//       e.preventDefault();
//       e.stopImmediatePropagation();
//       instantBlock();
//       return false;
//     }
    
//     // Ctrl+Shift+I/J/C/K (Firefox يستخدم K أحياناً)
//     if (ctrl && shift && [73, 74, 67, 75].includes(key)) {
//       e.preventDefault();
//       e.stopImmediatePropagation();
//       instantBlock();
//       return false;
//     }
    
//     // Ctrl+U
//     if (ctrl && key === 85) {
//       e.preventDefault();
//       e.stopImmediatePropagation();
//       instantBlock();
//       return false;
//     }
//   }

//   function blockContextMenu(e) {
//     e.preventDefault();
//     e.stopImmediatePropagation();
//     setTimeout(function() {
//       if (detectDevTools()) instantBlock();
//     }, 10);
//     return false;
//   }

//   // ==================== 6. الحماية الإضافية ====================
  
//   function disableConsole() {
//     if (CONFIG.debugMode) return;
    
//     const noop = function() {};
//     const methods = ['log','warn','error','info','debug','trace','dir','dirxml','table','group','groupEnd','clear'];
    
//     methods.forEach(function(method) {
//       if (console[method]) console[method] = noop;
//     });
    
//     try { Object.freeze(console); } catch(e) {}
//   }

//   function hideErrors() {
//     window.onerror = function() { return true; };
//     window.addEventListener('error', function(e) {
//       e.preventDefault();
//       e.stopImmediatePropagation();
//       return false;
//     }, true);
//   }

//   function disableSelection() {
//     const css = document.createElement('style');
//     css.textContent = '*{-webkit-user-select:none!important;-moz-user-select:none!important;user-select:none!important}';
//     document.head.appendChild(css);
//   }

//   // ==================== 7. المراقبة المستمرة (محسّنة للهاتف) ====================
  
//   function startMonitoring() {
//     // على الهاتف، فحص أبطأ (لتوفير البطارية)
//     const interval = isMobile ? 200 : CONFIG.checkInterval;
    
//     // فحص عادي
//     setInterval(function() {
//       if (!blocked && detectDevTools()) instantBlock();
//     }, interval);
    
//     // فحص سريع في البداية (غير على الكمبيوتر)
//     if (!isMobile) {
//       const quick = setInterval(function() {
//         if (!blocked && detectDevTools()) instantBlock();
//       }, 10);
//       setTimeout(() => clearInterval(quick), 3000);
//     }
    
//     // مراقبة Resize (مع استثناء للهاتف)
//     let lastW = window.innerWidth;
//     let lastH = window.innerHeight;
//     let resizeTimeout = null;
    
//     window.addEventListener('resize', function() {
//       // على الهاتف، نتجاهلو resize الصغير
//       clearTimeout(resizeTimeout);
      
//       resizeTimeout = setTimeout(function() {
//         const wDiff = Math.abs(window.innerWidth - lastW);
//         const hDiff = Math.abs(window.innerHeight - lastH);
        
//         // threshold أكبر على الهاتف
//         const threshold = isMobile ? 200 : 100;
        
//         if (wDiff > threshold || hDiff > threshold) {
//           // فحص إضافي: ما تكونش orientation change
//           if (!detectOrientationChange() && !isZooming) {
//             if (detectDevTools()) instantBlock();
//           }
//         }
        
//         lastW = window.innerWidth;
//         lastH = window.innerHeight;
//       }, 300); // تأخير أطول على الهاتف
      
//     }, true);
    
//     // مراقبة visualViewport (للتكبير)
//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', function() {
//         if (CONFIG.debugMode) {
//           console.log('📱 Visual viewport resize - scale:', window.visualViewport.scale);
//         }
//         // ما نعملو والو، غير نسجلو
//       });
//     }
    
//     // مراقبة orientation change
//     window.addEventListener('orientationchange', function() {
//       if (CONFIG.debugMode) {
//         console.log('📱 Orientation changed to:', window.orientation);
//       }
//       // تجاهل الفحص لمدة ثانيتين بعد التدوير
//       setTimeout(function() {
//         lastOrientation = window.orientation;
//       }, 2000);
//     });
//   }

//   // ==================== 8. MutationObserver للـ Scripts ====================
  
//   function watchNewScripts() {
//     const observer = new MutationObserver(function(mutations) {
//       mutations.forEach(function(mutation) {
//         mutation.addedNodes.forEach(function(node) {
//           if (node.tagName === 'SCRIPT' && node.src) {
//             const shouldHide = CONFIG.filesToHide.some(f => 
//               node.src.includes(f)
//             );
            
//             if (shouldHide) {
//               if (isFirefox()) {
//                 hideScriptInline(node);
//               } else {
//                 hideScriptBlob(node);
//               }
//             }
//           }
//         });
//       });
//     });
    
//     observer.observe(document.documentElement, {
//       childList: true,
//       subtree: true
//     });
//   }

//   // ==================== التهيئة ====================
  
//   function init() {
//     // فحص أولي
//     if (detectDevTools()) {
//       instantBlock();
//       return;
//     }
    
//     try {
//       // الحماية الأساسية
//       hideErrors();
//       disableConsole();
//       disableSelection();
//       blockSourceMaps();
//       obfuscateStackTraces();
      
//       // المستمعات
//       document.addEventListener('keydown', blockShortcuts, true);
//       document.addEventListener('contextmenu', blockContextMenu, true);
      
//       // إخفاء Scripts الموجودة
//       scanAndHideScripts();
      
//       // مراقبة Scripts الجديدة
//       watchNewScripts();
      
//       // بدء المراقبة
//       startMonitoring();
      
//       if (CONFIG.debugMode) {
//         console.log('🛡️ TOMITO Protection Active');
//         console.log('🦊 Browser:', isFirefox() ? 'Firefox' : 'Chrome/Other');
//         console.log('📱 Mobile:', isMobile ? 'Yes' : 'No');
//         console.log('🔍 Mobile Protections:', {
//           ignoreZoom: CONFIG.ignoreMobileZoom,
//           ignoreOrientation: CONFIG.ignoreOrientationChange
//         });
//         console.log('📁 Hidden:', Array.from(scriptsHidden));
//       }
      
//     } catch(e) {
//       setTimeout(init, 100);
//     }
//   }

//   // ==================== التشغيل ====================
  
//   if (detectDevTools()) {
//     instantBlock();
//   } else {
//     if (document.readyState === 'loading') {
//       document.addEventListener('DOMContentLoaded', init);
//     } else {
//       init();
//     }
    
//     setTimeout(init, 0);
//     setTimeout(init, 50);
//     setTimeout(init, 100);
//   }

// })();

