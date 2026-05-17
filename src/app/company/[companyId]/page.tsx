import ClientPage from './page.client';
import { Metadata } from 'next';

// Placeholder server metadata (will be enhanced per page type later)
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  return {
    title: 'TOMITO — مشاهدة ممتعة',
  };
}

export default function Page() {
  return <ClientPage />;
}
