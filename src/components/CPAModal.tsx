import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchAllOffers, CPAOffer } from '@/lib/cpaOffers';

export function CPAModal() {
  const location = useLocation();
  const [offer, setOffer] = useState<CPAOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [closeCountdown, setCloseCountdown] = useState(5);
  const [offerLoaded, setOfferLoaded] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [allOffers, setAllOffers] = useState<CPAOffer[]>([]);

  // Track page visits and set random position on route change
  useEffect(() => {
    const currentCount = parseInt(localStorage.getItem('cpaPageCount') || '0');
    const newCount = currentCount + 1;
    setPageCount(newCount);
    localStorage.setItem('cpaPageCount', newCount.toString());

    // Reset hasShown for new page
    setHasShown(false);
    setIsVisible(false);

    // Set position to top for both desktop and mobile
    setPosition('top');
    console.log('CPAModal: Route changed to', location.pathname, 'Page', newCount);
  }, [location.pathname]);

  // Load all offers once when component mounts
  useEffect(() => {
    const loadOffers = async () => {
      try {
        console.log('CPAModal: Loading all offers...');
        const offers = await fetchAllOffers();
        console.log('CPAModal: Loaded', offers.length, 'offers');
        console.log('CPAModal: First 3 offers:', offers.slice(0, 3).map(o => o.title));
        setAllOffers(offers);
        setOfferLoaded(true);
      } catch (err) {
        console.error('CPAModal: Failed to load offers:', err);
      }
    };

    loadOffers();
  }, []);

  // Show modal on page load with different offer each time
  useEffect(() => {
    if (offerLoaded && !hasShown && allOffers.length > 0) {
      // Select random offer each time
      const randomIndex = Math.floor(Math.random() * allOffers.length);
      const selectedOffer = allOffers[randomIndex];
      setOffer(selectedOffer);

      console.log('CPAModal: Page', pageCount, '- Total offers:', allOffers.length, '- Selected random offer:', randomIndex, selectedOffer.title);
      setIsVisible(true);
      setCloseCountdown(5);
      setHasShown(true);
    }
  }, [pageCount, offerLoaded, hasShown, allOffers]);


  // Countdown timer (just for display, doesn't auto-hide)
  useEffect(() => {
    if (!isVisible || closeCountdown <= 0) return;

    const timer = setInterval(() => {
      setCloseCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, closeCountdown]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from triggering the document listener
    setIsVisible(false);
    // Save the time when modal was shown
    localStorage.setItem('cpaModalLastShown', Date.now().toString());
  };

  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'items-center justify-start pl-4';
      case 'right':
        return 'items-center justify-end pr-4';
      case 'top':
        return 'justify-center pt-4';
      case 'bottom':
        return 'justify-center pb-4';
      case 'top-left':
        return 'justify-start pt-4 pl-4';
      case 'top-right':
        return 'justify-end pt-4 pr-4';
      case 'bottom-left':
        return 'justify-start pb-4 pl-4';
      case 'bottom-right':
        return 'justify-end pb-4 pr-4';
      default:
        return 'items-center justify-center';
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:top-4 md:right-4 md:bottom-auto md:left-auto z-50 pointer-events-auto`}>
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-full max-w-md md:max-w-md mx-auto">
        {/* Close button - only show after countdown reaches 0 */}
        {closeCountdown === 0 && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition-colors z-10 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            aria-label="إغلاق"
          >
            ✕
          </button>
        )}

        {/* Countdown badge - show in place of X during countdown */}
        {closeCountdown > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full w-6 h-6 flex items-center justify-center">
            {closeCountdown}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-600 text-sm">جاري التحميل...</p>
            </div>
          ) : error || !offer ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">حدث خطأ</p>
            </div>
          ) : (
            <div className="flex gap-6">
              {offer.offerphoto && (
                <img
                  src={offer.offerphoto}
                  alt={offer.title}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{offer.title}</h3>

                {offer.description && (
                  <p className="text-gray-600 text-base mb-3 line-clamp-2">{offer.description}</p>
                )}

                {offer.payout && (
                  <p className="text-green-600 font-bold text-lg mb-4">إربح: ${offer.payout}</p>
                )}

                <a
                  href={offer.offerlink}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  اضغط هنا
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
