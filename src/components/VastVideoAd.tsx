import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const VAST_URL = 'https://s.magsrv.com/v1/vast.php?idz=5979286';
const SKIP_AFTER = 8;

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

export default function VastVideoAd() {
  const location = useLocation();
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(SKIP_AFTER);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefetchRef = useRef<Promise<string | null> | null>(null);
  const lastShownPath = useRef<string>('');

  // ── Prefetch the next ad immediately on route change ──────────────────────
  useEffect(() => {
    if (lastShownPath.current === location.pathname) return;
    lastShownPath.current = location.pathname;

    setVisible(false);
    setVideoSrc(null);
    setCountdown(SKIP_AFTER);
    if (timerRef.current) clearInterval(timerRef.current);

    prefetchRef.current = prefetchVast();

    prefetchRef.current.then((src) => {
      if (!src) return;
      setVideoSrc(src);
      setVisible(true);
      setCountdown(SKIP_AFTER);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [location.pathname]);

  // ── AutoPlay guarantee & fallback ─────────────────────────────────────────
  useEffect(() => {
    if (visible && videoSrc && videoRef.current) {
      const video = videoRef.current;
      video.muted = false; // Try playing with sound first
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay with sound was blocked, fallback to muted autoplay
          video.muted = true;
          video.play().catch((err) => {
            console.error("Autoplay failed completely:", err);
          });
        });
      }
    }
  }, [visible, videoSrc]);

  // ── Manage body class for preventing ad overlaps ─────────────────────────
  useEffect(() => {
    if (visible) {
      document.body.classList.add('vast-active');
    } else {
      document.body.classList.remove('vast-active');
    }
    return () => {
      document.body.classList.remove('vast-active');
    };
  }, [visible]);

  // ── Countdown ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    if (countdown > 0) return;
    setVisible(false);
    setVideoSrc(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [countdown]);

  // ── Re-trigger magsrv banner on every route change ────────────────────────
  useEffect(() => {
    try {
      const AdProvider: { push: (a: unknown) => void } =
        (window as any).AdProvider || [];
      AdProvider.push({ serve: {} });
    } catch {
      // ignore
    }
  }, [location.pathname]);

  if (!visible || !videoSrc) return null;

  const canSkip = countdown === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 99998,
          animation: 'vastFadeIn 0.2s ease',
        }}
        onClick={canSkip ? handleClose : undefined}
      />

      {/* Ad container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '720px',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.07)',
            pointerEvents: 'auto',
            animation: 'vastSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Video */}
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            playsInline
            controls={false}
            style={{ width: '100%', display: 'block', maxHeight: '80vh' }}
            onEnded={() => { setVisible(false); setVideoSrc(null); }}
          />

          {/* Skip / Countdown */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: canSkip ? '6px 16px' : '5px 12px',
              background: canSkip
                ? 'rgba(248,123,27,0.95)'
                : 'rgba(10,10,10,0.75)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: canSkip ? '0.88rem' : '0.8rem',
              fontWeight: 700,
              cursor: canSkip ? 'pointer' : 'default',
              transition: 'background 0.2s, transform 0.15s',
              backdropFilter: 'blur(6px)',
              lineHeight: 1.4,
              userSelect: 'none',
            }}
          >
            {canSkip ? 'تخطي الإعلان ✕' : `تخطي بعد ${countdown} ث`}
          </button>

          {/* Ad label */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.6)',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.68rem',
              padding: '2px 9px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          >
            إعلان
          </div>
        </div>
      </div>

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes vastFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes vastSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
