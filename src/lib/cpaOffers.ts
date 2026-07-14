// CPA Offer Fetch Module with Country Detection

const AFFILIATE_ID = '2541994';
const API_KEY = '874bb25988a5ec8bdfb76d6d854d8449';
const LIMIT = 100;

export interface CPAOffer {
  offerlink: string;
  title: string;
  offerphoto: string;
  payout: string;
  description?: string;
}

export interface IPInfo {
  country: string;
  country_code: string;
  ip: string;
}

// Detect user's country using IP geolocation
async function detectCountry(): Promise<string> {
  try {
    // Use ip-api.com (free, no CORS issues)
    const response = await fetch('http://ip-api.com/json/?fields=countryCode');
    if (!response.ok) {
      throw new Error('Failed to detect country');
    }
    const data: { countryCode: string } = await response.json();
    return data.countryCode || '';
  } catch (error) {
    console.error('Error detecting country:', error);
    return ''; // Return empty if detection fails (API will auto-detect)
  }
}

// Basic sanitization functions
function sanitizeUrl(url: string): string {
  return url.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeText(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Fetch offers from CPAGrip API
async function fetchOffers(countryCode: string): Promise<CPAOffer[]> {
  try {
    // Use Vite proxy in development, direct URL in production
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '/api/cpa/common/offer_feed_rss.php' : 'https://www.cpagrip.com/common/offer_feed_rss.php';
    const apiUrl = `${baseUrl}?user_id=${AFFILIATE_ID}&key=${API_KEY}&country=${countryCode}&limit=${LIMIT}`;

    console.log('Fetching from:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const text = await response.text();
    console.log('Response text length:', text.length);
    console.log('Response text preview:', text.substring(0, 500));

    // Parse XML to extract offers
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    const offerItems = xmlDoc.querySelectorAll('offer');
    const offers: CPAOffer[] = [];

    console.log('Found offer items in XML:', offerItems.length);

    offerItems.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const payout = item.querySelector('payout')?.textContent || '0';
      const offerlink = item.querySelector('offerlink')?.textContent || '';
      const offerphoto = item.querySelector('offerphoto')?.textContent || '';

      if (title && offerlink) {
        offers.push({
          title,
          description,
          payout,
          offerlink,
          offerphoto,
        });
      }
    });

    console.log('Parsed offers:', offers.length);
    if (offers.length > 0) {
      console.log('First offer:', offers[0]);
      console.log('Last offer:', offers[offers.length - 1]);
    }
    return offers;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}

// Select a random offer from the list
function selectRandomOffer(offers: CPAOffer[]): CPAOffer | null {
  if (offers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * offers.length);
  return offers[randomIndex];
}

// Main function to fetch a random offer based on user's country
export async function fetchRandomOffer(): Promise<CPAOffer | null> {
  try {
    // Detect user's country
    const countryCode = await detectCountry();
    console.log('Detected country:', countryCode);

    // Fetch offers for that country
    const offers = await fetchOffers(countryCode);
    console.log('Fetched offers count:', offers.length);
    console.log('Sample offer:', offers[0]);

    // Select and return a random offer
    const randomOffer = selectRandomOffer(offers);

    if (randomOffer) {
      // Replace CPAGrip domain with custom tracking domain
      randomOffer.offerlink = randomOffer.offerlink.replace('www.cpagrip.com', 'filetrkr.com');
      randomOffer.offerlink = sanitizeUrl(randomOffer.offerlink);
      randomOffer.title = sanitizeText(randomOffer.title);
      console.log('Selected offer:', randomOffer);
    }

    return randomOffer;
  } catch (error) {
    console.error('Error fetching random CPA offer:', error);
    return null;
  }
}

// Fetch all offers at once and cache them (based on user's country)
export async function fetchAllOffers(): Promise<CPAOffer[]> {
  try {
    // Detect user's country
    const countryCode = await detectCountry();
    console.log('Detected user country:', countryCode);

    // Fetch offers for that country
    const offers = await fetchOffers(countryCode);
    console.log(`Fetched ${offers.length} offers from ${countryCode}`);

    // Sanitize all offers
    const sanitizedOffers = offers.map(offer => ({
      ...offer,
      offerlink: sanitizeUrl(offer.offerlink.replace('www.cpagrip.com', 'filetrkr.com')),
      title: sanitizeText(offer.title),
    }));

    console.log('Total offers after sanitization:', sanitizedOffers.length);
    return sanitizedOffers;
  } catch (error) {
    console.error('Error fetching all CPA offers:', error);
    return [];
  }
}
