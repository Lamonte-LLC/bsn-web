import type { Metadata } from 'next';
import RecordsContent from '@/archivo/components/pages/RecordsContent';

export const metadata: Metadata = { title: 'Récords · Archivo BSN', description: 'Los récords de temporada y de carrera en la historia del BSN.' };

export default function Page() {
  return <RecordsContent />;
}
