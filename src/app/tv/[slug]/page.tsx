import ClientPage from './page.client';
import { Metadata, ResolvingMetadata } from 'next';
import { fetchTVDetails, getImageUrl } from '../../../lib/tmdb';
import { getIdFromSlug } from '../../../lib/utils';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || '';
  const id = getIdFromSlug(slug);
  
  if (!id) return { title: 'مسلسل غير موجود | Tomito' };

  try {
    const show = await fetchTVDetails(id);
    const titleText = `مشاهدة تريلر مسلسل ${show.name} كامل HD`;
    const descText = show.overview ? `شاهد تريلر ${show.name} الرسمي. ${show.overview.substring(0, 150)}...` : '';
    const keywords = `${show.name}, تريلر, مشاهدة مسلسل, ${show.genres?.map((g: any) => g.name).join(', ')}, مسلسلات جديدة`;
    const canonicalUrl = `https://tomito.xyz/tv/${slug}`;
    
    return {
      title: titleText,
      description: descText,
      keywords: keywords,
      openGraph: {
        title: `تريلر ${show.name}`,
        description: show.overview || '',
        images: show.backdrop_path ? [getImageUrl(show.backdrop_path, 'original')] : [],
        type: 'video.other',
        url: canonicalUrl,
      },
      alternates: {
        canonical: canonicalUrl,
      }
    };
  } catch (e) {
    return { title: 'Tomito' };
  }
}

export default function Page() {
  return <ClientPage />;
}
