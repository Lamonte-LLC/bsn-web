import type { Metadata } from 'next';
import MultiMvpContent from '@/archivo/components/pages/MultiMvpContent';

export const metadata: Metadata = { title: 'Los que repitieron · Estadísticas · BSN', description: 'Los jugadores que ganaron el MVP del BSN más de una vez.' };

export default function Page() {
  return <MultiMvpContent site />;
}
