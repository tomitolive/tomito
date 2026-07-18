import { useEffect, useRef } from 'react';

export default function MobileAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Fast check without React state delay so it mounts properly
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileWidth = window.innerWidth <= 768;
    
    const isMobile = mobileRegex.test(userAgent) || isMobileWidth;

    if (!isMobile || initialized.current || !containerRef.current) return;
    initialized.current = true;

    // Create ins element
    const ins = document.createElement('ins');
    ins.className = 'eas6a97888e33';
    ins.setAttribute('data-zoneid', '5979974');
    containerRef.current.appendChild(ins);

    // Provide the ad provider script
    const script1 = document.createElement('script');
    script1.src = 'https://a.pemsrv.com/ad-provider.js';
    script1.async = true;
    script1.type = 'application/javascript';
    containerRef.current.appendChild(script1);

    // Call AdProvider Push
    const script2 = document.createElement('script');
    script2.innerHTML = `(window.AdProvider = window.AdProvider || []).push({"serve": {}});`;
    containerRef.current.appendChild(script2);

  }, []);

  return <div ref={containerRef} />;
}
