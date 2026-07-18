import { useEffect, useRef, useState } from 'react';

export default function MobileAd() {
  const [isMobile, setIsMobile] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      // Basic mobile check
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileWidth = window.innerWidth <= 768;
      
      setIsMobile(mobileRegex.test(userAgent) || isMobileWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || initialized.current) return;
    
    // Add the ad scripts and ensure they're only added once
    initialized.current = true;

    const script1 = document.createElement('script');
    script1.src = 'https://a.pemsrv.com/ad-provider.js';
    script1.async = true;
    script1.type = 'application/javascript';
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `(window.AdProvider = window.AdProvider || []).push({"serve": {}});`;
    document.body.appendChild(script2);

    return () => {
        // We typically don't remove ad scripts on unmount to avoid breaking network behaviors,
        // but we could if strictly necessary.
    };
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <>
      {/* The AdProvider typically uses this <ins> element */}
      <ins className="eas6a97888e33" data-zoneid="5979974"></ins>
    </>
  );
}
