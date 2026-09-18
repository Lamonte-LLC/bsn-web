import type { Metadata } from 'next';
import MvpsContent from '@/archivo/components/pages/MvpsContent';

export const metadata: Metadata = { title: 'Salón de MVPs · Archivo BSN', description: 'Los Jugadores Más Valiosos del BSN desde 1951.' };

export default function Page() {
  return <MvpsContent />;
}
