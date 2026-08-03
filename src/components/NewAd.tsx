"use client";

import { useEffect, useRef, useState } from "react";

const ADS = {
  ad1: {
    id: "container-08370281e563742f6dcb56530f5e8082",
    src: "https://pl30597637.effectivecpmnetwork.com/08370281e563742f6dcb56530f5e8082/invoke.js",
    type: "invoke"
  },
  ad2: {
    id: "container-7853b06f071ef8a725aee4957098eae1",
    src: "https://pl30598106.effectivecpmnetwork.com/7853b06f071ef8a725aee4957098eae1/invoke.js",
    type: "invoke"
  },
  ad3: {
    id: "container-74473a481e12f32fea68225a3cc97eed",
    src: "https://pl30598123.effectivecpmnetwork.com/74473a481e12f32fea68225a3cc97eed/invoke.js",
    type: "invoke"
  },
  ad4: {
    src: "https://pl30597533.effectivecpmnetwork.com/b6/9d/a7/b69da7c3ee677ac42178f0d30e42047b.js",
    type: "simple"
  },
  ad5: {
    src: "https://pl29663719.effectivecpmnetwork.com/ee/2c/53/ee2c53a58b817b6b31db41f2d2ed78df.js",
    type: "simple"
  },
  ad6: {
    src: "https://pl30597550.effectivecpmnetwork.com/e9/97/d5/e997d5de88469fe50e1f491bdebf4d3e.js",
    type: "simple"
  },
  ad7: {
    id: "container-673424a2e33d873f2de0db7bf4828fec",
    src: "https://pl30670419.effectivecpmnetwork.com/673424a2e33d873f2de0db7bf4828fec/invoke.js",
    type: "invoke"
  }
};

interface NewAdProps {
  ad?: "ad1" | "ad2" | "ad3" | "ad7";
}

export default function NewAd({ ad = "ad1" }: NewAdProps) {
  const adConfig = ADS[ad];
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before the ad comes into view
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const loadScript = () => {
      if (adConfig.type === "invoke") {
        // Only inject script once per ad type
        if (!document.querySelector(`script[src="${adConfig.src}"]`)) {
          const script = document.createElement("script");
          script.src = adConfig.src;
          script.async = true;
          script.setAttribute("data-cfasync", "false");
          document.head.appendChild(script);
        }
      }
    };

    loadScript();
  }, [isVisible, adConfig.src, adConfig.type]);

  // Only invoke type ads have an id
  const invokeAdConfig = adConfig as { id: string; src: string; type: string };
  
  return (
    <div 
      ref={adRef}
      style={{ 
        textAlign: "center", 
        margin: "20px auto", 
        overflow: "hidden", 
        maxWidth: "728px", 
        minHeight: "90px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px"
      }}
    >
      <div id={invokeAdConfig.id} style={{ flex: 1, minWidth: 0 }}></div>
    </div>
  );
}
