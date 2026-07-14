import { useEffect, useState } from 'react';
import { fetchRandomOffer, CPAOffer } from '@/lib/cpaOffers';

export default function CPATest() {
  const [offers, setOffers] = useState<CPAOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAllOffers = async () => {
      try {
        // Fetch offers for Morocco as test
        const response = await fetch('https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2541994&key=874bb25988a5ec8bdfb76d6d854d8449&country=MA&limit=20');
        
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        const offerItems = xmlDoc.querySelectorAll('offer');
        const allOffers: CPAOffer[] = [];
        
        offerItems.forEach((item) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const payout = item.querySelector('payout')?.textContent || '0';
          const offerlink = item.querySelector('offerlink')?.textContent || '';
          const offerphoto = item.querySelector('offerphoto')?.textContent || '';
          
          if (title && offerlink) {
            allOffers.push({
              title,
              description,
              payout,
              offerlink: offerlink.replace('www.cpagrip.com', 'filetrkr.com'),
              offerphoto,
            });
          }
        });
        
        setOffers(allOffers);
      } catch (err) {
        console.error('Error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadAllOffers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4">جاري تحميل العروض...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>حدث خطأ أثناء تحميل العروض</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">اختبار عروض CPA</h1>
        <p className="text-center text-gray-400 mb-8">عدد العروض: {offers.length}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg">
              {offer.offerphoto && (
                <img
                  src={offer.offerphoto}
                  alt={offer.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                {offer.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{offer.description}</p>
                )}
                <p className="text-green-600 font-bold mb-3">إربح: ${offer.payout}</p>
                <a
                  href={offer.offerlink}
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full text-center"
                >
                  اضغط هنا
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
