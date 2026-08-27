import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Function to hide ad overlays from external video servers
function hideAdOverlays() {
  const hideElements = () => {
    // Hide elements with high z-index (typical of ad overlays)
    const highZIndexElements = document.querySelectorAll('div[style*="z-index: 2147483647"], div[style*="z-index:2147483647"], div[style*="z-index: 9999999"], div[style*="z-index:9999999"]');
    highZIndexElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.visibility = 'hidden';
      (el as HTMLElement).style.pointerEvents = 'none';
    });

    // Hide elements with specific ad class patterns
    const adElements = document.querySelectorAll('[class*="fhujcsxogqn"], [class*="ad-overlay"], [class*="popup-overlay"]');
    adElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.visibility = 'hidden';
      (el as HTMLElement).style.pointerEvents = 'none';
    });

    // Hide absolute positioned overlays at top-left with pointer-events: none
    const overlayElements = document.querySelectorAll('div[style*="pointer-events: none"][style*="position: absolute"][style*="top: 0px"][style*="left: 0px"]');
    overlayElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.visibility = 'hidden';
      (el as HTMLElement).style.pointerEvents = 'none';
    });
  };

  // Run immediately
  hideElements();

  // Run periodically to catch dynamically added ads
  const interval = setInterval(hideElements, 1000);

  // Also run on DOM mutations
  const observer = new MutationObserver(hideElements);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
    observer.disconnect();
  });
}

// Start hiding ads
hideAdOverlays();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>
);

