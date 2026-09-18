import type { Metadata } from 'next';
import DirigentesContent from '@/archivo/components/pages/DirigentesContent';

export const metadata: Metadata = { title: 'Los dirigentes que ganaron · Estadísticas · BSN', description: 'Los dirigentes con más campeonatos en la historia del BSN.' };

export default function Page() {
  return <DirigentesContent site />;
}
