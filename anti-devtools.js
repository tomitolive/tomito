// ==========================================
// نظام حماية متقدم ضد DevTools و Inspect
// يشتغل حتى في الخلفية
// ==========================================

(function() {
    'use strict';
    
    // متغيرات الحماية
    let devtoolsOpen = false;
    let checkInterval;
    let backgroundCheckInterval;
    let blockAttempts = 0;
    const MAX_ATTEMPTS = 3;
    let isPageVisible = true;
    
    // حفظ حالة DevTools في localStorage
    const STORAGE_KEY = 'devtools_status';
    const BLOCK_TIME_KEY = 'devtools_block_time';
    
    // ==========================================
    // فحص إذا كان المستخدم محظور
    // ==========================================
    function isUserBlocked() {
        const blockTime = localStorage.getItem(BLOCK_TIME_KEY);
        if (blockTime) {
            const timePassed = Date.now() - parseInt(blockTime);
            // حظر لمدة ساعة
            if (timePassed < 3600000) {
                return true;
            } else {
                localStorage.removeItem(BLOCK_TIME_KEY);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        return false;
    }
    
    // تسجيل محاولة مخالفة
    function recordViolation() {
        localStorage.setItem(STORAGE_KEY, 'open');
        localStorage.setItem(BLOCK_TIME_KEY, Date.now().toString());
    }
    
    // ==========================================
    // 1. كشف فتح DevTools (طرق متعددة)
    // ==========================================
    
    // الطريقة الأولى: مراقبة حجم النافذة
    function detectDevToolsBySize() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            return true;
        }
        return false;
    }
    
    // الطريقة الثانية: استخدام debugger مع تأخير
    function detectDevToolsByDebugger() {
        const before = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const after = performance.now();
        
        if (after - before > 100) {
            return true;
        }
        return false;
    }
    
    // الطريقة الثالثة: فحص console باستخدام Object
    function detectDevToolsByConsole() {
        let detected = false;
        const element = new Image();
        
        Object.defineProperty(element, 'id', {
            get: function() {
                detected = true;
                throw new Error('DevTools detected');
            }
        });
        
        try {
            console.log('%c', element);
            console.clear();
        } catch(e) {}
        
        return detected;
    }
    
    // الطريقة الرابعة: toString override
    function detectDevToolsByToString() {
        let detected = false;
        const fn = function() {};
        
        fn.toString = function() {
            detected = true;
            return '';
        };
        
        console.log('%c', fn);
        return detected;
    }
    
    // الطريقة الخامسة: Date.now() precision
    function detectDevToolsByTiming() {
        const start = Date.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = Date.now();
        
        return (end - start) > 100;
    }
    
    // ==========================================
    // 2. إجراءات الحماية المتقدمة
    // ==========================================
    
    function blockPage() {
        blockAttempts++;
        recordViolation();
        
        // إنشاء overlay للحجب
        const overlay = document.createElement('div');
        overlay.id = 'security-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
            animation: fadeIn 0.3s ease-in;
        `;
        
        const remainingTime = Math.ceil((3600000 - (Date.now() - parseInt(localStorage.getItem(BLOCK_TIME_KEY) || Date.now()))) / 60000);
        
        overlay.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .shield-icon {
                    animation: pulse 2s infinite;
                }
                .loading-circle {
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: rotate 1s linear infinite;
                    margin: 20px auto;
                }
            </style>
            <div style="text-align: center; padding: 40px; max-width: 700px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                <div class="shield-icon" style="font-size: 120px; margin-bottom: 30px;">
                    🛡️
                </div>
                <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    ⚠️ تحذير أمني
                </h1>
                <p style="font-size: 24px; margin-bottom: 30px; line-height: 1.8;">
                    تم اكتشاف محاولة غير مصرح بها لفتح أدوات المطور
                </p>
                <div style="background: rgba(255,255,255,0.2); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
                    <p style="font-size: 20px; margin: 15px 0;">
                        🔒 <strong>حالة الحماية:</strong> مفعلة
                    </p>
                    <p style="font-size: 20px; margin: 15px 0;">
                        📊 <strong>عدد المحاولات:</strong> ${blockAttempts}
                    </p>
                    <p style="font-size: 20px; margin: 15px 0;">
                        ⏰ <strong>الوقت:</strong> ${new Date().toLocaleTimeString('ar-MA')}
                    </p>
                    <p style="font-size: 20px; margin: 15px 0; color: #ffeb3b;">
                        ⏳ <strong>مدة الحظر:</strong> ${remainingTime > 0 ? remainingTime + ' دقيقة' : 'دائم'}
                    </p>
                </div>
                <div style="background: rgba(255,77,77,0.3); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid rgba(255,77,77,0.5);">
                    <p style="font-size: 18px; margin: 0;">
                        ⛔ هذه الصفحة محمية بنظام أمان متقدم
                    </p>
                </div>
                <p style="font-size: 16px; opacity: 0.9; margin-bottom: 20px;">
                    الرجاء إغلاق جميع أدوات المطور وإعادة تحميل الصفحة
                </p>
                <div class="loading-circle"></div>
                <p style="font-size: 14px; opacity: 0.7;">
                    جاري المعالجة التلقائية...
                </p>
            </div>
        `;
        
        // إزالة أي overlay سابق
        const oldOverlay = document.getElementById('security-overlay');
        if (oldOverlay) {
            oldOverlay.remove();
        }
        
        document.body.appendChild(overlay);
        
        // حجب كامل للصفحة
        document.body.style.overflow = 'hidden';
        document.body.style.userSelect = 'none';
        document.body.style.pointerEvents = 'none';
        overlay.style.pointerEvents = 'all';
        
        // منع أي تفاعل
        document.addEventListener('keydown', preventAll, true);
        document.addEventListener('keyup', preventAll, true);
        document.addEventListener('keypress', preventAll, true);
        document.addEventListener('click', preventAll, true);
        
        // محاولة إعادة التحميل
        setTimeout(() => {
            if (blockAttempts >= MAX_ATTEMPTS) {
                // إعادة توجيه لصفحة فارغة
                window.location.href = 'about:blank';
            } else {
                window.location.reload();
            }
        }, 5000);
    }
    
    function preventAll(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    // ==========================================
    // 3. منع اختصارات لوحة المفاتيح
    // ==========================================
    
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+Shift+C (Inspect)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+S (Save)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    }, true);
    
    // ==========================================
    // 4. منع النقر بالزر الأيمن
    // ==========================================
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showWarningToast('🚫 النقر بالزر الأيمن معطل');
        return false;
    }, true);
    
    // ==========================================
    // 5. رسالة تحذيرية منبثقة
    // ==========================================
    
    function showWarningToast(message) {
        const toast = document.createElement('div');
        toast.className = 'security-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Cairo', Arial, sans-serif;
            font-size: 16px;
            z-index: 2147483646;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
        `;
        
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        if (!document.querySelector('style[data-security-toast]')) {
            style.setAttribute('data-security-toast', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // ==========================================
    // 6. مراقبة مستمرة (حتى في الخلفية)
    // ==========================================
    
    function startMonitoring() {
        // فحص سريع كل ثانية
        checkInterval = setInterval(() => {
            if (detectDevToolsBySize()) {
                devtoolsOpen = true;
                blockPage();
                return;
            }
        }, 1000);
        
        // فحص عميق كل 3 ثواني
        backgroundCheckInterval = setInterval(() => {
            // فحص متعدد
            const checks = [
                detectDevToolsByTiming(),
                detectDevToolsByConsole(),
            ];
            
            if (checks.some(check => check === true)) {
                devtoolsOpen = true;
                blockPage();
            }
        }, 3000);
    }
    
    // مراقبة حالة الصفحة (visible/hidden)
    document.addEventListener('visibilitychange', function() {
        isPageVisible = !document.hidden;
        
        if (isPageVisible) {
            // عند العودة للصفحة، فحص فوري
            if (detectDevToolsBySize()) {
                blockPage();
            }
        }
    });
    
    // فحص عند focus على الصفحة
    window.addEventListener('focus', function() {
        setTimeout(() => {
            if (detectDevToolsBySize()) {
                blockPage();
            }
        }, 100);
    });
    
    // ==========================================
    // 7. منع النسخ والتحديد
    // ==========================================
    
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', '🚫 المحتوى محمي');
        showWarningToast('🚫 النسخ معطل على هذه الصفحة');
        return false;
    }, true);
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    // ==========================================
    // 8. حماية Console المتقدمة
    // ==========================================
    
    function disableConsole() {
        const noop = () => {};
        const throwError = () => {
            throw new Error('Console access denied');
        };
        
        const methods = [
            'log', 'debug', 'info', 'warn', 'error', 
            'table', 'clear', 'trace', 'assert', 
            'count', 'time', 'timeEnd', 'group', 
            'groupEnd', 'dir', 'dirxml'
        ];
        
        methods.forEach(method => {
            try {
                Object.defineProperty(window.console, method, {
                    get: function() {
                        return throwError;
                    },
                    set: function() {}
                });
            } catch(e) {
                window.console[method] = noop;
            }
        });
    }
    
    // ==========================================
    // 9. منع أدوات Inspect Element
    // ==========================================
    
    // منع السحب والإفلات
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    // منع Print Screen
    document.addEventListener('keyup', function(e) {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
            showWarningToast('🚫 لقطة الشاشة معطلة');
        }
    });
    
    // ==========================================
    // 10. بدء النظام
    // ==========================================
    
    // فحص الحظر السابق
    if (isUserBlocked()) {
        blockPage();
        return;
    }
    
    // رسالة تحذيرية في console قبل التعطيل
    const styles = [
        'color: red',
        'font-size: 40px',
        'font-weight: bold',
        'text-shadow: 2px 2px 4px rgba(0,0,0,0.3)'
    ].join(';');
    
    console.log('%c⛔ تحذير أمني', styles);
    console.log('%c🔒 هذا الموقع محمي بنظام أمان متقدم', 'color: orange; font-size: 20px;');
    console.log('%c⚠️ أي محاولة للوصول ستؤدي للحظر الدائم', 'color: yellow; font-size: 16px;');
    
    // تعطيل console
    setTimeout(() => {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            disableConsole();
        }
    }, 3000);
    
    // بدء المراقبة
    startMonitoring();
    
    // فحص عند تحميل الصفحة
    window.addEventListener('load', () => {
        if (detectDevToolsBySize()) {
            blockPage();
        }
    });
    
    // فحص عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        if (detectDevToolsBySize()) {
            blockPage();
        }
    });
    
    // فحص قبل إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        if (devtoolsOpen) {
            recordViolation();
        }
    });
    
    // حماية من محاولة إيقاف السكريبت
    setInterval(() => {
        if (!checkInterval || !backgroundCheckInterval) {
            startMonitoring();
        }
    }, 5000);
    
    // ==========================================
    // 11. حماية إضافية - Anti-Tamper
    // ==========================================
    
    // منع تعديل الكود
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
    Object.freeze(Function.prototype);
    
    // مراقبة محاولات التلاعب بال DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach((node) => {
                    if (node.id === 'security-overlay') {
                        // محاولة إزالة overlay الحماية
                        blockPage();
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('%c✅ نظام الحماية مفعل', 'color: green; font-size: 16px; font-weight: bold;');
    
})();