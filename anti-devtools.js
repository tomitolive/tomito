// ==========================================
// نظام حماية متقدم ضد DevTools و Inspect
// ==========================================

(function() {
    'use strict';
    
    // متغيرات الحماية
    let devtoolsOpen = false;
    let checkInterval;
    let blockAttempts = 0;
    const MAX_ATTEMPTS = 3;
    
    // ==========================================
    // 1. كشف فتح DevTools
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
    
    // الطريقة الثانية: استخدام debugger
    function detectDevToolsByDebugger() {
        const before = new Date();
        debugger;
        const after = new Date();
        
        if (after - before > 100) {
            return true;
        }
        return false;
    }
    
    // الطريقة الثالثة: فحص console
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
            console.log(element);
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
    
    // ==========================================
    // 2. إجراءات الحماية
    // ==========================================
    
    function blockPage() {
        blockAttempts++;
        
        // إنشاء overlay للحجب
        const overlay = document.createElement('div');
        overlay.id = 'security-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; padding: 40px; max-width: 600px;">
                <div style="font-size: 120px; margin-bottom: 30px;">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    ⚠️ تنبيه أمني
                </h1>
                <p style="font-size: 24px; margin-bottom: 30px; line-height: 1.6;">
                    تم اكتشاف محاولة فتح أدوات المطور (DevTools)
                </p>
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                    <p style="font-size: 18px; margin: 10px 0;">
                        🔒 هذه الصفحة محمية
                    </p>
                    <p style="font-size: 18px; margin: 10px 0;">
                        📊 عدد المحاولات: ${blockAttempts}
                    </p>
                    <p style="font-size: 18px; margin: 10px 0;">
                        ⏰ الوقت: ${new Date().toLocaleTimeString('ar-MA')}
                    </p>
                </div>
                <p style="font-size: 16px; opacity: 0.9;">
                    الرجاء إغلاق أدوات المطور والتحديث للمتابعة
                </p>
                <div style="margin-top: 30px; animation: pulse 2s infinite;">
                    <p style="font-size: 14px;">سيتم تحديث الصفحة تلقائياً...</p>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `;
        
        // إزالة أي overlay سابق
        const oldOverlay = document.getElementById('security-overlay');
        if (oldOverlay) {
            oldOverlay.remove();
        }
        
        document.body.appendChild(overlay);
        
        // حجب التفاعل مع الصفحة
        document.body.style.overflow = 'hidden';
        
        // محاولة إعادة التحميل بعد 3 ثواني
        setTimeout(() => {
            if (blockAttempts >= MAX_ATTEMPTS) {
                window.location.href = 'about:blank';
            } else {
                window.location.reload();
            }
        }, 3000);
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
        
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            blockPage();
            return false;
        }
        
        // Ctrl+U (view source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            blockPage();
            return false;
        }
    });
    
    // ==========================================
    // 4. منع النقر بالزر الأيمن
    // ==========================================
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        // رسالة تحذيرية
        showWarningToast('🚫 النقر بالزر الأيمن معطل على هذه الصفحة');
        
        return false;
    });
    
    // ==========================================
    // 5. رسالة تحذيرية منبثقة
    // ==========================================
    
    function showWarningToast(message) {
        const toast = document.createElement('div');
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
            z-index: 999998;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
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
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // ==========================================
    // 6. مراقبة مستمرة
    // ==========================================
    
    function startMonitoring() {
        checkInterval = setInterval(() => {
            // فحص بواسطة الحجم
            if (detectDevToolsBySize()) {
                devtoolsOpen = true;
                blockPage();
                return;
            }
            
            // فحص بواسطة debugger (كل 5 ثواني فقط)
            if (Math.random() < 0.2) {
                if (detectDevToolsByDebugger()) {
                    devtoolsOpen = true;
                    blockPage();
                    return;
                }
            }
        }, 1000);
    }
    
    // ==========================================
    // 7. منع النسخ والتحديد
    // ==========================================
    
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showWarningToast('🚫 النسخ معطل على هذه الصفحة');
        return false;
    });
    
    // ==========================================
    // 8. حماية Console
    // ==========================================
    
    // تعطيل console methods
    const disableConsole = () => {
        const noop = () => {};
        const methods = [
            'log', 'debug', 'info', 'warn', 'error', 
            'table', 'clear', 'trace', 'assert', 
            'count', 'time', 'timeEnd'
        ];
        
        methods.forEach(method => {
            window.console[method] = noop;
        });
    };
    
    // تطبيق تعطيل console في بيئة الإنتاج
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        disableConsole();
    }
    
    // ==========================================
    // 9. بدء النظام
    // ==========================================
    
    // رسالة تحذيرية في console قبل التعطيل
    console.log('%c⛔ تحذير أمني', 'color: red; font-size: 40px; font-weight: bold;');
    console.log('%cهذا الموقع محمي ضد أدوات المطور', 'color: orange; font-size: 20px;');
    console.log('%cأي محاولة لفحص الكود ستؤدي لحجب الصفحة', 'color: yellow; font-size: 16px;');
    
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
    
    // منع إيقاف السكريبت
    window.addEventListener('beforeunload', () => {
        clearInterval(checkInterval);
    });
    
})();