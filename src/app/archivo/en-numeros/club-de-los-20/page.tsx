import type { Metadata } from 'next';
import ClubDeLos20Content from '@/archivo/components/pages/ClubDeLos20Content';

export const metadata: Metadata = { title: 'El club de los 20 · Archivo BSN', description: 'Cuántas temporadas de 15, 20, 25 y 30 puntos por juego hubo en cada década del BSN.' };

export default function Page() {
  return <ClubDeLos20Content />;
}
