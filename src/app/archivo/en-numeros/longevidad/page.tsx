import type { Metadata } from 'next';
import LongevidadContent from '@/archivo/components/pages/LongevidadContent';

export const metadata: Metadata = { title: 'Los que duraron · Archivo BSN', description: 'Los jugadores con más temporadas y más juegos en la historia del BSN.' };

export default function Page() {
  return <LongevidadContent />;
}
