import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function MagsrvPopunderAd() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous ad instance to force fresh rendering on page/URL change
    containerRef.current.innerHTML = '';

    // Create the ins element
    const insNode = document.createElement('ins');
    insNode.className = 'eas6a97888e31';
    insNode.setAttribute('data-zoneid', '5979274');
    containerRef.current.appendChild(insNode);

    // Create the MagSrv provider script tag
    const scriptNode = document.createElement('script');
    scriptNode.type = 'application/javascript';
    scriptNode.async = true;
    scriptNode.src = 'https://a.magsrv.com/ad-provider.js';
    containerRef.current.appendChild(scriptNode);

    // Push serve command to AdProvider queue
    const pushScriptNode = document.createElement('script');
    pushScriptNode.type = 'text/javascript';
    pushScriptNode.textContent = '(window.AdProvider = window.AdProvider || []).push({"serve": {}});';
    containerRef.current.appendChild(pushScriptNode);

    // Also trigger via window variable directly if loaded
    try {
      const AdProvider = (window as any).AdProvider || [];
      AdProvider.push({ serve: {} });
    } catch {
      // ignore
    }
  }, [location.pathname, location.search]); // Trigger on pathname or search (query parameter) changes

  return <div ref={containerRef} style={{ display: 'none' }} />;
}
