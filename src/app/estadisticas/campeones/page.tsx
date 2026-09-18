import type { Metadata } from 'next';
import CampeonesContent from '@/archivo/components/pages/CampeonesContent';

export const metadata: Metadata = { title: 'Campeones · Estadísticas · BSN', description: 'Todos los campeones del BSN desde 1930, las dinastías año por año, con dirigente y serie final.' };

export default function Page() {
  return <CampeonesContent site />;
}
