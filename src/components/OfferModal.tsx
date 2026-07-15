import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchAppSaveOffers, pickRandomOffer, AppSaveOffer } from '@/lib/cpaOffers';

// كاش العروض في الميموري
let offersCache: AppSaveOffer[] | null = null;
let fetchPromise: Promise<AppSaveOffer[]> | null = null;

async function getOffers(): Promise<AppSaveOffer[]> {
  if (offersCache !== null) return offersCache;
  if (!fetchPromise) {
    fetchPromise = fetchAppSaveOffers().then((offers) => {
      offersCache = offers;
      return offers;
    });
  }
  return fetchPromise;
}

export function OfferModal() {
  const location = useLocation();
  const [offer, setOffer] = useState<AppSaveOffer | null>(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownRef = useRef(false);

  // كل مرة يتبدل الروت — اختار عرض جديد وخرجو
  useEffect(() => {
    shownRef.current = false;
    setVisible(false);
    setOffer(null);

    let cancelled = false;

    getOffers().then((offers) => {
      if (cancelled || shownRef.current) return;
      if (!offers.length) return;

      const picked = pickRandomOffer(offers);
      if (!picked) return;

      shownRef.current = true;
      setOffer(picked);
      setCountdown(8);
      setVisible(true);
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // العداد التنازلي — 5 ثواني قبل ما يقدر يسكر
  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(8);

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

  const handleClose = () => {
    if (countdown > 0) return;
    setVisible(false);
  };

  if (!visible || !offer) return null;

  const canClose = countdown === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="offer-modal-backdrop"
        onClick={canClose ? handleClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="offer-modal-wrapper" role="dialog" aria-modal="true" aria-label="عرض خاص">
        <div className="offer-modal-container">
          {/* Header */}
          <div className="offer-modal-header">
            <span className="offer-modal-title">⚡ عرض خاص لك</span>
            {canClose ? (
              <button
                className="offer-modal-close-btn"
                onClick={handleClose}
                aria-label="إغلاق"
              >
                ✕
              </button>
            ) : (
              <div className="offer-modal-countdown" aria-live="polite">
                {countdown}
              </div>
            )}
          </div>

          {/* iFrame لعرض رابط العرض (الفريم) */}
          <div className="offer-modal-frame-wrap">
            <iframe
              src={offer.url}
              title={offer.name}
              className="offer-modal-iframe"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
              loading="lazy"
            />
          </div>

          {/* Footer */}
          {!canClose && (
            <div className="offer-modal-footer">
              <span className="offer-modal-hint">
                يمكنك الإغلاق بعد <strong>{countdown}</strong> ثوانٍ
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
