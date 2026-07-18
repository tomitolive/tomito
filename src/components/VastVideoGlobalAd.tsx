import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const VAST_URL = 'https://s.magsrv.com/v1/vast.php?idz=5979976';

function prefetchVast(): Promise<string | null> {
  const bustUrl = `${VAST_URL}&_cb=${Date.now()}&_r=${Math.random()}`;
  return fetch(bustUrl, { cache: 'no-store' })
    .then((r) => r.text())
    .then((xml) => {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const mediaFile =
        doc.querySelector('MediaFile[type="video/mp4"]') ||
        doc.querySelector('MediaFile');
      return mediaFile?.textContent?.trim() || null;
    })
    .catch(() => null);
}

export default function VastVideoGlobalAd() {
  const location = useLocation();
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefetchRef = useRef<Promise<string | null> | null>(null);
  const lastFetchedPath = useRef<string>('');

  // Prefetch VAST when route changes
  useEffect(() => {
    // Fetch and show on every route change
    if (lastFetchedPath.current === location.pathname) return;
    lastFetchedPath.current = location.pathname;

    setVisible(false);
    setVideoSrc(null);
    setHasEnded(false);

    prefetchRef.current = prefetchVast();

    prefetchRef.current.then((src) => {
      if (!src) return;
      setVideoSrc(src);
      setVisible(true);
      setHasEnded(false);
    });
  }, [location.pathname]);

  // AutoPlay Guarantee
  useEffect(() => {
    if (visible && videoSrc && videoRef.current) {
      const video = videoRef.current;
      video.muted = false; // Try sound
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {
            // failed to auto-play
          });
        });
      }
    }
  }, [visible, videoSrc]);

  const handleClose = useCallback(() => {
    if (!hasEnded) return;
    setVisible(false);
    setVideoSrc(null);
  }, [hasEnded]);

  const handleVideoError = useCallback(() => {
    setVisible(false);
    setVideoSrc(null);
  }, []);

  if (!visible || !videoSrc) return null;

  return (
    <>
      {/* Floating Ad container */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          width: '320px',
          maxWidth: 'calc(100vw - 40px)',
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
          animation: 'vastSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          playsInline
          controls={false}
          style={{ width: '100%', display: 'block', maxHeight: '240px', objectFit: 'contain', background: '#000' }}
          onEnded={() => setHasEnded(true)}
          onError={handleVideoError}
        />

        {/* Close Button or Loading Text */}
        {hasEnded ? (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '6px 12px',
              background: 'rgba(248,123,27,0.95)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s',
              backdropFilter: 'blur(6px)',
              lineHeight: 1.4,
            }}
          >
            إغلاق ✕
          </button>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '4px 8px',
              background: 'rgba(10,10,10,0.75)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              lineHeight: 1.4,
            }}
          >
            انتظر انتهاء الإعلان
          </div>
        )}

        {/* Ad label */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.6)',
            color: 'rgba(255,255,255,0.65)',
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        >
          إعلان
        </div>
      </div>

      <style>{`
        @keyframes vastSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
