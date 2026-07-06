import { useEffect } from 'react';

export default function NetworkAds() {
  useEffect(() => {
    // Wait until the page finishes its initial data loading before showing ads
    const timer = setTimeout(() => {
      // Ads container
      const container = document.createElement('div');
      container.id = 'container-40d8069a7626b6b8606581e30c0aecfd';
      document.body.appendChild(container);

      // Ad Script 1
      const script1 = document.createElement('script');
      script1.src = 'https://pl29663723.effectivecpmnetwork.com/6e/78/14/6e781401b81579a741ac7074d6fe77eb.js';
      script1.async = true;
      document.body.appendChild(script1);
      
      // Ad Script 2
      const script2 = document.createElement('script');
      script2.src = 'https://pl30149173.effectivecpmnetwork.com/40d8069a7626b6b8606581e30c0aecfd/invoke.js';
      script2.async = true;
      script2.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script2);
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, []);
  
  return null;
}
