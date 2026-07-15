// AppSave Offer API v2 — https://appsave.online/api/v2

const API_KEY = '45717|LZTb0O2v1xFt3JkrkQJUxlyOOVfzhJKQJj8KdIfJ77b4f43f';

export interface AppSaveOffer {
  id: string | number;
  name: string;
  url: string;          // رابط العرض (offer link)
  icon?: string;        // صورة العرض
  description?: string;
  payout?: string | number;
  anchor?: string;      // نص زر الدعوة للفعل
}

// جلب IP الزائر الحقيقي
async function getVisitorIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data: { ip: string } = await res.json();
    return data.ip || '1.1.1.1';
  } catch {
    return '1.1.1.1';
  }
}

// جلب العروض من AppSave API v2
export async function fetchAppSaveOffers(): Promise<AppSaveOffer[]> {
  try {
    const ip = await getVisitorIP();
    const userAgent = navigator.userAgent;

    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '/api/appsave' : 'https://appsave.online/api/v2';

    const params = new URLSearchParams({
      ip,
      user_agent: userAgent,
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AppSave API error: ${response.status}`);
    }

    const data = await response.json();

    // الـ API يُرجع مصفوفة مباشرة أو كائن فيه offers/data
    const rawOffers: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : (data.offers ?? data.data ?? []);

    const offers: AppSaveOffer[] = rawOffers.map((o) => ({
      id: (o.id ?? o.offer_id ?? o.offerid ?? Math.random()) as string | number,
      name: (o.name ?? o.title ?? 'عرض حصري') as string,
      url: (o.url ?? o.offerlink ?? o.link ?? '') as string,
      icon: (o.icon ?? o.image ?? o.offerphoto ?? o.picture ?? '') as string,
      description: (o.description ?? o.adcopy ?? '') as string,
      payout: (o.payout ?? '') as string | number,
      anchor: (o.anchor ?? o.cta ?? 'اضغط هنا') as string,
    }));

    return offers.filter((o) => o.url);
  } catch (error) {
    console.error('AppSave API: خطأ في جلب العروض', error);
    return [];
  }
}

// اختيار عرض عشوائي
export function pickRandomOffer(offers: AppSaveOffer[]): AppSaveOffer | null {
  if (!offers.length) return null;
  return offers[Math.floor(Math.random() * offers.length)];
}
