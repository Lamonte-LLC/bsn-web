import type { Metadata } from 'next';
import MvpsContent from '@/archivo/components/pages/MvpsContent';

export const metadata: Metadata = { title: 'Salón de MVPs · Estadísticas · BSN', description: 'Los Jugadores Más Valiosos del BSN, año por año desde 1951.' };

export default function Page() {
  return <MvpsContent site />;
}
