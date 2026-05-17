import ClientPage from './page.client';
import { Metadata, ResolvingMetadata } from 'next';
import { fetchTVDetails, getImageUrl } from '../../../../lib/tmdb';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const idStr = resolvedParams.id || '';
  const id = parseInt(idStr, 10);
  
  if (!id || isNaN(id)) return { title: 'مسلسل غير موجود | Tomito' };

  try {
    const show = await fetchTVDetails(id);
    const titleText = `مشاهدة مسلسل ${show.name} كامل HD`;
    const descText = show.overview ? `مشاهدة جميع حلقات ${show.name} اون لاين. ${show.overview.substring(0, 150)}...` : '';
    const keywords = `${show.name}, مشاهدة مسلسل, حلقات ${show.name}, مسلسلات 2025, ${show.genres?.map((g: any) => g.name).join(', ')}, ايجي بست, شاهد فور يو`;
    const canonicalUrl = `https://tomito.xyz/tv/${id}/watch`;
    
    return {
      title: titleText,
      description: descText,
      keywords: keywords,
      openGraph: {
        title: titleText,
        description: show.overview || '',
        images: show.backdrop_path ? [getImageUrl(show.backdrop_path, 'original')] : [],
        type: 'video.tv_show',
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
