import type { Metadata } from 'next';
import CampeonesContent from '@/archivo/components/pages/CampeonesContent';

export const metadata: Metadata = { title: 'Campeones · Archivo BSN', description: 'Todos los campeones del BSN desde 1930, con dirigente y serie final.' };

export default function Page() {
  return <CampeonesContent />;
}
