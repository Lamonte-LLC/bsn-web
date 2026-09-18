import type { Metadata } from 'next';
import MvpYCampeonContent from '@/archivo/components/pages/MvpYCampeonContent';

export const metadata: Metadata = { title: '¿El MVP levanta el trofeo? · Estadísticas · BSN', description: 'Cuántas veces el MVP del BSN jugaba en el equipo campeón, año por año desde 1951.' };

export default function Page() {
  return <MvpYCampeonContent site />;
}
