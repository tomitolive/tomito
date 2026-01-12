// ========================================
// LOGO ANIMATION SETUP
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    setupLogoAnimation();
});

function setupLogoAnimation() {
    const logoArea = document.querySelector('.logo--area');
    const enText = document.querySelector('.en-text');
    const arText = document.querySelector('.ar-text');
    const middleT = document.querySelector('.en-text span:nth-child(2)');
    
    if (!logoArea || !middleT) return;
    
    // إضافة صوت طرق الباب (خفيف) عند التحويم على الشعار
    enText.addEventListener('mouseenter', function() {
        // إنشاء صوت تأثير
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 300;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch(e) {
            console.log("الصوت غير مدعوم في هذا المتصفح");
        }
    });
    
    // إعادة تعيين الحروف بعد اختفائها
    enText.addEventListener('mouseleave', function() {
        const spans = this.querySelectorAll('span');
        if (spans) {
            spans.forEach(span => {
                span.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
                span.style.opacity = '1';
            });
        }
    });
    
    console.log("✅ Logo animation setup complete");
}