// ========================================
// ADSTERRA ADS - FULL WORKING SCRIPT
// ========================================

console.log("💰 بدء تحميل نظام الإعلانات...");

// مفاتيح الإعلانات الخاصة بك
const AD_KEYS = {
    banner: 'f04a37538c06d079b05a55a92ec6338f',  // 468x60 - Banner
    mobile: 'ef3740f3a25e0d9bd52bbb71b2d55056',  // 320x50 - Mobile
    sidebar: 'ebe22145d6bd288c4408b7f4806e8ec0'  // 160x300 - Sidebar
};

// ========================================
// MAIN INITIALIZATION
// ========================================

window.addEventListener('load', function() {
    console.log("📄 الصفحة محملة - انتظار 2 ثانية قبل الإعلانات...");
    
    addAdStyles();
    
    setTimeout(function() {
        console.log("🚀 بدء تحميل الإعلانات...");
        initAllAds();
    }, 2000);
});

function initAllAds() {
    loadTopAd();
    
    setTimeout(loadMobileAd, 500);
    setTimeout(loadSideAds, 1000);
    setTimeout(loadSectionAds, 1500);
    setTimeout(loadMiddleSectionAds, 2000);
}

// ========================================
// CREATE AD SCRIPT
// ========================================
function createAdScript(containerId, adKey, width, height) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const safeId = containerId.replace(/[^a-zA-Z0-9_]/g, '_');
    const uniqueVar = 'atOptions_' + safeId;

    const script = document.createElement('script');
    script.type = 'text/javascript';

    script.textContent = `
        var ${uniqueVar} = {
            key: "${adKey}",
            format: "iframe",
            height: ${height},
            width: ${width},
            params: {}
        };
        (function () {
            var s = document.createElement("script");
            s.src = "https://www.highperformanceformat.com/${adKey}/invoke.js";
            s.async = true;
            document.currentScript.parentNode.appendChild(s);
        })();
    `;

    container.appendChild(script);
}

// ========================================
// TOP AD
// ========================================
function loadTopAd() {
    console.log("📢 إضافة الإعلان العلوي...");
    
    const searchContainer = document.querySelector('.search-container');
    if (!searchContainer) return;
    
    const adContainer = document.createElement('div');
    adContainer.className = 'ad-container top-ad';
    adContainer.innerHTML = `
        <div class="ad-label">
            <i class="fas fa-ad"></i> إعلان
        </div>
        <div class="ad-content" id="top-ad-script"></div>
    `;
    
    searchContainer.parentNode.insertBefore(adContainer, searchContainer.nextSibling);
    setTimeout(() => createAdScript('top-ad-script', AD_KEYS.banner, 468, 60), 300);
}

// ========================================
// MOBILE AD
// ========================================
function loadMobileAd() {
    if (window.innerWidth >= 768) return;

    console.log("📱 إضافة إعلان الجوال...");
    
    const mobileAdDiv = document.createElement('div');
    mobileAdDiv.id = 'mobile-ad-banner';
    mobileAdDiv.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0;
        background: #1a1a1a; padding: 8px; z-index: 9999;
        display: flex; justify-content: center; align-items: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    `;
    
    mobileAdDiv.innerHTML = `
        <button onclick="closeMobileAd()" style="
            position: absolute; top: 4px; left: 4px;
            background: #E50914; color: white; border: none;
            border-radius: 50%; width: 24px; height: 24px;
            font-size: 18px; cursor: pointer; z-index: 10; line-height: 20px;
        ">×</button>
        <div id="mobile-ad-script" style="width:100%;max-width:320px;display:flex;justify-content:center;"></div>
    `;
    
    document.body.appendChild(mobileAdDiv);
    document.body.style.paddingTop = '60px';
    setTimeout(() => createAdScript('mobile-ad-script', AD_KEYS.mobile, 320, 50), 300);
}

// ========================================
// SIDE ADS
// ========================================
function loadSideAds() {
    if (window.innerWidth < 1200) return;

    createSideAd('left', 'left-ad-script');
    createSideAd('right', 'right-ad-script');

    setTimeout(() => createAdScript('left-ad-script', AD_KEYS.sidebar, 160, 300), 300);
    setTimeout(() => createAdScript('right-ad-script', AD_KEYS.sidebar, 160, 300), 600);
}

function createSideAd(side, scriptId) {
    const ad = document.createElement('div');
    ad.id = side + '-side-ad';
    ad.className = 'side-ad';
    ad.style.cssText = `
        position: fixed; ${side}: 10px; top: 150px;
        width: 160px; background: #1a1a1a; border: 2px solid #E50914;
        border-radius: 8px; padding: 10px; z-index: 500;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    `;
    ad.innerHTML = `
        <div style="text-align:center;font-size:11px;color:#999;margin-bottom:8px;">
            إعلان
        </div>
        <div id="${scriptId}"></div>
        <button onclick="closeSideAd('${side}')" style="
            position:absolute; top:4px; ${side==='left'?'right':'left'}:4px;
            background:transparent; border:none; color:#E50914;
            font-size:18px; cursor:pointer; line-height:1;
        ">×</button>
    `;
    document.body.appendChild(ad);
}

// ========================================
// SECTION ADS
// ========================================
function loadSectionAds() {
    const moreButtons = document.querySelectorAll('.more-btn');
    moreButtons.forEach((btn,index)=>{
        const scriptId = 'more-btn-ad-' + index;
        const adDiv = document.createElement('div');
        adDiv.className = 'ad-container more-btn-ad';
        adDiv.innerHTML = `
            <div class="ad-label">
                <i class="fas fa-ad"></i> إعلان
            </div>
            <div class="ad-content" id="${scriptId}"></div>
        `;
        btn.parentNode.insertBefore(adDiv, btn);
        const delay = 300 + index*400;
        setTimeout(() => {
            if(window.innerWidth<768)
                createAdScript(scriptId, AD_KEYS.mobile, 320, 50);
            else
                createAdScript(scriptId, AD_KEYS.banner, 468, 60);
        }, delay);
    });
}

// ========================================
// MIDDLE SECTION ADS
// ========================================
function loadMiddleSectionAds() {
    const containers = document.querySelectorAll('.movies-container');
    containers.forEach((container,index)=>{
        if(index===1 || index===3){
            const scriptId = 'middle-section-ad-' + index;
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-container middle-section-ad';
            adDiv.innerHTML = `
                <div class="ad-label"><i class="fas fa-ad"></i> إعلان</div>
                <div class="ad-content" id="${scriptId}"></div>
            `;
            const section = container.closest('.movies-section');
            if(section && section.nextSibling)
                section.parentNode.insertBefore(adDiv, section.nextSibling);
            const delay = 300 + index*500;
            setTimeout(()=>{
                if(window.innerWidth<768)
                    createAdScript(scriptId, AD_KEYS.mobile, 320, 50);
                else
                    createAdScript(scriptId, AD_KEYS.banner, 728, 90);
            }, delay);
        }
    });
}

// ========================================
// CLOSE FUNCTIONS
// ========================================
function closeMobileAd() {
    const ad = document.getElementById('mobile-ad-banner');
    if(ad){ ad.style.display='none'; document.body.style.paddingTop='0'; }
}

function closeSideAd(side) {
    const ad = document.getElementById(side+'-side-ad');
    if(ad) ad.style.display='none';
}

window.closeMobileAd = closeMobileAd;
window.closeSideAd = closeSideAd;

// ========================================
// ADD STYLES
// ========================================
function addAdStyles(){
    if(document.getElementById('ad-styles-injected')) return;
    const style = document.createElement('style');
    style.id='ad-styles-injected';
    style.textContent=`
        .ad-container{background:linear-gradient(145deg,#0a0a0a,#1a1a1a);border:1px solid #333;border-radius:10px;padding:15px;margin:25px auto;max-width:1200px;display:flex;flex-direction:column;align-items:center;min-height:100px;box-shadow:0 4px 10px rgba(0,0,0,0.3);}
        .ad-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
        .ad-label i{color:#E50914;}
        .ad-content{width:100%;display:flex;justify-content:center;align-items:center;min-height:60px;}
        .top-ad{margin-top:15px;margin-bottom:20px;}
        .more-btn-ad{margin:20px auto 15px auto;background:linear-gradient(145deg,#1a1a1a,#0a0a0a);}
        .middle-section-ad{margin:30px auto;background:linear-gradient(145deg,#0a0a0a,#1a1a1a);}
        .side-ad{animation:slideInSide 0.4s ease-out;}
        @keyframes slideInSide{from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);}}
        @media(max-width:768px){.side-ad{display:none !important;}.section-ad{display:none !important;}.ad-container{padding:10px;margin:15px 5px;}}
        @media(max-width:480px){.ad-container{padding:8px;margin:10px 5px;border-radius:8px;}.ad-label{font-size:10px;}}
    `;
    document.head.appendChild(style);
    console.log("✅ Styles تم إضافتها");
}

console.log("✅ ads.js محمّل ومستعد!");
