import ClientPage from './page.client';
import { Metadata, ResolvingMetadata } from 'next';
import { fetchMovieDetails, getImageUrl } from '../../../../lib/tmdb';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const idStr = resolvedParams.id || '';
  const id = parseInt(idStr, 10);
  
  if (!id || isNaN(id)) return { title: 'فيلم غير موجود | Tomito' };

  try {
    const movie = await fetchMovieDetails(id);
    const titleText = `مشاهدة فيلم ${movie.title} كامل HD`;
    const descText = movie.overview ? `مشاهدة وتحميل فيلم ${movie.title} كامل اون لاين. ${movie.overview.substring(0, 150)}...` : '';
    const keywords = `${movie.title}, مشاهدة فيلم, تحميل فيلم, ${movie.genres?.map((g: any) => g.name).join(', ')}, ايجي بست, فاصل اعلاني`;
    const canonicalUrl = `https://tomito.xyz/movie/${id}/watch`;
    
    return {
      title: titleText,
      description: descText,
      keywords: keywords,
      openGraph: {
        title: titleText,
        description: movie.overview || '',
        images: movie.backdrop_path ? [getImageUrl(movie.backdrop_path, 'original')] : [],
        type: 'video.movie',
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
