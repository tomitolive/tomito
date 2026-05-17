import ClientPage from './page.client';
import { Metadata, ResolvingMetadata } from 'next';
import { fetchMovieDetails, getImageUrl } from '../../../lib/tmdb';
import { getIdFromSlug } from '../../../lib/utils';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || '';
  const id = getIdFromSlug(slug);
  
  if (!id) return { title: 'فيلم غير موجود | Tomito' };

  try {
    const movie = await fetchMovieDetails(id);
    const titleText = `مشاهدة تريلر ${movie.title} كامل HD`;
    const descText = movie.overview ? `شاهد تريلر ${movie.title} الرسمي. ${movie.overview.substring(0, 150)}...` : '';
    const keywords = `${movie.title}, تريلر, مشاهدة, ${movie.genres?.map((g: any) => g.name).join(', ')}, افلام جديدة, بكس اوفيس`;
    const canonicalUrl = `https://tomito.xyz/movie/${slug}`;
    
    return {
      title: titleText,
      description: descText,
      keywords: keywords,
      openGraph: {
        title: `تريلر ${movie.title}`,
        description: movie.overview || '',
        images: movie.backdrop_path ? [getImageUrl(movie.backdrop_path, 'original')] : [],
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
