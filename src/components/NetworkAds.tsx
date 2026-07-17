import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NetworkAds() {
  const location = useLocation();

  useEffect(() => {
    // Only run ads if NOT on the homepage ("/")
    if (location.pathname === '/') {
      return;
    }

    // Wait until the page finishes its initial data loading before showing ads
    const timer = setTimeout(() => {
      // Ad Script (specific network ad)
      const script = document.createElement('script');
      script.src = 'https://pl30308184.effectivecpmnetwork.com/b1/7c/90/b17c90534fca3de69eb209808a32e347.js';
      script.async = true;
      document.body.appendChild(script);
    }, 2000); // 2 seconds delay

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return null;
}

